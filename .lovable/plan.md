

## Problém

Ak klient nestihne potvrdiť navrhnutý tréning do deadline-u (24h), na klientskej strane sa deje nasledovné:

1. **Edge Function `check-proposed-deadlines`** správne zruší booking a vymaže slot — ale beží len keď ju zavolá externý cron, takže medzi vypršaním a spracovaním môže byť medzera
2. **Klientský hook `useClientBookings.ts`** (riadok 181–185) filtruje `proposedBookings` len podľa statusu `awaiting_confirmation` a budúceho `start_time` — **nekontroluje `confirmation_deadline`**, takže vypršané návrhy sa stále zobrazujú ako aktívne
3. **`ProposedTrainingsSection`** síce zobrazí badge "Vypršané", ale stále ponúka tlačidlá na potvrdenie/odmietnutie
4. Vypršané návrhy sa nezobrazujú ani v histórii (`pastBookings` vylučuje `awaiting_confirmation`)

Zároveň je tu stále nevyriešený problém z predchádzajúcej konverzácie: **kontrola konfliktov pri potvrdení** blokuje klientov (riadky 255–270 v `useProposedTrainings.ts`).

## Riešenie

### 1. `src/hooks/useClientBookings.ts` — rozdeliť vypršané od aktívnych

**Riadky 180–185** — pridať kontrolu deadline-u do filtra `proposedBookings`:

```typescript
// Navrhnuté = awaiting_confirmation, v budúcnosti, deadline ešte nevypršal
const proposedBookings = (bookingsQuery.data || []).filter(
  (booking) =>
    booking.status === 'awaiting_confirmation' &&
    new Date(booking.slot.start_time) > now &&
    (!booking.confirmation_deadline || new Date(booking.confirmation_deadline) > now)
);
```

**Riadky 173–178** — zahrnúť vypršané návrhy do `pastBookings`:

```typescript
const pastBookings = (bookingsQuery.data || []).filter(
  (booking) =>
    (booking.status !== 'booked' && booking.status !== 'pending' && booking.status !== 'awaiting_confirmation') ||
    new Date(booking.slot.start_time) <= now ||
    // Vypršané návrhy (deadline prešiel)
    (booking.status === 'awaiting_confirmation' && booking.confirmation_deadline && new Date(booking.confirmation_deadline) <= now)
);
```

### 2. `src/components/client/ProposedTrainingsSection.tsx` — skryť akčné tlačidlá pre vypršané

V renderovaní každého bookingu (riadky 195–218) pridať podmienku — ak je deadline vypršaný, nezobrazovať tlačidlá Potvrdiť/Odmietnuť, ale len text "Vypršané":

```typescript
const isExpired = booking.confirmation_deadline && new Date(booking.confirmation_deadline) < new Date();
```

Ak `isExpired`, namiesto tlačidiel zobraziť len badge "Vypršané" bez akčných ikon.

### 3. `src/hooks/useProposedTrainings.ts` — opraviť potvrdenie

**Riadky 251–270** — odstrániť celú kontrolu konfliktov (`conflicting` query + `hasConflict` logiku). Nahradiť jednoduchou validáciou:

```typescript
// Overiť, že booking je stále awaiting_confirmation
if (booking.status !== 'awaiting_confirmation') {
  throw new Error('Tento tréning už bol spracovaný.');
}

// Overiť, že deadline ešte nevypršal
if (booking.confirmation_deadline && new Date(booking.confirmation_deadline) < new Date()) {
  throw new Error('Termín na potvrdenie už vypršal.');
}
```

### Zhrnutie zmien

| Súbor | Zmena |
|---|---|
| `src/hooks/useClientBookings.ts` | Filtrovať vypršané návrhy do histórie, nie do aktívnych |
| `src/components/client/ProposedTrainingsSection.tsx` | Skryť akčné tlačidlá pri vypršanom deadline |
| `src/hooks/useProposedTrainings.ts` | Nahradiť kontrolu konfliktov validáciou stavu a deadline-u |

Žiadne databázové zmeny nie sú potrebné. Edge function `check-proposed-deadlines` bude naďalej čistiť vypršané záznamy na pozadí, ale klientská strana bude teraz správne reagovať aj pred tým, než cron prebehne.

