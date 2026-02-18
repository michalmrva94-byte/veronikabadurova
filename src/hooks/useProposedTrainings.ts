import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { addHours, setHours, setMinutes, addDays, startOfWeek, getDay } from 'date-fns';

export interface DayTimeSelection {
  dayOfWeek: number; // 0=Sun, 1=Mon, ...6=Sat
  hour: number;
  minute: number;
}

export interface ConflictInfo {
  date: string;
  time: string;
  reason: string;
}

export interface ProposalResult {
  created: number;
  skipped: number;
  conflicts: ConflictInfo[];
}

// Generate concrete dates from day selections + range
function generateDates(selections: DayTimeSelection[], weeksAhead: number): Date[] {
  const now = new Date();
  const dates: Date[] = [];

  for (let week = 0; week < weeksAhead; week++) {
    const weekStart = addDays(startOfWeek(now, { weekStartsOn: 1 }), week * 7);

    for (const sel of selections) {
      // Convert our dayOfWeek (1=Mon..7=Sun) to JS day (0=Sun..6=Sat)
      const jsDayOfWeek = sel.dayOfWeek === 7 ? 0 : sel.dayOfWeek;
      const currentStart = startOfWeek(weekStart, { weekStartsOn: 1 });

      let targetDate: Date;
      const mondayBased = sel.dayOfWeek; // 1=Mon..7=Sun
      targetDate = addDays(currentStart, mondayBased - 1);

      targetDate = setHours(targetDate, sel.hour);
      targetDate = setMinutes(targetDate, sel.minute);

      // Only future dates
      if (targetDate > now) {
        dates.push(targetDate);
      }
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

export function useProposedTrainings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const checkConflicts = async (
    clientId: string,
    dates: Date[]
  ): Promise<ConflictInfo[]> => {
    const conflicts: ConflictInfo[] = [];

    for (const date of dates) {
      const startTime = date.toISOString();
      const endTime = addHours(date, 1).toISOString();

      // Check client's existing bookings at this time
      const { data: clientBookings } = await supabase
        .from('bookings')
        .select('*, slot:training_slots(*)')
        .eq('client_id', clientId)
        .in('status', ['booked', 'awaiting_confirmation']);

      const clientConflict = (clientBookings || []).some((b: any) => {
        const slotStart = new Date(b.slot.start_time);
        const slotEnd = new Date(b.slot.end_time);
        return date < slotEnd && new Date(endTime) > slotStart;
      });

      if (clientConflict) {
        conflicts.push({
          date: startTime,
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          reason: 'Klient má v tomto čase už tréning',
        });
        continue;
      }

      // Check trainer calendar - any booking at this time
      const { data: trainerBookings } = await supabase
        .from('bookings')
        .select('*, slot:training_slots(*)')
        .in('status', ['booked', 'awaiting_confirmation']);

      const trainerConflict = (trainerBookings || []).some((b: any) => {
        const slotStart = new Date(b.slot.start_time);
        const slotEnd = new Date(b.slot.end_time);
        return date < slotEnd && new Date(endTime) > slotStart;
      });

      if (trainerConflict) {
        conflicts.push({
          date: startTime,
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          reason: 'Trénerka má v tomto čase iný tréning',
        });
      }
    }

    return conflicts;
  };

  const proposeFixedTrainings = useMutation({
    mutationFn: async ({
      clientId,
      selections,
      weeksAhead,
      skipConflicts,
    }: {
      clientId: string;
      selections: DayTimeSelection[];
      weeksAhead: number;
      skipConflicts: boolean;
    }): Promise<ProposalResult> => {
      if (!profile?.id) throw new Error('Nie ste prihlásený');

      const dates = generateDates(selections, weeksAhead);
      const conflicts = await checkConflicts(clientId, dates);

      if (conflicts.length > 0 && !skipConflicts) {
        return { created: 0, skipped: conflicts.length, conflicts };
      }

      const conflictDates = new Set(conflicts.map((c) => c.date));
      const validDates = skipConflicts
        ? dates.filter((d) => !conflictDates.has(d.toISOString()))
        : dates;

      let created = 0;
      const deadline = addHours(new Date(), 24).toISOString();

      for (const date of validDates) {
        const startTime = date.toISOString();
        const endTime = addHours(date, 1).toISOString();

        // Create training slot
        const { data: slot, error: slotError } = await supabase
          .from('training_slots')
          .insert({
            start_time: startTime,
            end_time: endTime,
            is_available: false,
            is_recurring: false,
          })
          .select()
          .single();

        if (slotError) {
          console.error('Failed to create slot:', slotError);
          continue;
        }

        // Create booking
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            client_id: clientId,
            slot_id: slot.id,
            status: 'awaiting_confirmation',
            price: DEFAULT_TRAINING_PRICE,
            confirmation_deadline: deadline,
            proposed_by: profile.id,
          });

        if (bookingError) {
          console.error('Failed to create booking:', bookingError);
          continue;
        }

        created++;
      }

      // Send notification to client
      if (created > 0) {
        await supabase.from('notifications').insert({
          user_id: clientId,
          title: 'Nové návrhy tréningov',
          message: `Veronika vám navrhla ${created} ${created === 1 ? 'tréning' : created < 5 ? 'tréningy' : 'tréningov'}. Potvrďte ich, prosím, do 24 hodín.`,
          type: 'proposal',
        });
      }

      return {
        created,
        skipped: conflicts.length,
        conflicts: skipConflicts ? conflicts : [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  const confirmProposedTraining = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!profile?.id) throw new Error('Nie ste prihlásený');

      // Fetch booking with slot
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*, slot:training_slots(*)')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Re-check for conflicts (race condition protection)
      const slotStart = new Date(booking.slot.start_time);
      const slotEnd = new Date(booking.slot.end_time);

      const { data: conflicting } = await supabase
        .from('bookings')
        .select('*, slot:training_slots(*)')
        .neq('id', bookingId)
        .in('status', ['booked', 'awaiting_confirmation']);

      const hasConflict = (conflicting || []).some((b: any) => {
        if (!b.slot) return false;
        const bStart = new Date(b.slot.start_time);
        const bEnd = new Date(b.slot.end_time);
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (hasConflict) {
        throw new Error('Termín sa medzičasom zmenil alebo už nie je dostupný. Prosím vyber iný.');
      }

      // Confirm booking
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (error) throw error;

      // Notify admins about confirmation
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', profile.id)
        .single();

      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .in('user_id', adminRoles.map((r) => r.user_id));

        if (adminProfiles && adminProfiles.length > 0) {
          const clientName = clientProfile?.full_name || 'Klient';
          const slotDate = booking.slot?.start_time
            ? new Date(booking.slot.start_time).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
            : '';

          await supabase.from('notifications').insert(
            adminProfiles.map((admin) => ({
              user_id: admin.id,
              title: 'Potvrdený tréning',
              message: `${clientName} potvrdil/a navrhnutý tréning${slotDate ? ` dňa ${slotDate}` : ''}.`,
              type: 'proposal_confirmed',
              related_slot_id: booking.slot_id,
            }))
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  const rejectProposedTraining = useMutation({
    mutationFn: async (bookingId: string) => {
      // Fetch booking with slot and client info
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('slot_id, client_id, slot:training_slots(start_time)')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Get client name for admin notification
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', booking.client_id)
        .single();

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Odmietnuté klientom',
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Free the slot
      await supabase
        .from('training_slots')
        .update({ is_available: true })
        .eq('id', booking.slot_id);

      // Notify all admins about the rejection
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        // Get admin profile IDs
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .in('user_id', adminRoles.map((r) => r.user_id));

        if (adminProfiles && adminProfiles.length > 0) {
          const clientName = clientProfile?.full_name || 'Klient';
          const slotDate = booking.slot?.start_time
            ? new Date(booking.slot.start_time).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
            : '';

          const notifications = adminProfiles.map((admin) => ({
            user_id: admin.id,
            title: 'Odmietnutý tréning',
            message: `${clientName} odmietol/a navrhnutý tréning${slotDate ? ` dňa ${slotDate}` : ''}. Termín bol uvoľnený.`,
            type: 'proposal_rejected',
            related_slot_id: booking.slot_id,
          }));

          await supabase.from('notifications').insert(notifications);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  const confirmAllProposed = useMutation({
    mutationFn: async (bookingIds: string[]) => {
      const results: { id: string; success: boolean; error?: string }[] = [];

      for (const id of bookingIds) {
        try {
          await confirmProposedTraining.mutateAsync(id);
          results.push({ id, success: true });
        } catch (err: any) {
          results.push({ id, success: false, error: err.message });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
    },
  });

  return {
    proposeFixedTrainings,
    confirmProposedTraining,
    rejectProposedTraining,
    confirmAllProposed,
    checkConflicts,
    generateDates,
  };
}
