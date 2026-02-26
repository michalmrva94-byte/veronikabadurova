

## Problém

PWA konfigurácia má `skipWaiting: false`, čo znamená, že nový service worker **čaká** kým sa zatvoria všetky taby/okná predtým, než sa aktivuje. V standalone PWA móde na telefóne sa "tab" prakticky nikdy nezatvorí — používateľ len minimalizuje appku. Preto `window.location.reload()` z PullToRefresh stále načíta starú cachovanú verziu.

## Riešenie

**Súbor: `vite.config.ts`** — zmeniť `skipWaiting: false` na `skipWaiting: true` (riadok 39).

Toto zabezpečí, že nový service worker sa aktivuje okamžite po stiahnutí, bez čakania na zatvorenie tabov. V kombinácii s už existujúcim `clientsClaim: true` a visibility change listenerom v `App.tsx` to znamená:

1. Používateľ sa vráti do appky → `visibilitychange` event spustí `reg.update()`
2. Nový SW sa stiahne a **okamžite aktivuje** (skipWaiting: true)
3. `clientsClaim: true` zabezpečí, že nový SW prevezme kontrolu
4. Pull-to-refresh reload načíta nové assety z nového SW cache

### Zmena

```diff
- skipWaiting: false,
+ skipWaiting: true,
```

Jedna zmena, jeden riadok.

