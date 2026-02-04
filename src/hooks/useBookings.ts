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
      // Najprv skontrolovať, či slot nie je už rezervovaný
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('slot_id', slot_id)
        .in('status', ['booked', 'pending'])
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingBooking) {
        throw new Error('Tento termín už nie je dostupný. Prosím, vyberte iný.');
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          slot_id,
          client_id,
          price,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Tento termín už nie je dostupný. Prosím, vyberte iný.');
        }
        throw error;
      }
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
