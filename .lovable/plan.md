

## Blokovanie času pre externých klientov — s financiami

### Problém
Veronika potrebuje v kalendári zablokovať čas pre klientov mimo aplikácie a zároveň chce, aby sa odplávaný tréning započítal do financií (zarobené, dashboard štatistiky).

### Kľúčové rozhodnutie: financie
Existujúci systém transakcií vyžaduje `client_id` (NOT NULL). Namiesto zložitého refaktoru pridáme finančné údaje priamo na `training_slots`:

- `is_blocked` (boolean) — slot je blokovaný pre externého klienta
- `blocked_client_name` (text) — meno externého klienta
- `blocked_price` (numeric) — cena tréningu
- `blocked_completed` (boolean) — či bol tréning odplávaný

Toto je čisté riešenie, pretože externý klient nemá profil v systéme a transakcie sa na neho nedajú naviazať. Financie pre blokované sloty sa budú počítať z `training_slots` priamo.

### Zmeny

#### 1. Databáza — migrácia
```sql
ALTER TABLE training_slots 
  ADD COLUMN is_blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN blocked_client_name text,
  ADD COLUMN blocked_price numeric DEFAULT 0,
  ADD COLUMN blocked_completed boolean NOT NULL DEFAULT false;
```

#### 2. CreateTrainingDialog
Pridať tretiu možnosť do select klienta: **"Externý klient (mimo appky)"**. Keď je zvolená:
- Zobrazí sa textové pole pre meno klienta
- Zobrazí sa pole cena
- Skryje sa štandardný select klientov (nahradí ho toggle/select s 3 možnosťami: Voľný slot / Klient z appky / Externý klient)
- Tlačidlo: "Blokovať termín"
- Vytvorí slot s `is_available: false, is_blocked: true, blocked_client_name, blocked_price`

#### 3. Orphan filter — useWeeklySlots + useSlotsForMonth
Aktuálny filter (riadok 66): `if (!slot.is_available && !slot.booking) return false;`
Zmena: `if (!slot.is_available && !slot.booking && !slot.is_blocked) return false;`

Rovnako v `useSlotsForMonth` (riadok 111): pridať kontrolu `is_blocked` aby sa blokované sloty nezahadzovali.

#### 4. SlotWithBooking interface
Rozšíriť o `is_blocked`, `blocked_client_name`, `blocked_price`, `blocked_completed`.

#### 5. SlotDetailDialog — zobrazenie blokovaných slotov
Pre `is_blocked` sloty:
- Zobraziť šedý/fialový badge **"Externý klient"**
- Zobraziť meno klienta a cenu
- Akcie:
  - **"Odplávaný"** — nastaví `blocked_completed: true`, pridá cenu do financií
  - **"Zmazať blokáciu"** — vymaže slot

#### 6. Kalendárové zobrazenie (WeeklyCalendarGrid)
Blokované sloty sa zobrazia s odlišnou farbou (šedá/fialová) a ikonou zámku. Odplavané blokované sloty dostanú zelenú farbu (completed).

#### 7. Financie — useAdminFinances + useAdminDashboardStats
Pridať do výpočtu metriky "Zarobené" aj sumu z `training_slots WHERE is_blocked = true AND blocked_completed = true` v danom období. Rovnako pre dashboard "earned" metriku. Toto zabezpečí, že externé tréningy sa objavia v celkových príjmoch.

#### 8. Typy — types/database.ts
Rozšíriť `TrainingSlot` interface o nové stĺpce.

#### 9. RLS
Existujúce RLS na `training_slots` je dostatočné — admin má ALL prístup, klienti vidia len `is_available: true` sloty (blokované majú `is_available: false`, takže sú automaticky skryté).

### Flow
```text
Admin vytvára tréning
     │
     ├── Voľný slot (existujúce)
     ├── Klient z appky (existujúce)  
     └── Externý klient (NOVÉ)
           │
           ├── Zadá meno + cenu
           ├── Vytvorí blokovaný slot
           │
           └── V kalendári vidí slot s menom
                 │
                 ├── "Odplávaný" → blocked_completed = true
                 │                  → započíta sa do financií
                 └── "Zmazať" → vymaže slot
```

