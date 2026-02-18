
-- 1. Add debt_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS debt_balance NUMERIC DEFAULT 0;

-- 2. Migrate negative balances to debt
UPDATE public.profiles
SET debt_balance = ABS(balance), balance = 0
WHERE balance < 0;

-- 3. Add direction and paid_method to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS direction TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paid_method TEXT;

-- 4. Add no_show to transaction_type enum
ALTER TYPE public.transaction_type ADD VALUE IF NOT EXISTS 'no_show';

-- 5. Backfill direction on existing transactions
UPDATE public.transactions SET direction = 'in' WHERE type IN ('deposit', 'referral_bonus') AND direction IS NULL;
UPDATE public.transactions SET direction = 'out' WHERE type IN ('training', 'cancellation', 'manual_adjustment') AND amount < 0 AND direction IS NULL;

-- 6. Drop old process_booking_cancellation and create apply_charge
DROP FUNCTION IF EXISTS public.process_booking_cancellation(UUID, UUID, NUMERIC, INTEGER);

CREATE OR REPLACE FUNCTION public.apply_charge(
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
    
    UPDATE profiles SET balance = v_new_balance, updated_at = now() WHERE id = p_client_id;
    
    INSERT INTO transactions (client_id, type, amount, balance_after, description, booking_id, direction)
    VALUES (p_client_id, p_charge_type, -p_charge, v_new_balance, p_note, p_booking_id, 'out');
  ELSE
    v_from_credit := v_balance;
    v_to_debt := p_charge - v_balance;
    v_new_balance := 0;
    v_new_debt := v_debt + v_to_debt;
    
    UPDATE profiles 
    SET balance = 0, debt_balance = v_new_debt, updated_at = now()
    WHERE id = p_client_id;

    IF v_from_credit > 0 THEN
      INSERT INTO transactions (client_id, type, amount, balance_after, description, booking_id, direction)
      VALUES (p_client_id, p_charge_type, -v_from_credit, 0, p_note || ' (uhradené z kreditu)', p_booking_id, 'out');
    END IF;

    INSERT INTO transactions (client_id, type, amount, balance_after, description, booking_id, direction)
    VALUES (p_client_id, p_charge_type, -v_to_debt, 0, p_note || ' (vznikol dlh)', p_booking_id, 'debt_increase');
  END IF;
END;
$$;
