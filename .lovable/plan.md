

## Pridanie detailu storno metriky — zoznam konkrétnych stornovaných tréningov

### Čo sa zmení
Po kliknutí na "?" pri Miere storna sa v popoveri okrem vzorca a benchmarkov zobrazí aj **zoznam konkrétnych stornovaných/neúčasťových tréningov** v danom období — meno klienta, dátum tréningu a typ (zrušené / neúčasť).

### Technické zmeny

#### 1. `useAdminDashboardStats.ts` — rozšíriť query a výstup
- Zmeniť period bookings query (riadok 128) — pridať `client:profiles!bookings_client_id_fkey(full_name)` do select, aby sme mali meno klienta
- Pridať do `AdminDashboardStats` interface nové pole:
  ```typescript
  stornoDetails: Array<{ clientName: string; slotDate: string; status: 'cancelled' | 'no_show' }>;
  ```
- V logike (riadok 290-296) zozbierať detaily z `stornoRelevantBookings` kde status je `cancelled` alebo `no_show`

#### 2. `AdminStatsSection.tsx` — rozšíriť popover
- Pod existujúci benchmark blok pridať sekciu "Detail storna" so scrollovateľným zoznamom (max-h-[200px])
- Každý riadok: dátum tréningu, meno klienta, badge (Zrušené / Neúčasť)
- Ak je zoznam prázdny, zobraziť "Žiadne storná v tomto období"

### Vizuálny návrh
```text
┌─────────────────────────────────────┐
│  Miera storna = ...                 │
│  Aktuálne: 3 / 12 (25%)            │
│  ─────────────────────────────────  │
│  Benchmark                          │
│  🟢 < 15% — Výborná                │
│  🟡 15-25% — Prijateľná            │
│  🔴 > 25% — Vysoká                 │
│  ─────────────────────────────────  │
│  Storná v období (3)                │
│  ┌─────────────────────────────┐    │
│  │ 18.3. 14:00  Buntová  [Zruš]│   │
│  │ 15.3. 10:00  Vojtas   [Neúč]│   │
│  │ 12.3. 16:00  Novák    [Zruš]│   │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

