

## Plan: Add "Ste uz moj klient?" section to PublicLandingPage

Based on the screenshot, the section should be a **compact single-row card** with icon + text on the left and two outline buttons on the right — matching the exact layout shown.

### What to do

1. **Add the "Ste uz moj klient?" card to `PublicLandingPage.tsx`** — place it after the Hero section (after `<LandingHero />`), as shown in the screenshot. It will be a simple inline section (no separate component needed, or reuse the existing card pattern from `DualPathSection.tsx`).

2. **Layout from screenshot**: Single `ios-card` with a horizontal flex layout:
   - Left side: primary-colored icon (`UserCheck`) + bold "Ste uz moj klient?" title + subtitle "Spravujte si treningy online."
   - Right side: Two outline-style buttons — "Prihlasit sa" and "Registrovat sa"
   - On mobile, the layout stays compact as a row (icon + text | buttons), matching the screenshot exactly.

3. **No other changes** to the landing page structure or existing sections.

### File changes

- **`src/pages/PublicLandingPage.tsx`** — import `Link`, `ROUTES`, `UserCheck` and add the client card section between `<LandingHero />` and `<AboutVeronika />`.

