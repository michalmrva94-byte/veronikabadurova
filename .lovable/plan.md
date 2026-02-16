

# Prepinanie casoveho obdobia na dashboarde

## Prehlad

Pridat prepinac casoveho obdobia (Tyzden / 2 tyzdne / Mesiac) do hornej KPI listy na admin dashboarde, aby Veronika mohla sledovat klucove metriky na roznych casovych horizontoch.

---

## 1. UI zmena: Prepinac obdobia

Pridat `Tabs` komponent nad KPI karty s tromi moznostami:
- **Tento tyzden** (default)
- **2 tyzdne**
- **Tento mesiac**

Styl: kompaktne tab pills v ios-style, zarovnane nalavo pod nadpisom "Dashboard".

---

## 2. Uprava useAdminDashboardStats

Pridat parameter `period: 'week' | '2weeks' | 'month'` do hooku:

- `week`: startOfWeek(now) az endOfWeek(now)
- `2weeks`: startOfWeek(now) - 7 dni az endOfWeek(now)
- `month`: startOfMonth(now) az now

Metriky ovplyvnene obdobim:
- **Treningy**: pocet booked treningov v danom obdobi (namiesto len "tento tyzden")
- **Prijem**: sucet depositov v danom obdobi (namiesto len "tento mesiac")

Label KPI karty sa dynamicky zmeni:
- "Treningy / tyzden" -> "Treningy / 2 tyzdne" -> "Treningy / mesiac"
- "Prijem / tyzden" -> "Prijem / 2 tyzdne" -> "Prijem / mesiac"

Metriky **neovplyvnene** obdobim (vzdy aktualne):
- Aktivni klienti
- Nepotvrdene
- Rizikove (dlhy)

---

## 3. Uprava AdminDashboardPage

- Pridat `useState` pre vybranu periodu
- Predat periodu do `useAdminDashboardStats(period)`
- Pridat `queryKey` s periodou pre spravny caching
- Dynamicky menit labely KPI kariet podla vybranej periody

---

## Technicke detaily

### Upravene subory
- `src/hooks/useAdminDashboardStats.ts` - pridanie `period` parametra a vypocet datumovych rozsahov
- `src/pages/admin/AdminDashboardPage.tsx` - pridanie Tabs prepinaca a state pre periodu

### Pouzite komponenty
- `Tabs`, `TabsList`, `TabsTrigger` z `@/components/ui/tabs` (uz existuje)
- `subWeeks` z `date-fns` (uz nainstalovane)

### Ziadne DB zmeny
Vsetky data su dostupne z existujucich tabuliek.
