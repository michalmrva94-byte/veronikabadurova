
-- 1. Create new enums
CREATE TYPE public.client_type AS ENUM ('fixed', 'flexible');
CREATE TYPE public.client_approval_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Add columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN client_type public.client_type DEFAULT NULL,
  ADD COLUMN approval_status public.client_approval_status NOT NULL DEFAULT 'pending',
  ADD COLUMN approved_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN training_goal text DEFAULT NULL,
  ADD COLUMN preferred_days text DEFAULT NULL,
  ADD COLUMN flexibility_note text DEFAULT NULL;

-- 3. Set existing clients as approved (so they keep working)
UPDATE public.profiles SET approval_status = 'approved';

-- 4. Add new values to booking_status enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'proposed';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'awaiting_confirmation';

-- 5. Add columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN confirmation_deadline timestamp with time zone DEFAULT NULL,
  ADD COLUMN proposed_by uuid DEFAULT NULL;
