import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';
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
    if (dates.length === 0) return conflicts;

    // Get the full time range to filter bookings efficiently
    const minDate = dates[0].toISOString();
    const maxDate = addHours(dates[dates.length - 1], 1).toISOString();

    // Fetch all relevant bookings in ONE query instead of N queries
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('*, slot:training_slots(*)')
      .in('status', ['booked', 'awaiting_confirmation'])
      .gte('slot.start_time', minDate)
      .lte('slot.start_time', maxDate);

    const bookings = allBookings || [];

    for (const date of dates) {
      const endTime = addHours(date, 1);

      // Check client's existing bookings at this time
      const clientConflict = bookings.some((b: any) => {
        if (b.client_id !== clientId || !b.slot) return false;
        const slotStart = new Date(b.slot.start_time);
        const slotEnd = new Date(b.slot.end_time);
        return date < slotEnd && endTime > slotStart;
      });

      if (clientConflict) {
        conflicts.push({
          date: date.toISOString(),
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          reason: 'Klient má v tomto čase už tréning',
        });
        continue;
      }

      // Check trainer calendar - any booking at this time
      const trainerConflict = bookings.some((b: any) => {
        if (!b.slot) return false;
        const slotStart = new Date(b.slot.start_time);
        const slotEnd = new Date(b.slot.end_time);
        return date < slotEnd && endTime > slotStart;
      });

      if (trainerConflict) {
        conflicts.push({
          date: date.toISOString(),
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

      // 1. Build all slot objects
      const slotObjects = validDates.map((date) => ({
        start_time: date.toISOString(),
        end_time: addHours(date, 1).toISOString(),
        is_available: false,
        is_recurring: false,
      }));

      if (slotObjects.length === 0) {
        return { created: 0, skipped: conflicts.length, conflicts: skipConflicts ? conflicts : [] };
      }

      // 2. Batch-insert all training slots
      const { data: slots, error: slotsError } = await supabase
        .from('training_slots')
        .insert(slotObjects)
        .select();

      if (slotsError || !slots) {
        throw new Error('Nepodarilo sa vytvoriť tréningové sloty');
      }

      // 3. Build booking objects — each with individual deadline (24h before training start, min 1h from now)
      const now = Date.now();
      const bookingObjects = slots.map((slot) => {
        const deadline = new Date(Math.max(
          new Date(slot.start_time).getTime() - 1 * 60 * 60 * 1000,
          now + 30 * 60 * 1000
        )).toISOString();
        return {
          client_id: clientId,
          slot_id: slot.id,
          status: 'awaiting_confirmation' as const,
          price: DEFAULT_TRAINING_PRICE,
          confirmation_deadline: deadline,
          proposed_by: profile.id,
        };
      });

      // 4. Batch-insert all bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .insert(bookingObjects)
        .select();

      if (bookingsError) {
        throw new Error('Nepodarilo sa vytvoriť rezervácie');
      }

      const created = bookings?.length ?? 0;

      // Send notification to client
      if (created > 0) {
        await supabase.from('notifications').insert({
          user_id: clientId,
          title: 'Nové návrhy tréningov',
          message: `Veronika vám navrhla ${created} ${created === 1 ? 'tréning' : created < 5 ? 'tréningy' : 'tréningov'}. Potvrďte ich najneskôr 1 hodinu pred tréningom.`,
          type: 'proposal',
        });

        // Send email if enabled
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('full_name, email, email_notifications')
          .eq('id', clientId)
          .single();

        if (clientProfile?.email_notifications && clientProfile.email) {
          const firstDate = validDates[0];
          sendNotificationEmail({
            type: 'proposal',
            to: clientProfile.email,
            clientName: clientProfile.full_name,
            trainingDate: firstDate.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' }),
            trainingTime: firstDate.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
            trainingCount: created,
          });
        }
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
      queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['year-slots'] });
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

      // Overiť, že booking je stále awaiting_confirmation
      if (booking.status !== 'awaiting_confirmation') {
        throw new Error('Tento tréning už bol spracovaný.');
      }

      // Overiť, že deadline ešte nevypršal
      if (booking.confirmation_deadline && new Date(booking.confirmation_deadline) < new Date()) {
        throw new Error('Termín na potvrdenie už vypršal.');
      }

      // Confirm booking
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'booked' })
        .eq('id', bookingId);

      if (error) throw error;

      // Notify admins about confirmation
      try {
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', profile.id)
          .single();

        const { data: adminIds } = await supabase.rpc('get_admin_profile_ids');

        if (adminIds && adminIds.length > 0) {
          const clientName = clientProfile?.full_name || 'Klient';
          const slotDate = booking.slot?.start_time
            ? new Date(booking.slot.start_time).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
            : '';

          await supabase.from('notifications').insert(
            adminIds.map((adminId: string) => ({
              user_id: adminId,
              title: 'Potvrdený tréning',
              message: `${clientName} potvrdil/a navrhnutý tréning${slotDate ? ` dňa ${slotDate}` : ''}.`,
              type: 'proposal_confirmed',
              related_slot_id: booking.slot_id,
            }))
          );
        }
      } catch (e) {
        console.error('Failed to send admin confirmation notification:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['year-slots'] });
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

      // Delete the slot and cancel booking atomically via RPC
      const { error: rpcError } = await supabase.rpc('delete_proposed_slot', {
        p_slot_id: booking.slot_id,
        p_booking_id: bookingId,
      });
      if (rpcError) throw rpcError;

      // Notify all admins about the rejection
      try {
        const { data: adminIds } = await supabase.rpc('get_admin_profile_ids');

        if (adminIds && adminIds.length > 0) {
          const clientName = clientProfile?.full_name || 'Klient';
          const slotDate = booking.slot?.start_time
            ? new Date(booking.slot.start_time).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
            : '';

          await supabase.from('notifications').insert(
            adminIds.map((adminId: string) => ({
              user_id: adminId,
              title: 'Odmietnutý tréning',
              message: `${clientName} odmietol/a navrhnutý tréning${slotDate ? ` dňa ${slotDate}` : ''}. Termín bol odstránený z kalendára.`,
              type: 'proposal_rejected',
              related_slot_id: null,
            }))
          );
        }
      } catch (e) {
        console.error('Failed to send admin rejection notification:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['training-slots'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['year-slots'] });
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
      queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['year-slots'] });
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
