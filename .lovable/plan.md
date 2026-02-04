
# Prepojenie klientskeho kalendára s databázou

## Problém
Klientský kalendár (`CalendarPage.tsx`) má hardcoded prázdne pole `slots: any[] = []` a vôbec nenačítava dáta z databázy. Admin kalendár funguje správne, pretože používa `useTrainingSlots` hook.

## Riešenie
Prepojíme klientský kalendár s rovnakým hookom `useTrainingSlots` a pridáme zobrazenie dostupných slotov s možnosťou rezervácie.

## Čo sa zmení

### 1. Klientský kalendár (`src/pages/client/CalendarPage.tsx`)

- Import `useTrainingSlots` hook
- Načítavanie slotov pre vybraný dátum z databázy
- Zobrazenie loading stavu počas načítavania
- Renderovanie kariet pre každý dostupný slot s:
  - Časom tréningu (napr. "08:00 - 09:00")
  - Tlačidlom "Rezervovať" (zatiaľ bez funkcionality)
  - Prípadnými poznámkami od admina

### 2. Nový komponent pre slot (`src/components/client/AvailableSlotCard.tsx`)

Vytvoríme kartu pre zobrazenie dostupného slotu:

```text
┌─────────────────────────────────┐
│ 🕐 08:00 - 09:00               │
│ Poznámka: Skupinový tréning    │
│ ┌─────────────────────────────┐│
│ │      Rezervovať             ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

## Technické detaily

### CalendarPage.tsx - zmeny

```text
Pred:
  import { Clock, AlertCircle } from 'lucide-react';
  
  const slots: any[] = [];

Po:
  import { Clock, AlertCircle, Loader2 } from 'lucide-react';
  import { useTrainingSlots } from '@/hooks/useTrainingSlots';
  import { AvailableSlotCard } from '@/components/client/AvailableSlotCard';
  
  const { slots, isLoading } = useTrainingSlots(selectedDate);
```

### AvailableSlotCard.tsx - nový komponent

Zobrazí:
- Čas tréningu formátovaný ako "HH:mm - HH:mm"
- Poznámky (ak existujú)
- Tlačidlo "Rezervovať" (zatiaľ len vizuálne, funkcia rezervácie bude ďalší krok)

## Výsledok

- Klient uvidí všetky dostupné sloty vytvorené adminom
- Pri výbere dátumu sa načítajú sloty pre daný deň
- Zobrazí sa loading indikátor počas načítavania
- Sloty budú mať tlačidlo "Rezervovať" pripravené na ďalšiu implementáciu
