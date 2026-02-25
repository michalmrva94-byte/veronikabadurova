

## Analýza problému

Na snímke obrazovky vidím, že tlačidlo "Uložiť nastavenia" na stránke Admin Nastavenia je orezané spodným tab barom. AdminLayout má `pb-24` na `<main>`, čo by malo stačiť, ale tlačidlo je úplne na konci obsahu a v standalone PWA režime je nav bar vyšší kvôli `safe-bottom` paddingu.

Problém: `pb-24` (6rem = 96px) nestačí, keď sa pripočíta výška tab baru (h-20 = 80px) + safe-area-inset-bottom (cca 34px na iPhone).

## Riešenie

Jednoduchá zmena – zvýšiť spodný padding hlavného obsahu v `AdminLayout.tsx` z `pb-24` na `pb-32`, čím sa zabezpečí dostatok priestoru pre scroll aj na zariadeniach so safe-area.

### Zmena v `src/components/layout/AdminLayout.tsx`

Zmeniť:
```
<main className="container flex-1 px-4 py-4 pb-24">
```
Na:
```
<main className="container flex-1 px-4 py-4 pb-32">
```

Toto pridá extra 32px (z 96px na 128px), čo pokryje tab bar + safe area na všetkých iOS zariadeniach.

