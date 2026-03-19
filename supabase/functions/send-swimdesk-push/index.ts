import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const vapidSubject = Deno.env.get("SWIMDESK_VAPID_SUBJECT") ?? "";
const subject = vapidSubject.startsWith("mailto:") ? vapidSubject : `mailto:${vapidSubject}`;
webpush.setVapidDetails(
  subject,
  Deno.env.get("SWIMDESK_VAPID_PUBLIC_KEY")!,
  Deno.env.get("SWIMDESK_VAPID_PRIVATE_KEY")!
);

interface PushRequest {
  club_id: string;
  user_ids?: string[];
  send_to_all?: boolean;
  title: string;
  body: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: PushRequest = await req.json();
    const { club_id, title, body, url, actions, user_ids, send_to_all } = payload;

    if (!club_id || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is a club admin
    const { data: adminRow } = await supabaseAdmin
      .from("club_admins")
      .select("role")
      .eq("user_id", user.id)
      .eq("club_id", club_id)
      .maybeSingle();

    if (!adminRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch subscriptions for this club
    let query = supabaseAdmin
      .from("swimdesk_push_subscriptions")
      .select("*")
      .eq("club_id", club_id);

    if (!send_to_all && user_ids?.length) {
      query = query.in("user_id", user_ids);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) throw subError;

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      url: url ?? `/${club_id}`,
      actions: actions ?? [],
    });

    let sent = 0;
    let failed = 0;
    const staleIds: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, notificationPayload);
        sent++;
      } catch (err: any) {
        console.error(`Push failed for ${sub.id}:`, err.statusCode);
        if (err.statusCode === 404 || err.statusCode === 410) staleIds.push(sub.id);
        failed++;
      }
    }

    if (staleIds.length > 0) {
      await supabaseAdmin.from("swimdesk_push_subscriptions").delete().in("id", staleIds);
    }

    return new Response(JSON.stringify({ success: true, sent, failed, cleaned: staleIds.length }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-swimdesk-push error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
