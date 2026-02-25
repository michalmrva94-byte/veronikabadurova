

## Analýza problému

Keď klient odmietne navrhnutý tréning, kód v `rejectProposedTraining` (riadok 348-352) nastaví `is_available: true` na danom slote. To spôsobí, že slot sa zobrazí v klientskom kalendári ako voľný termín — čo je nežiaduce, pretože bol vytvorený výhradne pre konkrétneho klienta.

Rovnaký problém je aj v `check-proposed-deadlines` edge funkcii (riadok 51-54) — keď deadline vyprší, slot sa tiež nastaví na `is_available: true`.

### Požadované správanie

Odmietnutý/expirovaný navrhnutý tréning by mal slot **zmazať** (nie uvoľniť), pretože:
- Slot bol vytvorený špeciálne pre návrh konkrétnemu klientovi
- Admin ho nechce automaticky ponúkať ostatným
- Ak by admin chcel termín ponúknuť znova, vytvorí nový slot manuálne

## Plán opráv

### 1. `src/hooks/useProposedTrainings.ts` — rejectProposedTraining

Nahradiť `update({ is_available: true })` za `delete()` na danom slote. Aktualizovať notifikáciu adminovi — zmeniť text z "Termín bol uvoľnený" na "Termín bol odstránený z kalendára".

### 2. `supabase/functions/check-proposed-deadlines/index.ts` — expirácia

Rovnako nahradiť `update({ is_available: true })` za `delete()`. Aktualizovať text notifikácie z "Termín bol uvoľnený" na "Termín bol odstránený z kalendára".

### Zmenené súbory
- `src/hooks/useProposedTrainings.ts` — delete slotu namiesto uvoľnenia pri odmietnutí
- `supabase/functions/check-proposed-deadlines/index.ts` — delete slotu namiesto uvoľnenia pri expirácii

