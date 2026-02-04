import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateBookingParams {
  slot_id: string;
  client_id: string;
  price: number;
}

export function useBookings() {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async ({ slot_id, client_id, price }: CreateBookingParams) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          slot_id,
          client_id,
          price,
          status: 'booked',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return {
    createBooking,
  };
}
