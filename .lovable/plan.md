

## Analýza problému

`ScrollArea` v `AdminNotificationBell` má `max-h-[60vh] sm:max-h-[400px]`, ale `ScrollArea` z Radix vyžaduje **explicitnú výšku** (nie len `max-h`) na to, aby scroll fungoval. Keď obsah presahuje `max-h`, kontajner sa jednoducho orezáva bez možnosti scrollovania.

Rovnaký problém neexistuje na klientskej stránke `NotificationsPage`, pretože tá nepoužíva `ScrollArea` v popoveri – je to celá stránka so štandardným scrollom.

## Riešenie

### Zmena v `src/components/admin/AdminNotificationBell.tsx`

Nahradiť `ScrollArea` za jednoduchý `div` s `overflow-y-auto` a `overscroll-behavior-contain` (zabráni propagácii scrollu na pozadie). `ScrollArea` z Radix v popoveroch na mobile nefunguje spoľahlivo.

Riadok 79 – zmeniť:
```tsx
<ScrollArea className="max-h-[60vh] sm:max-h-[400px]">
```
Na:
```tsx
<div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
```

A zodpovedajúci uzatvárací tag `</ScrollArea>` (riadok 109) zmeniť na `</div>`.

Odstrániť nepoužitý import `ScrollArea`.

Jedna zmena, jeden súbor, žiadne ďalšie závislosti.

