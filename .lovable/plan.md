
# Plan: Jednotny tone of voice Veroniky

## Prehlad

Aktualizacia vsetkych klientskych textov v aplikacii tak, aby komunikacia posobila pokojne, profesionalne, ferovo a osobne. Ziadne stresujuce, moralizujuce alebo utocne formulacie. Nahradenie slov ako "nedoplatok", "nezaplatene", "pokuta" za jemnejsie alternativy.

---

## 1. DashboardPage.tsx -- Domov

### Privitanie (riadky 91-96)
- Stare: `"Ahoj, {name}! 👋"` + `"Vitajte v rezervačnom systéme"`
- Nove: `"Ahoj, {name}! 👋"` + `"Teším sa na ďalší tréning."`

### Zostatok -- podtexty (riadky 132-136)
- `netBalance > 0`: `"Máte kredit pripravený na tréning."`
- `netBalance === 0`: `"Tréning si môžete rezervovať. Platbu vyriešime neskôr."`
- `netBalance < 0`: `"Máte otvorenú platbu za predošlý tréning. Stačí ju uhradiť pri najbližšej príležitosti."`

### Tlacidlo pri zaporne zostatku (riadok 139)
- Stare: `"Zobraziť platobné údaje"`
- Nove: `"Zobraziť platobné údaje"` (ponechat -- je to neutralne)

### Prazdne rezervacie text (riadok 188)
- Stare: `"Zatiaľ nemáte žiadne rezervácie"`
- Nove: `"Zatiaľ nemáte žiadne rezervácie"` (ponechat)

### Storno pravidla karta (riadky 280-292)
- Stare: `"💡 Pripomienka storno pravidiel:"`
- Nove: `"Rezervačné podmienky"` (bez emoji, pokojnejsie)
- Zmenit `"Neúčasť"` na `"neúčasť bez zrušenia"` pre konzistenciu s landing page

---

## 2. FinancesPage.tsx -- Financie

### Nadpis a podtext (riadky 68-71)
- Stare: `"Financie"` + `"Prehľad vášho kreditu a transakcií"`
- Nove: `"Financie"` + `"Prehľad vašich platieb a tréningov."`

### Zostatok podtexty (riadky 108-110)
- Rovnake ako dashboard (vid bod 1)

### IBAN text (riadok 179)
- Stare: `"Platby sú spracovávané manuálne. Kredit bude pripísaný po zaevidovaní platby."`
- Nove: `"Platbu môžete uhradiť prevodom alebo v hotovosti. Kredit pripíšeme po zaevidovaní platby."`

### Info banner pri zaporne zostatku (riadky 189-191)
- Stare: `"Máte nezaplatený zostatok. Prosím, doplňte kredit prevodom na účet."` / `"Váš kredit nemusí pokryť nadchádzajúce tréningy. Zvážte doplnenie kreditu."`
- Nove: `"Máte otvorenú platbu. Môžete ju uhradiť prevodom alebo v hotovosti pri najbližšom tréningu."` / `"Kredit môžete kedykoľvek doplniť prevodom na účet."`

---

## 3. LowCreditWarningDialog.tsx -- Upozornenie pred rezervaciou

### Nadpis (riadok 29)
- Ponechat: `"Nedostatok kreditu"`

### Popis (riadok 31)
- Stare: `"Informácia o vašom zostatkoch"`
- Nove: `"Informácia o vašom zostatku"`

### Text (riadky 37-39)
- Stare: `"Nemáte dostatočný kredit. Po absolvovaní tréningu vznikne záväzok vo výške X €."`
- Nove: `"Aktuálny kredit nepokrýva cenu tréningu. Platbu vo výške {missing} € môžete uhradiť neskôr."`

---

## 4. BookingConfirmDialog.tsx -- Potvrdenie rezervacie

### Info box text (riadky 88-91)
- Stare: `"Čaká na potvrdenie"` + `"Po odoslaní rezervácie vás trénerka potvrdí a dostanete notifikáciu."`
- Nove: `"Čaká na potvrdenie"` + `"Po odoslaní rezervácie vás Veronika potvrdí a dostanete notifikáciu."`

