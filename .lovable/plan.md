
# Last-minute broadcast -- redizajn stranky

## Prehlad zmien

Stranka sa preorganizuje tak, aby hlavnou castou boli **automaticky zistene zrusene treningy**, ktore sa kvalifikuju ako last-minute ponuky. Manualne vytvorenie slotu zostane, ale bude vizualne menej dominantne (v rozbalitelnej sekcii).

## Struktura stranky (zhora nadol)

### 1. Hlavicka + Info karta
Zostava rovnaka ako teraz.

### 2. NOVA: Sekcia "Zrusene treningy na ponuku" (hlavna cast)
- Nacitaju sa bookings so statusom `cancelled` kde `slot.start_time` je v buducnosti (nasledujucich 48 hodin) a slot je `is_available = true` (uvolneny)
- Pouzije sa `useAdminBookings` -- z existujucich dat sa vyfiltruju zrusene bookings s buducim slotom
- Kazdy zruseny trening sa zobrazi ako karta obsahujuca:
  - Datum a cas treningu
  - Meno klienta, ktory zrusil
  - Dovod zrusenia (ak existuje)
  - Cas od zrusenia (napr. "pred 2 hodinami")
  - Tlacidlo **"Ponuknut ako last-minute"** -- kliknutim sa automaticky predvyplni broadcast formular (title + message) s datami tohto treningu
- Ak ziadne zrusene treningy neexistuju, zobrazi sa prazdny stav s ikonou a textom "Ziadne zrusene treningy na ponuku"

### 3. Broadcast formular
Zostava rovnaky -- title, message, tlacidlo odoslat. Predvyplna sa bud z automatickej sekcie (klik na "Ponuknut") alebo z manualneho formulara.

### 4. Manualne vytvorenie slotu (v Collapsible/Accordion)
- Existujuci formular na manualne vytvorenie slotu (datum, cas, zlava) sa presunie do **rozbalitelnej sekcie** (Collapsible)
- Defaultne zatvoreny s nadpisom "Vytvorit slot manualne" a ikonou Plus
- Obsah zostava identicky (datum picker, casy, zlava, poznamky)

### 5. Upozornenie
Zostava rovnake ako teraz.

## Technicke detaily

### Subory na upravu
- **`src/pages/admin/AdminBroadcastPage.tsx`** -- jediny subor

### Logika filtrovania zrusenych treningov
- Z `useAdminBookings()` sa pouziju vsetky bookings
- Filter: `status === 'cancelled'` AND `slot.start_time` je v buducnosti (do 48h) AND `slot.is_available === true`
- Zoradenie podla `cancelled_at` (najnovsie prvy)

### UI komponenty
- Pouzije sa existujuci `Collapsible` pre manualny formular
- Karty zrusenych treningov budu pouzivat existujuci `Card` komponent
- Ikony: `XCircle` pre zrusene, `Zap` pre "Ponuknut ako last-minute"

### Predvyplnenie broadcastu z zruseneho treningu
- Kliknutim na "Ponuknut" sa nastavi `title` a `message` rovnako ako pri manualnom vytvoreni -- s datumom, casom a volitelnou zlavou
