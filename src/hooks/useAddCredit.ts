import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddCreditParams {
  clientId: string;
  amount: number;
  description?: string;
  paidMethod?: string;
}

export function useAddCredit() {
  const queryClient = useQueryClient();
  const { profile: adminProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ clientId, amount, description, paidMethod }: AddCreditParams) => {
      if (!adminProfile?.id) throw new Error('Admin nie je prihlásený');

      // Get current client balance and debt
      const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('balance, debt_balance')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const currentBalance = client.balance ?? 0;
      const currentDebt = client.debt_balance ?? 0;
      const newBalance = currentBalance + amount;

      // Auto-offset debt when adding credit
      const debtReduction = Math.min(Math.max(newBalance, 0), currentDebt);
      const finalBalance = newBalance - debtReduction;
      const finalDebt = currentDebt - debtReduction;

      // Update client balance and debt in one call
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: finalBalance, debt_balance: finalDebt })
        .eq('id', clientId);

      if (updateError) throw updateError;

      // Map paid method
      const dbPaidMethod = paidMethod === 'hotovost' ? 'cash' 
        : paidMethod === 'prevod' ? 'bank_transfer' 
        : paidMethod === 'iny' ? 'other' 
        : null;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          client_id: clientId,
          type: amount >= 0 ? 'deposit' : 'manual_adjustment',
          amount: amount,
          balance_after: finalBalance,
          description: description || (amount >= 0 ? 'Vklad kreditu' : 'Manuálna úprava'),
          created_by: adminProfile.id,
          direction: 'in',
          paid_method: dbPaidMethod,
        });

      if (transactionError) throw transactionError;

      return { newBalance: finalBalance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finances-stats'] });
      queryClient.invalidateQueries({ queryKey: ['clients-with-debt'] });
    },
  });
}