### Storno podmienky text (riadky 99-102)
- Stare: `"Storno podmienky"` + `"Pri zrušení menej ako 24h pred tréningom sa účtuje 80% z ceny."`
- Nove: `"Podmienky zrušenia"` + `"Podľa podmienok sa pri zrušení menej ako 24 hodín vopred účtuje 80 % ceny tréningu."`

---

## 5. CancelBookingDialog.tsx -- Storno dialog

### Nadpis (riadky 55-58)
- Ikona: zmenit z `text-destructive` na `text-warning` (menej stresujuce)
- Text ponechat: `"Zrušiť rezerváciu"`

### Popis (riadok 60)
- Stare: `"Naozaj chcete zrušiť túto rezerváciu?"`
- Nove: `"Chcete zrušiť túto rezerváciu?"`

### S poplatkom (riadky 84-89)
- Stare: `"Storno poplatok: X€ (Y%)"` + `"Tento poplatok bude odpočítaný z vášho kreditu podľa storno podmienok."`
- Nove: `"Podľa podmienok sa účtuje {percentage} % ceny tréningu ({fee} €)."` + `"Suma bude zohľadnená vo vašom zostatku."`

### Bez poplatku (riadky 93-99)
- Stare: `"Zrušenie bez poplatku"` + `"Tréning je viac ako 48 hodín, takže storno poplatok sa neúčtuje."`
- Nove: `"Zrušenie bez poplatku"` + `"Zrušenie prebehne bez poplatku."`

---

## 6. Notifikacie -- useCompleteTraining.ts

### Training completed (riadky 55-60)
- Stare: `title: 'Tréning dokončený ✓'`, `message: 'Váš tréning bol označený ako odplávaný. Z kreditu bolo odpočítaných X€.'`
- Nove: `title: 'Tréning dokončený'`, `message: 'Váš tréning bol zaznamenaný. Ďakujeme a teším sa nabudúce 😊'`

### No show (riadky 87-92)
- Stare: `title: 'Neúčasť na tréningu'`, `message: 'Neprišli ste na tréning. Bol vám účtovaný poplatok X€.'`
- Nove: `title: 'Neúčasť na tréningu'`, `message: 'Tréning nebol absolvovaný. Podľa podmienok sa účtuje ${price} €.'`

---

## 7. Notifikacie -- useAdminBookings.ts

### Booking confirmed (riadok 73-74)
- Stare: `title: 'Rezervácia potvrdená ✓'`, `message: 'Váš tréning bol potvrdený. Tešíme sa na vás!'`
- Nove: `title: 'Rezervácia potvrdená'`, `message: 'Váš tréning je potvrdený. Vidíme sa v bazéne 🏊‍♂️'`

### Booking rejected (riadky 117-118)
- Stare: `title: 'Rezervácia zamietnutá'`, `message: 'Bohužiaľ, váš požadovaný termín nie je možné potvrdiť. Prosím, vyberte si iný termín.'`
- Nove: `title: 'Zmena termínu'`, `message: reason || 'Tento termín, žiaľ, nie je možné potvrdiť. Skúste prosím iný.'`

### Booking cancelled by admin (riadky 170-171)
- Stare: `title: 'Tréning zrušený'`, `message: 'Váš tréning bol zrušený trénerom.'`
- Nove: `title: 'Tréning zrušený'`, `message: reason || 'Rezervácia bola zrušená. Ak máte otázky, ozvite sa.'`

---

## 8. Notifikacie -- useAssignTraining.ts (riadky 53-56)

- Stare: `title: 'Nový tréning priradený'`, `message: 'Bol vám priradený nový tréning. Skontrolujte si detaily v sekcii "Moje tréningy".'`
- Nove: `title: 'Nový tréning'`, `message: 'Máte priradený nový tréning. Detaily nájdete v sekcii Moje tréningy.'`

---

## 9. Notifikacie -- useProposedTrainings.ts (riadky 189-190)

