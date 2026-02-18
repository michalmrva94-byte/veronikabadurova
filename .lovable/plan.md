
# Admin Dashboard Refaktor -- Obsadenost, Trendy, Benchmarky

## Prehlad

Nahradenie metriky "Rizikove" metrikou **Obsadenost** v 2x2 gride, pridanie **trend arrows** ku 4 KPI + Prijmu, a aktualizacia **Statistiky** sekcie s CLV benchmarkmi. Logika alertov ("Potrebujem riesit dnes") zostava bez zmien.

---

## Zmeny

### 1. `useAdminDashboardStats.ts` -- Previous period data + obsadenost

Pridat do interface:

```text
// Previous period for trend calculation
prevActiveClients: number
prevTrainings: number
prevSlotOccupancy: number
prevNetRevenue: number
```

Logika:
- Vypocitat `previousRange` automaticky: ak current = tyzden, previous = predchadzajuci tyzden; ak mesiac, predchadzajuci mesiac; ak custom, posun o rovnaky pocet dni
- Pridat duplicitne queries pre previous period (period bookings, slots, transactions) do existujuceho `Promise.all`
- Obsadenost v gride = `slotOccupancy` (uz existuje) -- confirmed+completed / total slots v obdobi

### 2. `KPICard.tsx` -- Trend arrow support + insight text

Pridat nove props:

```text
trend?: { current: number; previous: number }  -- auto-vypocet %
insightText?: string                            -- kratky text pod hodnotou
insightColor?: 'success' | 'warning' | 'destructive' | 'muted'
```

Trend logika v komponente:
- Ak previous = 0, nezobrazovat
- zmena > +5% = zelena sipka hore + "% text"
- zmena < -5% = cervena sipka dole + "% text"
- -5% az +5% = siva sipka vpravo + "% text"
- Tooltip: "Porovnanie s predchadzajucim obdobim"

Vizual: maly text pod hlavnou hodnotou, napr. `↑ +12%`

### 3. `AdminDashboardPage.tsx` -- Grid refaktor

2x2 grid zmeny:
- Karta 1: **Aktivni klienti** -- bez zmien, pridat `trend`
- Karta 2: **Treningy / obdobie** -- bez zmien, pridat `trend`
- Karta 3: **Nepotvrdene** -- bez zmien, **bez trendu**
- Karta 4: **Obsadenost** (NAHRADI "Rizikove") -- percento, benchmark insight text, trend arrow

Obsadenost benchmarky (insightText):
- >= 75% = zelena, "Vyborne vyuzitie kapacity"
- 50-74% = zlta, "Stabilne, priestor na rast"
- 30-49% = oranzova, "Slabsie vyuzitie"
- < 30% = cervena, "Kapacita sa nevyuziva efektivne"

Prijem karta: pridat `trend` (prevNetRevenue)

### 4. `AdminStatsSection.tsx` -- CLV benchmarky

Pridat pod CLV hodnotu benchmark text:
- < 300 EUR = "Kratkodobi klienti"
- 300-1000 EUR = "Stabilni klienti"
- > 1000 EUR = "Dlhodobi klienti"

Presun "Obsadenost slotov" StatCard z tejto sekcie prec (je uz v hlavnom gride).

---

## Subory na zmenu

1. **`src/hooks/useAdminDashboardStats.ts`** -- previous period queries + prev* fieldy
2. **`src/components/admin/KPICard.tsx`** -- trend arrow + insightText props
3. **`src/pages/admin/AdminDashboardPage.tsx`** -- nahradit "Rizikove" za "Obsadenost", pridat trendy
4. **`src/components/admin/AdminStatsSection.tsx`** -- CLV benchmarky, odstranit duplicitnu obsadenost
