

# Plan: Reorganizacia sekcie DOMOV -- priorita treningov

## Prehlad

Prestavba dashboardu tak, aby odpovedal na otazku: "Kedy idem plavat a co mam teraz spravit?" Treningy su prvy fokus, financie az na konci.

---

## Nova struktura (zhora nadol)

1. **Pozdrav** -- personalizovany text
2. **Nadchadzajuce treningy** -- proposed (prioritne) + confirmed + prazdny stav
3. **Moje treningy** -- motivacne metriky + CTA tlacidla
4. **Vas zostatok** -- kompaktna karta (bez zmeny logiky)

Odstranujem: Collapsible rezervacne podmienky (presunute do sekcie Moje treningy alebo uplne prec -- su uz na landing page a v CancelBookingDialog).

---

## Detailne zmeny v DashboardPage.tsx

### 1. Pozdrav (ponechat)
- `"Ahoj, {meno}! 👋"` + `"Tesim sa na dalsi trening."`

### 2. Nadchadzajuce treningy (prvy blok)

**A) Proposed treningy (najvyssia priorita)**
- Ak `proposedBookings.length > 0`: zobrazit `ProposedTrainingsSection` PRED potvrdenym treningom
- Toto uz existuje, len sa posunie vyssie (pred CTA a pred confirmed)

**B) Potvrdeny trening**
- Ak `upcomingBookings.length > 0`: karta "Najblizsi trening" s datumom + casom + tlacidlo "Detail"
- Ponechat aktualny dizajn karty

**C) Prazdny stav**
- Ak ziadne proposed ani upcoming: `"Zatial nemate trening na najblizsi tyzden."`
- Pod tym primarne CTA: `"Rezervovat trening"`

### 3. Moje treningy (druhy blok) -- NOVA SEKCIA

Karta s motivacnymi metrikami a CTA:

```text
Moje treningy

[Tento tyzden: X]  [Tento mesiac: X]  [Po sebe: X tyzdnov]

[Rezervovat novy trening]  [Zobrazit historiu]
```

**Metriky:**
- "Tento tyzden" -- pocet completed + booked treningov v aktualnom tyzdni
- "Tento mesiac" -- pocet completed + booked treningov v aktualnom mesiaci  
- "Konzistentnost" -- pocet po sebe nasledujucich tyzdnov s aspon 1 treningom (pocitane dozadu od aktualneho tyzdna)

Vizualne jemne: `text-muted-foreground`, male cislo, bez velkych ikon.

**Tlacidla:**
- "Rezervovat novy trening" (primary, naviguje na /kalendar)
- "Zobrazit historiu" (ghost/outline, naviguje na /moje-treningy)

### 4. Vas zostatok (treti blok)
- Ponechat aktualnu kompaktnu kartu bez zmeny
- Zelena/siva/cervena logika zostava

### 5. Odstranit
- Samostatne primarne CTA tlacidlo (presunute do sekcie "Moje treningy")
- Collapsible "Rezervacne podmienky" (uz nie je na dashboarde)
- Sekciu Historia (nahradena tlacidlom "Zobrazit historiu")

---

## Vypocet metrik

Metriky sa vypocitaju priamo v komponente z `bookingsQuery.data`:

```text
thisWeekCount = bookings kde:
  - status je 'booked' alebo 'completed'
  - slot.start_time je v aktualnom tyzdni (pon-ned)

thisMonthCount = bookings kde:
  - status je 'booked' alebo 'completed'  
  - slot.start_time je v aktualnom mesiaci

consistencyWeeks = pocet po sebe nasledujucich tyzdnov
  dozadu od aktualneho tyzdna, kde kazdy tyzden
  ma aspon 1 booking so statusom 'completed' alebo 'booked'
```

Pouziju sa funkcie z `date-fns`: `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `subWeeks`, `isWithinInterval`.

---

## Importy

### Pridat
- `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `subWeeks`, `isWithinInterval` z `date-fns`
- `Dumbbell` alebo `Activity` z `lucide-react` (ikona pre sekciu Moje treningy)

### Odstranit
- `ChevronDown` (ak sa uz nepouziva)
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` import (ak sa uz nepouziva)

---

## Subory na upravu

- `src/pages/client/DashboardPage.tsx` -- jediny subor
- `src/hooks/useClientBookings.ts` -- bez zmeny (data uz su k dispozicii)

## Co sa NEMENI

- PendingApprovalScreen, RejectedScreen
- ProposedTrainingsSection komponent (pouziva sa rovnako, len vyssia pozicia)
- useClientBookings hook
- Backend / databaza
- Financie karta logika

