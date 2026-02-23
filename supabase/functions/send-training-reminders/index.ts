import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ReminderEmail } from "../_shared/notification-templates/reminder.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const APP_URL = "https://veronikabadurova.lovable.app";
const FROM = "Veronika Swim <noreply@veronikaswim.sk>";

serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find bookings 23-25h from now (to catch within a 2h window for cron tolerance)
    const now = new Date();
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, client_id, slot:training_slots(start_time, end_time)")
      .eq("status", "booked")
      .gte("slot.start_time", from.toISOString())
      .lte("slot.start_time", to.toISOString());

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    // Filter bookings that have valid slot data
    const validBookings = (bookings || []).filter((b: any) => b.slot?.start_time);

    let sent = 0;
    for (const booking of validBookings) {
      // Fetch client profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, email_notifications")
        .eq("id", booking.client_id)
        .single();

      if (!profile || !profile.email_notifications) continue;

      const slotStart = new Date(booking.slot.start_time);
      const trainingDate = slotStart.toLocaleDateString("sk-SK", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const trainingTime = slotStart.toLocaleTimeString("sk-SK", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const html = await renderAsync(
        React.createElement(ReminderEmail, {
          clientName: profile.full_name,
          trainingDate,
          trainingTime,
          appUrl: APP_URL,
        })
      );

      const { error } = await resend.emails.send({
        from: FROM,
        to: [profile.email],
        subject: "Pripomienka tréningu — Veronika Swim",
        html,
      });

      if (error) {
        console.error(`Reminder email error for ${profile.email}:`, error);
      } else {
        sent++;
      }
    }

    console.log(`Sent ${sent} reminder emails out of ${validBookings.length} bookings`);
    return new Response(JSON.stringify({ sent, total: validBookings.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-training-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
