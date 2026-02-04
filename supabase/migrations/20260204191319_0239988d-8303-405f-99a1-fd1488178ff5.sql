-- Create a function to handle cancellation with fee deduction
-- This function runs with SECURITY DEFINER to bypass RLS for transaction creation
CREATE OR REPLACE FUNCTION public.process_booking_cancellation(
  p_booking_id UUID,
  p_client_id UUID,
  p_cancellation_fee NUMERIC,
  p_fee_percentage INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Only process if there's a fee
  IF p_cancellation_fee > 0 THEN
    -- Get current balance
    SELECT balance INTO current_balance
    FROM profiles
    WHERE id = p_client_id;
    
    -- Calculate new balance
    new_balance := COALESCE(current_balance, 0) - p_cancellation_fee;
    
    -- Update balance
    UPDATE profiles
    SET balance = new_balance, updated_at = now()
    WHERE id = p_client_id;
    
    -- Create transaction record
    INSERT INTO transactions (client_id, type, amount, balance_after, description, booking_id)
    VALUES (
      p_client_id,
      'cancellation',
      -p_cancellation_fee,
      new_balance,
      'Storno poplatok za tréning (' || p_fee_percentage || '%)',
      p_booking_id
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_booking_cancellation TO authenticated;