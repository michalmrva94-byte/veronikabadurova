import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TO_EMAIL = "veronika.duro@gmail.com";
const FROM = "Veronika Swim <noreply@veronikaswim.sk>";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      throw new Error("Neplatné meno");
    }
    if (!email || typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Neplatný email");
    }
    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
      throw new Error("Neplatná správa");
    }

    const sanitize = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#333;">Nová správa z webu</h2>
        <p><strong>Meno:</strong> ${sanitize(name.trim())}</p>
        <p><strong>Email:</strong> ${sanitize(email.trim())}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
        <p style="white-space:pre-wrap;">${sanitize(message.trim())}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO_EMAIL],
      replyTo: email.trim(),
      subject: `Nová správa z webu od ${name.trim()}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Nepodarilo sa odoslať email");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-form:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
