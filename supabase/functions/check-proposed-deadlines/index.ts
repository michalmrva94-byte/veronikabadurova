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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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

    for (const booking of pendingBookings || []) {
      const deadline = new Date(booking.confirmation_deadline)
      const createdAt = new Date(booking.created_at)
      const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

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
          .update({ is_available: true })
          .eq('id', booking.slot_id)

        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Návrh tréningu vypršal',
          message: 'Navrhnutý tréning nebol potvrdený včas. Termín bol uvoľnený.',
          type: 'proposal_expired',
        })

        expired++
        continue
      }

      // 12h reminder (between 11.5h and 12.5h since creation)
      if (hoursSinceCreation >= 11.5 && hoursSinceCreation < 12.5) {
        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Pripomienka',
          message: `Máte nepotvrdené návrhy tréningov. Potvrďte ich do ${Math.round(hoursUntilDeadline)} hodín.`,
          type: 'proposal_reminder',
        })
        reminders12h++
      }

      // 1h before deadline reminder
      if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 1.5 && hoursSinceCreation >= 22) {
        await supabase.from('notifications').insert({
          user_id: booking.client_id,
          title: 'Posledná hodina na potvrdenie',
          message: 'Návrhy tréningov je možné potvrdiť ešte necelú hodinu.',
          type: 'proposal_urgent',
        })
        reminders1h++
      }
    }

    return new Response(
      JSON.stringify({ expired, reminders12h, reminders1h, total: pendingBookings?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
