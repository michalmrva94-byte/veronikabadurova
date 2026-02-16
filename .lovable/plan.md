

# Dashboard Veroniky - Kompletny redizajn

## Prehlad

Transformacia admin dashboardu z jednoduchych statistik na skutocny riadiaci panel trenerky s plnou kontrolou nad kapacitou, financiami, rizikami a klientmi.

---

## 1. AdminDashboardPage - Kompletny redizajn

### 1.1 Horna prehlyadova lista (5 KPI kariet)

Nahradit existujuce placeholder stats skutocnymi datami:

- Aktivni klienti (zelena) - pocet schvalenych klientov z `profiles`
- Treningy tento tyzden (zlta) - pocet bookovanych treningov v aktualnom tyzdni
- Nepotvrdene treningy (modra) - pocet `pending` + `proposed` + `awaiting_confirmation` bookingov
- Rizikove (cervena) - klienti s dlhom + neodpovedane navrhy blizko deadline
- Mesacny prijem (zelena) - sucet `deposit` transakcii za aktualny mesiac

### 1.2 Sekcia "Caka na potvrdenie" (prioritna)

Zobrazit vsetky `pending`, `proposed`, `awaiting_confirmation` bookings s:
- Meno klienta
- Datum a cas treningu
- Kolko hodin zostava do deadline (odpocitavanie)
- Tlacidla: Potvrdit / Zamietnuť / Pripomenut

### 1.3 Dnesne treningy (zachovat existujuce, pridat "Oznacit ako odplavany")

Rozsirit `ConfirmedBookingCard` o:
- Zobrazenie typu klienta (Fixny/Flexibilny badge)
- Tlacidlo "Odplavany" - zmeni status na `completed`, odpocita kredit
- Tlacidlo "Neucasť" - zmeni status na `no_show`, aplikuje 100% poplatok
- Tlacidlo "Uvolnit ako last minute"

### 1.4 Rychle akcie (zachovat, upravit)

Zachovat existujuce linky, pridat:
- "Navrhnuť trening fixnemu klientovi"

---

## 2. Novy hook: useAdminDashboardStats

Vytvorit `src/hooks/useAdminDashboardStats.ts`:
- Pocet approved klientov z `profiles`
- Pocet pending klientov
- Pocet treningov tento tyzden z `bookings` (status = `booked`)
- Pocet nepotvrdeneho (status in `pending`, `proposed`, `awaiting_confirmation`)
- Pocet klientov s dlhom (balance < 0)
- Mesacny prijem z `transactions` (type = `deposit`, aktualny mesiac)

---

## 3. WeeklyCalendarGrid - Farebne stavy

Aktualizovat `src/components/admin/WeeklyCalendarGrid.tsx`:

Nove farby podla statusu bookingu:
- Seda - `proposed` (navrhnuty)
- Oranzova - `pending` / `awaiting_confirmation` (caka na potvrdenie)
- Modra - `booked` (potvrdeny)
- Cervena - `cancelled` / `no_show` (storno/neucasť)
- Zelena - `completed` (odplavany)
- Svetlozelena (existujuca) - volny slot bez bookingu

---

## 4. Detail treningu - SlotDetailDialog (novy komponent)

Vytvorit `src/components/admin/SlotDetailDialog.tsx`:

Kliknutim na trening v kalendari sa otvori dialog s:
- Meno klienta
- Typ klienta (Fixny/Flexibilny)
- Stav treningu (badge s farbou)
- Deadline na potvrdenie (ak existuje)
- Datum a cas
- Cena

Akcie podla stavu:
- `booked`: Oznacit ako odplavany / Zrusit / Presunuť / Uvolniť ako last minute
- `pending`/`awaiting_confirmation`: Potvrdiť / Zamietnuť
- `proposed`: Čaka na klienta (info)
- Volny slot: Priradiť klientovi / Zmazať

"Oznacit ako odplavany" logika:
- Zmeni booking status na `completed`
- Odpocita kredit z profilu klienta (cena treningu)
- Vytvori transakciu typu `training`

---

## 5. AdminClientsPage - Filtre a detail klienta

### 5.1 Pridať filtre
Nad zoznamom klientov pridat filter chips:
- Vsetci / Aktivni / Cakajuci / Dlznici / Fixni / Flexibilni

### 5.2 Detail klienta (nova stranka)

Vytvorit `src/pages/admin/AdminClientDetailPage.tsx`:
- Kontaktne udaje (meno, email, telefon)
- Typ klienta (moznost zmenit)
- Stav konta (kredit/dlh)
- Frekvencia treningov (pocet za posledne 4 tyzdne)
- Odporucanie: "Pre optimalny progres odporucam aspon 2 treningy tyzdenne"
- Historia treningov (poslednych 20)
- Moznosti: Upravit kredit / Zaznacit platbu / Navrhnuť trening / Pozastaviť

Pridat route: `/admin/klienti/:id`

---

## 6. Platby - Rozsirenie AdminFinancesPage

Pridat do existujucej stranky:
- Typ platby v formulari (prevod / hotovost / iny)
- Historia platieb (poslednych 50 transakcii)

---

## 7. Novy hook: useCompleteTraining

Vytvorit `src/hooks/useCompleteTraining.ts`:
- Zmeni booking status na `completed`
- Odpocita cenu z klientovho balance
- Vytvori transakciu
- Posle notifikaciu klientovi

---

## Technicke detaily

### Poradie implementacie
1. `useAdminDashboardStats` hook - real data pre KPI
2. Redizajn `AdminDashboardPage` - nova prehladova lista + sekcia nepotvrdene
3. `useCompleteTraining` hook
4. `SlotDetailDialog` - detail treningu s akciami
5. Aktualizacia farieb v `WeeklyCalendarGrid`
6. `AdminClientDetailPage` + route
7. Filtre na `AdminClientsPage`
8. Rozsirenie `AdminFinancesPage`

### Upravene subory
- `src/pages/admin/AdminDashboardPage.tsx` - kompletny redizajn
- `src/components/admin/WeeklyCalendarGrid.tsx` - nove farby
- `src/components/admin/ConfirmedBookingCard.tsx` - nove akcie
- `src/pages/admin/AdminClientsPage.tsx` - filtre
- `src/pages/admin/AdminFinancesPage.tsx` - historia platieb
- `src/pages/admin/AdminCalendarPage.tsx` - integrace SlotDetailDialog
- `src/App.tsx` - nova route pre detail klienta

### Nove subory
- `src/hooks/useAdminDashboardStats.ts`
- `src/hooks/useCompleteTraining.ts`
- `src/components/admin/SlotDetailDialog.tsx`
- `src/pages/admin/AdminClientDetailPage.tsx`

### UX Principy
- Maximalne 3 kliky na kazdu akciu
- Ciste, minimalisticke rozhranie
- Farebne kodovanie pre okamzity prehlad
- iOS-style dizajn zachovany (glassmorphism, ios-card, ios-press)

