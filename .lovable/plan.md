

## Problém

Keď klient zruší tréning, ktorý mu Veronika navrhla (stav `awaiting_confirmation`), slot sa nastaví na `is_available: true` a objaví sa v kalendári ako voľný pre všetkých. Rovnaký problém je aj pri admin zrušení navrhnutého tréningu.

**Odmietnutie návrhu** (`rejectProposedTraining`) a **vypršanie deadline** (`check-proposed-deadlines`) už správne mažú slot — chyba je len v cancellation flowoch.

## Zmeny

### 1. `src/hooks/useClientBookings.ts` — klientské storno

Riadky 86–92: Namiesto vždy `is_available: true` — skontrolovať, či bol booking v stave `awaiting_confirmation`. Ak áno, slot **zmazať**. Ak nie (bežný potvrdený tréning), ponechať súčasné správanie (`is_available: true` pre last-minute).

```typescript
// Ak ide o navrhnutý tréning, slot úplne odstrániť
if (booking.status === 'awaiting_confirmation') {
  await supabase.from('training_slots').delete().eq('id', booking.slot_id);
} else {
  // Bežný tréning — uvoľniť pre last-minute
  await supabase.from('training_slots').update({ is_available: true }).eq('id', booking.slot_id);
}
```

### 2. `src/hooks/useAdminBookings.ts` — admin storno (cancelBooking)

Riadky 203–209: Rovnaká logika — ak bol booking `awaiting_confirmation` alebo `proposed`, slot zmazať. Inak uvoľniť.

```typescript
if (booking.status === 'awaiting_confirmation' || booking.status === 'proposed') {
  await supabase.from('training_slots').delete().eq('id', booking.slot_id);
} else {
  await supabase.from('training_slots').update({ is_available: true }).eq('id', booking.slot_id);
}
```

### Zhrnutie

| Súbor | Zmena |
|---|---|
| `src/hooks/useClientBookings.ts` | Navrhnuté tréningy → mazať slot namiesto uvoľnenia |
| `src/hooks/useAdminBookings.ts` | Navrhnuté tréningy → mazať slot namiesto uvoľnenia |

Žiadne DB migrácie ani nové hooky nie sú potrebné.

