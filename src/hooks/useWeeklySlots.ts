import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrainingSlot } from '@/types/database';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';

export interface SlotWithBooking extends TrainingSlot {
  booking?: {
    id: string;
    status: string;
    price?: number;
    client?: {
      id: string;
      full_name: string;
      email: string;
      client_type?: string;
    };
  };
}

export function useWeeklySlots(weekStart: Date) {
  const queryClient = useQueryClient();
  
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 }); // Monday
  const weekEndDate = endOfWeek(weekStart, { weekStartsOn: 1 }); // Sunday

  return useQuery({
    queryKey: ['weekly-slots', format(weekStartDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_slots')
        .select(`
          *,
          bookings(
            id,
            status,
            price,
            client:profiles(id, full_name, email, client_type)
          )
        `)
        .gte('start_time', weekStartDate.toISOString())
        .lte('start_time', weekEndDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform data to include booking info
      return (data || []).map((slot: any) => {
        const activeStatuses = ['booked', 'pending', 'proposed', 'awaiting_confirmation', 'completed', 'no_show'];
        // bookings is an array from Supabase (one-to-many relation)
        const bookingsArr = Array.isArray(slot.bookings) ? slot.bookings : (slot.bookings ? [slot.bookings] : []);
        const activeBooking = bookingsArr.find((b: any) => activeStatuses.includes(b.status));
        return {
          ...slot,
          booking: activeBooking ? {
            id: activeBooking.id,
            status: activeBooking.status,
            client: activeBooking.client,
            price: activeBooking.price,
          } : undefined,
        };
      }) as SlotWithBooking[];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// Hook to get days with slots for calendar highlighting
export function useSlotsForMonth(month: Date) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  return useQuery({
    queryKey: ['month-slots', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_slots')
        .select(`
          id,
          start_time,
          is_available,
          bookings(id, status)
        `)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());

      if (error) throw error;

      // Group by date and determine availability
      const dateMap = new Map<string, { hasAvailable: boolean; hasBooked: boolean; availableCount: number; bookedCount: number }>();
      
      (data || []).forEach((slot: any) => {
        const dateKey = format(new Date(slot.start_time), 'yyyy-MM-dd');
        const existing = dateMap.get(dateKey) || { hasAvailable: false, hasBooked: false, availableCount: 0, bookedCount: 0 };
        
        // bookings is an array from Supabase
        const bookingsArr = Array.isArray(slot.bookings) ? slot.bookings : (slot.bookings ? [slot.bookings] : []);
        const hasActiveBooking = bookingsArr.some((b: any) => 
          b.status === 'booked' || b.status === 'pending' || b.status === 'awaiting_confirmation' || b.status === 'completed' || b.status === 'proposed'
        );
        
        if (hasActiveBooking) {
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
    staleTime: 60 * 1000,
  });
}

// Hook for client's own bookings in a month
export function useClientMonthBookings(month: Date, clientId?: string) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  return useQuery({
    queryKey: ['client-month-bookings', format(monthStart, 'yyyy-MM'), clientId],
    queryFn: async () => {
      if (!clientId) return new Set<string>();

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          slot:training_slots(start_time)
        `)
        .eq('client_id', clientId)
        .in('status', ['booked', 'pending']);

      if (error) throw error;

      // Return set of dates with client's bookings
      const dates = new Set<string>();
      (data || []).forEach((booking: any) => {
        if (booking.slot?.start_time) {
          const bookingDate = new Date(booking.slot.start_time);
          if (bookingDate >= monthStart && bookingDate <= monthEnd) {
            dates.add(format(bookingDate, 'yyyy-MM-dd'));
          }
        }
      });

      return dates;
    },
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
}
