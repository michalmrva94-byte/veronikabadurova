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
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      // Send notification to all admins
      try {
        const [{ data: clientProfile }, { data: slot }, { data: adminRoles }] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', variables.client_id).single(),
          supabase.from('training_slots').select('start_time').eq('id', variables.slot_id).single(),
          supabase.from('user_roles').select('user_id').eq('role', 'admin'),
        ]);

        if (adminRoles && adminRoles.length > 0) {
          const timeStr = slot ? new Date(slot.start_time).toLocaleString('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          const name = clientProfile?.full_name || 'Klient';

          // Get admin profile IDs
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('id')
            .in('user_id', adminRoles.map(r => r.user_id));

          if (adminProfiles && adminProfiles.length > 0) {
            await supabase.from('notifications').insert(
              adminProfiles.map(a => ({
                user_id: a.id,
                title: 'Nová žiadosť o tréning',
                message: `${name} požiadal/a o tréning dňa ${timeStr}.`,
                type: 'booking_request',
              }))
            );
          }
        }
      } catch (e) {
        console.error('Failed to send admin notification:', e);
      }
    },
  });

  return {
    createBooking,
  };
}
