

# Plan: Kredit/Dlh model s rezervaciou bez blokovania

## Prehlad zmien

Tento plan implementuje model, kde rezervacia nie je nikdy blokovana pre nizky kredit. Po treningu alebo storne sa najprv minie kredit a zvysok sa zapise ako dlh. Klient vidi obe hodnoty (kredit aj dlh) v dashboarde aj vo financiach.

---

## 1. Databazove zmeny (migrace)

### A) Nove pole na `profiles`
- Pridat `debt_balance NUMERIC DEFAULT 0` -- nezaplatene zavazky (vzdy >= 0)
- Existujuce `balance` pole sa premapuje na "kredit" (vzdy >= 0 po migracii)

### B) Migracia existujucich dat
- Kde `balance < 0`: presuneme absolutnu hodnotu do `debt_balance`, nastavime `balance = 0`
- Kde `balance >= 0`: `debt_balance` zostane 0

### C) Nove polia na `transactions`
- `direction TEXT` -- hodnoty: 'in', 'out', 'debt_increase', 'debt_decrease'
- `paid_method TEXT` -- hodnoty: 'cash', 'bank_transfer', 'other' (nullable)
- Pridat `no_show` do enum `transaction_type`

### D) Nova databazova funkcia `apply_charge`
- `apply_charge(p_client_id UUID, p_booking_id UUID, p_charge_type transaction_type, p_charge NUMERIC, p_note TEXT)`
- SECURITY DEFINER funkcia, ktora:
  1. Nacita `balance` a `debt_balance`
  2. Ak `balance >= charge`: odpocita z balance, vytvori transakciu s direction='out'
  3. Ak `balance < charge`: minie vsetok kredit (transakcia direction='out'), zvysok prida do debt_balance (transakcia direction='debt_increase')
  4. Aktualizuje profil

### E) Aktualizacia existujucej `process_booking_cancellation`
- Prepisat na pouzitie novej logiky apply_charge (alebo ju nahradit volanim apply_charge)

---

## 2. Frontend zmeny -- Rezervacny flow (CalendarPage + BookingConfirmDialog)

### A) Upozornenie pred rezervaciou pri nizkom kredite
- V `CalendarPage.tsx` / `handleSlotClick`: skontrolovat `profile.balance` vs `DEFAULT_TRAINING_PRICE`
- Ak kredit < cena: zobrazit info dialog (nie error) s textom:
  - Nadpis: "Nedostatok kreditu"
  - Text: "Nemate dostatocny kredit. Po absolvovani treningu vznikne zavazok vo vyske {missing} EUR."
  - Tlacidla: "Pokracovat" (primary) + "Zrusit" (secondary)
- Ak klient potvrdi, pokracovat normalne s vytvorenim bookingu
- Novy komponent `LowCreditWarningDialog.tsx`

### B) BookingConfirmDialog
- Pridat info riadok zobrazujuci aktualny kredit klienta

---

## 3. Frontend zmeny -- Klientsky Dashboard

### A) DashboardPage.tsx
- Zobrazit 2 oddelene hodnoty:
  1. **Kredit** (balance) -- zelena karta
  2. **Nezaplatene** (debt_balance) -- cervena karta, len ak > 0
- Ak debt > 0, zobrazit nenapadny info text: "Mate nezaplateny zostatok X EUR"
- Aktualizovat `AuthContext` aby nacitaval aj `debt_balance` z profilu

---

## 4. Frontend zmeny -- Financie klienta (FinancesPage)

### A) Filter chips
- Pridat horizontalne filter chips: Vsetko | Vklady | Treningy | Poplatky | Dlh
- Filtrovat podla `transaction.type` a `transaction.direction`

### B) Paginacia
- Zobrazit prvych 20 transakcii
- Tlacidlo "Nacitat viac" na konci zoznamu
- Upravit `useTransactions` hook na podporu paginacie (offset/limit)

### C) Dlh sekcia
- Pod zostatkom zobrazit aj `debt_balance` ak > 0

---

## 5. Backend logika -- useCompleteTraining refactor

### A) `completeTraining` mutacia
- Namiesto manualneho odpoctu volat novu RPC funkciu `apply_charge`
- Parametry: client_id, booking_id, 'training', price, "Trening absolvovany"
- Notifikacia zostava rovnaka

### B) `markNoShow` mutacia  
- Volat `apply_charge` s typom 'no_show' a 100% cenou
- Notifikacia aktualizovana

---

## 6. Backend logika -- useClientBookings (storno)

### A) `cancelBooking` mutacia
- Po vypocte storno poplatku volat `apply_charge` cez RPC namiesto `process_booking_cancellation`
- Alebo aktualizovat `process_booking_cancellation` aby interne pouzivala apply_charge logiku

