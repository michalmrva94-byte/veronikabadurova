import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export type TransactionFilter = 'all' | 'deposits' | 'trainings' | 'fees' | 'debt';

const PAGE_SIZE = 20;

export function useTransactions() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const monthStart = startOfMonth(selectedMonth).toISOString();
  const monthEnd = endOfMonth(selectedMonth).toISOString();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', profile?.id, filter, page, monthStart],
    queryFn: async () => {
      if (!profile?.id) return { data: [], hasMore: false };

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('client_id', profile.id)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'deposits') {
        query = query.in('type', ['deposit', 'referral_bonus']);
      } else if (filter === 'trainings') {
        query = query.eq('type', 'training');
      } else if (filter === 'fees') {
        query = query.in('type', ['cancellation', 'no_show']);
      } else if (filter === 'debt') {
        query = query.eq('direction', 'debt_increase');
      }

      query = query.range(0, page * PAGE_SIZE - 1);

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: (data || []) as Transaction[],
        hasMore: (data || []).length === page * PAGE_SIZE,
      };
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000,
  });

  const result = transactionsQuery.data || { data: [], hasMore: false };
  const transactions = result.data;

  const changeMonth = (direction: 'prev' | 'next') => {
    setPage(1);
    setSelectedMonth(prev =>
      direction === 'prev' ? subMonths(prev, 1) : subMonths(prev, -1)
    );
  };

  const isCurrentMonth =
    format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return {
    transactions,
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    filter,
    setFilter: (f: TransactionFilter) => { setFilter(f); setPage(1); },
    hasMore: result.hasMore,
    loadMore: () => setPage(p => p + 1),
    selectedMonth,
    changeMonth,
    isCurrentMonth,
  };
}
