

# Plan: Redizajn sekcie DOMOV -- 3 otazky

Cela obrazovka odpoveda na 3 otazky:
1. Kedy idem najblizsie plavat?
2. Musim teraz nieco spravit?
3. Ako sa mi dari?

Vsetko ostatne je sekundarne.

---

## Nova struktura (zhora nadol)

1. **Pozdrav** -- "Ahoj, {meno}! Tesim sa na dalsi trening."
2. **Najblizssi trening / Akcia** (absolutna priorita, najvacsi blok)
3. **Primarne CTA** -- "Rezervovat novy trening"
4. **Moja aktivita** -- motivacne metriky (3 cisla)
5. **Zostatok** -- kompaktna karta
6. **Posledne treningy** -- max 3 + "Zobrazit vsetko"
7. **Rezervacne podmienky** -- Collapsible, zatvoreny

---

## Detailne zmeny v DashboardPage.tsx

### 1. Pozdrav (bez zmeny)
Ponechat aktualny text: "Ahoj, {meno}! Tesim sa na dalsi trening."

### 2. Najblizssi trening / Akcia -- NOVY hero blok

Tri scenare (vzajomne sa vylucuju, priorita A > B > C):

**A) Navrhy od Veroniky (proposedBookings.length > 0)**
- Zobrazit ProposedTrainingsSection na 1. mieste (uz existuje komponent)
- Tento blok bude vizualne dominantny

**B) Potvrdeny trening (upcomingBookings.length > 0)**
- Karta s nadpisom "Najblizssi trening"
- Datum + cas prveho upcoming bookingu: "streda, 19. feb o 09:00"
- Tlacidlo: "Detail treningu" -> naviguje na `/moje-treningy`
- Ak je viacero, pod kartou text: "+X dalsich treningov" s linkou

**C) Nic naplanované**
- Text: "Zatial nemate rezervovany trening tento tyzden."
- CTA: "Rezervovat trening" (v ramci karty)

### 3. Primarne CTA
- Jedno velke tlacidlo plnej sirky: "Rezervovat novy trening"
- Naviguje na `/kalendar`
- Zobrazit vzdy (aj ked su upcoming treningy)

### 4. Moja aktivita -- NOVY motivacny blok
- Kompaktna karta s nadpisom "Moja aktivita"
- Grid 3 stlpcov s metrikami:
  - **Tento tyzden**: pocet completed treningov od pondelka aktualneho tyzdna
  - **Tento mesiac**: pocet completed treningov od 1. dna aktualneho mesiaca
  - **Seria**: pocet po sebe iducich tyzdnov s min. 1 completed treningom (streak, pocitane dozadu od aktualneho tyzdna)
- Vypocet z `pastBookings` filtrovanych na `status === 'completed'`
- Dizajn: male cisla s popiskami, jemne farby
- Pri streak > 0 zobrazit malu ikonu Flame

### 5. Zostatok -- kompaktna karta (UPRAVENA)
- Odstranit absolutny div s opacity-5 overlay
- Odstranit ikony TrendingUp, TrendingDown, Minus
- Zjednodusit na: nadpis "Vas zostatok" + suma + microcopy
- Farebna logika:
  - `> 0`: border-success/30, text-success, "Mate dostupny kredit."
  - `=== 0`: border-border, text-muted-foreground, "Momentalne nemate kredit ani dlh."
  - `< 0`: border-destructive/30, text-destructive, "Evidujeme nezaplateny zostatok."
- Pri < 0: male tlacidlo "Zobrazit platobne udaje"

### 6. Posledne treningy (ZJEDNODUSENE)
- Zobrazit max 3 polozky (namiesto 5)
- Tlacidlo: "Zobrazit vsetko" (bez poctu v zatvorke)

### 7. Rezervacne podmienky -- Collapsible
- Pouzit Collapsible komponent
- Trigger: "Rezervacne podmienky" s ChevronDown ikonou
- Standardne zatvoreny

### 8. Odstranit
- 2-stlpcovy grid s kartami "Rezervovat" a "Moje treningy" (riadky 146-170)
- Sekciu "Nadchadzajuce treningy" ako separatnu kartu (riadky 175-231) -- nahradena hero blokom
- Ikony TrendingUp, TrendingDown, Minus, Clock z importov

---

## Vypocet metrik (priamo v komponente)

```text
const completedBookings = pastBookings.filter(b => b.status === 'completed');

// Tento tyzden
const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // pondelok
const thisWeekCount = completedBookings.filter(
  b => new Date(b.slot.start_time) >= weekStart
).length;

// Tento mesiac
const monthStart = startOfMonth(now);
const thisMonthCount = completedBookings.filter(
  b => new Date(b.slot.start_time) >= monthStart
).length;

// Streak -- iterovat dozadu po tyzdnoch
let streak = 0;
let checkWeek = startOfWeek(now, { weekStartsOn: 1 });
// Ak aktualny tyzden este nema completed, zaciname od predchadzajuceho
if (thisWeekCount === 0) {
  checkWeek = subWeeks(checkWeek, 1);
}
while (true) {
  const weekEnd = endOfWeek(checkWeek, { weekStartsOn: 1 });
  const hasTraining = completedBookings.some(b => {
    const d = new Date(b.slot.start_time);
    return d >= checkWeek && d <= weekEnd;
  });
  if (!hasTraining) break;
  streak++;
  checkWeek = subWeeks(checkWeek, 1);
}
```

---

## Importy

### Pridat
- `ChevronDown`, `ArrowRight`, `Flame` z `lucide-react`
- `Collapsible, CollapsibleTrigger, CollapsibleContent` z `@/components/ui/collapsible`
- `startOfWeek, startOfMonth, subWeeks, endOfWeek` z `date-fns`

### Odstranit
- `TrendingUp`, `TrendingDown`, `Minus`, `Clock` (nepouzivane po zmenach)

---

## Subory na upravu

- `src/pages/client/DashboardPage.tsx` -- jediny subor

## Co sa NEMENI

- PendingApprovalScreen, RejectedScreen
- ProposedTrainingsSection komponent (logika aj dizajn)
- useClientBookings hook
- Backend / databaza
- Ostatne stranky

