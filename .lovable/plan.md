

# Fixne treningy na schvalenie - Implementacny plan

## Prehlad

Tato funkcia umozni adminovi navrhnut fixne treningy pre klienta (vyber dni + cas + rozsah), s koliznou kontrolou, notifikaciami a deadline systemom. Klient moze navrhy potvrdit/odmietnut zo svojho dashboardu.

## Databazove zmeny

Nie su potrebne ziadne zmeny schemy. Existujuce tabulky uz podporuju vsetko potrebne:
- `bookings` - ma `status` (proposed/awaiting_confirmation), `confirmation_deadline`, `proposed_by`
- `training_slots` - ma `start_time`, `end_time`, `is_available`
- `notifications` - ma `user_id`, `title`, `message`, `type`

Booking status `proposed` a `awaiting_confirmation` su uz definovane v `BookingStatus` type a `BOOKING_STATUS_LABELS`.

## Nove subory

### 1. `src/components/admin/ProposeFixedTrainingsDialog.tsx`
Modal dialog s:
- Multi-select checkboxy pre dni (Pondelok-Nedela)
- Time picker pre kazdy vybrany den
- Select pre rozsah: "Najblizsi 1 tyzden" / "NajblizSie 2 tyzdne"
- Kolizna kontrola pred vytvorenim
- Zobrazenie konfliktov s moznostou "Preskocit konfliktne terminy"
- CTA: "Vytvorit navrhy treningov"

### 2. `src/hooks/useProposedTrainings.ts`
Hook obsahujuci:
- `proposeFixedTrainings` mutation - vytvori sloty + bookingy so statusom `awaiting_confirmation`, nastavi `confirmation_deadline` na +24h, posle notifikaciu
- `checkConflicts` funkcia - skontroluje existujuce bookingy (booked, awaiting_confirmation) pre dany datum/cas pre klienta aj v kalendari trenerky
- `confirmProposedTraining` mutation - zmeni status na `booked` (s opetovnou koliznou kontrolou)
- `rejectProposedTraining` mutation - zmeni status na `cancelled`, uvolni slot
- `confirmAllProposed` mutation - hromadne potvrdenie vsetkych navrhov

### 3. `src/components/client/ProposedTrainingsSection.tsx`
Sekcia pre klientsky dashboard zobrazujuca:
- Zoznam navrhnutych treningov
- Datum, cas, countdown do deadline
- Tlacidla Potvrdit / Odmietnut pre kazdy trening
- Tlacidlo "Potvrdit vsetky" pre hromadne potvrdenie
- Alert pri konflikte pocas potvrdzovania

## Upravene subory

### 4. `src/pages/admin/AdminClientDetailPage.tsx`
- Pridat tlacidlo "Navrhnit fixne treningy" pod sekciu kontaktu/typu klienta
- Importovat a pouzit `ProposeFixedTrainingsDialog`
- Nacitat zoznam uz navrhnutych treningov pre daneho klienta

### 5. `src/pages/client/DashboardPage.tsx`
- Pridat `ProposedTrainingsSection` nad sekciu "Nadchadzajuce treningy"
- Zobrazit len ak existuju navrhy so statusom `awaiting_confirmation`

### 6. `src/hooks/useClientBookings.ts`
- Pridat filter pre `proposedBookings` (status === 'awaiting_confirmation')
- Exportovat `proposedBookings` zo hooku

## Technicke detaily

### Kolizna kontrola (admin strana)
Pred vytvorenim navrhov sa vykona query:
```text
SELECT bookings WHERE:
  - client_id = vybrany klient AND status IN ('booked', 'awaiting_confirmation')
  - ALEBO existuje booking pre iny klient v rovnakom case so statusom 'booked'/'awaiting_confirmation'
  - start_time sa prekryva s navrhovanym casom
```

### Kolizna kontrola (klient strana)
Pri potvrdeni sa znova skontroluje ci slot nie je obsadeny (race condition ochrana).

### Vytvorenie navrhov - flow
1. Pre kazdy vybrany den + rozsah vypocitaj konkretne datumy
2. Pre kazdy datum vytvor `training_slot` (is_available: false)
3. Vytvor `booking` so statusom `awaiting_confirmation`, `confirmation_deadline` = now + 24h, `proposed_by` = admin profile id
4. Vytvor notifikaciu pre klienta

### Automaticke pripomienky a expiracka
Vytvorit edge function `check-proposed-deadlines` spustanu cez pg_cron kazdu hodinu:
- Po 12h od vytvorenia: poslat pripomienku
- 1h pred deadline: poslat urgentnu pripomienku
- Po deadline: zmenit status na `cancelled`, uvolnit slot

### Countdown v UI
Pouzit `differenceInHours` / `differenceInMinutes` z `date-fns` pre zobrazenie zostaveajuceho casu do deadline.

## Poradie implementacie

1. Hook `useProposedTrainings` (zakladna logika)
2. `ProposeFixedTrainingsDialog` (admin modal)
3. Uprava `AdminClientDetailPage` (tlacidlo + dialog)
4. `ProposedTrainingsSection` (klientska sekcia)
5. Uprava `DashboardPage` + `useClientBookings`
6. Edge function `check-proposed-deadlines` + pg_cron schedule

