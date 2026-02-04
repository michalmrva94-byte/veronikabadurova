import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Booking, TrainingSlot } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInHours } from 'date-fns';

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
      
      let cancellationFeePercentage = 0;
      if (hoursUntilTraining <= 24) {
        cancellationFeePercentage = 80;
      } else if (hoursUntilTraining <= 48) {
        cancellationFeePercentage = 50;
      }

      const cancellationFee = booking.price * (cancellationFeePercentage / 100);

      // Aktualizovať booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_fee: cancellationFee,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Spracovať storno poplatok cez databázovú funkciu (SECURITY DEFINER)
      if (cancellationFee > 0) {
        const { error: feeError } = await supabase.rpc('process_booking_cancellation', {
          p_booking_id: bookingId,
          p_client_id: profile.id,
          p_cancellation_fee: cancellationFee,
          p_fee_percentage: cancellationFeePercentage,
        });

        if (feeError) {
          console.error('Failed to process cancellation fee:', feeError);
          // Continue even if fee processing fails - booking is already cancelled
        }
      }

      return { cancellationFee };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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

  // Minulé = cancelled, completed, no_show alebo v minulosti
  const pastBookings = (bookingsQuery.data || []).filter(
    (booking) =>
      (booking.status !== 'booked' && booking.status !== 'pending') ||
      new Date(booking.slot.start_time) <= now
  );

  return {
    bookings: bookingsQuery.data || [],
    upcomingBookings,
    pastBookings,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    cancelBooking,
  };
}
