import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useTransactions() {
  const { profile } = useAuth();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000,
  });

  // Calculate totals
  const transactions = transactionsQuery.data || [];
  
  // Vklady (deposits) - positive amounts
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' || t.type === 'referral_bonus')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Výdavky (expenses) - negative amounts (training, cancellation)
  const totalExpenses = transactions
    .filter(t => t.type === 'training' || t.type === 'cancellation')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Storno poplatky specifically
  const totalCancellationFees = transactions
    .filter(t => t.type === 'cancellation')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    transactions,
    totalDeposits,
    totalExpenses,
    totalCancellationFees,
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
  };
}
