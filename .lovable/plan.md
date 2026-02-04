

## Veronika Swim – MVP Implementačný plán

### 🎨 Dizajnové rozhodnutia
- **Jazyk:** Slovenčina
- **Štýl:** Moderný & minimalistický
- **Farby:** Vodná modrá / tyrkysová paleta
- **Kalendár:** Kombinácia fixných slotov + týždenný rozvrh

---

### 📱 Fáza 1: Základ aplikácie

**Nastavenie PWA**
- Konfigurácia pre inštaláciu na mobil
- Ikony a manifest pre "Add to Home Screen"
- Mobile-first responzívny dizajn

**Autentifikácia & Role**
- Registrácia klienta (meno, email, súhlas s podmienkami, referral kód)
- Prihlásenie pre klientov aj admin
- Rozlíšenie rolí: Klient vs Admin (Veronika)

---

### 📅 Fáza 2: Kalendár & Rezervácie

**Admin kalendár**
- Vytváranie fixných tréningových slotov
- Nastavenie týždenného rozvrhu (opakujúce sa termíny)
- Správa dostupnosti (otvorenie/zatvorenie slotov)

**Klientsky kalendár**
- Prehľad voľných termínov v reálnom čase
- Jednoduchá rezervácia jedným kliknutím
- Zobrazenie storno pravidiel pri rezervácii

---

### ❌ Fáza 3: Storno logika

**Automatický storno systém**
- Pravidlá: >48h = 0%, 24-48h = 50%, <24h = 80%, neúčasť = 100%
- Automatický výpočet a účtovanie storno poplatku
- Jasné, férové notifikácie o storno poplatkoch
- Admin nastaviteľná cena tréningu (default 25€)

---

### 💰 Fáza 4: Kreditový systém & Financie

**Kreditový systém**
- Manuálne pridanie kreditu adminom (zálohy od klienta)
- Automatické odpočítavanie z kreditu (tréningy, storno)
- Prechod do dlhu ak kredit = 0

**Finančný ledger**
- Kompletná história transakcií pre každého klienta
- Typy: vklad, tréning, storno, referral odmena, manuálna úprava
- Prehľadné zobrazenie aktuálneho stavu (kredit/dlh)

---

### 🎁 Fáza 5: Referral systém

**Odporúčací program**
- Unikátny referral link pre každého klienta
- Sledovanie registrácií cez referral
- Automatické pripísanie 25€ kreditu po prvom odplávanom tréningu

---

### 📢 Fáza 6: Last-minute & Notifikácie

**Last-minute tréningy**
- Uvoľnenie slotu pri zrušení <24h
- Admin broadcast ponuka všetkým klientom
- "Prvý berie" rezervačný systém

**Notifikácie**
- In-app notifikácie
- Email notifikácie (potvrdenia, pripomienky, last-minute)
- Možnosť zapnúť/vypnúť v profile

---

### 📊 Fáza 7: Dashboardy

**Klientsky profil**
- Moje nadchádzajúce tréningy
- Kredit / Dlh prehľad
- Finančná história
- Referral link + štatistiky
- Nastavenia notifikácií

**Admin dashboard**
- Dnešné / týždenné tréningy
- Zoznam všetkých klientov
- Detail klienta (tréningy, financie, akcie)
- Finančný prehľad celkovo
- Last-minute broadcast nástroj

---

### 🔧 Technické riešenie

**Backend (Lovable Cloud)**
- Databáza: klienti, tréningy, transakcie, referraly
- Autentifikácia cez Supabase Auth
- Row Level Security pre bezpečnosť dát
- Edge functions pre automatizáciu (storno výpočty, notifikácie)

**Frontend**
- React + TypeScript + Tailwind CSS
- Vodná modrá farebná schéma
- Moderný, čistý dizajn
- Plne responzívny (mobile-first)

---

### ✅ Výsledok MVP

Kompletná aplikácia s:
- ✅ Registrácia a prihlásenie (klient + admin)
- ✅ Kalendár s rezerváciami
- ✅ Automatické storno pravidlá
- ✅ Kreditový systém a finančný ledger
- ✅ Referral program
- ✅ Last-minute ponuky
- ✅ In-app + email notifikácie
- ✅ PWA inštalácia na mobil

