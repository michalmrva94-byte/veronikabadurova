import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking, TrainingSlot } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInHours } from 'date-fns';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';

export type BookingWithSlot = Booking & { slot: TrainingSlot };

export function useClientBookings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['client-bookings', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          slot:training_slots(*)
        `)
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BookingWithSlot[];
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000, // 30 sekúnd
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!profile?.id) throw new Error('Nie ste prihlásený');

      // Najprv získať booking pre výpočet storno poplatku
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`*, slot:training_slots(*)`)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      const slot = booking.slot as TrainingSlot;
      const hoursUntilTraining = differenceInHours(new Date(slot.start_time), new Date());
      
      // Fetch cancellation fee percentages from app_settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['cancel_fee_24h', 'cancel_fee_48h']);

      const settingsMap: Record<string, number> = {};
      (settings || []).forEach((s: any) => {
        settingsMap[s.key] = parseFloat(s.value) || 0;
      });

      const fee24h = settingsMap['cancel_fee_24h'] ?? 80;
      const fee48h = settingsMap['cancel_fee_48h'] ?? 50;

      let cancellationFeePercentage = 0;
      if (hoursUntilTraining <= 24) {
        cancellationFeePercentage = fee24h;
      } else if (hoursUntilTraining <= 48) {
        cancellationFeePercentage = fee48h;
      }

      const cancellationFee = booking.price * (cancellationFeePercentage / 100);

      if (booking.status === 'awaiting_confirmation') {
        // Atomicky zrušiť booking a zmazať slot cez RPC
        const { error: rpcError } = await supabase.rpc('delete_proposed_slot', {
          p_slot_id: booking.slot_id,
          p_booking_id: bookingId,
        });
        if (rpcError) throw rpcError;
      } else {
        // Bežný booking — aktualizovať status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancellation_fee: cancellationFee,
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
        if (updateError) throw updateError;

        // Uvoľniť slot pre last-minute
        const { error: slotError } = await supabase
          .from('training_slots')
          .update({ is_available: true })
          .eq('id', booking.slot_id);
        if (slotError) console.error('Slot update error:', slotError);
      }

      // Spracovať storno poplatok cez apply_charge RPC
      if (cancellationFee > 0) {
        const { error: feeError } = await supabase.rpc('apply_charge', {
          p_client_id: profile.id,
          p_booking_id: bookingId,
          p_charge_type: 'cancellation',
          p_charge: cancellationFee,
          p_note: `Storno poplatok (${cancellationFeePercentage}%)`,
        });

        if (feeError) {
          console.error('Failed to process cancellation fee:', feeError);
        }
      }

      // Send cancellation email to admins is handled via in-app notif
      // Send email to client themselves as confirmation of cancellation
      if (profile.email) {
        const slotStart = new Date(slot.start_time);
        sendNotificationEmail({
          type: 'cancellation',
          to: profile.email,
          clientName: profile.full_name,
          trainingDate: slotStart.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }),
          trainingTime: slotStart.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
          cancelledBy: 'client',
          cancellationFee: cancellationFee > 0 ? `${cancellationFee.toFixed(2)}€` : undefined,
        });
      }

      return { cancellationFee };
    },
    onSuccess: async (_data, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // Send notification to all admins about cancellation
      try {
        const { data: booking } = await supabase
          .from('bookings')
          .select('slot:training_slots(start_time), client:profiles!bookings_client_id_fkey(full_name)')
          .eq('id', bookingId)
          .single();

        const { data: adminIds } = await supabase.rpc('get_admin_profile_ids');

        if (adminIds && adminIds.length > 0) {
          const slot = booking?.slot as any;
          const client = booking?.client as any;
          const timeStr = slot ? new Date(slot.start_time).toLocaleString('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          const name = client?.full_name || 'Klient';

          await supabase.from('notifications').insert(
            adminIds.map((adminId: string) => ({
              user_id: adminId,
              title: 'Storno tréningu',
              message: `${name} stornoval/a tréning dňa ${timeStr}.`,
              type: 'booking_cancelled',
            }))
          );
        }
      } catch (e) {
        console.error('Failed to send admin cancellation notification:', e);
      }
    },
  });

  // Rozdeliť na nadchádzajúce a minulé
  const now = new Date();
  
  // Nadchádzajúce = pending alebo booked, v budúcnosti
  const upcomingBookings = (bookingsQuery.data || []).filter(
    (booking) =>
      (booking.status === 'booked' || booking.status === 'pending') &&
      new Date(booking.slot.start_time) > now
  );

  // Minulé = cancelled, completed, no_show alebo v minulosti alebo vypršané návrhy
  const pastBookings = (bookingsQuery.data || []).filter(
    (booking) =>
      (booking.status !== 'booked' && booking.status !== 'pending' && booking.status !== 'awaiting_confirmation') ||
      new Date(booking.slot.start_time) <= now ||
      (booking.status === 'awaiting_confirmation' && booking.confirmation_deadline && new Date(booking.confirmation_deadline) <= now)
  );

  // Navrhnuté = awaiting_confirmation, v budúcnosti, deadline ešte nevypršal
  const proposedBookings = (bookingsQuery.data || []).filter(
    (booking) =>
      booking.status === 'awaiting_confirmation' &&
      new Date(booking.slot.start_time) > now &&
      (!booking.confirmation_deadline || new Date(booking.confirmation_deadline) > now)
  );

  return {
    bookings: bookingsQuery.data || [],
    upcomingBookings,
    pastBookings,
    proposedBookings,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    cancelBooking,
  };
}
