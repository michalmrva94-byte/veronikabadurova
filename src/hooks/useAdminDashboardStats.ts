import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth } from 'date-fns';

export interface AdminDashboardStats {
  activeClients: number;
  pendingClients: number;
  weekTrainings: number;
  unconfirmedBookings: number;
  clientsWithDebt: number;
  monthlyRevenue: number;
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Parallel queries
      const [profilesRes, weekBookingsRes, unconfirmedRes, monthTransRes] = await Promise.all([
        // All client profiles
        supabase.from('profiles').select('approval_status, balance'),
        // Booked trainings this week
        supabase
          .from('bookings')
          .select('id, slot:training_slots(start_time)')
          .eq('status', 'booked')
          .gte('created_at', '2000-01-01'), // need all, filter by slot time below
        // Unconfirmed bookings
        supabase
          .from('bookings')
          .select('id')
          .in('status', ['pending', 'proposed', 'awaiting_confirmation']),
        // Monthly deposits
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'deposit')
          .gte('created_at', monthStart.toISOString()),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const profiles = profilesRes.data || [];
      const activeClients = profiles.filter(p => p.approval_status === 'approved').length;
      const pendingClients = profiles.filter(p => p.approval_status === 'pending').length;
      const clientsWithDebt = profiles.filter(p => (p.balance ?? 0) < 0).length;

      // Filter week trainings by slot start_time
      const weekTrainings = (weekBookingsRes.data || []).filter((b: any) => {
        const slotTime = b.slot?.start_time;
        if (!slotTime) return false;
        const d = new Date(slotTime);
        return d >= weekStart && d <= weekEnd;
      }).length;

      const unconfirmedBookings = unconfirmedRes.data?.length ?? 0;

      const monthlyRevenue = (monthTransRes.data || [])
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
