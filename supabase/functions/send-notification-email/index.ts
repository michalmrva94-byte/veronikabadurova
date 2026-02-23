import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ConfirmationEmail } from "../_shared/notification-templates/confirmation.tsx";
import { ReminderEmail } from "../_shared/notification-templates/reminder.tsx";
import { LastMinuteEmail } from "../_shared/notification-templates/last-minute.tsx";
import { ProposalEmail } from "../_shared/notification-templates/proposal.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_URL = "https://veronikabadurova.lovable.app";
const FROM = "Veronika Swim <noreply@veronikaswim.sk>";

interface EmailRequest {
  type: "confirmation" | "reminder" | "last_minute" | "proposal";
  to: string;
  clientName: string;
  trainingDate?: string;
  trainingTime?: string;
  // last_minute specific
  title?: string;
  message?: string;
  slotId?: string;
  // proposal specific
  trainingCount?: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailRequest = await req.json();
    const { type, to, clientName } = payload;

    if (!type || !to || !clientName) {
      throw new Error("Missing required fields: type, to, clientName");
    }

    let html: string;
    let subject: string;

    switch (type) {
      case "confirmation":
        subject = "Tréning potvrdený — Veronika Swim";
        html = await renderAsync(
          React.createElement(ConfirmationEmail, {
            clientName,
            trainingDate: payload.trainingDate || "",
            trainingTime: payload.trainingTime || "",
            appUrl: APP_URL,
          })
        );
        break;

      case "reminder":
        subject = "Pripomienka tréningu — Veronika Swim";
        html = await renderAsync(
          React.createElement(ReminderEmail, {
            clientName,
            trainingDate: payload.trainingDate || "",
            trainingTime: payload.trainingTime || "",
            appUrl: APP_URL,
          })
        );
        break;

      case "last_minute":
        subject = payload.title || "Last-minute ponuka — Veronika Swim";
        html = await renderAsync(
          React.createElement(LastMinuteEmail, {
            clientName,
            title: payload.title || "Last-minute ponuka",
            message: payload.message || "",
            appUrl: APP_URL,
            slotId: payload.slotId,
          })
        );
        break;

      case "proposal":
        subject = "Nový navrhnutý tréning — Veronika Swim";
        html = await renderAsync(
          React.createElement(ProposalEmail, {
            clientName,
            trainingDate: payload.trainingDate || "",
            trainingTime: payload.trainingTime || "",
            trainingCount: payload.trainingCount,
            appUrl: APP_URL,
          })
        );
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log(`Email sent: type=${type}, to=${to}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
