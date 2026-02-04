

# Implementácia rezervácie tréningov a optimalizácia kalendára

## Prehľad problémov

### 1. Tlačidlo "Rezervovať" nefunguje
Karta pre slot obsahuje tlačidlo s `onClick={() => onBook?.(slot.id)}`, ale CalendarPage nepredáva žiadnu `onBook` funkciu - preto kliknutie na tlačidlo nič nerobí.

### 2. Pomalé načítanie
React Query nemá nastavenú optimalizáciu cache - pri každej zmene dátumu sa robí nový request na server bez využitia už načítaných dát.

## Riešenie

### 1. Nový hook pre rezervácie (`src/hooks/useBookings.ts`)

Vytvoríme hook na správu rezervácií:
- Funkcia `createBooking` - vytvorí novú rezerváciu v databáze
- Kontrola, či slot nie je už rezervovaný
- Automatická invalidácia cache po úspešnej rezervácii

### 2. Aktualizácia CalendarPage

Pridáme:
- Import `useAuth` pre získanie profilu klienta
- Import nového `useBookings` hook
- Stav pre načítanie počas rezervácie
- Handler `handleBook` funkciu, ktorá:
  - Vytvorí rezerváciu v `bookings` tabuľke
  - Zobrazí toast s potvrdením
  - Aktualizuje zoznam slotov

### 3. Optimalizácia React Query v `useTrainingSlots.ts`

Pridáme:
- `staleTime: 60 * 1000` - dáta sú "čerstvé" 1 minútu
- `gcTime: 5 * 60 * 1000` - cache sa drží 5 minút

## Technické detaily

### Nový hook useBookings.ts

```text
- createBooking mutácia:
  - Prijíma: slot_id, client_id, price
  - Vytvára záznam v bookings tabuľke
  - Nastavuje status: 'booked'
  - Invaliduje training-slots query
```

### CalendarPage.tsx zmeny

```text
Nové importy:
- useAuth z AuthContext
- useBookings hook
- toast z sonner

Nová funkcia:
- handleBook(slotId: string) - zavolá createBooking a zobrazí potvrdenie

Aktualizovaný render:
- AvailableSlotCard dostane onBook={handleBook} a isBooking prop
```

### useTrainingSlots.ts optimalizácia

```text
slotsQuery pridá:
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
```

## Flow rezervácie

```text
1. Klient vyberie dátum v kalendári
2. Zobrazí sa zoznam voľných slotov
3. Klient klikne "Rezervovať"
4. Systém vytvorí booking v databáze
5. Zobrazí sa toast "Tréning úspešne rezervovaný"
6. Zoznam slotov sa aktualizuje
```

## Súbory na úpravu

| Súbor | Zmena |
|-------|-------|
| `src/hooks/useBookings.ts` | Nový súbor - hook pre rezervácie |
| `src/hooks/useTrainingSlots.ts` | Pridanie staleTime a gcTime |
| `src/pages/client/CalendarPage.tsx` | Pridanie rezervačnej logiky |

