

# Úprava Landing Page

## Čo sa zmení

### 1. Odstránenie sekcie "Storno pravidlá" (riadky 190-217)
Celá sekcia so storno pravidlami bude odstránená z landing page. Tieto informácie sa zobrazia neskôr v samostatnej podstránke.

### 2. Odstránenie 💦 ikonky z CTA sekcie (riadok 223)
Riadok `<p className="text-3xl mb-3">💦</p>` bude odstránený.

### 3. Úprava karty "Férové pravidlá" pre navigáciu
Karta "Férové pravidlá" v sekcii "Ako to funguje" bude v budúcnosti klikateľná a bude odkazovať na podstránku so storno pravidlami. Zatiaľ vytvoríme novú route `/storno-pravidla` a novú stránku.

## Nová štruktúra Landing Page

```text
┌─────────────────────────────────┐
│         HERO SEKCIA            │
│   Fotka + "Ahoj, som Veronika" │
│   Tlačidlá: Začať / Mám účet   │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│      O MNE (karta)             │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│     AKO TO FUNGUJE             │
│  • Vyber si termín             │
│  • Férové pravidlá → (link)    │
│  • Kreditový systém            │
│  • Pozvi kamarátov             │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│      CTA SEKCIA                │
│   "Pripravená?"                │
│   (bez 💦 ikonky)              │
│   Tlačidlo: Zaregistrovať sa   │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│         FOOTER                 │
└─────────────────────────────────┘
```

## Súbory na úpravu

| Súbor | Zmena |
|-------|-------|
| `src/pages/LandingPage.tsx` | Odstránenie sekcie Storno pravidlá (riadky 190-217), odstránenie 💦 ikonky (riadok 223), úprava karty Férové pravidlá na Link |
| `src/lib/constants.ts` | Pridanie novej route `CANCELLATION_POLICY: '/storno-pravidla'` |
| `src/pages/CancellationPolicyPage.tsx` | Nová stránka so storno pravidlami |
| `src/App.tsx` | Pridanie novej route pre storno pravidlá |

## Technické detaily

### LandingPage.tsx
- Odstrániť celú `<section>` pre storno pravidlá (riadky 190-217)
- Odstrániť riadok 223: `<p className="text-3xl mb-3">💦</p>`
- Karta "Férové pravidlá" bude obalená do `<Link to={ROUTES.CANCELLATION_POLICY}>` pre navigáciu na podstránku

### Nová stránka CancellationPolicyPage.tsx
Bude obsahovať:
- Nadpis "Storno pravidlá"
- Karty s pravidlami (>48h = zadarmo, 24-48h = 50%, <24h = 80%)
- Cena tréningu: 25€
- Tlačidlo späť

