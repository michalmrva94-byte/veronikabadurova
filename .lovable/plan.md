

# Dashboard: Vykon vs Cashflow oddelenie

## Prehlad

Nahradit "Prijem / obdobie" kartu na dashboarde novou metrikou **"Zarobene"** (realny vynos z treningov a storno poplatkov). Cashflow metriky (vklady, vycerpane, net) presunieme do sekcie Financie.

---

## Zmeny

### 1. `useAdminDashboardStats.ts` -- nova metrika `earned`

Pridat do interface `AdminDashboardStats`:

```text
earned: number           -- SUM(training + cancellation transakcie v obdobi, absolutne hodnoty)
prevEarned: number       -- to iste pre predchadzajuce obdobie
```

V `queryFn`:
- Pridat 2 nove queries do existujuceho `Promise.all`:
  - Transakcie typu `training` + `cancellation` v aktualnom obdobi
  - To iste pre predchadzajuce obdobie
- `earned` = SUM absolutnych hodnot (training transakcie su zaporne, cancellation tiez -- pouzijeme `Math.abs`)
- `prevEarned` = to iste pre prev period

Poznamka: Typ `training` = odcitanie za odplávany trening. Typ `cancellation` = storno poplatok. Obe su zaporne v DB (odcitaju sa z kreditu klienta), preto pouzijeme absolutnu hodnotu.

### 2. `AdminDashboardPage.tsx` -- nahrada "Prijem" za "Zarobene"

Zmenit full-width KPICard:
- **Title**: `Zarobene / ${periodLabel}`
- **mainValue**: `${stats.earned.toFixed(0)}EUR`
- **mainColor**: success (ak >= 0)
- **tooltip**: "Zarobene = realny vynos z treningov, storno poplatkov a last-minute obsadeni. Nezahrna kreditne vklady."
- **trend**: `{ current: stats.earned, previous: stats.prevEarned }`
- **Odstranit subValues** (Vklady/Vycerpane) -- tie idu do Financii
- **Ikona**: Euro (zachovat)

### 3. `AdminFinancesPage.tsx` -- pridanie cashflow prehladu

Do existujucej stranky Financie pridat na vrch (nad "Pridaj kredit" formular) novu cashflow sekciu:

Nahradit sucasny 3-column stats grid (Kredity/Dlhy/Mesiac) za:
- **Vklady (obdobie)**: suma deposit transakcii za aktualny mesiac
- **Vycerpane (obdobie)**: suma training transakcii za aktualny mesiac
- **Netto**: rozdiel (vklady - vycerpane)

Pouzit existujuci `useAdminFinancesStats` hook -- uz ma `totalCredits`, `totalDebts`, `monthlyRevenue`. Zachovat existujuce hodnoty, len upravit labely pre jasnost.

---

## Subory na zmenu

1. **`src/hooks/useAdminDashboardStats.ts`** -- pridat `earned` + `prevEarned` fieldy a queries
2. **`src/pages/admin/AdminDashboardPage.tsx`** -- nahradit Prijem kartu za Zarobene (bez subValues)
3. **`src/pages/admin/AdminFinancesPage.tsx`** -- volitelne: upravit labely stats kariet pre konzistenciu

---

## Co sa NEMENI

- 2x2 KPI grid (Aktivni klienti, Treningy, Nepotvrdene, Obsadenost)
- Sekcia "Potrebujem riesit dnes" (alerty)
- Statistiky (collapsible sekcia s CLV)
- KPICard komponent (uz ma vsetky potrebne props)

