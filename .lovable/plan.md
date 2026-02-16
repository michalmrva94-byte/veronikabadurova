

# Riadeny rezervacny system - Plan implementacie

## Prehlad zmien

Transformacia z otvoreneho booking systemu na riadeny model, kde Veronika (admin) ma plnu kontrolu nad klientmi, terminmi a schvalovanim.

---

## Faza 1: Databazove zmeny

### 1.1 Profily - nove stlpce
- `client_type`: enum (`fixed`, `flexible`) - typ klienta, nastavuje admin
- `approval_status`: enum (`pending`, `approved`, `rejected`) - stav schvalenia noveho klienta
- `approved_at`: timestamp - kedy bol klient schvaleny
- `training_goal`: text - ciel klienta (vyplni pri registracii)
- `preferred_days`: text - preferovane dni (vyplni pri registracii)
- `flexibility_note`: text - poznamka o flexibilite

### 1.2 Bookings - nove stavy
Aktualizovat `booking_status` enum:
- Pridat `proposed` (admin navrhol fixnemu klientovi)
- Pridat `awaiting_confirmation` (klient dostal navrh, caka sa na odpoved)
- Existujuce stavy (`pending`, `booked`, `cancelled`, `completed`, `no_show`) zostavaju

Novy stlpec:
- `confirmation_deadline`: timestamp - deadline na potvrdenie (24h od navrhu)
- `proposed_by`: uuid - kto navrhol trening (admin)

### 1.3 Nove DB typy
```text
CREATE TYPE client_type AS ENUM ('fixed', 'flexible');
CREATE TYPE client_approval_status AS ENUM ('pending', 'approved', 'rejected');
```

---

## Faza 2: Registracia a onboarding

### 2.1 Registracny formular - rozsirenie
- Pridat pole: "Aky je vas ciel?" (textarea)
- Pridat pole: "Preferovane dni treningov" (multi-select: Po-Ne)
- Pridat pole: "Flexibilita" (textarea, volitelne)
- Po registracii klient dostane spravu: "Vasa ziadost bola odoslana. Cakajte na schvalenie trenerom."
- Klient je v stave `approval_status = 'pending'`

### 2.2 Klientsky dashboard - stav "Caka na schvalenie"
- Ak `approval_status = 'pending'`: zobrazit informacnu obrazovku "Vasa ziadost o spolupracu caka na schvalenie"
- Ak `approval_status = 'rejected'`: zobrazit spravu o zamietnutí
- Skryt kalendar a rezervacne funkcie kym nie je schvaleny

### 2.3 ProtectedRoute - uprava
- Pridat kontrolu `approval_status` - neschvaleni klienti vidia len obmedzeny dashboard

---

## Faza 3: Admin - Sprava klientov

### 3.1 Admin Clients Page - rozsirenie
- Sekcia "Nove ziadosti" (pending klienti) na vrchu
- Pri kazdom pending klientovi zobrazit: meno, email, ciel, preferovane dni
- Tlacidla: Schvalit / Zamietnuť
- Pri schvaleni: nastavit `client_type` (fixed/flexible)

### 3.2 Admin - Detail klienta
- Zobrazit a menit `client_type`
- Statistiky pravidelnosti (pocet treningov/tyzden)
- Odporucanie: "Pre optimalny progres odporucam aspon 2 treningy tyzdenne"

---

## Faza 4: Fixny klient - Navrhovanie treningov

### 4.1 Admin - "Navrhnut trening" dialog
- Rozsirit existujuci AssignTrainingDialog
- Namiesto priameho vytvorenia bookingu so statusom `booked` vytvori booking so statusom `proposed`
- Nastavi `confirmation_deadline` na +24 hodin
- Posle notifikaciu klientovi

### 4.2 Klientska strana - Potvrdenie navrhu
- Nova sekcia na dashboarde: "Navrhnuty trening - Potvrdte do X hodin"
- Tlacidla: Potvrdit / Odmietnuť
- Po potvrdeni: status sa zmeni na `booked`, platia storno podmienky
- Po odmietnutí: status sa zmeni na `cancelled`, slot sa uvolni

### 4.3 Automaticke pripomienky (buducnost)
- 12h pred deadline: pripomienkova notifikacia
- 1h pred deadline: posledna pripomienka
- Po vyprsani: automaticke zrusenie (cron job - implementovat neskor)

---

## Faza 5: Flexibilny klient - Existujuci flow

Flexibilny klient zachovava sucasny flow:
1. Veronika otvori dostupne sloty
2. Klient posle ziadost o rezervaciu (status `pending`)
3. Veronika schvali alebo zamietne
4. Po schvaleni je trening oficialny

Jedina zmena: kalendar je pristupny len schvalenym klientom.

---

## Faza 6: Skrytie referral systemu

### 6.1 Navigacia
- Odstranit "Odmeny" z bottom navigation v ClientLayout
- Skryt route `/odporucanie` a `/referral`

### 6.2 Registracia
- Skryt pole "Odporucaci kod" z registracneho formulara

### 6.3 Zachovat kod
- Neruset kód, len skryt z UI (moznost aktivovat neskor)

---

## Faza 7: Kapacitne riadenie (admin dashboard)

### 7.1 Dashboard stats - rozsirenie
- Pocet aktivnych klientov (approved)
- Pocet cakajucich na schvalenie
- Pocet treningov tento tyzden
- Priemerna pravidelnost klientov

---

## Technicke detaily

### Nove DB migrácie
1. Vytvorit enumy `client_type`, `client_approval_status`
2. Pridat stlpce do `profiles`
3. Pridat stavy do `booking_status` enum
4. Pridat stlpce do `bookings`
5. Aktualizovat RLS politiky

### Nove/upravene subory
- `src/types/database.ts` - nove typy
- `src/pages/auth/RegisterPage.tsx` - onboarding polia
- `src/contexts/AuthContext.tsx` - pridat `approvalStatus`
- `src/components/auth/ProtectedRoute.tsx` - kontrola schvalenia
- `src/components/layout/ClientLayout.tsx` - skryt referral
- `src/pages/client/DashboardPage.tsx` - pending stav + navrhy treningov
- `src/pages/admin/AdminClientsPage.tsx` - schvalovanie klientov
- `src/hooks/useAssignTraining.ts` - podpora `proposed` statusu
- `src/hooks/useClientBookings.ts` - potvrdenie/odmietnutie navrhov
- `src/lib/constants.ts` - nove status labels
- `src/App.tsx` - skryt referral routes

### Poradie implementacie
1. DB migracie (zaklad)
2. Registracia + onboarding (novy klient flow)
3. Admin schvalovanie klientov
4. Fixny klient - navrhovanie a potvrdenie
5. Skrytie referral systemu
6. Kapacitne riadenie na dashboarde

