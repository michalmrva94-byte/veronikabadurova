

## Problem

The current push notification banner is minimal — a small inline row that's easy to overlook. There's also no "Add to Home Screen" (A2HS) prompt at all. Since 0 clients currently have push enabled, we need a more compelling, visually prominent approach.

## Plan

### 1. Create a reusable `InstallAndPushBanner` component

A new component `src/components/client/InstallPushBanner.tsx` that handles two scenarios:

**Scenario A — App not installed (browser, not standalone)**
- Detect via `window.matchMedia('(display-mode: standalone)')` 
- Capture the `beforeinstallprompt` event to enable native install
- Show a prominent card with phone icon, heading "Pridajte si appku na plochu", description about benefits (rýchly prístup, notifikácie), and a CTA button
- On Android: trigger native install prompt; on iOS: show instructions ("Ťuknite na Zdieľať → Pridať na plochu")
- Dismissible with 14-day cooldown via localStorage

**Scenario B — App installed but push not enabled**
- Same as current logic: `Notification.permission === 'default'`
- Show a visually upgraded card (not just a thin row) with bell icon, heading "Zapnite si notifikácie", description about training reminders, and CTA
- Dismissible with 7-day cooldown (existing behavior)

### 2. Visual design

Replace the current inline banner with a full-width Card featuring:
- Gradient background (`bg-gradient-to-br from-primary/10 to-primary/5`)
- Large icon (40px) in a colored circle
- Bold heading + descriptive text
- Full-width primary CTA button
- Small dismiss link at bottom
- Subtle entrance animation via framer-motion

### 3. Integration into DashboardPage

- Remove the existing push banner code (lines 151-200)
- Import and place `<InstallPushBanner />` right after the greeting section
- The component self-manages visibility (returns null when not applicable)

### 4. iOS detection helper

For iOS Safari (no `beforeinstallprompt` support), detect via user agent and show manual instructions in a small dialog/sheet explaining the steps with Safari share icon.

### Technical notes

- `beforeinstallprompt` event is Chrome/Edge only; for iOS we show manual instructions
- The component checks `display-mode: standalone` to avoid showing install prompt when already installed
- No database changes needed — all state is localStorage-based

