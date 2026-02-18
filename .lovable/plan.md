
# Plan: Optimalizacia sekcie DOMOV pre klienta

## Prehlad

Restrukturalizacia klientskeho dashboardu s dorazom na rezervacie a treningy. Financie sa presunu do sekundarnej pozicie. Pridame hero sekciu s najblizsim treningom, jedno velke CTA tlacidlo, kompaktnejsiu kartu zostatku a zbalitelny blok pre storno podmienky.

---

## Nova struktura (zhora nadol)

1. **Hero sekcia** -- pozdrav + najblizssi trening alebo CTA
2. **Primarne CTA** -- velke tlacidlo "Rezervovat novy trening" (plna sirka)
3. **Navrhy treningov** -- sekcia "Vyzaduje pozornost" (ak existuju)
4. **Zostatok** -- kompaktna karta (zjednodusena, bez ikoniek TrendingUp/Down)
5. **Historia** -- posledne 3 treningy + "Zobrazit vsetko"
6. **Rezervacne podmienky** -- zbalitelny blok (Collapsible), standardne zatvoreny

---

## Detailne zmeny v DashboardPage.tsx

### 1. Hero sekcia (nahradi aktualny pozdrav + quick actions grid)

- Pozdrav: `"Ahoj, {meno}! 👋"` + `"Tesim sa na dalsi trening."`
- Ak `upcomingBookings.length > 0`:
  - Pod pozdravom zobrazit kartu s najblizsim treningom:
    - Text: `"Najblizsie: streda, 19. feb o 09:00"`
    - Tlacidlo: `"Detail treningu"` -- naviguje na `/moje-treningy`
- Ak `upcomingBookings.length === 0`:
  - Pod pozdravom zobrazit text: `"Zatial nemate rezervovany trening."`
  - (CTA bude hned pod tym)

### 2. Primarne CTA

- Jedno velke tlacidlo plnej sirky namiesto 2-stlpcoveho gridu
- Text: `"Rezervovat novy trening"`
- Naviguje na `/kalendar`
- Styl: `btn-dark h-14 text-base` (plna sirka, vyrazne)

### 3. Odstranit

- 2-stlpcovy grid s kartami "Rezervovat" a "Moje treningy" (nahradeny hero + CTA)
- Sekciu "Nadchadzajuce treningy" (Card s CardHeader) -- informaciu o najblizssom treningu prebera hero sekcia
- Ikony TrendingUp, TrendingDown, Minus z karty zostatku

### 4. Zostatok -- kompaktna karta

- Zjednoduseny dizajn bez velkych ikon
- Nadpis: `"Vas zostatok"` s ikonou Wallet
- Suma: velke cislo s farbou:
  - `> 0`: `text-success`, border `border-success/30` 
  - `=== 0`: `text-muted-foreground`, border `border-border` (siva, nie oranzova!)
  - `< 0`: `text-destructive`, border `border-destructive/30`
- Microcopy:
  - `> 0`: `"Mate dostupny kredit."`
  - `=== 0`: `"Momentalne nemate kredit ani dlh."`
  - `< 0`: `"Evidujeme nezaplateny zostatok."`
- Pri < 0: male tlacidlo "Zobrazit platobne udaje"
- Ziadne pozadie overlay (odstranit absolutny div s opacity)

### 5. Historia

- Zobrazit iba posledne 3 (nie 5)
- Tlacidlo: `"Zobrazit vsetko"` (namiesto "Zobrazit celu historiu (X)")

### 6. Rezervacne podmienky -- Collapsible

- Pouzit `Collapsible` komponent z `@radix-ui/react-collapsible`
- Trigger: `"Rezervacne podmienky"` s ChevronDown ikonou
- Standardne zatvoreny
- Obsah rovnaky (grid so storno percentami)

---

## Importy

### Pridat
- `ChevronDown` z `lucide-react`
- `Collapsible, CollapsibleTrigger, CollapsibleContent` z `@/components/ui/collapsible`
- `ArrowRight` z `lucide-react`

### Odstranit (nepouzivane po zmenach)
- `TrendingUp`, `TrendingDown`, `Minus`, `Clock`

---

## Subory na upravu

- `src/pages/client/DashboardPage.tsx` -- jediny subor

## Co sa NEMENI

- PendingApprovalScreen, RejectedScreen
- ProposedTrainingsSection logika
- Backend / hooks / databaza
- Ostatne stranky
