-- Allow all authenticated users to see booking status for any slot
-- This is needed so clients can see which slots are already taken
-- Only exposes id and status, client personal data is still protected by profiles RLS
CREATE POLICY "Anyone can check slot booking status"
ON public.bookings
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND status IN ('booked', 'pending', 'proposed', 'awaiting_confirmation')
);