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

  return {
    bookings: bookingsQuery.data || [],
    pendingBookings,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    approveBooking,
    rejectBooking,
  };
}
