-- Zmeniť default hodnotu pre nové bookings na 'pending'
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';