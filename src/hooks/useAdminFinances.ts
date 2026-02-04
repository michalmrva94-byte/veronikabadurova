import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminFinancesStats() {
  return useQuery({
    queryKey: ['admin-finances-stats'],
    queryFn: async () => {
      // Get all client profiles with their balances
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('balance');

      if (profilesError) throw profilesError;

      let totalCredits = 0;
      let totalDebts = 0;

      (profiles || []).forEach((profile) => {
        const balance = profile.balance ?? 0;
        if (balance > 0) {
          totalCredits += balance;
        } else if (balance < 0) {
          totalDebts += Math.abs(balance);
        }
      });

      // Get this month's transactions (deposits only for revenue)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthTransactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('created_at', startOfMonth.toISOString())
        .in('type', ['deposit', 'training']);

      if (transError) throw transError;

      const monthlyRevenue = (monthTransactions || [])
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalCredits,
        totalDebts,
        monthlyRevenue,
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useClientsWithDebt() {
  return useQuery({
    queryKey: ['clients-with-debt'],
    queryFn: async () => {
      // Get client user_ids
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      if (rolesError) throw rolesError;

      const clientUserIds = clientRoles.map(r => r.user_id);
      if (clientUserIds.length === 0) return [];

      // Get profiles with negative balance
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', clientUserIds)
        .lt('balance', 0)
        .order('balance', { ascending: true });

      if (profilesError) throw profilesError;

      return profiles || [];
    },
    staleTime: 30 * 1000,
  });
}
