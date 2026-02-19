

# Zjednodušenie a zosobnenie Landing Page

## Prehľad zmien

Celá landing page sa zredukuje z 8 sekcií na 6 čistejších, osobnejších blokov. Veronikina fotka bude dominantná v hero sekcii, jedno hlavné CTA, menej vizuálneho šumu a viac white space.

## Nová štruktúra stránky

```text
┌─────────────────────────────┐
│  HEADER (bez zmien)         │
│  Veronika | Swim Coach      │
│  Prihlásiť sa / Registrovať │
├─────────────────────────────┤
│  HERO (prepracovaný)        │
│  Veľká fotka 180px          │
│  Nový headline + osobný tón │
│  1x CTA: "Chcem sa spojiť"  │
├─────────────────────────────┤
│  EXISTUJÚCI KLIENT (mini)   │
│  Malá karta, secondary btns │
├─────────────────────────────┤
│  O VERONIKE (zjednodušený)  │
│  Inline ikonové body         │
│  Krátky osobný text          │
├─────────────────────────────┤
│  PRE KOHO + AKO PREBIEHA    │
│  3 body + 3 kroky (mini)     │
├─────────────────────────────┤
│  KONTAKT (formulár + tel)    │
│  Bez ďalšieho veľkého CTA   │
├─────────────────────────────┤
│  FOOTER                     │
└─────────────────────────────┘
```

## Detailné zmeny po komponentoch

### 1. LandingHero.tsx -- kompletne prepracovať

- Veľká kruhová fotka Veroniky (h-44 w-44 / ~180px) s jemným tieňom a glow efektom
- Nový headline: "Plávanie s osobným prístupom v Pezinku"
- Subheadline: "Som Veronika a rada vám pomôžem cítiť sa vo vode istejšie. 🤍"
- Doplnok: "Každého klienta si vyberám individuálne, aby som zachovala kvalitu tréningov."
- Jedno CTA: "Chcem sa spojiť s Veronikou" (scrollne na kontakt)
- Pod CTA: "Nezáväzný kontakt. Ozvem sa vám osobne."

### 2. DualPathSection.tsx -- nahradiť mini blokom pre existujúcich klientov

- Odstrániť kartu pre nových záujemcov (tá je pokrytá hero CTA)
- Nechať len malú kartu "Ste už môj klient?" s secondary tlačidlami Prihlásiť sa / Registrovať sa
- Menšie, nenápadnejšie

### 3. AboutVeronika.tsx -- zjednodušiť

- Zrušiť grid 2x2 s veľkými kartami
- Nahradiť inline zoznamom s ikonami (3 body v rade):
  - 14 rokov skúseností
  - Certifikovaná trénerka
  - Individuálny prístup
- Ponechať osobný text pod tým

### 4. TargetGroupsSection.tsx -- skrátiť na 3 body

- Len 3 položky namiesto 5:
  - Zlepšenie techniky
  - Príprava na skúšky
  - Prekonanie strachu z vody
- Jednoduchší layout bez veľkých kariet (kompaktnejšie riadky)

### 5. HowItWorksSteps.tsx -- minimalistickejšie

- Zmeniť text kroku 3: "Ak si sadneme, dostanete prístup do systému"
- Menšie karty, kompaktnejší vizuál
- Bez ďalšieho CTA

### 6. ContactSection.tsx -- bez zmien

- Už obsahuje presne to, čo treba (telefón + formulár)
- Žiadne duplicitné CTA

### 7. PublicLandingPage.tsx -- odstrániť prop

- `DualPathSection` už nebude potrebovať `onScrollToContact` prop (karta pre nových záujemcov zmizne)
- `LandingHero` bude naďalej používať `onScrollToContact`

## Technické detaily

- **Upravené súbory:** LandingHero.tsx, DualPathSection.tsx, AboutVeronika.tsx, TargetGroupsSection.tsx, HowItWorksSteps.tsx, PublicLandingPage.tsx
- **Žiadne nové závislosti** -- všetko už je nainštalované (framer-motion, lucide-react)
- **Žiadne zmeny v databáze**
- Fotka Veroniky sa importuje z existujúceho `@/assets/veronika-photo.png`

