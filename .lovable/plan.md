

## Zmena deadline potvrdenia navrhnutého tréningu z 24h na 12h

### Čo sa zmení
Klient bude musieť potvrdiť navrhnutý tréning najneskôr **12 hodín** pred jeho začiatkom (namiesto aktuálnych 24 hodín). Minimálna rezerva 1 hodina od návrhu zostáva.

### Technické zmeny

**2 súbory, 2 riadky:**

1. **`src/hooks/useAssignTraining.ts`** (riadok 43)
   - `- 24 * 60 * 60 * 1000` → `- 12 * 60 * 60 * 1000`

2. **`src/hooks/useProposedTrainings.ts`** (riadok 174)
   - `- 24 * 60 * 60 * 1000` → `- 12 * 60 * 60 * 1000`

Oba miesta počítajú `confirmation_deadline` ako `max(start_time - Xh, now + 1h)`. Zmena je len v hodnote X z 24 na 12.

### Čo sa nezmení
- Pripomienkové emaily v `check-proposed-deadlines` (48h pred tréningom) — fungujú nezávisle od deadline
- Storno poplatky — tie sú viazané na čas pred tréningom, nie na deadline potvrdenia
- UI odpočítavanie — automaticky zobrazí správny čas podľa uloženého deadline

