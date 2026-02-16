
# Prepracovanie klientskeho dashboardu - treningy na potvrdenie

## Prehlad

Prepracovanie klientskeho dashboardu s novym systemom sekcii, zvyraznenym boxom pre treningy cakajuce na potvrdenie, aktualizovanou farebnou logikou stavov a sekciovym rozdelenim (Vyzaduje pozornost / Nadchadzajuce / Historia).

## Zmeny

### 1. `src/components/client/ProposedTrainingsSection.tsx` - Kompletne prepracovanie

**Novy zvyrazneny box na vrchu:**
- Nadpis: "Mas treningy na potvrdenie"
- Countdown do najblizieho deadline
- Primary button "Potvrdit vsetky" (len ak >= 2 navrhy)
- Secondary button "Zobrazit detaily" - scroll/expand na zoznam

**Zoznam jednotlivych navrhov:**
- Datum + cas
- Badge "Caka na potvrdenie" (zlta/oranzova)
- Countdown do deadline
- Tlacidla Potvrdit / Odmietnut
- Zachovat existujucu logiku confirm/reject/confirmAll z hooku

**Farebna logika stavov (Badge):**
- `awaiting_confirmation` - zlta (`bg-warning/10 text-warning`)
- `booked` - zelena (`bg-success/10 text-success`)
- `cancelled` / rejected - siva (`bg-muted text-muted-foreground`)
- expired (deadline presiel) - cervena (`bg-destructive/10 text-destructive`)

### 2. `src/pages/client/DashboardPage.tsx` - Sekciove rozdelenie

Zmena `ApprovedDashboard` layoutu:

1. Welcome + Balance + Storno poplatky + Quick actions (bez zmeny)
2. **Sekcia "Vyzaduje pozornost"** - `ProposedTrainingsSection` (len ak existuju navrhy)
3. **Sekcia "Nadchadzajuce treningy"** - existujuca karta s upcomingBookings, ale s aktualizovanymi badge farbami (zelena pre booked, zlta pre pending)
4. **Sekcia "Historia"** - nova karta zobrazujuca poslednych 5 minulych treningov z `pastBookings` s farebnymi badge podla stavu (completed=zelena, cancelled=siva, no_show=cervena)
5. Storno pravidla karta (bez zmeny)

### 3. `src/hooks/useClientBookings.ts` - Drobna uprava

Pridat rozdelenie `pastBookings` pre lepsie filtrovanie - uz existuje, len overit ze expired/awaiting_confirmation po deadline sa spravne radi do historie.

## Technicke detaily

- Bulk tlacidlo "Potvrdit vsetky" sa zobrazi len pri `proposedBookings.length >= 2`
- CountdownBadge ostane s existujucou logikou (`differenceInHours`/`differenceInMinutes`)
- Pouzit existujuce UI komponenty (Card, Badge, Button) so shadcn
- Zachovat iOS-inspired dizajn pattern (zaoblene karty, vzdusnost)
- Nova helper funkcia `getStatusBadge(status, deadline?)` na centralizovane mapovanie stavu na farbu/text
