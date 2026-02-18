import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInMonths, subDays, differenceInHours } from 'date-fns';

export type DashboardPeriod = 'week' | 'month' | 'custom';

export interface DashboardDateRange {
  start: Date;
  end: Date;
  label?: string;
}

export interface AdminDashboardStats {
  // Period-bound
  activeClients: number;
  regularClients: number;
  plannedTrainings: number;
  completedTrainings: number;
  cancelledTrainings: number;
  deposits: number;
  creditUsage: number;
  netRevenue: number;
  stornoRate: number;
  avgTrainingsPerClient: number;
  slotOccupancy: number;
  // Global
  unconfirmedBookings: number;
  criticalBookings: number;
  debtClients: number;
  totalDebt: number;
  riskyCancellers: number;
  // CLV
  clv: number;
  avgCooperationMonths: number;
  avgMonthlyRevenuePerClient: number;
  // Action alerts data
  debtClientsList: Array<{ id: string; full_name: string; balance: number }>;
  criticalBookingsList: Array<{ id: string; client_name: string; deadline: string; slot_start: string }>;
  insufficientCreditClients: Array<{ id: string; full_name: string; balance: number; nextTrainingPrice: number }>;
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
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      const [
        periodBookingsRes,
        unconfirmedRes,
        depositTransRes,
        trainingTransRes,
        slotsRes,
        debtProfilesRes,
        completedAllRes,
        recentCancellationsRes,
        noShowRes,
        confirmedUpcomingRes,
      ] = await Promise.all([
        // Period bookings with client info
        supabase
          .from('bookings')
          .select('id, status, client_id, price, slot:training_slots(start_time)')
          .in('status', ['booked', 'completed', 'cancelled', 'no_show'])
          .gte('created_at', '2000-01-01'),
        // Unconfirmed bookings (global) with deadline
        supabase
          .from('bookings')
          .select('id, status, confirmation_deadline, client:profiles(id, full_name), slot:training_slots(start_time)')
          .in('status', ['pending', 'proposed', 'awaiting_confirmation']),
        // Deposit transactions in period
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'deposit')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        // Training transactions in period
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'training')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        // Slots in period for occupancy
        supabase
          .from('training_slots')
          .select('id, start_time, is_available, bookings(id)')
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString()),
        // Profiles with debt
        supabase
          .from('profiles')
          .select('id, full_name, balance')
          .lt('balance', 0),
        // All completed bookings for CLV
        supabase
          .from('bookings')
          .select('id, client_id, price, created_at')
          .eq('status', 'completed'),
        // Recent cancellations (last 30 days) for risky cancellers
        supabase
          .from('bookings')
          .select('id, client_id, cancelled_at, slot:training_slots(start_time)')
          .eq('status', 'cancelled')
          .gte('cancelled_at', thirtyDaysAgo.toISOString()),
        // No-shows last 30 days
        supabase
          .from('bookings')
          .select('id, client_id')
          .eq('status', 'no_show')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        // Confirmed upcoming trainings for insufficient credit check
        supabase
          .from('bookings')
          .select('id, client_id, price, client:profiles(id, full_name, balance), slot:training_slots(start_time)')
          .eq('status', 'booked')
          .gte('created_at', '2000-01-01'),
      ]);

      // === PERIOD BOOKINGS ===
      const allBookings = (periodBookingsRes.data || []).filter((b: any) => {
        const slotTime = b.slot?.start_time;
        if (!slotTime) return false;
        const d = new Date(slotTime);
        return d >= start && d <= end;
      });

      const plannedTrainings = allBookings.filter((b: any) => b.status === 'booked').length;
      const completedTrainings = allBookings.filter((b: any) => b.status === 'completed').length;
      const cancelledTrainings = allBookings.filter((b: any) => b.status === 'cancelled').length;

      // Active clients = distinct client_id with booked/completed in period
      const activeClientIds = new Set(
        allBookings
          .filter((b: any) => b.status === 'booked' || b.status === 'completed')
          .map((b: any) => b.client_id)
      );
      const activeClients = activeClientIds.size;

      // Regular clients = those with >= 2 booked/completed in period
      const clientTrainingCount = new Map<string, number>();
      allBookings
        .filter((b: any) => b.status === 'booked' || b.status === 'completed')
        .forEach((b: any) => {
          clientTrainingCount.set(b.client_id, (clientTrainingCount.get(b.client_id) || 0) + 1);
        });
      const regularClients = Array.from(clientTrainingCount.values()).filter(c => c >= 2).length;

      // Storno rate
      const totalRelevant = allBookings.filter(
        (b: any) => ['cancelled', 'no_show', 'booked', 'completed'].includes(b.status)
      ).length;
      const stornoCount = allBookings.filter(
        (b: any) => b.status === 'cancelled' || b.status === 'no_show'
      ).length;
      const stornoRate = totalRelevant > 0 ? (stornoCount / totalRelevant) * 100 : 0;

      // Avg trainings per client per week
      const activeBookings = plannedTrainings + completedTrainings;
      const avgTrainingsPerClient = activeClients > 0
        ? activeBookings / activeClients / periodWeeks
        : 0;

      // === SLOT OCCUPANCY ===
      const slots = slotsRes.data || [];
      const totalSlots = slots.length;
      const bookedSlots = slots.filter((s: any) => s.bookings && s.bookings.length > 0).length;
      const slotOccupancy = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      // === UNCONFIRMED (GLOBAL) ===
      const unconfirmedData = unconfirmedRes.data || [];
      const unconfirmedBookings = unconfirmedData.length;
      
      // Critical = deadline < 6h from now
      const criticalBookingsList = unconfirmedData
        .filter((b: any) => {
          if (!b.confirmation_deadline) return false;
          const hoursLeft = differenceInHours(new Date(b.confirmation_deadline), now);
          return hoursLeft >= 0 && hoursLeft < 6;
        })
        .map((b: any) => ({
          id: b.id,
          client_name: (b.client as any)?.full_name || 'Neznámy',
          deadline: b.confirmation_deadline,
          slot_start: (b.slot as any)?.start_time || '',
        }));
      const criticalBookings = criticalBookingsList.length;

      // === DEBT ===
      const debtProfiles = debtProfilesRes.data || [];
      const debtClients = debtProfiles.length;
      const totalDebt = debtProfiles.reduce((sum, p) => sum + Math.abs(p.balance ?? 0), 0);
      const debtClientsList = debtProfiles.map(p => ({
        id: p.id,
        full_name: p.full_name,
        balance: p.balance ?? 0,
      }));

      // === RISKY CANCELLERS (last 30 days) ===
      // Late cancellations: cancelled < 24h before slot start
      const lateCancellerCounts = new Map<string, number>();
      (recentCancellationsRes.data || []).forEach((b: any) => {
        const slotTime = b.slot?.start_time;
        const cancelledAt = b.cancelled_at;
        if (slotTime && cancelledAt) {
          const hoursBeforeSlot = differenceInHours(new Date(slotTime), new Date(cancelledAt));
          if (hoursBeforeSlot < 24) {
            lateCancellerCounts.set(b.client_id, (lateCancellerCounts.get(b.client_id) || 0) + 1);
          }
        }
      });

      const noShowClientIds = new Set((noShowRes.data || []).map((b: any) => b.client_id));
      
      // Risky = >= 2 late cancellations OR >= 1 no_show
      const riskyClientIds = new Set<string>();
      lateCancellerCounts.forEach((count, clientId) => {
        if (count >= 2) riskyClientIds.add(clientId);
      });
      noShowClientIds.forEach(id => riskyClientIds.add(id));
      const riskyCancellers = riskyClientIds.size;

      // === REVENUE ===
      const deposits = (depositTransRes.data || []).reduce((sum, t) => sum + t.amount, 0);
      
      // Credit usage: training transactions or fallback to completed * price
      let creditUsage = 0;
      const trainingTrans = trainingTransRes.data || [];
      if (trainingTrans.length > 0) {
        creditUsage = Math.abs(trainingTrans.reduce((sum, t) => sum + t.amount, 0));
      } else {
        // Fallback: count completed bookings in period * price
        creditUsage = allBookings
          .filter((b: any) => b.status === 'completed')
          .reduce((sum, b: any) => sum + (b.price || 0), 0);
      }
      const netRevenue = deposits - creditUsage;

      // === INSUFFICIENT CREDIT ===
      const upcomingConfirmed = (confirmedUpcomingRes.data || []).filter((b: any) => {
        const slotTime = (b.slot as any)?.start_time;
        return slotTime && new Date(slotTime) >= now;
      });
      
      const clientNextTraining = new Map<string, { price: number; balance: number; full_name: string; id: string }>();
      upcomingConfirmed.forEach((b: any) => {
        const client = b.client as any;
        if (!client) return;
        if (!clientNextTraining.has(b.client_id)) {
          clientNextTraining.set(b.client_id, {
            price: b.price,
            balance: client.balance ?? 0,
            full_name: client.full_name || 'Neznámy',
            id: client.id,
          });
        }
      });
      
      const insufficientCreditClients = Array.from(clientNextTraining.values())
        .filter(c => c.balance < c.price && c.balance >= 0)
        .map(c => ({
          id: c.id,
          full_name: c.full_name,
          balance: c.balance,
          nextTrainingPrice: c.price,
        }));

      // === CLV ===
      const completedAll = completedAllRes.data || [];
      let clv = 0;
      let avgCooperationMonths = 0;
      let avgMonthlyRevenuePerClient = 0;

      if (completedAll.length > 0) {
        const clientMap = new Map<string, { dates: Date[]; totalRevenue: number }>();
        for (const b of completedAll) {
          if (!clientMap.has(b.client_id)) {
            clientMap.set(b.client_id, { dates: [], totalRevenue: 0 });
          }
          const entry = clientMap.get(b.client_id)!;
          entry.dates.push(new Date(b.created_at));
          entry.totalRevenue += b.price;
        }

        const clientStats = Array.from(clientMap.values()).map(data => {
          const sorted = data.dates.sort((a, b) => a.getTime() - b.getTime());
          const months = sorted.length > 1
            ? Math.max(1, differenceInMonths(sorted[sorted.length - 1], sorted[0]))
            : 1;
          return { months, monthlyRevenue: data.totalRevenue / months, totalRevenue: data.totalRevenue };
        });

        const totalMonths = clientStats.reduce((s, c) => s + c.months, 0);
        avgCooperationMonths = clientStats.length > 0 ? totalMonths / clientStats.length : 0;
        const totalMonthlyRev = clientStats.reduce((s, c) => s + c.monthlyRevenue, 0);
        avgMonthlyRevenuePerClient = clientStats.length > 0 ? totalMonthlyRev / clientStats.length : 0;
        clv = avgCooperationMonths * avgMonthlyRevenuePerClient;
      }

      return {
        activeClients,
        regularClients,
        plannedTrainings,
        completedTrainings,
        cancelledTrainings,
        deposits,
        creditUsage,
        netRevenue,
        stornoRate,
        avgTrainingsPerClient,
        slotOccupancy,
        unconfirmedBookings,
        criticalBookings,
        debtClients,
        totalDebt,
        riskyCancellers,
        clv,
        avgCooperationMonths,
        avgMonthlyRevenuePerClient,
        debtClientsList,
        criticalBookingsList,
        insufficientCreditClients,
      };
    },
    staleTime: 30 * 1000,
  });
}
