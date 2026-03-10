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

      return { cancellationFee, clientName: profile.full_name, slotStart: slot.start_time };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      const { clientName, slotStart } = data;
      const slotDate = new Date(slotStart);
      const timeStr = slotDate.toLocaleString('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
      const name = clientName || 'Klient';

      try {
        // In-app notifications for admins
        const { data: adminProfileIds } = await supabase.rpc('get_admin_profile_ids');
        if (adminProfileIds && adminProfileIds.length > 0) {
          await supabase.from('notifications').insert(
            adminProfileIds.map((adminId: string) => ({
              user_id: adminId,
              title: 'Storno tréningu',
              message: `${name} stornoval/a tréning dňa ${timeStr}.`,
              type: 'booking_cancelled',
            }))
          );
        }

        // Push notification to admins
        const { data: adminUserIds } = await supabase.rpc('get_admin_user_ids');
        if (adminUserIds && adminUserIds.length > 0) {
          sendPushNotification({
            user_ids: adminUserIds,
            title: 'Storno tréningu ❌',
            body: `${name} stornoval/a tréning dňa ${timeStr}.`,
            url: '/admin/kalendar',
          });
        }

        // Email notification to admin
        const { data: adminProfiles } = await supabase.rpc('get_admin_profile_ids');
        if (adminProfiles && adminProfiles.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email')
            .in('id', adminProfiles);

          for (const ap of profiles || []) {
            if (ap.email) {
              sendNotificationEmail({
                type: 'cancellation',
                to: ap.email,
                clientName: name,
                trainingDate: slotDate.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }),
                trainingTime: slotDate.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
                cancelledBy: 'client',
                cancellationFee: data.cancellationFee > 0 ? `${data.cancellationFee.toFixed(2)}€` : undefined,
              });
            }
          }
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
