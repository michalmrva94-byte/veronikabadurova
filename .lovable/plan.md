

## Zmena pravidla deadline-u potvrdenia

**Teraz:** Deadline = 24h od momentu návrhu (pevný čas).
**Nové:** Deadline = 24h pred začiatkom tréningu (dynamický, závisí od `start_time`).

### Zmeny v 4 súboroch:

**1. `src/hooks/useAssignTraining.ts` (riadok 41)**
- Zmeniť výpočet `confirmation_deadline` z `Date.now() + 24h` na `new Date(start_time) - 24h`
- Ak je tréning menej ako 24h v budúcnosti, deadline = okamžite (alebo krátky window, napr. 1h)
- Upraviť text notifikácie z "do 24 hodín" na "najneskôr 24h pred tréningom"

**2. `src/hooks/useProposedTrainings.ts` (riadok 147, 172-178, 198)**
- Batch návrhy: namiesto jedného spoločného deadline-u (`addHours(now, 24)`) nastaviť každému bookingu individuálny deadline podľa jeho `start_time`: `new Date(slot.start_time) - 24h`
- Ak je tréning < 24h v budúcnosti, nastaviť minimálny deadline (napr. 1h od teraz)
- Upraviť text notifikácie

**3. `supabase/functions/check-proposed-deadlines/index.ts`**
- Pripomienky prepočítať na základe `hoursUntilDeadline` namiesto `hoursSinceCreation`, keďže deadline je teraz dynamický
- 12h reminder: keď zostáva 12h do deadline-u
- 1h reminder: keď zostáva 1h do deadline-u

**4. `supabase/functions/_shared/notification-templates/proposal.tsx`**
- Upraviť text z "do 24 hodín" na "najneskôr 24 hodín pred tréningom"

### Logika minimálneho deadline-u
Ak admin navrhne tréning, ktorý je o menej ako 25h, deadline by bol v minulosti. Preto: `deadline = max(start_time - 24h, now + 1h)` — klient dostane aspoň 1 hodinu na potvrdenie.

