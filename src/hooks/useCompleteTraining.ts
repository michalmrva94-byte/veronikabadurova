import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CompleteTrainingParams {
  bookingId: string;
  clientId: string;
  price: number;
  slotId: string;
}

interface NoShowParams {
  bookingId: string;
  clientId: string;
  price: number;
  slotId: string;
}

export function useCompleteTraining() {
  const queryClient = useQueryClient();
  const { profile: adminProfile } = useAuth();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
    queryClient.invalidateQueries({ queryKey: ['admin-finances-stats'] });
  };

  const completeTraining = useMutation({
    mutationFn: async ({ bookingId, clientId, price }: CompleteTrainingParams) => {
      if (!adminProfile?.id) throw new Error('Admin nie je prihlásený');

      // 1. Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);
      if (bookingError) throw bookingError;

      // 2. Get current balance & deduct
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', clientId)
        .single();
      if (clientError) throw clientError;

      const currentBalance = client.balance ?? 0;
      const newBalance = currentBalance - price;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', clientId);
      if (updateError) throw updateError;

      // 3. Create transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          client_id: clientId,
          type: 'training',
          amount: -price,
          balance_after: newBalance,
          description: 'Tréning - odplávaný',
          booking_id: bookingId,
          created_by: adminProfile.id,
        });
      if (transError) throw transError;

      // 4. Notify client
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'Tréning dokončený ✓',
        message: `Váš tréning bol označený ako odplávaný. Z kreditu bolo odpočítaných ${price}€.`,
        type: 'training_completed',
      });
    },
    onSuccess: invalidateAll,
  });

  const markNoShow = useMutation({
    mutationFn: async ({ bookingId, clientId, price }: NoShowParams) => {
      if (!adminProfile?.id) throw new Error('Admin nie je prihlásený');

      // 1. Update booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'no_show', cancellation_fee: price })
        .eq('id', bookingId);
      if (bookingError) throw bookingError;

      // 2. Deduct 100% fee
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', clientId)
        .single();
      if (clientError) throw clientError;

      const currentBalance = client.balance ?? 0;
      const newBalance = currentBalance - price;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', clientId);
      if (updateError) throw updateError;

      // 3. Create transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          client_id: clientId,
          type: 'cancellation',
          amount: -price,
          balance_after: newBalance,
          description: 'Neúčasť na tréningu (100% poplatok)',
          booking_id: bookingId,
          created_by: adminProfile.id,
        });
      if (transError) throw transError;

      // 4. Notify
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'Neúčasť na tréningu',
        message: `Neprišli ste na tréning. Bol vám účtovaný poplatok ${price}€.`,
        type: 'no_show',
      });
    },
    onSuccess: invalidateAll,
  });

  return { completeTraining, markNoShow };
}
