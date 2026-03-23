

## Problém

Poznámkové sloty (`is_note: true`) sa počítajú do obsadenosti a ďalších KPI metrík, pretože dotazy na `training_slots` ich nefiltrujú. Poznámka nemá booking → počíta sa ako "voľný slot" → zvyšuje menovateľ → znižuje obsadenosť.

## Oprava

**1 súbor: `src/hooks/useAdminDashboardStats.ts`**

### Hlavná obsadenosť (riadky 309-312)
Filtrovať `is_note` a `is_blocked` sloty z výpočtu:
```typescript
const slots = (slotsRes.data || []).filter((s: any) => !s.is_note && !s.is_blocked);
```
Blokované sloty tiež nemajú booking záznam, takže by tiež skresľovali obsadenosť. Externé tréningy sa počítajú cez `earned` metriku, nie cez obsadenosť.

### Týždenná obsadenosť (riadky 449-453)
Rovnaký filter:
```typescript
const thisWeekSlots = (thisWeekSlotsRes.data || []).filter((s: any) => !s.is_note && !s.is_blocked);
```

### Predchádzajúce obdobie obsadenosť (riadky 502-504)
```typescript
const prevSlots = (prevSlotsRes.data || []).filter((s: any) => !s.is_note && !s.is_blocked);
```

### Doplnenie `is_note` a `is_blocked` do select dotazov
Tri dotazy na `training_slots` (riadky 151-155, 197-201, 209-213) potrebujú pridať `is_note, is_blocked` do select, aby filter fungoval.

Žiadne iné zmeny nie sú potrebné — poznámky nemajú bookingy, takže neovplyvňujú storno rate, CLV ani iné booking-based metriky.

