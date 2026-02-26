

## Problém

RPC funkcia `delete_proposed_slot` kontroluje `b.status = 'cancelled'`, ale v oboch hookoch sa booking najprv aktualizuje na `cancelled` a **potom** sa volá RPC. Problém je, že RPC tiež robí JOIN cez `profiles.user_id = auth.uid()`, čo je správne — ale status check zlyhá kvôli timing issues (RLS SELECT politiky môžu vrátiť starý stav).

Riešenie: RPC bude akceptovať aj `awaiting_confirmation` status (nie len `cancelled`) a hooky nebudú robiť separátny status update pred RPC volaním pre navrhnuté tréningy.

## Zmeny

### 1. DB migrácia — aktualizovaná RPC funkcia

```sql
CREATE OR REPLACE FUNCTION public.delete_proposed_slot(p_slot_id uuid, p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Overiť, že booking existuje, patrí volajúcemu, a je navrhnutý alebo už zrušený
  IF NOT EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.id = b.client_id
    WHERE b.id = p_booking_id
      AND b.slot_id = p_slot_id
      AND p.user_id = auth.uid()
      AND b.status IN ('awaiting_confirmation', 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Neplatný booking alebo slot';
  END IF;

  -- Atomicky zrušiť booking
  UPDATE bookings 
  SET status = 'cancelled', 
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_booking_id;

  -- Zmazať slot
  DELETE FROM training_slots WHERE id = p_slot_id;
END;
$$;
```

### 2. `src/hooks/useProposedTrainings.ts` — rejectProposedTraining (riadky 326-341)

Odstrániť separátny booking update (riadky 326-335) a nechať len RPC volanie s error handling:

```typescript
      // Delete the slot and cancel booking atomically via RPC
      const { error: rpcError } = await supabase.rpc('delete_proposed_slot', {
        p_slot_id: booking.slot_id,
        p_booking_id: bookingId,
      });
      if (rpcError) throw rpcError;
```

### 3. `src/hooks/useClientBookings.ts` — cancelBooking (riadky 74-98)

Pre `awaiting_confirmation` bookings preskočiť separátny status update a volať priamo RPC. Pre bežné bookings ponechať existujúci flow:

```typescript
      if (booking.status === 'awaiting_confirmation') {
        // Atomicky zrušiť booking a zmazať slot cez RPC
        const { error: rpcError } = await supabase.rpc('delete_proposed_slot', {
          p_slot_id: booking.slot_id,
          p_booking_id: bookingId,
        });
        if (rpcError) throw rpcError;
      } else {
        // Bežný booking — aktualizovať status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancellation_fee: cancellationFee,
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
        if (updateError) throw updateError;

        // Uvoľniť slot pre last-minute
        const { error: slotError } = await supabase
          .from('training_slots')
          .update({ is_available: true })
          .eq('id', booking.slot_id);
        if (slotError) console.error('Slot update error:', slotError);
      }
```

Poznámka: Storno poplatok sa pre `awaiting_confirmation` bookings nepočíta (cancellationFeePercentage je 0 keďže sú v budúcnosti), takže preskočenie apply_charge je bezpečné. Ak by sa mal apply_charge volať aj pre tieto bookings, treba ho ponechať pod podmienkou.

### Zhrnutie

| Zmena | Popis |
|---|---|
| DB migrácia | RPC akceptuje `awaiting_confirmation` aj `cancelled`, atomicky updatuje booking a maže slot |
| `useProposedTrainings.ts` | Odstránený separátny booking update, len RPC |
| `useClientBookings.ts` | Pre navrhnuté tréningy len RPC, pre bežné pôvodný flow |

