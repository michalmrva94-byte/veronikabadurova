

# Audit kodu + opravy

Analyzoval som celý kód aplikacie Veronika Swim. Nasiel som 7 bugov a 4 optimalizacie. Odhadovaná cena: **2-3 kredity** (1 sprava na opravu bugov, 1 na optimalizacie).

---

## Najdene bugy

### BUG 1: MyTrainingsPage nezobrazuje navrhnuté tréningy (awaiting_confirmation)
- **Závažnosť:** Vysoká
- **Súbor:** `src/pages/client/MyTrainingsPage.tsx`
- Hook `useClientBookings` vracia `proposedBookings`, ale stránka ich vôbec nezobrazuje
- Klient nevidí tréningy čakajúce na potvrdenie a nemôže ich potvrdiť/odmietnuť
- **Oprava:** Pridať sekciu s navrhnutými tréningami vrátane tlačidiel Potvrdiť/Odmietnuť

### BUG 2: Double-booking ochrana neblokuje awaiting_confirmation
- **Závažnosť:** Vysoká
- **Súbor:** `src/hooks/useBookings.ts` (riadok 22)
- Klient si môže zarezervovať slot, ktorý už má booking v stave `awaiting_confirmation`
- Kontrola používa len `['booked', 'pending']`, chýba `'awaiting_confirmation'`
- **Oprava:** Pridať `'awaiting_confirmation'` do filtra

### BUG 3: Storno poplatky sú hardcodované namiesto čítania z app_settings
- **Závažnosť:** Stredná
- **Súbor:** `src/hooks/useClientBookings.ts` (riadky 50-55)
- Hodnoty 50% a 80% sú napevno, aj keď admin ich môže meniť v nastaveniach
- **Oprava:** Načítať percentá z `app_settings` pred výpočtom

### BUG 4: Console warning - forwardRef na AdminFinancesPage
- **Závažnosť:** Nízka
- **Súbor:** `src/pages/admin/AdminFinancesPage.tsx`
- React varuje o predávaní ref na Select a Badge komponenty
- Vizuálne neškodí, ale zanáša konzolu

### BUG 5: is_available flag je nekonzistentný
- **Závažnosť:** Stredná
- Všetky sloty v databáze majú `is_available: true` aj keď majú aktívne bookingy
- `useAssignTraining` vytvára slot s `is_available: true` aj keď hneď vytvorí booking
- Klientský kalendár filtruje podľa tohto flagu, čo môže spôsobiť zobrazenie obsadených slotov
- **Oprava:** Nastaviť `is_available: false` pri vytváraní priradenia

### BUG 6: Kolízna kontrola fetchuje VŠETKY bookings pre každý dátum
- **Závažnosť:** Stredná (výkon)
- **Súbor:** `src/hooks/useProposedTrainings.ts`
- Pre každý navrhovaný dátum sa sťahujú VŠETKY bookingy v systéme (N+1 problém)
- Pri 10+ klientoch a desiatich tréningoch denne to bude citeľne pomalé
- **Oprava:** Filtrovať bookings podľa časového rozsahu na úrovni query

### BUG 7: Admin zrušenie tréningu neaplikuje storno poplatok
- **Závažnosť:** Nízka
- **Súbor:** `src/hooks/useAdminBookings.ts` (cancelBooking)
- Keď admin zruší tréning, neúčtuje sa žiadny storno poplatok (čo môže byť zámer, ale chýba možnosť voľby)

---

## Optimalizácie

### OPT 1: Invalidácia query keys po operáciách
- Niektoré hooky neinvalidujú všetky relevánte query keys (napr. `useAdminBookings.approveBooking` neinvaliduje `weekly-slots` a `month-slots`)
- To spôsobuje, že kalendár sa neaktualizuje po schválení bookingu

### OPT 2: Stale data v SlotDetailDialog
- Dialog sa otvorí s dátami zo state, ale tie môžu byť zastarané
- Po akcii (complete/cancel) sa dialog zavrie, ale ak sa znova otvorí pred refetch, zobrazí staré dáta

### OPT 3: Transakčná história na finance stránke nemá filter podľa obdobia
- `admin-all-transactions` query vždy načítava posledných 20 transakcií bez ohľadu na vybrané obdobie

### OPT 4: Batch operácie pre hromadné návrhy
- `useProposedTrainings` vytvára sloty a bookings jeden po druhom v slučke
- Batch insert by bol výrazne rýchlejší

---

## Technický postup implementácie

1. **MyTrainingsPage** - import a pridanie `ProposedTrainingsSection` alebo inline bloku s navrhnutými tréningami + confirm/reject tlačidlá
2. **useBookings.ts** - pridať `'awaiting_confirmation'` do `.in('status', ...)` kontroly na riadku 22
3. **useClientBookings.ts** - nahradiť hardcodované percentá dotazom na `app_settings`
4. **useAssignTraining.ts** - zmeniť `is_available: true` na `is_available: false`
5. **useAdminBookings.ts** - pridať invalidáciu `weekly-slots`, `month-slots` do `approveBooking`, `rejectBooking`, `cancelBooking`
6. **useProposedTrainings.ts** - pridať filtre `.gte`/`.lte` na `start_time` v kolíznej kontrole

