import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';

interface CreateBookingParams {
  slot_id: string;
  client_id: string;
  price: number;
  is_last_minute?: boolean;
}

export function useBookings() {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async ({ slot_id, client_id, price, is_last_minute }: CreateBookingParams) => {
      // Najprv skontrolovať, či slot nie je už rezervovaný
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('slot_id', slot_id)
        .in('status', ['booked', 'pending', 'awaiting_confirmation'])
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
          is_last_minute: is_last_minute || false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Tento termín už nie je dostupný. Prosím, vyberte iný.');
        }
        throw error;
      }

      // Označiť slot ako nedostupný
      await supabase
        .from('training_slots')
        .update({ is_available: false })
        .eq('id', slot_id);

      return data;
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      // Send notification to all admins
      try {
        const [{ data: clientProfile }, { data: slot }] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', variables.client_id).single(),
          supabase.from('training_slots').select('start_time').eq('id', variables.slot_id).single(),
        ]);

        const { data: adminIds } = await supabase.rpc('get_admin_profile_ids');

        if (adminIds && adminIds.length > 0) {
          const timeStr = slot ? new Date(slot.start_time).toLocaleString('sk-SK', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          const name = clientProfile?.full_name || 'Klient';

          await supabase.from('notifications').insert(
            adminIds.map((adminId: string) => ({
              user_id: adminId,
              title: 'Nová žiadosť o tréning',
              message: `${name} požiadal/a o tréning dňa ${timeStr}.`,
              type: 'booking_request',
            }))
          );
        }

        // Send email notification to admin
        if (slot) {
          const startDate = new Date(slot.start_time);
          await sendNotificationEmail({
            type: 'admin_booking_request',
            to: 'veronika.duro@gmail.com',
            clientName: clientProfile?.full_name || 'Klient',
            trainingDate: startDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' }),
            trainingTime: startDate.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
          });
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
