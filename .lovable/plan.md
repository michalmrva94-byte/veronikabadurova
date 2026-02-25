

## Plan: Zobraziť poznámku tréningu klientovi

### Prehľad
Poznámka (`notes`) z `training_slots` sa už ukladá pri vytvorení tréningu adminom. Treba ju zobraziť klientovi na dvoch miestach:
1. V **BookingConfirmDialog** — keď klient klikne na voľný slot a chce sa prihlásiť
2. V **ProposedTrainingsSection** — pri navrhnutých tréningoch
3. V **BookingCard** — pri potvrdených/budúcich tréningoch

### Kroky

**1. `BookingConfirmDialog.tsx`** — pridať zobrazenie `slot.notes`
- Za sekciu s dátumom a časom (riadok ~63) pridať podmienený blok:
- Ak `slot.notes` existuje, zobraziť info box s ikonou `MapPin` alebo `Info` a textom poznámky
- Štýl: `p-3 rounded-lg bg-muted/50` konzistentný s ostatnými info boxami v dialógu

**2. `ProposedTrainingsSection.tsx`** — pridať `booking.slot.notes`
- V každom navrhnutom tréningu (riadok ~195, pod časom) pridať podmienený riadok:
- `{booking.slot.notes && <p className="text-xs text-muted-foreground">📍 {booking.slot.notes}</p>}`

**3. `BookingCard.tsx`** — pridať `booking.slot.notes`
- Pod riadkom s časom (riadok ~70) pridať:
- `{booking.slot.notes && <p className="text-xs text-muted-foreground">{booking.slot.notes}</p>}`

**4. `WeeklyAvailableSlots.tsx`** — voliteľne zobraziť poznámku pri slot buttonoch
- Ak slot má notes, pridať tooltip alebo malý text pod tlačidlom, aby klient videl info ešte pred kliknutím

### Technické detaily

- Žiadne databázové zmeny — `notes` stĺpec v `training_slots` už existuje
- Žiadne nové API volania — `notes` sa už načítava v existujúcich query (`select *`)
- Zmeny sú čisto UI — 4 súbory: `BookingConfirmDialog.tsx`, `ProposedTrainingsSection.tsx`, `BookingCard.tsx`, `WeeklyAvailableSlots.tsx`

