import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface DaySlotSummary {
  hasAvailable: boolean;
  hasBooked: boolean;
  availableCount: number;
  bookedCount: number;
  completedCount: number;
  totalCount: number;
}

export function useSlotsForYear(year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  return useQuery({
    queryKey: ['year-slots', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_slots')
        .select(`
          id,
          start_time,
          is_available,
          bookings(id, status)
        `)
        .gte('start_time', yearStart.toISOString())
        .lte('start_time', yearEnd.toISOString());

      if (error) throw error;

      const dateMap = new Map<string, DaySlotSummary>();

      (data || []).forEach((slot: any) => {
        const dateKey = format(new Date(slot.start_time), 'yyyy-MM-dd');
        const existing = dateMap.get(dateKey) || {
          hasAvailable: false,
          hasBooked: false,
          availableCount: 0,
          bookedCount: 0,
          completedCount: 0,
          totalCount: 0,
        };

        existing.totalCount++;

        const bookingsArr = Array.isArray(slot.bookings) ? slot.bookings : (slot.bookings ? [slot.bookings] : []);
        const activeBooking = bookingsArr.find((b: any) => ['booked', 'pending', 'awaiting_confirmation'].includes(b.status));
        const completedBooking = bookingsArr.find((b: any) => b.status === 'completed');
        const hasActiveBooking = !!activeBooking;
        const isCompleted = !!completedBooking;

        if (isCompleted) {
          existing.completedCount++;
          existing.hasBooked = true;
        } else if (hasActiveBooking) {
          existing.hasBooked = true;
          existing.bookedCount++;
        } else {
          existing.hasAvailable = true;
          existing.availableCount++;
        }

        dateMap.set(dateKey, existing);
      });

      return dateMap;
    },
    staleTime: 2 * 60 * 1000,
  });
}
