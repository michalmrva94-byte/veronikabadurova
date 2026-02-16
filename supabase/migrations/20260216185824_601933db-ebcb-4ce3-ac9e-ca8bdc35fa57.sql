
CREATE OR REPLACE FUNCTION public.get_referrer_name(code TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT full_name FROM public.profiles WHERE referral_code = code LIMIT 1;
$$;
