import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.94.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Si expert tréner závodného plávania so 20 rokmi skúseností.
Navrhni periodizovaný tréningový plán pre závodného plavca.
Odpovedaj VÝHRADNE v JSON formáte — žiadny text mimo JSON.
Štruktúra odpovede:
{
  "analysis": {
    "gap_seconds": number,
    "weekly_improvement_needed": number,
    "feasibility": "realisticky" | "narocne" | "velmi_narocne",
    "key_focus": string
  },
  "periodization": {
    "phase_1": { "name": string, "weeks": number, "focus": string },
    "phase_2": { "name": string, "weeks": number, "focus": string },
    "phase_3": { "name": string, "weeks": number, "focus": string }
  },
  "weekly_plans": [
    {
      "week": number,
      "phase": string,
      "theme": string,
      "total_meters": number,
      "trainings": [
        {
          "day": string,
          "type": "vytrvalost" | "rychlost" | "technika" | "zavod" | "zmiesany",
          "title": string,
          "total_meters": number,
          "sets": [
            {
              "phase": "rozcvicka" | "hlavna" | "upokojenie",
              "description": string,
              "meters": number,
              "intensity": "nizka" | "stredna" | "vysoka"
            }
          ]
        }
      ]
    }
  ],
  "coach_notes": string
}`;

function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return secs.toFixed(2);
  return `${mins}:${secs.toFixed(2).padStart(5, "0")}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "API kľúč nie je nakonfigurovaný. Kontaktujte správcu." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Neautorizovaný prístup" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Neautorizovaný prístup" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      swimmer_id,
      discipline_code,
      discipline_name,
      discipline_id,
      current_pr_seconds,
      target_time_seconds,
      weeks,
      trainings_per_week,
      competition_name,
      swimmer_age,
      swimmer_gender,
    } = body;

    const gap = (current_pr_seconds - target_time_seconds).toFixed(2);
    const genderLabel = swimmer_gender === "M" ? "chlapec" : "dievča";

    const userPrompt = `Plavec: ${swimmer_age} rokov, ${genderLabel}
Disciplína: ${discipline_name}
Aktuálny PR: ${formatTimeDisplay(current_pr_seconds)}
Cieľový čas: ${formatTimeDisplay(target_time_seconds)} (limit ${competition_name})
Gap: ${gap}s
Počet týždňov: ${weeks}
Tréningy za týždeň: ${trainings_per_week}

Navrhni kompletný ${weeks}-týždňový periodizovaný plán.
Každý tréning musí mať konkrétne sety so vzdialenosťami a intervalmi.
Zameraj sa na disciplínu: ${discipline_name}.`;

    // Call Anthropic API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errBody);
      return new Response(
        JSON.stringify({ error: "Generovanie zlyhalo", details: `API status ${anthropicRes.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text || "";

    // Parse JSON from response (handle possible markdown code blocks)
    let planJson: Record<string, unknown>;
    try {
      const jsonStr = rawText.replace(/^```json?\n?/g, "").replace(/\n?```$/g, "").trim();
      planJson = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw text:", rawText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Generovanie zlyhalo, skúste znova", details: "Invalid JSON response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to season_plans
    const { data: profile } = await supabase
      .from("sd_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const { data: savedPlan, error: saveError } = await supabase
      .from("season_plans")
      .insert({
        swimmer_id,
        discipline_id,
        target_time_seconds,
        weeks,
        start_date: new Date().toISOString().slice(0, 10),
        ai_plan_json: planJson,
        created_by: profile?.id || null,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
    }

    return new Response(
      JSON.stringify({ plan: planJson, season_plan_id: savedPlan?.id || null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    const message = err instanceof Error && err.name === "AbortError"
      ? "Časový limit vypršal (60s). Skúste znova."
      : "Generovanie zlyhalo";
    return new Response(
      JSON.stringify({ error: message, details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
