import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMonths } from 'date-fns';

export type DashboardPeriod = 'week' | 'month' | 'custom';

export interface DashboardDateRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface AdminDashboardStats {
  activeClients: number;
  pendingClients: number;
  weekTrainings: number;
  unconfirmedBookings: number;
  clientsWithDebt: number;
  monthlyRevenue: number;
  stornoRate: number;
  avgTrainingsPerClient: number;
  slotOccupancy: number;
  totalDebt: number;
  clv: number;
  avgCooperationMonths: number;
  avgMonthlyRevenuePerClient: number;
}

export function getDefaultRange(period: 'week' | 'month'): DashboardDateRange {
  const now = new Date();
  if (period === 'week') {
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

function estimateWeeks(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.round(days / 7));
}

export function useAdminDashboardStats(range: DashboardDateRange) {
  return useQuery({
    queryKey: ['admin-dashboard-stats', range.start.toISOString(), range.end.toISOString()],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const { start, end } = range;
      const periodWeeks = estimateWeeks(start, end);

      const [
        profilesRes,
        periodBookingsRes,
        unconfirmedRes,
        periodTransRes,
        allPeriodBookingsRes,
        slotsRes,
        completedBookingsRes,
        trainingTransRes,
      ] = await Promise.all([
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
        supabase
          .from('bookings')
          .select('id, status, slot:training_slots(start_time)')
          .gte('created_at', '2000-01-01'),
        supabase
          .from('training_slots')
          .select('id, start_time, is_available, bookings(id)')
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
        supabase
          .from('bookings')
          .select('id, client_id, price, created_at')
          .eq('status', 'completed'),
        supabase
          .from('transactions')
          .select('amount, client_id, created_at')
          .eq('type', 'training'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const profiles = profilesRes.data || [];
      const activeClients = profiles.filter(p => p.approval_status === 'approved').length;
      const pendingClients = profiles.filter(p => p.approval_status === 'pending').length;
      const clientsWithDebt = profiles.filter(p => (p.balance ?? 0) < 0).length;
      const totalDebt = profiles
        .filter(p => (p.balance ?? 0) < 0)
        .reduce((sum, p) => sum + Math.abs(p.balance ?? 0), 0);

      const weekTrainings = (periodBookingsRes.data || []).filter((b: any) => {
        const slotTime = b.slot?.start_time;
        if (!slotTime) return false;
        const d = new Date(slotTime);
        return d >= start && d <= end;
      }).length;

      const unconfirmedBookings = unconfirmedRes.data?.length ?? 0;

      const monthlyRevenue = (periodTransRes.data || [])
        .reduce((sum, t) => sum + t.amount, 0);

      const periodAllBookings = (allPeriodBookingsRes.data || []).filter((b: any) => {
        const slotTime = b.slot?.start_time;
        if (!slotTime) return false;
        const d = new Date(slotTime);
        return d >= start && d <= end;
      });
      const stornoCount = periodAllBookings.filter(
        (b: any) => b.status === 'cancelled' || b.status === 'no_show'
      ).length;
      const totalRelevant = periodAllBookings.filter(
        (b: any) => ['cancelled', 'no_show', 'booked', 'completed'].includes(b.status)
      ).length;
      const stornoRate = totalRelevant > 0 ? (stornoCount / totalRelevant) * 100 : 0;

      const activeBookings = periodAllBookings.filter(
        (b: any) => b.status === 'booked' || b.status === 'completed'
      ).length;
      const avgTrainingsPerClient = activeClients > 0
        ? activeBookings / activeClients / periodWeeks
        : 0;

      const slots = slotsRes.data || [];
      const totalSlots = slots.length;
      const bookedSlots = slots.filter((s: any) => s.bookings && s.bookings.length > 0).length;
      const slotOccupancy = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      const completed = completedBookingsRes.data || [];
      const trainingTrans = trainingTransRes.data || [];
      
      let clv = 0;
      let avgCooperationMonths = 0;
      let avgMonthlyRevenuePerClient = 0;

      if (completed.length > 0) {
        const clientMap = new Map<string, { dates: Date[]; totalRevenue: number }>();
        
        for (const b of completed) {
          if (!clientMap.has(b.client_id)) {
            clientMap.set(b.client_id, { dates: [], totalRevenue: 0 });
          }
          const entry = clientMap.get(b.client_id)!;
          entry.dates.push(new Date(b.created_at));
          entry.totalRevenue += b.price;
        }

        const clientStats = Array.from(clientMap.entries()).map(([, data]) => {
          const sorted = data.dates.sort((a, b) => a.getTime() - b.getTime());
          const months = sorted.length > 1
            ? Math.max(1, differenceInMonths(sorted[sorted.length - 1], sorted[0]))
            : 1;
          return {
            months,
            monthlyRevenue: data.totalRevenue / months,
            totalRevenue: data.totalRevenue,
          };
        });

        const totalMonths = clientStats.reduce((s, c) => s + c.months, 0);
        avgCooperationMonths = clientStats.length > 0 ? totalMonths / clientStats.length : 0;
        
        const totalMonthlyRev = clientStats.reduce((s, c) => s + c.monthlyRevenue, 0);
        avgMonthlyRevenuePerClient = clientStats.length > 0 ? totalMonthlyRev / clientStats.length : 0;
        
        clv = avgCooperationMonths * avgMonthlyRevenuePerClient;
      }

      return {
        activeClients,
        pendingClients,
        weekTrainings,
        unconfirmedBookings,
        clientsWithDebt,
        monthlyRevenue,
        stornoRate,
        avgTrainingsPerClient,
        slotOccupancy,
        totalDebt,
        clv,
        avgCooperationMonths,
        avgMonthlyRevenuePerClient,
      };
    },
    staleTime: 30 * 1000,
  });
}
