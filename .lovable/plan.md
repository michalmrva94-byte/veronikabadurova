

# Rozdelenie Landing Page + Referral Flow

## Prehľad

Aplikácia zostane jedna -- rovnaky backend, auth a dashboard. Pridame dva nove vstupne body:
- `/` -- nova verejna marketingova landing pre novych klientov
- `/klienti` -- existujuca landing pre sucasnych klientov
- `/referral?code=XYZ` -- referral landing s personalizaciou

## Zmeny v routingu

### `src/lib/constants.ts`
- Pridat nove routy: `CLIENTS_LANDING: '/klienti'` a `REFERRAL: '/referral'` (pre verejnu referral landing, nie klientsku stranku)
- Existujuci `REFERRAL` premenovai na `REFERRAL_PAGE` (klientsky profil) a novy `REFERRAL_LANDING` pre verejnu landing

### `src/App.tsx`
- `/` -- nova `PublicLandingPage`
- `/klienti` -- existujuca `LandingPage` (premenovana na `ClientsLandingPage`)
- `/referral` -- nova `ReferralLandingPage`
- Ostatne routy bez zmeny

## Nove stranky a komponenty

### 1. Verejna landing (`/`) -- `src/pages/PublicLandingPage.tsx`
Nova marketingovo silnejsia stranka s sekciami:
- **Hero**: "Individualne treningy plavania v Pezinku" + CTA "Rezervovat prvy trening"
- **O Veronike**: strucna bio karta (14 rokov, certifikovana, PK Pezinok, individualny pristup)
- **Pre koho je trening**: zoznam cielovych skupin (technika, skusky, kraul, strach z vody, zdravy pohyb)
- **Referencie**: placeholder sekcia pre buduce referencie
- **Ako prebieha rezervacia**: kratka veta bez detailov storna
- **CTA**: "Zacat trenovat"

Pouzije rovnaku vizualnu identitu (farby, fonty, framer-motion animacie), ale profesionalnejsi ton.

### 2. Klientska landing (`/klienti`) -- premenovanie existujucej `LandingPage.tsx`
Existujuca verzia so vsetkymi sekciami (Hero, O mne, Ako funguje system, Rezervacne pravidla, CTA). Minimalne zmeny -- iba presun na novu URL.

### 3. Referral landing (`/referral?code=XYZ`) -- `src/pages/ReferralLandingPage.tsx`
- Nacita `code` z URL query parametra
- Dotaz do databazy: vyhladanie profilu odporucatela podla `referral_code`
- Zobrazenie banneru: "Odporucil vam trening: [Meno klienta]" alebo "Prisli ste na odporucanie."
- Pod bannerom: zjednodusena verzia verejnej landing (hero + kluocve benefity)
- CTA smeruje na `/registracia?ref=XYZ` (existujuca registracia uz podporuje `ref` parameter)

## Zmeny v existujucich suboroch

### `src/pages/client/ReferralPage.tsx`
- Zmena referral linku z `/registracia?ref=CODE` na `/referral?code=CODE`
- Ziadne ine zmeny

### `src/components/landing/HeroSection.tsx` a dalsie landing komponenty
- Bez zmien -- pouzite na `/klienti`

### `src/pages/LandingPage.tsx`
- Premenovanie / presun na `ClientsLandingPage.tsx` pre jasnost
- Ak je pouzivatel prihlaseny, redirect na dashboard (existujuca logika zostava)

## Databazove zmeny
Ziadne -- existujuca schema uz podporuje:
- `profiles.referral_code` pre ulozenie kodu
- `profiles.referred_by` pre ulozenme odporucatela
- `referral_rewards` tabulka pre sledovanie odmien
- `handle_new_user()` trigger pre vytvorenie referral kodu

Jedina uprava: dotaz na profil odporucatela v referral landing -- pouzije sa existujuci SELECT cez Supabase klienta. RLS politika pre profily vsak neumoznuje anonymnym pouzivatelom citat profily. Preto:
- Vytvorime databazovu funkciu `get_referrer_name(code TEXT)` ktora vrati meno podla referral kodu (SECURITY DEFINER, vracia iba `full_name`)

## Technicka implementacia

### Nove subory
1. `src/pages/PublicLandingPage.tsx` -- nova verejna landing
2. `src/pages/ReferralLandingPage.tsx` -- referral landing s personalizaciou
3. Databazova migracia pre funkciu `get_referrer_name`

### Upravene subory
1. `src/App.tsx` -- novy routing
2. `src/lib/constants.ts` -- nove routy
3. `src/pages/LandingPage.tsx` -- premenovanie/uprava
4. `src/pages/client/ReferralPage.tsx` -- zmena referral linku
5. `src/components/landing/HeroSection.tsx` -- uprava linkov na registraciu (ak je potrebne)
6. `src/components/landing/CTASection.tsx` -- uprava linkov

## Dizajnove pravidla
- Rovnaka farebna paleta a typografia na oboch landingoch
- Klientska landing: osobna, pokojny ton, detailnejsie informacie
- Verejna landing: profesionalnejsia, marketingovo orientovana, strucnejsia
- Referral landing: rovnaky styl ako verejna + personalizovany banner