- Stare: `title: 'Nové návrhy tréningov'`, `message: 'Trénerka vám navrhla X tréningov. Potvrďte ich do 24 hodín.'`
- Nove: `title: 'Nové návrhy tréningov'`, `message: 'Veronika vám navrhla ${created} ${...}. Potvrďte ich, prosím, do 24 hodín.'`

---

## 10. Edge function -- check-proposed-deadlines/index.ts

### Expired notification (riadky 56-60)
- Stare: `title: 'Návrh tréningu vypršal'`, `message: 'Navrhnutý tréning nebol potvrdený v stanovenom termíne a bol zrušený.'`
- Nove: `title: 'Návrh tréningu vypršal'`, `message: 'Navrhnutý tréning nebol potvrdený včas. Termín bol uvoľnený.'`

### 12h reminder (riadky 67-69)
- Stare: `title: 'Pripomienka: Nepotvrdené tréningy'`, `message: 'Máte nepotvrdené návrhy tréningov. Potvrďte ich do X hodín.'`
- Nove: `title: 'Pripomienka'`, `message: 'Máte nepotvrdené návrhy tréningov. Potvrďte ich do ${Math.round(hoursUntilDeadline)} hodín.'`

### 1h urgent (riadky 75-77)
- Stare: `title: '⚠️ Posledná hodina na potvrdenie'`, `message: 'Návrhy tréningov vyprší o menej ako hodinu! Potvrďte ich teraz.'`
- Nove: `title: 'Posledná hodina na potvrdenie'`, `message: 'Návrhy tréningov je možné potvrdiť ešte necelú hodinu.'`

---

## 11. ProfilePage.tsx -- Profil

### Notifikacie sekcia (riadky 121-123)
- Stare: `"Notifikácie"` + `"Nastavte si, aké upozornenia chcete dostávať"`
- Nove: `"Notifikácie"` + `"Vyberte si, aké upozornenia chcete dostávať"`

### In-app (riadok 129)
- Stare: `"Upozornenia v aplikácii"`
- Nove: `"Upozornenia priamo v aplikácii"`

### Email (riadok 151)
- Stare: `"Potvrdenia rezervácií, pripomienky, last-minute ponuky"`
- Nove: `"Potvrdenia, pripomienky a uvoľnené miesta"`

---

## 12. ProposedTrainingsSection.tsx

### Alert text (riadky 133-134)
- Stare: `"Máš tréningy na potvrdenie"`
- Nove: `"Máte návrhy tréningov"` (vykanie, konzistencia)

---

## 13. PendingApprovalScreen + RejectedScreen (DashboardPage)

### Pending (riadky 25-26, 31)
- Ponechat -- uz je pokojne

### Rejected (riadky 50-51, 56)
- Stare: `"Bohužiaľ, vaša žiadosť o spoluprácu nebola schválená."` + `"Ak máte otázky, neváhajte kontaktovať trénera priamo."`
- Nove: `"Vaša žiadosť, žiaľ, nebola schválená."` + `"Ak máte otázky, neváhajte sa ozvať priamo Veronike."`

---

## Subory na upravu

- `src/pages/client/DashboardPage.tsx`
- `src/pages/client/FinancesPage.tsx`
- `src/pages/client/ProfilePage.tsx`
- `src/components/client/LowCreditWarningDialog.tsx`
- `src/components/client/BookingConfirmDialog.tsx`
- `src/components/client/CancelBookingDialog.tsx`
- `src/components/client/ProposedTrainingsSection.tsx`
- `src/hooks/useCompleteTraining.ts`
- `src/hooks/useAdminBookings.ts`
- `src/hooks/useAssignTraining.ts`
- `src/hooks/useProposedTrainings.ts`
- `supabase/functions/check-proposed-deadlines/index.ts`

## Co sa NEMENI

- Ziadna logika, ziadne databazove zmeny
- Admin-facing texty (iba klientske texty)
- Dizajn a layout komponentov
- Landing page texty (uz su v spravnom tone)
