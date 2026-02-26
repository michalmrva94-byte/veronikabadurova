

## Problém

Keď tréning bol v stave `awaiting_confirmation` (navrhnutý adminom), ale klient ho nestihol potvrdiť a tréning sa napriek tomu uskutočnil — admin nemá možnosť zmeniť status na "Odplávaný". V `SlotDetailDialog` sa pre stav `awaiting_confirmation` zobrazuje len tlačidlo "Stiahnuť návrh", chýba možnosť označiť ho ako dokončený alebo neúčasť.

## Riešenie

### `src/components/admin/SlotDetailDialog.tsx`

Rozšíriť sekciu pre `awaiting_confirmation` (riadky 273–311) o akčné tlačidlá pre admina:

**Pre vypršané návrhy** (tréning už prebehol alebo deadline vypršal):
- **"Označiť ako odplávaný"** — zmení status na `completed`, odpočíta cenu z kreditu klienta (rovnaká logika ako pri `booked`)
- **"Neúčasť"** — zmení status na `no_show`, účtuje poplatok za neúčasť
- **"Stiahnuť návrh"** — zostane ako možnosť zrušiť

**Pre aktívne návrhy** (deadline ešte nevypršal):
- Zostane súčasné správanie ("Čaká sa na odpoveď klienta" + "Stiahnuť návrh")

Logika rozlíšenia:
```typescript
const expired = booking.confirmation_deadline 
  ? new Date(booking.confirmation_deadline) < new Date() 
  : new Date(slot.start_time) < new Date();
```

### Prepojenie s účtovaním

Hook `useCompleteTraining` (už existuje) správne:
1. Zmení booking status na `completed` / `no_show`
2. Zavolá RPC `apply_charge` — odpočíta z kreditu, prípadne vytvorí dlh
3. Vytvorí notifikáciu pre klienta
4. Invaliduje všetky relevantné query cache

Žiadna zmena v hookoch nie je potrebná — `completeTraining` a `markNoShow` mutácie akceptujú `bookingId`, `clientId`, `price` a `slotId`, čo je presne to, čo máme k dispozícii v dialógu.

### Zhrnutie

| Súbor | Zmena |
|---|---|
| `src/components/admin/SlotDetailDialog.tsx` | Pridať tlačidlá "Odplávaný" a "Neúčasť" pre vypršané `awaiting_confirmation` bookings |

Žiadne databázové ani hookové zmeny nie sú potrebné.

