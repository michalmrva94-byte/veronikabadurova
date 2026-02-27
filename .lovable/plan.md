

## Zmena deadline-u potvrdenia na 1h pred tréningom

Zmení sa výpočet `confirmation_deadline` z `start_time - 24h` na `start_time - 1h`. Minimálny window (1h od teraz) zostáva ako fallback.

### Zmeny v 4 súboroch:

**1. `src/hooks/useAssignTraining.ts`** — zmeniť `24 * 60 * 60 * 1000` na `1 * 60 * 60 * 1000` v deadline výpočte + update textu notifikácie na "najneskôr 1 hodinu pred tréningom"

**2. `src/hooks/useProposedTrainings.ts`** — rovnaká zmena deadline výpočtu v batch návrhoch + update textu notifikácií

**3. `supabase/functions/check-proposed-deadlines/index.ts`** — upraviť reminder intervaly (napr. 30min a 10min pred deadline-om namiesto 12h a 1h)

**4. `supabase/functions/_shared/notification-templates/proposal.tsx`** — zmeniť text z "24 hodín" na "1 hodinu"

