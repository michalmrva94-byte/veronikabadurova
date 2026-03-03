import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()

    // Get all awaiting_confirmation bookings
    const { data: pendingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*, slot:training_slots(*)')
      .eq('status', 'awaiting_confirmation')
      .not('confirmation_deadline', 'is', null)

    if (fetchError) throw fetchError

    let expired = 0
    let reminders12h = 0
    let reminders1h = 0
    let reminderEmails = 0

    for (const booking of pendingBookings || []) {
      const deadline = new Date(booking.confirmation_deadline)
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

      // Expired - cancel and free slot
      if (hoursUntilDeadline <= 0) {
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancelled_at: now.toISOString(),
            cancellation_reason: 'Nepotvrdené v stanovenom termíne',
          })
          .eq('id', booking.id)

        await supabase
          .from('training_slots')
          .delete()
          .eq('id', booking.slot_id)

        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Návrh tréningu vypršal',
          message: 'Navrhnutý tréning nebol potvrdený včas. Termín bol odstránený z kalendára.',
          type: 'proposal_expired',
        })

        expired++
        continue
      }

      // 48h before training reminder email (±30min tolerance)
      if (booking.slot && !booking.reminder_sent) {
        const slotStart = new Date(booking.slot.start_time)
        const hoursUntilTraining = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilTraining > 47.5 && hoursUntilTraining <= 48.5) {
          // Get client profile for email
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('full_name, email, email_notifications')
            .eq('id', booking.client_id)
            .single()

          if (clientProfile?.email_notifications && clientProfile.email) {
            const trainingDate = slotStart.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })
            const trainingTime = slotStart.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
            const deadlineDate = deadline.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })
            const deadlineTime = deadline.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })

            // Send reminder email via the send-notification-email function
            try {
              const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${anonKey}`,
                },
                body: JSON.stringify({
                  type: 'proposal_reminder',
                  to: clientProfile.email,
                  clientName: clientProfile.full_name,
                  trainingDate,
                  trainingTime,
                  deadlineDate,
                  deadlineTime,
                }),
              })

              if (emailRes.ok) {
                // Mark reminder as sent
                await supabase
                  .from('bookings')
                  .update({ reminder_sent: true })
                  .eq('id', booking.id)

                // Also create in-app notification
                await supabase.from('notifications').insert({
                  user_id: booking.client_id,
                  title: 'Nezabudni potvrdiť tréning',
                  message: `Máš nepotvrdený tréning na ${trainingDate} o ${trainingTime}. Potvrď ho do ${deadlineDate} ${deadlineTime}.`,
                  type: 'proposal_reminder',
                })

                reminderEmails++
              }
            } catch (e) {
              console.error('Failed to send proposal reminder email:', e)
            }
          }
        }
      }

      // 30min before deadline reminder
      const minutesUntilDeadline = hoursUntilDeadline * 60
      if (minutesUntilDeadline > 25 && minutesUntilDeadline <= 35) {
        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Pripomienka',
          message: `Máte nepotvrdené návrhy tréningov. Potvrďte ich do ${Math.round(minutesUntilDeadline)} minút.`,
          type: 'proposal_reminder',
        })
        reminders12h++
      }

      // 10min before deadline reminder
      if (minutesUntilDeadline > 0 && minutesUntilDeadline <= 12) {
        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Posledných 10 minút na potvrdenie',
          message: 'Návrhy tréningov je možné potvrdiť ešte niekoľko minút.',
          type: 'proposal_urgent',
        })
        reminders1h++
      }
    }

    return new Response(
      JSON.stringify({ expired, reminders12h, reminders1h, reminderEmails, total: pendingBookings?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
