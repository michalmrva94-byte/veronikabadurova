
# Plan: Uprava empty-state karty na Domove

## Co sa zmeni

Upravime texty v karte "Nic naplanované" (scenar C) tak, aby klient vedel, ze moze bud sam rezervovat termin, alebo pockat na navrh od Veroniky. Text bude zjednoduseny, prehladny a v sulade s tonom Veroniky.

## Novy obsah karty

Aktualne:
- "Momentálne nemáme naplánovaný tréning."
- "Vyberte si termín, ktorý vám vyhovuje."
- [Rezervovať tréning]

Nove:
- "Momentálne nemáme naplánovaný tréning."
- "Rezervujte si termín alebo počkajte -- navrhnem vám tréning priamo sem."
- [Rezervovať tréning]

Druha veta je zjednodusena do jedneho riadku, ktory pokryva obe moznosti (sam si rezervovat ALEBO pockat na navrh). Pointa "zobrazia sa tu na potvrdenie" je implicitne vyjadrena cez "priamo sem".

## Technicky detail

**Subor:** `src/pages/client/DashboardPage.tsx`, riadky 179-184

Nahradime dva `<p>` elementy za jeden kratsi text s jemnejsim stylom, aby karta zostala vzdusna a nerusiava.
