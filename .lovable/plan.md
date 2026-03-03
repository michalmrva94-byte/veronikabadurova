

## Plán: Deadline 24h + automatický reminder email 48h pred tréningom

### CHANGE 1: Deadline z 3h → 24h pred tréningom

**4 súbory na úpravu:**

1. **`src/hooks/useAssignTraining.ts`** (riadok 42)
   - `3 * 60 * 60 * 1000` → `24 * 60 * 60 * 1000`
   - Notifikácia riadok 61: "3 hodiny" → "24 hodín"

2. **`src/hooks/useProposedTrainings.ts`** (riadok 173, 203)
   - Deadline výpočet: `3 * 60 * 60 * 1000` → `24 * 60 * 60 * 1000`
   - Komentár riadok 169: "3h" → "24h"
   - Notifikácia riadok 203: "3 hodiny" → "24 hodín"

3. **`supabase/functions/_shared/notification-templates/proposal.tsx`** (riadky 24, 28, 32)
   - Všetky "3 hodiny" → "24 hodín"

4. **Databáza** — UPDATE existujúcich `awaiting_confirmation` bookings na `start_time - 24h`

---

### CHANGE 2: Reminder email 48h pred tréningom

**Nový stĺpec v DB:**
- `ALTER TABLE bookings ADD COLUMN reminder_sent boolean DEFAULT false`

**Nová email šablóna:**
- `supabase/functions/_shared/notification-templates/proposal-reminder.tsx`
- Subject: "Nezabudni potvrdiť tréning — máš čas do zajtra"
- Obsahuje dátum/čas tréningu, deadline, CTA "Potvrdiť tréning" → `/moje-treningy`, sekundárna akcia "Nemôžem prísť"

**Rozšírenie `send-notification-email/index.ts`:**
- Nový typ `proposal_reminder` v EmailRequest type a switch/case

**Rozšírenie `check-proposed-deadlines/index.ts`:**
- Nová logika: ak tréning začína za ~48h (±30min) a `reminder_sent === false`, odošle reminder email a nastaví `reminder_sent = true`

**Rozšírenie `src/lib/sendNotificationEmail.ts`:**
- Pridať `proposal_reminder` do typu

---

### Technické detaily

Deadline výpočet (obe hooky):
```typescript
confirmation_deadline: new Date(Math.max(
  new Date(start_time).getTime() - 24 * 60 * 60 * 1000, // 24h pred
  Date.now() + 1 * 60 * 60 * 1000 // min 1h od teraz
)).toISOString()
```

Reminder check v edge function (pseudokód):
```typescript
const hoursUntilTraining = (slotStart - now) / (1000*60*60)
if (hoursUntilTraining > 47.5 && hoursUntilTraining <= 48.5 
    && !booking.reminder_sent) {
  // send email + set reminder_sent = true
}
```

