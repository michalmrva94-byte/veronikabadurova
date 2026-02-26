

## Problém

1. **Sirotský slot v DB**: Slot na 28.2. stále existuje, booking je `cancelled`, ale slot nebol zmazaný — starý kód v prehliadači obišiel RPC
2. **Systémová zraniteľnosť**: `useWeeklySlots` zobrazuje VŠETKY sloty. Keď booking je `cancelled` a slot má `is_available = false`, kalendár ho zobrazí ako "Voľný" namiesto toho, aby ho skryl

## Zmeny

### 1. Vyčistiť sirotský slot z DB

Zmazať slot `c0a68d1e-6e63-44db-ad5f-fc380d50215a` (28.2. 22:20 CET) — booking je cancelled, slot je orphan.

### 2. `src/hooks/useWeeklySlots.ts` — filtrovať sirotské sloty

V `useWeeklySlots` po transformácii dát odstrániť sloty, kde:
- `is_available = false` (nie je voľný)
- Nemajú žiadny aktívny booking

Toto zabezpečí, že aj keby RPC niekedy zlyhalo, sirotské sloty sa nikdy nezobrazia v kalendári.

```typescript
// Po existujúcom .map() pridať .filter():
.filter((slot: SlotWithBooking) => {
  // Skryť sirotské sloty: is_available=false a žiadny aktívny booking
  if (!slot.is_available && !slot.booking) return false;
  return true;
})
```

### 3. `useSlotsForMonth` — rovnaký filter

Rovnakú logiku pridať aj do mesačného prehľadu — nezapočítavať sirotské sloty.

### Zhrnutie

| Zmena | Popis |
|---|---|
| DB cleanup | Zmazať sirotský slot na 28.2. |
| `useWeeklySlots` | Filtrovať sirotské sloty (obranná vrstva) |
| `useSlotsForMonth` | Rovnaký filter pre mesačný kalendár |

Kód hookov (RPC volanie) je správny — problém bol v tom, že prehliadač klienta bežal starú verziu kódu. Filter je obranná vrstva pre budúcnosť.

