

# Zjednotenie "Pridať slot" a "Priradiť tréning" do jedného dialógu

## Prečo

Aktuálne sú dva samostatné dialógy s takmer rovnakým účelom - oba vytvárajú časový termín. Jediný rozdiel je, či sa priradí klient alebo nie. Zjednotenie zníži počet tlačidiel, zjednoduší rozhranie a uľahčí prácu adminovi.

---

## Ako to bude fungovať

Jeden dialóg "Nový tréning" s týmito poľami:

1. **Dátum** (predvyplnený podľa kontextu)
2. **Čas od - do** (povinné)
3. **Klient** (voliteľné dropdown) - ak sa vyberie, vytvorí sa rovno booking so statusom `booked`
4. **Cena** (zobrazí sa iba ak je vybraný klient, predvyplnená DEFAULT_TRAINING_PRICE)
5. **Poznámka** (voliteľné)

Ak klient nie je vybraný = vytvorí sa voľný slot (ako doterajšie "Pridať slot").
Ak klient je vybraný = vytvorí sa slot + booking (ako doterajšie "Priradiť tréning").

---

## Technické zmeny

### 1. Nový zjednotený dialóg
- Vytvoriť `src/components/admin/CreateTrainingDialog.tsx` - nahradí oba existujúce dialógy
- Formulár: dátum, čas od/do, voliteľný klient dropdown, podmienená cena, poznámka
- Logika: ak `client_id` je vyplnené, zavolá `assignTraining`, inak `createSlot`

### 2. AdminCalendarPage.tsx
- Odstrániť import `AddSlotDialog` a `AssignTrainingDialog`
- Nahradiť dvomi stavmi (`isAddDialogOpen`, `isAssignDialogOpen`) jedným (`isCreateDialogOpen`)
- V headeri jedno tlačidlo "Nový tréning" namiesto dvoch
- Odstrániť funkciu `openAssignDialog`, ponechať jednu `openCreateDialog`

### 3. WeeklyCalendarGrid.tsx
- Tlačidlo `+` v mobile/desktop view už volá `onAddSlot` - to zostáva rovnaké, len otvára nový zjednotený dialóg

### 4. Existujúce dialógy
- `src/components/admin/AddSlotDialog.tsx` - prestane sa používať (môže sa odstrániť)
- `src/components/admin/AssignTrainingDialog.tsx` - prestane sa používať (môže sa odstrániť)

