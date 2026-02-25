

## Analýza a plán opráv

### Problém 1: Odmietnutý tréning sa stále zobrazuje ako rezervovaný

**Príčina:** Keď klient odmietne navrhnutý tréning, hook `rejectProposedTraining` správne nastaví `is_available: true` a status bookingu na `cancelled`. Avšak v `onSuccess` invaliduje iba query kľúče `['client-bookings']` a `['training-slots']`. **Neinvaliduje** kľúče `['weekly-slots']`, `['month-slots']` ani `['year-slots']`, takže admin kalendár zobrazuje zastaralé dáta.

**Rovnaký problém** má aj `confirmProposedTraining` a `confirmAllProposed` — chýba invalidácia kalendárových query.

### Problém 2: Nesúlad medzi týždenným a mesačným kalendárom

**Príčiny:**
- **Rôzne dátové zdroje:** Týždenný pohľad používa `useWeeklySlots` (plné booking dáta so statusmi), mesačný detail používa `useTrainingSlots` cez `SlotCard`, ktorý zobrazuje iba `is_available` príznak — žiaden status bookingu, žiadne meno klienta.
- **Rôzna logika filtrovania statusov:** `useSlotsForMonth` nepočíta `proposed` status ako aktívny booking, zatiaľ čo `useWeeklySlots` áno. To spôsobuje rozdielne farebné indikátory.
- **Mesačný detail je primitívny:** `SlotCard` zobrazuje iba „Voľný" / „Rezervovaný" bez možnosti kliknúť na detail. Týždenný pohľad umožňuje kliknúť na slot a otvoriť `SlotDetailDialog`.

### Plán opráv

**1. Pridať chýbajúce invalidácie v `useProposedTrainings.ts`**

Do `onSuccess` callbackov pre `rejectProposedTraining`, `confirmProposedTraining` a `confirmAllProposed` pridať:
```
queryClient.invalidateQueries({ queryKey: ['weekly-slots'] });
queryClient.invalidateQueries({ queryKey: ['month-slots'] });
queryClient.invalidateQueries({ queryKey: ['year-slots'] });
```

**2. Zjednotiť mesačný detail s týždenným pohľadom v `AdminCalendarPage.tsx`**

Nahradiť primitívny `SlotCard` v mesačnom pohľade za rovnaký formát ako v týždennom. Konkrétne:
- Použiť `useWeeklySlots` dáta (alebo dedikovaný daily hook) pre vybraný deň namiesto `useTrainingSlots`
- Zobraziť sloty s rovnakými farebnými kódmi a statusmi ako v týždennom pohľade
- Umožniť kliknutie na slot s otvorením `SlotDetailDialog` (rovnako ako v týždennom)

**3. Zjednotiť logiku statusov v `useSlotsForMonth`**

Pridať `proposed` do zoznamu aktívnych statusov v `useSlotsForMonth`, aby mesačný kalendár aj ročný prehľad korektne zobrazovali navrhnuté tréningy ako obsadené.

### Zmenené súbory
- `src/hooks/useProposedTrainings.ts` — pridanie invalidácií calendar queries
- `src/hooks/useWeeklySlots.ts` — pridanie `proposed` do aktívnych statusov v `useSlotsForMonth`
- `src/pages/admin/AdminCalendarPage.tsx` — nahradenie `SlotCard` za interaktívne sloty s booking detailmi v mesačnom pohľade

