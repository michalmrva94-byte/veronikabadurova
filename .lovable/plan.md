

## Plán: Email notifikácia pre admina pri novej rezervácii

### Čo sa zmení

Keď klient vytvorí rezerváciu (klikne "Rezervovať"), admin dostane email na pevnú adresu s informáciou kto a kedy si rezervoval tréning.

### 1. Nový email typ `admin_booking_request`

**Nový súbor: `supabase/functions/_shared/notification-templates/admin-booking-request.tsx`**

Email šablóna pre admina s:
- Meno klienta
- Dátum a čas tréningu
- CTA tlačidlo "Zobraziť žiadosti" → link na admin dashboard

### 2. Rozšíriť `sendNotificationEmail`

**Súbor: `src/lib/sendNotificationEmail.ts`**

Pridať nový typ `admin_booking_request` do interface a do toggle checku.

### 3. Rozšíriť edge function

**Súbor: `supabase/functions/send-notification-email/index.ts`**

Pridať `case 'admin_booking_request'` — renderuje novú šablónu, subject: "Nová žiadosť o tréning — Veronika Swim".

### 4. Odoslať email v `useBookings.ts`

**Súbor: `src/hooks/useBookings.ts`**

V `onSuccess` callbacku (kde sa už posielajú in-app notifikácie adminom) pridať volanie `sendNotificationEmail` s typom `admin_booking_request`, pevným `to: 'veronika.duro@gmail.com'`, menom klienta a časom tréningu.

### Technické detaily

- Admin email je hardcoded `veronika.duro@gmail.com` (jediný admin)
- Email sa posiela z klientskeho kódu cez existujúcu edge function `send-notification-email`
- Podlieha existujúcemu toggle systému v `app_settings` — admin si môže tento typ vypnúť
- Žiadne DB zmeny nie sú potrebné

