
-- Update handle_new_user to save onboarding fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    referral_profile_id UUID;
    new_referral_code TEXT;
BEGIN
    -- Generate unique referral code
    LOOP
        new_referral_code := public.generate_referral_code();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code);
    END LOOP;

    -- Create profile with onboarding fields
    INSERT INTO public.profiles (user_id, email, full_name, referral_code, training_goal, preferred_days, flexibility_note, approval_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        new_referral_code,
        NEW.raw_user_meta_data->>'training_goal',
        NEW.raw_user_meta_data->>'preferred_days',
        NEW.raw_user_meta_data->>'flexibility_note',
        'pending'
    );

    -- Assign client role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');

    RETURN NEW;
END;
$function$;
