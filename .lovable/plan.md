

## Plan: Batch-insert training slots and bookings in proposeFixedTrainings

### What changes
Refactor the `proposeFixedTrainings` mutation (lines 147-189) to replace the sequential for-loop with two batch inserts.

### Single file: `src/hooks/useProposedTrainings.ts`

**Replace lines 147-189** (the `let created` through end of for-loop) with:

```typescript
const deadline = addHours(new Date(), 24).toISOString();

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

// 3. Build booking objects from returned slot IDs
const bookingObjects = slots.map((slot) => ({
  client_id: clientId,
  slot_id: slot.id,
  status: 'awaiting_confirmation' as const,
  price: DEFAULT_TRAINING_PRICE,
  confirmation_deadline: deadline,
  proposed_by: profile.id,
}));

// 4. Batch-insert all bookings
const { data: bookings, error: bookingsError } = await supabase
  .from('bookings')
  .insert(bookingObjects)
  .select();

if (bookingsError) {
  throw new Error('Nepodarilo sa vytvoriť rezervácie');
}

const created = bookings?.length ?? 0;
```

Everything else (conflict checking, notification insert, email send, other mutations) stays unchanged.

### Why this is safe
- Supabase `.insert(array)` is atomic per call — either all rows insert or none do
- The `status: 'awaiting_confirmation' as const` satisfies the TypeScript enum type
- Error handling now throws instead of silently continuing, which is appropriate for batch operations (partial failures in a batch are unlikely — they'd be schema/RLS issues)

