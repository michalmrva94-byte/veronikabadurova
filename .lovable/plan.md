

## 4. typ termínu: Poznámka / Oznam v kalendári

### Čo to bude
Admin môže pridať do kalendára celodenný alebo časový oznam (napr. "Plaváreň zatvorená — Maratón", "Dovolenka"). Klienti aj admin to uvidia v kalendári ako informačnú poznámku — nie je to tréning, nedá sa naň prihlásiť.

### Databáza — nové stĺpce na `training_slots`
```sql
ALTER TABLE training_slots
  ADD COLUMN is_note boolean NOT NULL DEFAULT false,
  ADD COLUMN note_title text;
```

Poznámkový slot bude mať: `is_note: true`, `is_available: false`, `note_title` (napr. "Plaváreň zatvorená"), voliteľne `notes` pre detail. Časy `start_time`/`end_time` budú nastavené na celý deň (00:00–23:59) alebo na konkrétny rozsah.

### Zmeny v kóde

#### 1. `CreateTrainingDialog` — 4. typ "Poznámka"
Pridať štvrtý toggle vedľa Voľný/Klient/Externý:
- Ikona: `StickyNote` alebo `MessageSquare`
- Label: "Poznámka"
- Farba: žltá/amber
- Zobrazí len pole "Nadpis poznámky" + existujúce "Poznámky (voliteľné)"
- Skryje čas (nastaví automaticky celý deň) alebo ponechá voliteľný
- Tlačidlo: "Pridať poznámku"

#### 2. `useWeeklySlots` — filter
Riadok 70: Poznámkové sloty (`is_note: true`) neprehadzovať cez orphan filter:
```typescript
if (!slot.is_available && !slot.booking && !slot.is_blocked && !slot.is_note) return false;
```

#### 3. `WeeklyCalendarGrid` — admin zobrazenie
- Nová farba pre `is_note` sloty: amber/žltá pozadie s ikonou poznámky
- Zobrazí `note_title` namiesto času
- Kliknuteľné — v `SlotDetailDialog` zobrazí detail s možnosťou zmazať

#### 4. `SlotDetailDialog` — detail poznámky
Pre `is_note` sloty zobraziť:
- Badge "Poznámka" (amber)
- Nadpis a text poznámky
- Akcia: Zmazať poznámku

#### 5. Klientské zobrazenie
- `WeeklyAvailableSlots` — poznámky sa **nezobrazia** ako voľné termíny (filter `!slot.is_note`)
- Ale chceme aby klient videl oznam → zobraziť poznámkové sloty ako samostatný amber banner v danom dni (napr. "📌 Plaváreň zatvorená — Maratón")

#### 6. `useSlotsForMonth` — mesačný kalendár
Poznámkové sloty pridať do zobrazenia (nepočítať ako "voľné" ani "obsadené" — len ako indikátor pre daný deň).

#### 7. Typy
Rozšíriť `TrainingSlot` interface o `is_note: boolean` a `note_title: string | null`.

### Flow
```text
Admin → Nový tréning → Typ: "Poznámka"
  → Zadá nadpis (napr. "Plaváreň zatvorená")
  → Voliteľne detail
  → Uloží
  → V admin kalendári: amber chip s 📌 ikonou
  → V klientskom kalendári: informatívny banner v danom dni
```

