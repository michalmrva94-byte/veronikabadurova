

## Problém

Blokované sloty pre externých klientov majú `is_available: false`, ale **žiadny booking**. Klientský komponent `WeeklyAvailableSlots` filtruje len `!slot.booking`, takže blokované sloty prejdú filtrom a zobrazia sa klientom ako voľné termíny.

## Oprava

**2 zmeny:**

### 1. `src/components/client/WeeklyAvailableSlots.tsx` (riadok 29)
Pridať filter na `is_blocked`:
```typescript
const availableSlots = slots.filter((slot) => !slot.booking && !slot.is_blocked);
```

### 2. `src/hooks/useWeeklySlots.ts` — `useSlotsForMonth` 
V počítaní `hasAvailable` pre mesačný kalendár klienta tiež vylúčiť blokované sloty, aby sa dni s externými tréningami nezobrazovali ako "voľné".

Žiadne zmeny databázy ani RLS nie sú potrebné — RLS správne umožňuje klientom vidieť sloty (potrebujú to pre kontrolu obsadenosti), ale UI ich jednoducho nebude zobrazovať ako dostupné.

