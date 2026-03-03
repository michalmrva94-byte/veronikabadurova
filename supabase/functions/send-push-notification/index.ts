import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "";
const subject = vapidSubject.startsWith("mailto:") ? vapidSubject : `mailto:${vapidSubject}`;
webpush.setVapidDetails(
  subject,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

interface PushRequest {
  // Send to specific user_ids (auth.users IDs)
  user_ids?: string[];
  // Or send to all subscribed users
  send_to_all?: boolean;
  // Notification payload
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
    // Authenticate caller — must be admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden — admin only" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: PushRequest = await req.json();
    const { title, body, url, actions, user_ids, send_to_all } = payload;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing title or body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch subscriptions
    let query = supabaseAdmin.from("push_subscriptions").select("*");
    if (!send_to_all && user_ids?.length) {
      query = query.in("user_id", user_ids);
    }
    const { data: subscriptions, error: subError } = await query;

    if (subError) throw subError;
    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      url: url ?? "/",
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
        console.error(`Push failed for ${sub.id}:`, err.statusCode, err.body);
        // 404 or 410 = subscription expired / unsubscribed
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleIds.push(sub.id);
        }
        failed++;
      }
    }

    // Clean up stale subscriptions
    if (staleIds.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("id", staleIds);
      console.log(`Cleaned ${staleIds.length} stale subscriptions`);
    }

    console.log(`Push sent: ${sent}, failed: ${failed}, cleaned: ${staleIds.length}`);
    return new Response(
      JSON.stringify({ success: true, sent, failed, cleaned: staleIds.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("send-push-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
