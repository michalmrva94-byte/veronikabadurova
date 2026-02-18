import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FinancePeriod = 'week' | 'month';

export interface FinanceDateRange {
  start: Date;
  end: Date;
  label?: string;
}

interface FinancePeriodDates {
  currentStart: string;
  currentEnd: string;
  prevStart: string;
  prevEnd: string;
}

function getPeriodDates(period: FinancePeriod, customRange?: FinanceDateRange | null): FinancePeriodDates {
  // Custom range: use exact dates, prev = same duration before
  if (customRange) {
    const duration = customRange.end.getTime() - customRange.start.getTime();
    const prevEnd = new Date(customRange.start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return {
      currentStart: customRange.start.toISOString(),
      currentEnd: customRange.end.toISOString(),
      prevStart: prevStart.toISOString(),
      prevEnd: prevEnd.toISOString(),
    };
  }

  const now = new Date();
  const currentEnd = now.toISOString();

  if (period === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setMilliseconds(-1);

    return {
      currentStart: weekStart.toISOString(),
      currentEnd,
      prevStart: prevWeekStart.toISOString(),
      prevEnd: prevWeekEnd.toISOString(),
    };
  }

  // month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(monthStart);
  prevMonthEnd.setMilliseconds(-1);

  return {
    currentStart: monthStart.toISOString(),
    currentEnd,
    prevStart: prevMonthStart.toISOString(),
    prevEnd: prevMonthEnd.toISOString(),
  };
}

export interface AdminFinancesStats {
  earned: number;
  prevEarned: number;
  deposits: number;
  prevDeposits: number;
  totalDebts: number;
  totalCredits: number;
  creditUsage: number;
}

export function useAdminFinancesStats(period: FinancePeriod = 'month', customRange?: FinanceDateRange | null) {
  return useQuery({
    queryKey: ['admin-finances-stats', period, customRange?.start?.toISOString(), customRange?.end?.toISOString()],
    queryFn: async (): Promise<AdminFinancesStats> => {
      const dates = getPeriodDates(period, customRange);

      const [
        earnedRes,
        prevEarnedRes,
        depositsRes,
        prevDepositsRes,
        creditUsageRes,
        profilesRes,
      ] = await Promise.all([
        // earned: training + cancellation in current period
        supabase
          .from('transactions')
          .select('amount')
          .in('type', ['training', 'cancellation'])
          .gte('created_at', dates.currentStart)
          .lte('created_at', dates.currentEnd),
        // prev earned
        supabase
          .from('transactions')
          .select('amount')
          .in('type', ['training', 'cancellation'])
          .gte('created_at', dates.prevStart)
          .lte('created_at', dates.prevEnd),
        // deposits current
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'deposit')
          .gte('created_at', dates.currentStart)
          .lte('created_at', dates.currentEnd),
        // deposits prev
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'deposit')
          .gte('created_at', dates.prevStart)
          .lte('created_at', dates.prevEnd),
        // credit usage (training transactions in period)
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'training')
          .gte('created_at', dates.currentStart)
          .lte('created_at', dates.currentEnd),
        // profiles for balance totals
        supabase
          .from('profiles')
          .select('balance'),
      ]);

      if (earnedRes.error) throw earnedRes.error;
      if (prevEarnedRes.error) throw prevEarnedRes.error;
      if (depositsRes.error) throw depositsRes.error;
      if (prevDepositsRes.error) throw prevDepositsRes.error;
      if (creditUsageRes.error) throw creditUsageRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const sumAbs = (data: { amount: number }[]) =>
        data.reduce((s, t) => s + Math.abs(t.amount), 0);
      const sumPositive = (data: { amount: number }[]) =>
        data.reduce((s, t) => s + t.amount, 0);

      let totalCredits = 0;
      let totalDebts = 0;
      (profilesRes.data || []).forEach((p) => {
        const b = p.balance ?? 0;
        if (b > 0) totalCredits += b;
        else if (b < 0) totalDebts += Math.abs(b);
      });

      return {
        earned: sumAbs(earnedRes.data || []),
        prevEarned: sumAbs(prevEarnedRes.data || []),
        deposits: sumPositive(depositsRes.data || []),
        prevDeposits: sumPositive(prevDepositsRes.data || []),
        totalDebts,
        totalCredits,
        creditUsage: sumAbs(creditUsageRes.data || []),
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useClientsWithDebt() {
  return useQuery({
    queryKey: ['clients-with-debt'],
    queryFn: async () => {
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client');

      if (rolesError) throw rolesError;

      const clientUserIds = clientRoles.map(r => r.user_id);
      if (clientUserIds.length === 0) return [];

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
