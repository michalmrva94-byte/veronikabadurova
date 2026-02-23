

## Rozšírenie notifikačných emailov -- Návrh tréningu na schválenie

### Prehľad
K existujúcim 3 typom emailov (potvrdenie, pripomienka, last-minute) pridáme 4. typ: **email pri navrhnutom tréningu**, ktorý sa odošle klientovi keď mu admin priradí tréning na schválenie.

### Aktualizovaná tabuľka emailov

| Email | Kedy sa odošle | Komu (filter) |
|-------|---------------|----------------|
| Potvrdenie tréningu | Admin schváli booking | `email_notifications = true` |
| Pripomienka tréningu | 24h pred tréningom (cron) | `email_notifications = true` |
| Last-minute ponuka | Admin odošle broadcast | `last_minute_notifications = true` |
| **Navrhnutý tréning** | **Admin priradí tréning klientovi** | **`email_notifications = true`** |

### Implementačné kroky

#### 1. Uloženie RESEND_API_KEY
Bezpečne uložíme API kľúč do backend secrets.

#### 2. Edge funkcia `send-notification-email`
Jedna funkcia s parametrom `type` pre všetky 4 typy. Pre nový typ `proposal`:
- **Predmet:** "Nový navrhnutý tréning -- Veronika Swim"
- **Obsah:** Dátum a čas tréningu, informácia o 24h deadline na potvrdenie, CTA tlačidlo "Pozrieť tréningy"
- **Tón:** Osobný, slovenčina, v štýle Veroniky

#### 3. Napojenie na existujúce akcie

**Jednotlivý návrh** -- úprava `useAssignTraining.ts`:
- Po vytvorení in-app notifikácie (riadok 52-60) pridáme volanie edge funkcie
- Najprv načítame profil klienta, skontrolujeme `email_notifications`
- Ak zapnuté, zavoláme `send-notification-email` s type `proposal`

**Hromadný návrh** -- úprava `useProposedTrainings.ts`:
- Po vytvorení in-app notifikácie (riadok 192-198) pridáme volanie edge funkcie
- Načítame profil klienta, skontrolujeme `email_notifications`
- Odošleme jeden súhrnný email s počtom navrhnutých tréningov a deadline

#### 4. Email šablóna (React Email)
Rovnaký vizuálny štýl ako ostatné emaily:
- Biely background, teal akcent `hsl(170, 50%, 45%)`
- Zaoblené CTA tlačidlo "Pozrieť tréningy" s odkazom na `/moje-treningy`
- Text: "Veronika vám navrhla tréning na [dátum] o [čas]. Potvrďte ho do 24 hodín."

### Technické detaily

**Štruktúra súborov (celková pre všetky 4 typy):**

```text
supabase/functions/
  send-notification-email/
    index.ts                -- hlavná logika, routing podľa type, Resend
  send-training-reminders/
    index.ts                -- cron pre 24h pripomienky
  _shared/
    notification-templates/
      confirmation.tsx      -- potvrdenie tréningu
      reminder.tsx          -- pripomienka
      last-minute.tsx       -- last-minute ponuka
      proposal.tsx          -- navrhnutý tréning (NOVÝ)
```

**Úpravené frontend súbory:**
- `src/hooks/useAssignTraining.ts` -- pridanie email volania po notifikácii
- `src/hooks/useProposedTrainings.ts` -- pridanie email volania po hromadnom návrhu
- `src/hooks/useAdminBookings.ts` -- pridanie email volania po approveBooking
- `supabase/config.toml` -- registrácia nových edge funkcií

**Odosielateľ:** `Veronika Swim <noreply@veronikaswim.sk>`
