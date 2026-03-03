-- Create push_subscriptions table
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own subscription
CREATE POLICY "Users can insert own push subscription"
ON public.push_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscription
CREATE POLICY "Users can delete own push subscription"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Users can select their own subscription
CREATE POLICY "Users can select own push subscription"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can select all subscriptions
CREATE POLICY "Admins can select all push subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix reminder_sent: update nulls and set NOT NULL
UPDATE public.bookings SET reminder_sent = false WHERE reminder_sent IS NULL;
ALTER TABLE public.bookings ALTER COLUMN reminder_sent SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN reminder_sent SET DEFAULT false;