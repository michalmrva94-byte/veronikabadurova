-- Drop the existing unique constraint on slot_id
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_slot_id_key;

-- Create a partial unique index that only enforces uniqueness for active bookings
CREATE UNIQUE INDEX bookings_slot_id_active_unique 
ON public.bookings (slot_id) 
WHERE status NOT IN ('cancelled', 'no_show');