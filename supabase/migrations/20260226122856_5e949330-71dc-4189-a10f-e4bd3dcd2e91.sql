CREATE OR REPLACE FUNCTION public.delete_proposed_slot(p_slot_id uuid, p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM bookings b
    JOIN profiles p ON p.id = b.client_id
    WHERE b.id = p_booking_id
      AND b.slot_id = p_slot_id
      AND p.user_id = auth.uid()
      AND b.status IN ('awaiting_confirmation', 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Neplatný booking alebo slot';
  END IF;

  UPDATE bookings 
  SET status = 'cancelled', 
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_booking_id;

  DELETE FROM training_slots WHERE id = p_slot_id;
END;
$$;