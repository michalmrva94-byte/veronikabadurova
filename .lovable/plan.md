

# Financie Refaktor -- 4 KPI + Kreditny tok + Historia

## Prehlad

Kompletne prepisanie sekcie Financie s 4 KPI kartami (Cisty zarobok, Vklady, Dlhy, Zostatok kreditov), blokom Kreditny tok, opravou chyby v transaction query (ambiguous join) a pridanim linku na kompletnu historiu transakcii.

---

## Zmeny

### 1. `useAdminFinances.ts` -- kompletne prepisanie hooku

Novy hook `useAdminFinancesStats` bude prijmat **period parameter** (tyzden/mesiac) a vraciat:

```text
Interface:
  earned: number              -- SUM(training + cancellation transakcii v obdobi, abs)
  prevEarned: number          -- to iste pre predchadzajuce obdobie
  deposits: number            -- SUM(deposit transakcii v obdobi)
  prevDeposits: number        -- to iste pre predchadzajuce obdobie
  totalDebts: number          -- SUM(negativnych zostatkov profilov)
  totalCredits: number        -- SUM(pozitivnych zostatkov profilov)
  creditUsage: number         -- SUM(training transakcii v obdobi, abs)
```

Queries (paralelne cez Promise.all):
- Transakcie typu `training` + `cancellation` v aktualnom obdobi (earned)
- To iste pre predchadzajuce obdobie (prevEarned)
- Deposit transakcie v aktualnom obdobi
- To iste pre predchadzajuce obdobie
- Training transakcie v obdobi (credit usage / vycerpane)
- Profily -- balances (totalDebts, totalCredits)

Hook `useClientsWithDebt` zostava bez zmien.

### 2. `AdminFinancesPage.tsx` -- kompletne prepisanie

**Pridame period toggle** (Tyzden / Mesiac) -- rovnaky vizual ako na dashboarde.

**4 KPI karty** (2x2 grid) pouzijuci existujuci `KPICard` komponent:

1. **Cisty zarobok** -- `earned`, trend arrow (vs prevEarned), tooltip
2. **Vklady** -- `deposits`, trend arrow (vs prevDeposits)
3. **Dlhy klientov** -- `totalDebts`, bez trendu, cervena
4. **Zostatok kreditov** -- `totalCredits`, bez trendu

**Kreditny tok blok** (kompaktna karta pod KPI):
- Vklady: X EUR
- Vycerpane: X EUR
- Cista zmena: +/- X EUR (zelena/cervena)

**Pridaj kredit formular** -- zachovat bez zmien.

**Klienti s dlhom** -- zachovat bez zmien.

**Historia platieb** -- zachovat, ale:
- Opravit query: zmenit `client:profiles(full_name)` na `client:profiles!transactions_client_id_fkey(full_name)` (oprava 300 erroru z network logs)
- Pridat link "Zobrazit kompletnu historiu" vpravo hore v header karte

### 3. Nova stranka: `AdminFinanceHistoryPage.tsx`

Stranka na route `/admin/financie/historia` s:
- Filtry: obdobie (date range picker), klient (select), typ transakcie, len nezaplatene
- Tabulka transakcii: datum, klient, typ, suma, popis
- Strankovanie (po 25 zaznamoch)
- Pouzit existujuci `AdminLayout`

### 4. Routing -- `App.tsx` + `constants.ts`

- Pridat novu route `ROUTES.ADMIN.FINANCE_HISTORY = '/admin/financie/historia'`
- Pridat Route v App.tsx

### 5. Dashboard cleanup

Na `AdminDashboardPage.tsx` nie su potrebne zmeny -- "Zarobene" karta uz existuje a je spravna.

---

## Oprava bugu

Transaction query v `AdminFinancesPage` vracia HTTP 300 (ambiguous relationship). Oprava: pouzit explicit foreign key hint `profiles!transactions_client_id_fkey` v select stringu.

---

## Subory na zmenu

1. **`src/hooks/useAdminFinances.ts`** -- prepisat s period-based queries
2. **`src/pages/admin/AdminFinancesPage.tsx`** -- 4 KPI + kreditny tok + oprava query
3. **`src/pages/admin/AdminFinanceHistoryPage.tsx`** -- nova stranka s filtrovatelnou historiou
4. **`src/lib/constants.ts`** -- pridat FINANCE_HISTORY route
5. **`src/App.tsx`** -- pridat route

