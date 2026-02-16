
# Platba prevodom - IBAN karta

## Prehlad

Pridanie karty "Platba prevodom" do klientskej sekcie Financie s IBAN-om nastavitelnym v admin nastaveniach, kopirovacimi tlacidlami a zvyraznenim pri dlhu.

## Databazove zmeny

Vlozit novy zaznam do `app_settings`:
- `key`: `iban`, `value`: `''`, `description`: `IBAN pre platbu prevodom`

## Zmeny v suboroch

### 1. `src/pages/admin/AdminSettingsPage.tsx`

- Pridat state `iban` a nacitat ho v `fetchSettings` (druhy query na `app_settings` s `key = 'iban'`)
- Pridat novu kartu "IBAN pre platby" s textovym input polom
- V `handleSave` ulozit aj IBAN (upsert alebo update)
- Ak IBAN zaznam neexistuje, pouzit upsert

### 2. `src/pages/client/FinancesPage.tsx`

- Pridat query na nacitanie IBAN z `app_settings` (`key = 'iban'`)
- Importovat `useClientBookings` pre zistenie nadchadzajucich treningov
- Pridat novu kartu "Platba prevodom" medzi storno poplatky a historiu transakcii:
  - Text: "Ak si chces doplnit kredit, mozes poslat platbu prevodom."
  - IBAN formatovany s medzerami po 4 znakoch (helper funkcia)
  - Tlacidlo "Skopirovat IBAN" - `navigator.clipboard.writeText` + toast "IBAN skopirovaný"
  - Pole "Poznamka k platbe" s hodnotou `profile.full_name` + tlacidlo na kopirovanie + toast "Poznamka skopirovaná"
- Karta sa zobrazi len ak je IBAN nastaveny (neprazdny)
- Zvyraznenie (warning border/pozadie) ak:
  - `balance < 0`
  - alebo `balance === 0` a `upcomingBookings.length > 0`

## Technicke detaily

### IBAN formatovanie
```text
formatIBAN("SK3112000000198742637541") -> "SK31 1200 0000 1987 4263 7541"
```
Jednoducha inline funkcia - odstranenie medzier, vlozenie medzery po kazdych 4 znakoch.

### Zvyraznenie logika
```text
shouldHighlight = balance < 0 || (balance === 0 && upcomingBookings.length > 0)
```
Ak true: `border-warning/50 bg-warning/5`, inak standardny border.

### Kopirovanie do clipboard
Pouzit `navigator.clipboard.writeText()` s fallbackom a toast notifikaciou cez existujuci `useToast` hook.
