

# Dynamická sekcia "POTREBUJEM RIESIT DNES"

## Prehľad

Prepísanie `AdminActionAlerts.tsx` s novými pravidlami alertov, prioritným zoradením (max 3) a rozšírenie `useAdminDashboardStats.ts` o nové dátové body.

---

## Nové pravidlá alertov (5 typov)

| Priorita | Alert | Podmienka | Odkaz |
|----------|-------|-----------|-------|
| Vysoka | Kreditovy problem | booked booking v nasledujucich 24h AND client.balance < booking.price | Financie |
| Vysoka | Trening dnes bez potvrdenia | slot.start_time = dnes AND status NOT IN (booked, completed, cancelled) | Kalendar |
| Stredna | Neodpovedane navrhy po deadline | status = proposed AND confirmation_deadline < NOW() | Dashboard |
| Nizka | Vysoka miera storna | storno rate za 7 dni > 30% AND pocet treningov >= 5 | Klienti |
| Nizka | Nizka obsadenost | obsadenost slotov < 50% za aktualny tyzden AND otvorenych slotov > 5 | Kalendar |

Zobrazenie: max 3 alerty zoradene podla priority. Ak 0 alertov, sekcia sa nerenderuje.

---

## Technicke zmeny

### 1. `useAdminDashboardStats.ts` -- nove fieldy v interface

Pridat do `AdminDashboardStats`:

```text
// Nove alert data
creditRiskClients: number          -- klienti s booking <24h a nedostatocnym kreditom
expiredProposals: number           -- proposed bookings kde deadline < now
todayUnconfirmed: number           -- dnesne bookings ktore nie su booked/completed/cancelled
weeklyStornoRate7d: number         -- storno % za poslednich 7 dni
weeklyTrainingCount7d: number      -- pocet treningov za 7 dni
weeklySlotOccupancy: number        -- obsadenost aktualneho tyzdna (%)
weeklyOpenSlots: number            -- pocet otvorenych slotov tento tyzden
```

Pridat do `queryFn` nove queries (paralelne cez existujuci `Promise.all`):

- **creditRiskClients**: existujuci `confirmedUpcomingRes` -- filter na `start_time < now + 24h` a `balance < price`
- **expiredProposals**: z `unconfirmedRes` -- filter `status = proposed` a `confirmation_deadline < now`
- **todayUnconfirmed**: z `periodBookingsRes` alebo novy query -- `start_time` je dnes a `status NOT IN (booked, completed, cancelled)`
- **weeklyStorno**: novy query -- bookings za poslednich 7 dni, vypocet cancelled/(cancelled+completed+booked)
- **weeklySlots**: existujuci `slotsRes` prepocitat pre aktualny tyzden

### 2. `AdminActionAlerts.tsx` -- kompletne prepisanie

Novy interface:

```text
interface AlertItem {
  priority: 'high' | 'medium' | 'low'
  icon: ReactNode
  text: string
  count: number
  to: string
}
```

Logika:
1. Vybudovat pole alertov podla 5 pravidiel
2. Zoradit: high -> medium -> low
3. Orezat na max 3
4. Ak pole prazdne, return null

Vizual:
- high = cerveny pruh vlavo + cervena ikona
- medium = oranzovy pruh vlavo + oranzova ikona
- low = sedy pruh vlavo + seda ikona
- Minimalisticky: ikona + kratky text + pocet (badge) + sipka

### 3. `AdminDashboardPage.tsx` -- ziadne zmeny

Uz pouziva `{stats && <AdminActionAlerts stats={stats} />}`, takze staci upravit props cez interface.

---

## Subory na zmenu

1. **`src/hooks/useAdminDashboardStats.ts`** -- pridanie novych fieldov + queries
2. **`src/components/admin/AdminActionAlerts.tsx`** -- kompletne prepisanie s novymi pravidlami

