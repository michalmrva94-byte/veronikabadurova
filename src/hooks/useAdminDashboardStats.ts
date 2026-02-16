import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, subWeeks } from 'date-fns';

export type DashboardPeriod = 'week' | '2weeks' | 'month';

export interface AdminDashboardStats {
  activeClients: number;
  pendingClients: number;
  weekTrainings: number;
  unconfirmedBookings: number;
  clientsWithDebt: number;
  monthlyRevenue: number;
}

function getPeriodRange(period: DashboardPeriod) {
  const now = new Date();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  switch (period) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: weekEnd };
    case '2weeks':
      return { start: subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1), end: weekEnd };
    case 'month':
      return { start: startOfMonth(now), end: now };
  }
}

export function useAdminDashboardStats(period: DashboardPeriod = 'week') {
  return useQuery({
    queryKey: ['admin-dashboard-stats', period],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const { start, end } = getPeriodRange(period);

      const [profilesRes, periodBookingsRes, unconfirmedRes, periodTransRes] = await Promise.all([
        supabase.from('profiles').select('approval_status, balance'),
        supabase
          .from('bookings')
          .select('id, slot:training_slots(start_time)')
          .eq('status', 'booked')
          .gte('created_at', '2000-01-01'),
        supabase
          .from('bookings')
          .select('id')
          .in('status', ['pending', 'proposed', 'awaiting_confirmation']),
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'deposit')
          .gte('created_at', start.toISOString()),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const profiles = profilesRes.data || [];
      const activeClients = profiles.filter(p => p.approval_status === 'approved').length;
      const pendingClients = profiles.filter(p => p.approval_status === 'pending').length;
      const clientsWithDebt = profiles.filter(p => (p.balance ?? 0) < 0).length;

      const weekTrainings = (periodBookingsRes.data || []).filter((b: any) => {
        const slotTime = b.slot?.start_time;
        if (!slotTime) return false;
        const d = new Date(slotTime);
        return d >= start && d <= end;
      }).length;

      const unconfirmedBookings = unconfirmedRes.data?.length ?? 0;

      const monthlyRevenue = (periodTransRes.data || [])
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        activeClients,
        pendingClients,
        weekTrainings,
        unconfirmedBookings,
        clientsWithDebt,
        monthlyRevenue,
      };
    },
    staleTime: 30 * 1000,
  });
}
