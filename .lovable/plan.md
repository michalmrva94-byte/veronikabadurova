

# Inteligentne KPI insighty - Plan implementacie

## Prehlad

Rozsirit existujuce KPI karty a pridat novu sekciu "Statistiky" s inteligentnymi insightmi - kazda metrika bude mat cislo, farebny stav a 1-vetovy akcny insight. Pridat nove metriky: miera storna, priemer treningov/klient, obsadenost slotov, celkovy dlh a CLV.

---

## 1. Rozsirenie useAdminDashboardStats

Pridat nove metriky do existujuceho hooku:

- **Miera storna (%)**: query bookings za dane obdobie so statusom `cancelled` + `no_show` vs vsetky (`cancelled` + `no_show` + `booked` + `completed`)
- **Priemer treningov/klient/tyzden**: pocet `booked` + `completed` treningov / aktivni klienti / pocet tyzdnov v obdobi
- **Obsadenost slotov (%)**: pocet slotov s bookingom / celkovy pocet slotov v obdobi * 100
- **Celkovy dlh (€)**: sucet negativnych zostatkov z profiles (absolutna hodnota)
- **CLV data**: pre klientov s min. 1 completed treningom - priemerna dlzka spoluprace (mesiace) * priemerny mesacny prijem na klienta

Novy interface:

```text
AdminDashboardStats {
  // existujuce
  activeClients, pendingClients, weekTrainings,
  unconfirmedBookings, clientsWithDebt, monthlyRevenue

  // nove
  stornoRate: number          // percento
  avgTrainingsPerClient: number
  slotOccupancy: number       // percento
  totalDebt: number           // absolutna hodnota v €
  clv: number                 // € odhadovana hodnota
  avgCooperationMonths: number
  avgMonthlyRevenuePerClient: number
}
```

Nove queries:
- `bookings` s filtrom na obdobie pre vsetky statusy (pre vypocet storna)
- `training_slots` v obdobi (pre obsadenost)
- `transactions` typu `training` zoskupene po klientoch (pre CLV)
- `bookings` s `completed` statusom s min/max datumami per klient (pre dlzku spoluprace)

---

## 2. Novy komponent: AdminStatsSection

Vytvorit `src/components/admin/AdminStatsSection.tsx`:

### Struktura - 3 riadky kariet

**Riadok 1: Operativne KPI (4 karty)**
- Miera storna: cislo + farba + insight
- Priemer treningov/klient: cislo + farba + insight
- Obsadenost slotov: cislo + farba + insight
- Celkovy dlh: cislo + farba + insight

**Riadok 2: CLV panel (1 sirsie ios-card)**
- Priemerna dlzka spoluprace (mesiace)
- Priem. mesacny prijem/klient (€)
- CLV (€)
- CLV insight text

### Insight logika (ciasto v komponente)

Miera storna:
- < 15% -> zelena dot + "Vybornu stabilita treningov."
- 15-25% -> oranzova dot + "Sleduj potvrdenia treningov."
- > 25% -> cervena dot + "Zvaz sprisnenie potvrdzovania alebo upravu kapacity."

Priemer treningov/klient:
- >= 2 -> zelena + "Klienti trenuju optimalne."
- 1-1.9 -> oranzova + "Podpor pravidelnost treningov."
- < 1 -> cervena + "Nizka pravidelnost klientov."

Obsadenost slotov:
- < 70% -> oranzova + "Kapacita nie je efektivne vyuzita."
- 70-90% -> zelena + "Idealna vytazenost."
- > 95% -> cervena + "Riziko pretazenia."

Celkovy dlh:
- 0 -> zelena + "Ziadne otvorene pohladavky."
- 1-100€ -> oranzova + "Skontroluj otvorene pohladavky."
- > 100€ -> cervena + vyrazne zvyraznenie + "Urgentne skontroluj pohladavky."

CLV:
- Zobrazit orientacne cislo s tooltip vysvetlenim

### UI styl
- Kazda karta: velke cislo hore, maly label, pod nim 1-riadkovy insight text v jemnej farbe
- Farebny dot (maly kruzok) vedla insight textu indikuje stav
- Bez alarmo-bannerov - posobí ako "poradca"
- iOS-style karty (ios-card), mobilne responsive (grid-cols-2)

---

## 3. Integrace do AdminDashboardPage

Pridat `AdminStatsSection` do dashboardu:
- Umiestnit medzi period toggle a sekciu "Caka na potvrdenie"
- Zabalit do `Collapsible` s nadpisom "Statistiky" (default zbaleny)
- Pouzit existujuce stats data z `useAdminDashboardStats`

---

## Technicke detaily

### Nove subory
- `src/components/admin/AdminStatsSection.tsx`

### Upravene subory
- `src/hooks/useAdminDashboardStats.ts` - rozsirenie o nove metriky
- `src/pages/admin/AdminDashboardPage.tsx` - pridanie AdminStatsSection

### Ziadne DB zmeny
Vsetky data su dostupne z existujucich tabuliek.

### Pouzite existujuce komponenty
- `Tooltip`, `TooltipContent`, `TooltipTrigger`, `TooltipProvider`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- ios-card CSS trieda

