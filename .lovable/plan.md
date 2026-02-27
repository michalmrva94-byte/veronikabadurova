

## Plán: Manuálny reminder pre nepotvrdené tréningy

### Čo sa zmení

Admin bude môcť v detaile nepotvrdného tréningu (stav `awaiting_confirmation`) kliknúť tlačidlo "Pripomenúť klientovi". Toto odošle:
1. In-app notifikáciu klientovi
2. Email pripomienku (ak je email toggle zapnutý)

### 1. `src/components/admin/SlotDetailDialog.tsx`

V sekcii kde sa zobrazuje "Čaká sa na odpoveď klienta" (riadok 343) pridať tlačidlo:
- Ikona `Bell` + text "Pripomenúť klientovi"
- `variant="outline"`, plná šírka
- Po kliknutí zavolá nový callback `onSendReminder?.(booking.id)`
- Loading stav počas odosielania

### 2. `src/pages/admin/AdminCalendarPage.tsx`

Pridať handler `handleSendReminder(bookingId)`:
- Nájde booking podľa ID z existujúcich dát
- Vloží notifikáciu do `notifications` tabuľky pre klienta: "Pripomienka: Máte nepotvrdený tréning dňa X o Y. Potvrďte ho čo najskôr."
- Zavolá `sendNotificationEmail` s typom `reminder` a údajmi o tréningu
- Toast "Pripomienka odoslaná"
- Predá handler do `SlotDetailDialog` cez props

### Technické detaily

- Využíva existujúci email typ `reminder` — žiadna nová šablóna nie je potrebná
- Žiadne DB zmeny
- Žiadne nové edge function