---

## 7. Backend logika -- useAddCredit (admin vklad)

### A) Aktualizovat na:
- Navysit iba `balance` (kredit), NEODPOCITAT automaticky dlh
- Vytvorit transakciu s `direction = 'in'` a `paid_method` podla vyberu
- UI pre admin "Pridat kredit" uz ma vyber typu platby (prevod/hotovost/iny), namapovat na `paid_method`

---

## 8. Admin Financie

### A) "Klienti s dlhom" sekcia
- Aktualizovat `useClientsWithDebt` -- filtrovanie podla `debt_balance > 0` namiesto `balance < 0`
- Zobrazit debt_balance v karte klienta

### B) KPI "Dlhy klientov"
- Aktualizovat na suct `debt_balance` namiesto suctu negativnych `balance`

---

## 9. Aktualizacia typov

### A) `src/types/database.ts`
- Pridat `debt_balance` do `Profile` interface
- Pridat `no_show` do `TransactionType`
- Pridat `direction` a `paid_method` do `Transaction` interface

### B) `src/lib/constants.ts`
- Pridat `no_show: 'Neúčasť'` do `TRANSACTION_LABELS`

---

## Technicke detaily

### Databazova funkcia apply_charge (SQL)

```text
CREATE OR REPLACE FUNCTION apply_charge(
  p_client_id UUID,
  p_booking_id UUID,
  p_charge_type transaction_type,
  p_charge NUMERIC,
  p_note TEXT
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_balance NUMERIC;
  v_debt NUMERIC;
  v_from_credit NUMERIC;
  v_to_debt NUMERIC;
  v_new_balance NUMERIC;
  v_new_debt NUMERIC;
BEGIN
  IF p_charge <= 0 THEN RETURN; END IF;

  SELECT COALESCE(balance, 0), COALESCE(debt_balance, 0)
  INTO v_balance, v_debt
  FROM profiles WHERE id = p_client_id FOR UPDATE;

  IF v_balance >= p_charge THEN
    v_new_balance := v_balance - p_charge;
    v_new_debt := v_debt;
    
    UPDATE profiles SET balance = v_new_balance WHERE id = p_client_id;
    
    INSERT INTO transactions (client_id, type, amount, balance_after, 
      description, booking_id, direction)
    VALUES (p_client_id, p_charge_type, -p_charge, v_new_balance, 
      p_note, p_booking_id, 'out');
  ELSE
    v_from_credit := v_balance;
    v_to_debt := p_charge - v_balance;
    v_new_balance := 0;
    v_new_debt := v_debt + v_to_debt;
    
    UPDATE profiles 
    SET balance = 0, debt_balance = v_new_debt 
    WHERE id = p_client_id;

    IF v_from_credit > 0 THEN
      INSERT INTO transactions (client_id, type, amount, balance_after, 
        description, booking_id, direction)
      VALUES (p_client_id, p_charge_type, -v_from_credit, 0, 
        p_note || ' (uhradené z kreditu)', p_booking_id, 'out');
    END IF;

    INSERT INTO transactions (client_id, type, amount, balance_after, 
      description, booking_id, direction)
    VALUES (p_client_id, p_charge_type, -v_to_debt, v_new_balance, 
      p_note || ' (vznikol dlh)', p_booking_id, 'debt_increase');
  END IF;
END;
$$;
```

### Poradie implementacie

1. Databazova migracia (schema + data + funkcia)
2. Aktualizacia typov a konstant
3. AuthContext -- nacitanie debt_balance
4. useCompleteTraining + useClientBookings -- prepojenie na apply_charge
5. useAddCredit -- aktualizacia s paid_method
6. LowCreditWarningDialog + CalendarPage -- upozornenie pred rezervaciou
7. DashboardPage -- zobrazenie kreditu a dlhu
8. FinancesPage -- filter chips + paginacia + dlh zobrazenie
9. Admin Financie -- aktualizacia dlhov

### Subory na vytvorenie
- `src/components/client/LowCreditWarningDialog.tsx`

### Subory na upravu
- `src/types/database.ts`
- `src/lib/constants.ts`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useCompleteTraining.ts`
- `src/hooks/useClientBookings.ts`
- `src/hooks/useAddCredit.ts`
- `src/hooks/useTransactions.ts`
- `src/hooks/useAdminFinances.ts`
- `src/pages/client/CalendarPage.tsx`
- `src/pages/client/DashboardPage.tsx`
- `src/pages/client/FinancesPage.tsx`
- `src/pages/admin/AdminFinancesPage.tsx`
- `src/components/client/BookingConfirmDialog.tsx`

