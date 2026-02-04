import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddCreditParams {
  clientId: string;
  amount: number;
  description?: string;
}

export function useAddCredit() {
  const queryClient = useQueryClient();
  const { profile: adminProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ clientId, amount, description }: AddCreditParams) => {
      if (!adminProfile?.id) throw new Error('Admin nie je prihlásený');

      // Get current client balance
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const currentBalance = client.balance ?? 0;
      const newBalance = currentBalance + amount;

      // Update client balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', clientId);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          client_id: clientId,
          type: amount >= 0 ? 'deposit' : 'manual_adjustment',
          amount: amount,
          balance_after: newBalance,
          description: description || (amount >= 0 ? 'Vklad kreditu' : 'Manuálna úprava'),
          created_by: adminProfile.id,
        });

      if (transactionError) throw transactionError;

      return { newBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finances-stats'] });
    },
  });
}
