

## Analýza problému

PWA nainštalovaná na plochu mobilu používa Service Worker s `registerType: "autoUpdate"`. Hoci toto nastavenie teoreticky automaticky aktivuje nový SW na pozadí, v praxi:

1. **Standalone mód nemá adresný riadok** – používateľ nemôže stlačiť refresh
2. **iOS Safari drží cache agresívne** – nový SW sa nemusí aktivovať, kým sa app úplne nezavrie a znova neotvorí
3. **Žiadny vizuálny spôsob** ako vynútiť refresh obsahu

Riešenie: **Pull-to-refresh gesto** + **automatická detekcia novej verzie s toast notifikáciou**.

---

## Plán

### 1. Nový komponent: `src/components/PullToRefresh.tsx`

Jednoduchý pull-to-refresh wrapper pomocou touch eventov (`touchstart`, `touchmove`, `touchend`):
- Sleduje ťahanie prstom nadol, keď je `scrollTop === 0`
- Po dostatočnom potiahnutí (>80px) zavolá `window.location.reload()`
- Zobrazí vizuálny indikátor (spinner + šípka) počas ťahania
- Používa framer-motion pre plynulú animáciu

### 2. Nový hook: `src/hooks/useSWUpdatePrompt.ts`

Detekuje, keď je k dispozícii nová verzia service workeru:
- Počúva `controllerchange` event na `navigator.serviceWorker`
- Periodicky kontroluje registráciu SW (každých 60 sekúnd)
- Keď nájde `waiting` SW, zobrazí toast: "Nová verzia je dostupná" s tlačidlom "Aktualizovať"
- Kliknutie na "Aktualizovať" pošle `SKIP_WAITING` message workeru a reloadne stránku

### 3. Integrácia do layoutov

**`src/components/layout/ClientLayout.tsx`**:
- Obalí `children` komponentom `<PullToRefresh>`
- Pridá `useSWUpdatePrompt()` hook

**`src/components/layout/AdminLayout.tsx`**:
- Rovnaká integrácia

### 4. Aktualizácia `vite.config.ts`

Pridať do VitePWA konfigurácie:
```typescript
workbox: {
  // existujúce nastavenia...
  skipWaiting: false,  // necháme na manuálne potvrdenie
  clientsClaim: true,
  navigateFallbackDenylist: [/^\/~oauth/],
}
```

Tým zabezpečíme, že nový SW čaká na potvrdenie (toast) a potom prevezme kontrolu.

---

## Čo bude fungovať

- **Pull-to-refresh**: Na akomkoľvek mieste v app potiahne prstom nadol → stránka sa reloadne → načíta sa najnovšia verzia
- **Auto-update toast**: Keď je nová verzia nasadená, používateľ dostane toast notifikáciu s možnosťou okamžite aktualizovať
- **Funguje v standalone PWA aj v bežnom prehliadači**
- **Žiadne zmeny v DB ani edge functions**

