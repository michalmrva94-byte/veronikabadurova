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
    queryClient.invalidateQueries({ queryKey: ['clients-with-debt'] });
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

      // 2. Apply charge via RPC (handles credit/debt split)
      const { error: chargeError } = await supabase.rpc('apply_charge', {
        p_client_id: clientId,
        p_booking_id: bookingId,
        p_charge_type: 'training',
        p_charge: price,
        p_note: 'Tréning absolvovaný',
      });
      if (chargeError) throw chargeError;

      // 3. Notify client
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'Tréning dokončený',
        message: 'Váš tréning bol zaznamenaný. Ďakujeme a teším sa nabudúce 😊',
        type: 'training_completed',
      });
    },
    onSuccess: invalidateAll,
  });

  const markNoShow = useMutation({
    mutationFn: async ({ bookingId, clientId, price }: NoShowParams) => {
      if (!adminProfile?.id) throw new Error('Admin nie je prihlásený');

      // Fetch no-show fee percentage from settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'cancel_fee_noshow')
        .single();

      const noShowPercentage = settings ? parseFloat(settings.value) || 100 : 100;
      const noShowFee = price * (noShowPercentage / 100);

      // 1. Update booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'no_show', cancellation_fee: noShowFee })
        .eq('id', bookingId);
      if (bookingError) throw bookingError;

      // 2. Apply charge via RPC (handles credit/debt split)
      const { error: chargeError } = await supabase.rpc('apply_charge', {
        p_client_id: clientId,
        p_booking_id: bookingId,
        p_charge_type: 'no_show',
        p_charge: noShowFee,
        p_note: `Neúčasť na tréningu (${noShowPercentage}% poplatok)`,
      });
      if (chargeError) throw chargeError;

      // 3. Notify
      await supabase.from('notifications').insert({
        user_id: clientId,
        title: 'Neúčasť na tréningu',
        message: `Tréning nebol absolvovaný. Podľa podmienok sa účtuje ${noShowFee.toFixed(2)} €.`,
        type: 'no_show',
      });
    },
    onSuccess: invalidateAll,
  });

  return { completeTraining, markNoShow };
}
