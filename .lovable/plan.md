
# Admin Notification Bell

## Prehled
Pridanie ikony zvonceka (Bell) do admin headeru s dropdown panelom notifikacii. Admin bude vidiet notifikacie o:
- Potvrdeni / odmietnutí navrhnuteho treningu klientom
- Stornovaní treningu klientom  
- Novej ziadosti o trening od klienta

Zaroven doplnime chybajuce notifikacie pre admina pri storne a novej rezervacii.

---

## Co sa zmeni

### 1. Novy hook: `useAdminNotifications`
- Nacita notifikacie z tabulky `notifications` pre aktualneho admin profilu
- Poskytne pocet neprecitanych notifikacii
- Funkciu na oznacenie notifikacie ako precitanej
- Funkciu na oznacenie vsetkych ako precitanych

### 2. Novy komponent: `AdminNotificationBell`
- Ikona Bell v admin headeri (vedla Settings a LogOut)
- Cervena bodka s poctom neprecitanych notifikacii
- Popover panel s listom notifikacii (ScrollArea)
- Kazda notifikacia zobrazuje:
  - Ikonu podla typu (Calendar, X, Check, Plus)
  - Nazov a spravu
  - Cas (relativny, napr. "pred 5 min")
  - Moznost kliknutim oznacit ako precitane
- Tlacidlo "Oznacit vsetky" v hlavicke
- Prazdny stav ak nie su ziadne notifikacie

### 3. Uprava `AdminLayout.tsx`
- Import a vlozenie `AdminNotificationBell` do header sekcie medzi existujuce tlacidla

### 4. Notifikacia pri storne treningu klientom
- Uprava `useClientBookings.ts` - v `cancelBooking` mutacii po uspesnom storne:
  - Nacitat meno klienta a cas treningu
  - Najst vsetkych adminov
  - Vlozit notifikaciu typu `booking_cancelled` pre kazdeho admina

### 5. Notifikacia pri novej ziadosti o trening
- Uprava `useBookings.ts` - v `createBooking` mutacii po uspesnom vytvoreni:
  - Nacitat meno klienta a cas slotu
  - Najst vsetkych adminov  
  - Vlozit notifikaciu typu `booking_request` pre kazdeho admina

---

## Technicke detaily

### Hook `useAdminNotifications`
```text
- query key: ['admin-notifications']
- query: SELECT * FROM notifications WHERE user_id = profile.id ORDER BY created_at DESC LIMIT 50
- staleTime: 30s
- mutations: markAsRead(id), markAllAsRead()
```

### Mapovanie typov na ikony
```text
proposal_confirmed  -> Check   (zelena)
proposal_rejected   -> X       (cervena)  
booking_cancelled   -> CalendarX (oranzova)
booking_request     -> Plus    (modra)
default             -> Bell    (seda)
```

### Dizajn Popover panelu
- Sirka: ~320px
- Max vyska: ~400px so ScrollArea
- Glassmorphism styl konzistentny s iOS dizajnom aplikacie
- Neprecitane notifikacie s jemnym pozadim
- Relativny cas pomocou vlastnej utility funkcie (bez externej kniznice)

### Subory ktore sa vytvoria
- `src/hooks/useAdminNotifications.ts`
- `src/components/admin/AdminNotificationBell.tsx`

### Subory ktore sa upravia
- `src/components/layout/AdminLayout.tsx` - pridanie Bell komponentu
- `src/hooks/useClientBookings.ts` - notifikacia pri storne
- `src/hooks/useBookings.ts` - notifikacia pri novej rezervacii
