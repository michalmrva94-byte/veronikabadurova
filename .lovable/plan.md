

## Zmena

Pridať potvrdzujúci dialóg so storno podmienkami, ktorý sa zobrazí keď klient klikne "Potvrdiť" na navrhnutom tréningu (jednotlivo aj hromadne "Potvrdiť všetky").

### Nový súbor: `src/components/client/ProposedConfirmDialog.tsx`

Dialóg podobný existujúcemu `BookingConfirmDialog`, obsahujúci:
- Dátum a čas tréningu (alebo počet tréningov pri hromadnom potvrdení)
- Informáciu "Potvrdením súhlasíte so storno podmienkami"
- Tabuľku storno podmienok (rovnaká ako v `BookingConfirmDialog` — 4 úrovne z `CANCELLATION_RULES`)
- Tlačidlá "Zrušiť" a "Potvrdiť tréning"

### Úprava: `src/components/client/ProposedTrainingsSection.tsx`

1. Pridať state pre dialóg: `pendingConfirmId` (string | string[] | null) — drží ID bookingu alebo pole ID pre hromadné potvrdenie
2. Klik na ✓ tlačidlo → nastaví `pendingConfirmId` namiesto priameho volania `handleConfirm`
3. Klik na "Potvrdiť všetky" → nastaví `pendingConfirmId` na pole všetkých ID
4. Dialóg sa zobrazí → pri potvrdení zavolá existujúce `handleConfirm` / `handleConfirmAll`
5. Pri zrušení dialógu → `pendingConfirmId = null`

### Technické detaily

- Dialóg bude reusovateľný pre single aj batch potvrdenie
- Pre single booking zobrazí dátum/čas z `proposedBookings` array (lookup podľa ID)
- Pre batch zobrazí počet tréningov
- Storno podmienky sa načítajú z `CANCELLATION_RULES` a `DEFAULT_TRAINING_PRICE` konštánt (rovnako ako v `BookingConfirmDialog`)

