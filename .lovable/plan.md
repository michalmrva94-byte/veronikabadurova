

# Last-minute sekcia v klientskom menu

## Prehlad

Pridanie 5. polozky "Last-minute" do spodneho menu klienta. Tato polozka sa zobrazi len ak ma klient v profile zapnute `last_minute_notifications`. Stranka bude sluzit ako dedicke miesto pre last-minute ponuky -- vysvetli mechaniku a zobrazi aktivne ponuky na prijatie.

## Struktura novej stranky `/last-minute`

### Prazdny stav (ziadne aktivne ponuky)
- Ikona Zap (blesk) s jemnym pozadim
- Nadpis: "Last-minute treningy"
- Vysvetlujuci text o mechanike: "Ak sa uvolni termin na poslednú chvilu, ponuka sa zobrazi priamo tu. Staci ju jednym klikom prijat a mam miesto na treningu."
- Info karta s 3 bodmi: kedy sa to stava, ako rychlo reagovat, cenova vyhoda (zlava)

### Aktivny stav (existuju ponuky)
- Zoznam notifikacii typu `last_minute` z tabulky `notifications` ktore su `is_last_minute = true`
- Kazda ponuka ako karta s: datum, cas, cena (ak je v sprave), cas prijatia
- Tlacidlo "Rezervovat" ktore presmeruje na kalendar (kde klient dokaze slot zarezervovat standardnym sposobom)
- Moznost zavriet/odmietnuť ponuku (oznaci notifikaciu ako precitanu)

## Zmeny v suboroch

### 1. `src/lib/constants.ts`
- Pridat novu route: `LAST_MINUTE: '/last-minute'`

### 2. `src/components/layout/ClientLayout.tsx`
- Pridat 5. polozku do `navItems`: ikona `Zap`, label "Last-minute", path `ROUTES.LAST_MINUTE`
- Podmienene zobrazenie -- polozka sa zobrazi len ak `profile?.last_minute_notifications === true`
- Import `useAuth` pre pristup k profilu

### 3. `src/pages/client/LastMinutePage.tsx` (novy subor)
- Nacitanie notifikacii typu `last_minute` (neprecitanych) cez Supabase query
- Prazdny stav s vysvetlenim mechaniky
- Aktivny stav so zoznamom ponuk
- Kazda ponuka obsahuje tlacidlo "Rezervovat" (link na `/kalendar`) a "Zavriet" (mark as read)
- Pouzitie `ClientLayout` obalenia

### 4. `src/App.tsx`
- Pridat route `/last-minute` s `ProtectedRoute`

### 5. `src/pages/admin/AdminBroadcastPage.tsx`
- Uprava broadcast odosielania -- filtrovat len klientov s `last_minute_notifications = true`
- Zobrazit pocet klientov s aktivnym last-minute odberom

## Technicke detaily

### Filtrovanie v broadcast
Aktualne sa broadcast posiela vsetkym `approvedClients`. Upravime na:
```
approvedClients.filter(c => c.last_minute_notifications !== false)
```

### Podmienene zobrazenie tab polozky
V `ClientLayout` sa nacita profil cez `useAuth()` a 5. tab sa prida do pola `navItems` dynamicky len ak je `last_minute_notifications` zapnute.

### Zobrazenie ponuk
Query na notifikacie: `type = 'last_minute'` AND `is_read = false` AND `user_id = profileId`, zoradene podla `created_at DESC`.

