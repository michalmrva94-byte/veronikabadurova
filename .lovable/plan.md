

## Plan: PWA konfigurácia s novými ikonami

### Prehľad

Nahradenie existujúcej PWA konfigurácie novými ikonami, aktualizácia farieb na `#3DAB97`, odstránenie starého `manifest.json` a rozšírenie PullToRefresh o hard-reload threshold.

### Kroky

**1. Skopírovať 5 ikon do `public/`**
- `icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon.svg`

**2. Odstrániť `public/manifest.json`**
- VitePWA generuje manifest automaticky, starý by kolidoval

**3. Aktualizovať `index.html`**
- Nahradiť favicon linky: `favicon.svg` + `favicon.ico` + `apple-touch-icon.png`
- Zmeniť `theme-color` na `#3DAB97`
- Zmeniť `apple-mobile-web-app-status-bar-style` na `black-translucent`
- Odstrániť `<link rel="manifest">` (VitePWA ho injektuje)

**4. Aktualizovať `vite.config.ts`**
- `manifest: false` → plný manifest objekt s novými ikonami a farbami (`#3DAB97`)
- Aktualizovať `includeAssets`
- Zachovať existujúce workbox nastavenia

**5. Pridať SW visibility update do `App.tsx`**
- `useEffect` s `visibilitychange` listenerom, ktorý volá `reg?.update()` pri návrate do appky

**6. Rozšíriť `PullToRefresh.tsx`**
- Nový `HARD_RELOAD_THRESHOLD = 140`, `MAX_PULL = 160`
- Pod 140px: existujúci reload
- Nad 140px: hard reload s textom "Aktualizovať aplikáciu"

**7. Odstrániť `src/hooks/useSWUpdatePrompt.tsx`**
- Funkcionalita pokrytá novým visibility-change efektom v App.tsx

### Technické detaily

Upravené súbory: `index.html`, `vite.config.ts`, `src/App.tsx`, `src/components/PullToRefresh.tsx`
Odstránené: `public/manifest.json`, `src/hooks/useSWUpdatePrompt.tsx`
Nové v `public/`: 5 ikon
Bez databázových zmien.

