

## Zmena deadline-u potvrdenia na 3h pred tréningom (min 1h od návrhu)

### Zmeny v 4 súboroch:

**1. `src/hooks/useAssignTraining.ts` (riadok 42)**
- `1 * 60 * 60 * 1000` → `3 * 60 * 60 * 1000` (3h pred)
- `30 * 60 * 1000` → `1 * 60 * 60 * 1000` (min 1h od teraz)
- Text notifikácie: "1 hodinu" → "3 hodiny"

**2. `src/hooks/useProposedTrainings.ts` (riadok 173)**
- Rovnaká zmena deadline výpočtu: 3h pred, min 1h od teraz
- Komentár na riadku 169 aktualizovať
- Text notifikácie: "1 hodinu" → "3 hodiny"

**3. `supabase/functions/_shared/notification-templates/proposal.tsx`**
- Všetky texty "1 hodinu" → "3 hodiny"

**4. Databáza** — aktualizovať existujúce `awaiting_confirmation` bookings na nový deadline `start_time - 3h`

