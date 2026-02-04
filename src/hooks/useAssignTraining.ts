import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AssignTrainingParams {
  start_time: string;
  end_time: string;
  client_id: string;
  price: number;
  notes?: string;
}

export function useAssignTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ start_time, end_time, client_id, price, notes }: AssignTrainingParams) => {
      // 1. Create the training slot
      const { data: slot, error: slotError } = await supabase
        .from('training_slots')
        .insert({
          start_time,
          end_time,
          notes: notes || null,
          is_available: true,
          is_recurring: false,
        })
        .select()
        .single();

      if (slotError) throw slotError;

      // 2. Create the booking with status 'booked' (already confirmed by admin)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slot_id: slot.id,
          client_id,
          price,
          status: 'booked', // Directly booked since admin is creating it
        })
        .select()
        .single();

      if (bookingError) {
        // Rollback: delete the slot if booking failed
        await supabase.from('training_slots').delete().eq('id', slot.id);
        throw bookingError;
      }

      // 3. Create notification for the client
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: client_id,
          title: 'Nový tréning priradený',
          message: `Bol vám priradený nový tréning. Skontrolujte si detaily v sekcii "Moje tréningy".`,
          type: 'booking_confirmed',
        });

      if (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      return { slot, booking };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}
