

# Zjednodusena sekcia Financie

## Prehlad zmien

Kompletne prepracovanie stranky Financie na tri jasne bloky s pokojnym, osobnym tonom Veroniky. Odstranenie nadbytocnych KPI boxov, duplicitnych bannerov a zjednodusenie vizualneho jazyka.

## Struktura stranky

### 1. Hlavny blok -- "Moj zostatok"

Jedna dominantna karta s velkym cislom a osobnou spravou podla stavu:

- **Kredit > 0** (zelena): "Mate k dispozicii kredit na dalsie treningy. Tesim sa na dalsiu spolocnu hodinu."
- **Kredit = 0** (seda): "Momentalne nemate kredit ani dlh. Trening si mozete pokojne rezervovat, platbu vyriesime neskor."
- **Dlh** (cervena): "Momentalne evidujeme neuhradeny zostatok. Ked vam to bude vyhovovat, mozete ho uhradit prevodom alebo v hotovosti."

**Odstranene**: Vklady/Vydavky KPI boxy, Storno poplatky celkom karta, Low credit info banner.

### 2. Blok -- "Ako uhradit platbu"

Jednoducha karta s IBAN-om a tlacidlom Skopirovat.

Mikrocopy: "Platbu mozete uhradit prevodom alebo osobne v hotovosti. Kredit pripisem hned, ako platbu zaevidujem."

Bez podmienecneho zvyraznovania -- vzdy rovnaky pokojny dizajn.

### 3. Historia platieb a treningov

- Nadpis: "Historia platieb a treningov"
- Podnadpis: "Prehlad vsetkych pohybov na vasom ucte."
- Filter chips: Vsetko | Vklady | Treningy | Storno | Dlh
- Minimalisticky zoznam -- +/- suma, typ, datum
- Empty state: "Zatial tu nie je ziadna historia. Ked prebehne prva platba alebo trening, zobrazi sa tu."

## Technicky detail

**Subor:** `src/pages/client/FinancesPage.tsx`

Zmeny:
- Odstranenie importov `TrendingUp`, `TrendingDown`, `Minus`, `ArrowUpRight`, `ArrowDownRight`, `Info`, `Wallet` -- nahradenie jednoduchsimi ikonami
- Odstranenie premennych `totalDeposits`, `totalExpenses`, `totalCancellationFees`, `shouldHighlightIban` a importu `useClientBookings`
- Nahradenie hlavnej karty "Vas zostatok" za "Moj zostatok" s novym mikrocopy
- Odstranenie grid 2-col KPI boxov (Vklady/Vydavky)
- Odstranenie Storno poplatky celkom karty
- Zjednodusenie IBAN sekcie -- vzdy rovnaky styl, nadpis "Ako uhradit platbu", osobny text v 1. osobe ("pripisem")
- Odstranenie Low credit info banneru (duplicitna informacia)
- Aktualizacia nadpisu historie na "Historia platieb a treningov" s novym podnadpisom
- Filter chip "Poplatky" premenovat na "Storno"
- Aktualizacia empty state textu
- Odstranenie strankovej hlavicky (nadpis "Financie" a podnadpis) -- dominantna karta je dostatocna

**Subor:** `src/hooks/useTransactions.ts` -- bez zmien, hook zostava rovnaky (statistiky sa jednoducho nezobrazia)
