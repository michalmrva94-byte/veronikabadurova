import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrainingSlot } from '@/types/database';
import { startOfDay, endOfDay } from 'date-fns';

export function useTrainingSlots(selectedDate?: Date) {
  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
    queryKey: ['training-slots', selectedDate?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!selectedDate) return [];

      const dayStart = startOfDay(selectedDate).toISOString();
      const dayEnd = endOfDay(selectedDate).toISOString();

      // Načítať sloty s ich bookingami
      const { data, error } = await supabase
        .from('training_slots')
        .select(`
          *,
          bookings(id, status)
        `)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .eq('is_available', true)
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Filtrovať len voľné sloty (bez aktívnej rezervácie - pending alebo booked)
      const availableSlots = (data || []).filter((slot: any) => {
        const activeBooking = slot.bookings?.find(
          (b: any) => b.status === 'booked' || b.status === 'pending'
        );
        return !activeBooking;
      });

      return availableSlots as TrainingSlot[];
    },
    enabled: !!selectedDate,
    staleTime: 10 * 1000, // 10 sekúnd - kratší interval pre aktuálnejšie dáta
    gcTime: 60 * 1000, // 1 minúta
    refetchOnWindowFocus: true,
  });

  const createSlot = useMutation({
    mutationFn: async (slot: { start_time: string; end_time: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('training_slots')
        .insert({
          start_time: slot.start_time,
          end_time: slot.end_time,
          notes: slot.notes || null,
          is_available: true,
          is_recurring: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  const updateSlot = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TrainingSlot> & { id: string }) => {
      const { data, error } = await supabase
        .from('training_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  return {
    slots: slotsQuery.data || [],
    isLoading: slotsQuery.isLoading,
    error: slotsQuery.error,
    createSlot,
    updateSlot,
    deleteSlot,
  };
}
