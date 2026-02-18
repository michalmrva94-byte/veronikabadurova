

# Refaktoring Admin Dashboard -- Riadiaci panel s presnými KPI

## Prehľad

Kompletný refaktoring admin dashboardu (`/admin`) s cieľom poskytnúť Veronike presné, obdobím viazané KPI metriky, sekciu "Potrebujem riešiť dnes" a vylepšenú mobilnú skúsenosť.

---

## 1. Obdobie (Period Logic)

Prepínač zostáva: **Týždeň** (default) | **Mesiac** | **História**

Pridáme helper `getPeriodRange(period)` vracajúci `{ startDate, endDate }`:
- Týždeň: ISO týždeň Po-Ne (existujúce)
- Mesiac: 1. - posledný deň mesiaca (existujúce)
- História: picker rok/mesiac/týždeň (existujúce `DashboardHistoryPicker`)

Bez zmien v UI prepínačoch -- logika už funguje.

---

## 2. Refaktorovaný `useAdminDashboardStats.ts`

Rozšírený interface `AdminDashboardStats`:

```text
activeClients          -- distinct klienti s booked/completed v období
regularClients         -- z nich tí s >=2 tréningami
plannedTrainings       -- count(status=booked) v období
completedTrainings     -- count(status=completed) v období
cancelledTrainings     -- count(status=cancelled) v období
unconfirmedBookings    -- pending/proposed/awaiting (globálne)
criticalBookings       -- z nich tie s deadline < 6h
debtClients            -- profiles kde balance < 0
totalDebt              -- sum abs(balance) dlžníkov
riskyCancellers        -- klienti s >=2 stornami <24h alebo >=1 no_show za 30 dní
deposits               -- sum deposit transakcií v období
creditUsage            -- sum training transakcií v období (alebo count(completed)*price)
netRevenue             -- deposits - creditUsage
stornoRate, avgTrainingsPerClient, slotOccupancy  -- existujúce, opravené
clv, avgCooperationMonths, avgMonthlyRevenuePerClient  -- existujúce
```

Kľúčové opravy:
- **Aktívni klienti**: `distinct client_id` z bookings kde `start_time` v období a `status IN (booked, completed)` -- namiesto počítania approved profilov
- **Tréningy**: rozdelenie na planned/completed/cancelled
- **Príjem**: deposit + training transakcie namiesto iba deposit
- **Rizikové**: rozdelenie na dlžníkov a riziko rušení (posledných 30 dní)
- **Kritické nepotvrdené**: filtrovanie podľa `confirmation_deadline`

---

## 3. Nová sekcia: "Potrebujem riešiť dnes"

Nový komponent `AdminActionAlerts.tsx` zobrazený pod KPI kartami.

Zobrazí sa len ak existuje aspoň 1 alert:
- Kritické nepotvrdené bookings (deadline < 6h)
- Klienti s negatívnym zostatkom
- Klienti, ktorým kredit nepokrýva najbližší confirmed tréning

Každý alert bude klikateľný -- presmeruje na detail klienta alebo booking.

---

## 4. Nové KPI karty (5 blokov)

| # | Karta | Hlavná hodnota | Detail |
|---|---|---|---|
| 1 | Aktívni klienti | X | z toho pravidelní: Y |
| 2 | Tréningy | Plánované: X | Odplávané: Y, Zrušené: Z |
| 3 | Nepotvrdené | X | Kritické (<6h): Y (červený badge) |
| 4 | Rizikové | Dlžníci: X | Celkový dlh: Y EUR, Riziko rušení: Z |
| 5 | Príjem | Vklady: X EUR | Vyčerpané: Y EUR, Net: Z EUR |

Mobilný layout: 1 karta na riadok (plná šírka), desktop: grid 5 stĺpcov.

---

## 5. Klient detail -- rozšírenie

Na existujúcej stránke `AdminClientDetailPage.tsx` pridáme:
- Počet tréningov v období (posledných 30 dní)
- Storno rate (%) -- cancelled / (cancelled + completed + booked)
- CLV per klient -- sum(completed * price)
- Počet mesiacov v systéme

---

## 6. Farebná hierarchia

- Zelená: zdravé hodnoty (aktívni klienti, kladný príjem)
- Oranžová: pozor (nepotvrdené, nízka frekvencia)
- Červená: akcia potrebná (kritické, dlhy, rizikové)

---

## 7. Performance optimalizácia

- Agregované queries s `Promise.all` (existujúce, rozšírime)
- Filtrovanie cez Supabase `.gte()/.lte()` namiesto client-side filtra
- Odstránenie N+1: všetky dáta v jednom fetch cykle

---

## Technický plán -- súbory na zmenu

### Upravené súbory:
1. **`src/hooks/useAdminDashboardStats.ts`** -- kompletný refaktor: nový interface, nové queries, opravená logika všetkých KPI
2. **`src/pages/admin/AdminDashboardPage.tsx`** -- nové KPI karty s detailmi, mobilný layout (1 stĺpec), integrácia ActionAlerts
3. **`src/components/admin/AdminStatsSection.tsx`** -- aktualizácia pre nové stats fieldy
4. **`src/pages/admin/AdminClientDetailPage.tsx`** -- rozšírenie o storno rate, CLV, počet mesiacov

### Nové súbory:
5. **`src/components/admin/AdminActionAlerts.tsx`** -- sekcia "Potrebujem riešiť dnes"
6. **`src/components/admin/KPICard.tsx`** -- znovupoužiteľný KPI komponent s podporou sub-values a farebnej hierarchie

### Cleanup:
- Odstránenie starej `KPICard` inline funkcie z `AdminDashboardPage`
- Odstránenie starej logiky počítajúcej iba deposity ako príjem
- Odstránenie `activeClients` založeného na `approval_status`

