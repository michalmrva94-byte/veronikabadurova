
# Kompletny redizajn Landing Page -- 7 sekcii

## Prehlad

Cela landing page sa prestavuje na cistu, vzdusnu, modernu strukturu so 7 sekciami. DualPathSection sa odstranuje z hlavneho toku a nahradzuje sa novou kontrastnou CTA sekciou. Vsetky sekcie budu konzistentne, minimalisticke, bez emoji.

## Zmeny po sekciach

### 1. Hero (LandingHero.tsx) -- uprava stylu
- Odstranit background box / ios-card -- cista biela sekcia
- Zachovat velku kruhovu fotku (h-56 w-56), glow efekt
- Headline: "Ahoj, som Veronika. Osobna trenerka plavania v Pezinku." (uz je spravne)
- Subheadline: (uz je spravne)
- CTA cierne tlacidlo "Dohodnit trening" (uz je spravne)
- Mikrocopy bez emoji: "Nezavazny kontakt. Ozvem sa vam osobne."

### 2. O mne (AboutVeronika.tsx) -- prestavba layoutu
- Nadpis "O mne"
- Najprv text: "Plavanie ma sprevadza cely zivot..."
- Pod textom 4 horizontalne info bloky s jemnym borderom (nie plnou vyplnou)
- Bloky: "14 rokov skusenosti", "Certifikovana trenerka", "Plavecky klub PK Pezinok", "Individualny pristup"

### 3. Pre koho je trening (TargetGroupsSection.tsx) -- kompletne prepisanie
- Kazda polozka je samostatny elegantny blok s nadpisom + kratkou vetou:
  - "Zlepsenie techniky" + popis
  - "Priprava na skusky" + popis
  - "Naucenie kraulu" + popis
  - "Prekonanie strachu" + popis
  - "Zdravy pohyb" + popis
- Odstranit ikony, pridat popisne texty

### 4. Ako to prebieha (HowItWorksSteps.tsx) -- prepisanie
- 3 bloky s vyraznymi cislami (nie v pastelovej bubline)
- Kazdy blok: cislo + nadpis + kratky popis
  - 1: "Ozvite sa mi" / "Napisite spravu alebo mi zavolajte."
  - 2: "Kratka konzultacia" / "Zistime vasu uroven a ciel."
  - 3: "Zacneme trening" / "Dohodneme termin a ideme do vody."

### 5. Nova kontrastna CTA sekcia (novy komponent CTABanner.tsx)
- Full-width cierne pozadie (#0F0F0F)
- Biely text: "Zacnime spolu pracovat na vasom plavani."
- Biele CTA tlacidlo: "Dohodnit trening"
- Scrolluje na kontakt

### 6. Kontakt (ContactSection.tsx) -- uprava
- Odstranit emoji z mikrocopy ("Ozvem sa vam co najskor." bez 💙)
- Telefonne cislo vyrazne hore
- Formular v jednom elegantnom bloku

### 7. Footer (LandingFooter.tsx) -- zjednodusenie
- Odstranit emoji
- Text: "(c) 2026 Veronika Swim"
- Minimalisticky, bez odkazu na login

### 8. PublicLandingPage.tsx -- uprava poradia sekcii
- Odstranit DualPathSection z importov a renderingu
- Pridat novy CTABanner komponent medzi HowItWorksSteps a ContactSection

## Poradie sekcii (vysledne)

```text
Header
Hero (fotka + headline + CTA)
O mne (text + 4 info bloky)
Pre koho je trening (5 blokov s popisom)
Ako to prebieha (3 kroky)
Kontrastna CTA (cierne pozadie)
Kontakt (telefon + formular)
Footer
```

## Technicke detaily

### Subory na upravu:
1. **src/components/landing/LandingHero.tsx** -- odstranit ios-card pozadie, ponechat cisty layout
2. **src/components/landing/AboutVeronika.tsx** -- zmenit grid na border-only bloky, prehodit poradie (text prvy, bloky druhe)
3. **src/components/landing/TargetGroupsSection.tsx** -- kompletne prepisat s popisnymi textami, bez ikon
4. **src/components/landing/HowItWorksSteps.tsx** -- prepisat s vyraznymi cislami a popismi
5. **src/components/landing/ContactSection.tsx** -- odstranit emoji
6. **src/components/landing/LandingFooter.tsx** -- (c) 2026, bez emoji, bez login linku

### Novy subor:
7. **src/components/landing/CTABanner.tsx** -- cierna full-width CTA sekcia

### Uprava hlavnej stranky:
8. **src/pages/PublicLandingPage.tsx** -- odstranit DualPathSection, pridat CTABanner

DualPathSection.tsx ostane v projekte (nepotrebujeme ho mazat), len sa nebude renderovat na hlavnej stranke. Existujuci klienti maju pristup cez header (Prihlasit / Registrovat sa).
