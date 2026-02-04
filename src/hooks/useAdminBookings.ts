import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking, TrainingSlot, Profile } from '@/types/database';

export type AdminBookingWithDetails = Booking & {
  slot: TrainingSlot;
  client: Profile;
};

export function useAdminBookings() {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          slot:training_slots(*),
          client:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminBookingWithDetails[];
    },
    staleTime: 30 * 1000,
  });

  const pendingBookings = (bookingsQuery.data || []).filter(
    (b) => b.status === 'pending'
  );

  const confirmedBookings = (bookingsQuery.data || []).filter(
    (b) => b.status === 'booked' && new Date(b.slot.start_time) >= new Date()
  );

  const todayBookings = confirmedBookings.filter((b) => {
    const slotDate = new Date(b.slot.start_time);
    const today = new Date();
    return (
      slotDate.getDate() === today.getDate() &&
      slotDate.getMonth() === today.getMonth() &&
      slotDate.getFullYear() === today.getFullYear()
    );
  });

  const approveBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      // Aktualizovať booking na 'booked'
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Získať booking pre vytvorenie notifikácie
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`*, slot:training_slots(*), client:profiles(*)`)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Vytvoriť notifikáciu pre klienta
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: booking.client_id,
          title: 'Rezervácia potvrdená ✓',
          message: `Váš tréning bol potvrdený. Tešíme sa na vás!`,
          type: 'booking_confirmed',
          related_slot_id: booking.slot_id,
        });

      if (notifError) console.error('Notification error:', notifError);

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const rejectBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      // Získať booking pred zmazaním
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`*, slot:training_slots(*), client:profiles(*)`)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Aktualizovať booking na 'cancelled'
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Zamietnuté administrátorom',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Vytvoriť notifikáciu pre klienta
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: booking.client_id,
          title: 'Rezervácia zamietnutá',
          message: reason || 'Bohužiaľ, váš požadovaný termín nie je možné potvrdiť. Prosím, vyberte si iný termín.',
          type: 'booking_rejected',
          related_slot_id: booking.slot_id,
        });

      if (notifError) console.error('Notification error:', notifError);

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      // Získať booking
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`*, slot:training_slots(*), client:profiles(*)`)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Aktualizovať booking na 'cancelled'
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Zrušené administrátorom',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Uvolniť slot
      const { error: slotError } = await supabase
        .from('training_slots')
        .update({ is_available: true })
        .eq('id', booking.slot_id);

      if (slotError) console.error('Slot update error:', slotError);

      // Vytvoriť notifikáciu pre klienta
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: booking.client_id,
          title: 'Tréning zrušený',
          message: reason || 'Váš tréning bol zrušený trénerom.',
          type: 'booking_cancelled',
          related_slot_id: booking.slot_id,
        });

      if (notifError) console.error('Notification error:', notifError);

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    pendingBookings,
    confirmedBookings,
    todayBookings,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    approveBooking,
    rejectBooking,
    cancelBooking,
  };
}
