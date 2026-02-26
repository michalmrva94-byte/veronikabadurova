

## Problém

RLS na tabuľke `training_slots` povoľuje mazanie len adminom (`has_role(auth.uid(), 'admin')`). Keď klient odmietne alebo zruší navrhnutý tréning, `delete()` volanie ticho zlyhá (0 riadkov, žiadna chyba) a slot zostane viditeľný ako "Voľný".

## Riešenie

Vytvoríme jednu databázovú funkciu `delete_proposed_slot` so `SECURITY DEFINER`, ktorá bezpečne zmaže slot. Hooky ju budú volať namiesto priameho `delete()`.

### 1. DB migrácia — nová funkcia

```sql
CREATE OR REPLACE FUNCTION public.delete_proposed_slot(p_slot_id uuid, p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Overíme, že booking existuje, patrí volajúcemu a bol zrušený/odmietnutý
  IF NOT EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.id = b.client_id
    WHERE b.id = p_booking_id
      AND b.slot_id = p_slot_id
      AND b.status = 'cancelled'
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Neplatný booking alebo slot';
  END IF;

  DELETE FROM training_slots WHERE id = p_slot_id;
END;
$$;
```

### 2. `src/hooks/useProposedTrainings.ts` — rejectProposedTraining (riadky 337-341)

Nahradiť priamy `delete()`:

```typescript
await supabase.rpc('delete_proposed_slot', {
  p_slot_id: booking.slot_id,
  p_booking_id: bookingId,
});
```

### 3. `src/hooks/useClientBookings.ts` — cancelBooking (riadky 87-92)

Nahradiť priamy `delete()`:

```typescript
if (booking.status === 'awaiting_confirmation') {
  await supabase.rpc('delete_proposed_slot', {
    p_slot_id: booking.slot_id,
    p_booking_id: bookingId,
  });
} else {
  // Bežný tréning — uvoľniť pre last-minute
  const { error: slotError } = await supabase
    .from('training_slots')
    .update({ is_available: true })
    .eq('id', booking.slot_id);
  if (slotError) console.error('Slot update error:', slotError);
}
```

### Zhrnutie

| Zmena | Popis |
|---|---|
| DB migrácia | Nová RPC `delete_proposed_slot` (SECURITY DEFINER) |
| `useProposedTrainings.ts` | Volanie RPC namiesto priameho delete |
| `useClientBookings.ts` | Volanie RPC namiesto priameho delete |

Funkcia overuje, že booking patrí volajúcemu klientovi a bol už zrušený, takže nemôže byť zneužitá.

