

## Problém

Na screenshote vidno, že Marianna (07:15, 07:30) stále svieti žltou farbou s badge "Čaká" v kalendári, aj keď deadline na potvrdenie už dávno vypršal. Kalendár totiž vôbec nekontroluje `confirmation_deadline` — nemá prístup k tomuto údaju.

## Príčina

1. **`useWeeklySlots.ts`** — query na bookings neobsahuje pole `confirmation_deadline`, takže UI nemá ako rozlíšiť aktívny návrh od vypršaného
2. **`WeeklyCalendarGrid.tsx`** — funkcie `getSlotColor` a `getSlotChipColor` nemajú logiku pre expired stav; badge logika takisto nekontroluje deadline

## Riešenie

### 1. `src/hooks/useWeeklySlots.ts` — pridať `confirmation_deadline` do query a interface

- Rozšíriť `SlotWithBooking.booking` interface o `confirmation_deadline?: string`
- Pridať `confirmation_deadline` do SELECT query (riadok 34)
- Pridať `confirmation_deadline` do transformácie (riadok 58)

### 2. `src/components/admin/WeeklyCalendarGrid.tsx` — rozlíšiť vypršané návrhy

- Upraviť `getSlotColor` a `getSlotChipColor` — ak je status `awaiting_confirmation` a `confirmation_deadline` < now, použiť červenú/rose farbu (rovnakú ako zrušené) namiesto žltej
- Upraviť badge logiku v DesktopView (riadky 188–191) — ak je expired, zobraziť badge "Vypršané" namiesto "Čaká"
- Rovnako v MobileView (riadky 100–101) — ak je expired, zobraziť iný indikátor

Helper funkcia:
```typescript
const isExpiredProposal = (slot: SlotWithBooking) => {
  return slot.booking?.status === 'awaiting_confirmation' 
    && slot.booking.confirmation_deadline 
    && new Date(slot.booking.confirmation_deadline) < new Date();
};
```

### Zhrnutie zmien

| Súbor | Zmena |
|---|---|
| `src/hooks/useWeeklySlots.ts` | Pridať `confirmation_deadline` do query a interface |
| `src/components/admin/WeeklyCalendarGrid.tsx` | Expired návrhy zobraziť červenou s badge "Vypršané" |

