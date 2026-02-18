
# Plan: Zjednotena metrika "Vas zostatok" na klientskom dashboarde

## Prehlad

Nahradit dve oddelene karty (Kredit + Nezaplatene) jednou kartou "Vas zostatok", ktora zobrazuje `netBalance = balance - debt_balance`. Farba, ikona a podtext sa dynamicky menia podla stavu.

---

## Zmeny v DashboardPage.tsx

### Odstranit
- Kartu "Kredit" (riadky 100-120)
- Kartu "Nezaplatene / Debt" (riadky 122-144)
- Kartu "Storno poplatky" (riadky 146-163) -- tieto informacie su uz v sekcii Financie

### Pridat (pod pozdrav, nad rychle akcie)
Jedna karta "Vas zostatok":

```text
netBalance = balance - debtBalance

Ak netBalance > 0:
  - border-success/30, bg-success/5
  - Ikona: TrendingUp (zelena)
  - Text: "+XX.XX EUR" (zelena)
  - Podtext: "Mate dostupny kredit na treningy."

Ak netBalance == 0:
  - border-warning/30, bg-warning/5
  - Ikona: Minus (oranzova)
  - Text: "0.00 EUR" (oranzova)
  - Podtext: "Rezervacia je mozna. Vznikne nedoplatok."

Ak netBalance < 0:
  - border-destructive/30, bg-destructive/5
  - Ikona: TrendingDown (cervena)
  - Text: "-XX.XX EUR" (cervena)
  - Podtext: "Mate nedoplatok. Prosim uhradte platbu."
  - Male tlacidlo: "Zobrazit platobne udaje" -> naviguje na /financie
```

### Importy
- Pridat `Minus` z lucide-react (pre neutralny stav)
- Odstranit nepotrebne importy (CreditCard, XCircle ak sa uz nepouzivaju)

---

## Zmeny v FinancesPage.tsx

### Nahradit hlavnu kreditovu kartu
- Namiesto oddelenych "Aktualny zostatok" a "Nezaplatene" kariet zobrazit rovnaku zjednotenu kartu "Vas zostatok" s rovnakou logikou ako na dashboarde
- IBAN sekcia a historia transakcii zostavaju bez zmeny

---

## Subory na upravu
- `src/pages/client/DashboardPage.tsx`
- `src/pages/client/FinancesPage.tsx`

## Co sa NEMENI
- Interna logika (balance, debt_balance v profile)
- Hooks (useTransactions, useClientBookings)
- Backend / RPC funkcie
- Rezervacny flow (LowCreditWarningDialog zostava)
- Admin financie
