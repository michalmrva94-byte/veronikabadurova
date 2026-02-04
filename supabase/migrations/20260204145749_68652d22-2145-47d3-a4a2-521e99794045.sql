-- ============================================
-- VERONIKA SWIM - Complete Database Schema
-- ============================================

-- 1. Create ENUM types
CREATE TYPE public.app_role AS ENUM ('client', 'admin');
CREATE TYPE public.booking_status AS ENUM ('booked', 'cancelled', 'completed', 'no_show');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'training', 'cancellation', 'referral_bonus', 'manual_adjustment');

-- ============================================
-- 2. Create user_roles table (CRITICAL: separate from profiles)
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Create has_role security definer function
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- ============================================
-- 4. Create profiles table
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create app_settings table (for admin-configurable settings)
-- ============================================
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Insert default training price
INSERT INTO public.app_settings (key, value, description) 
VALUES ('training_price', '25.00', 'Cena tréningu v eurách');

-- ============================================
-- 6. Create training_slots table
-- ============================================
CREATE TABLE public.training_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurring_day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
    recurring_start_time TIME,
    recurring_end_time TIME,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_slots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. Create bookings table
-- ============================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES public.training_slots(id) ON DELETE CASCADE NOT NULL,
    status booking_status DEFAULT 'booked',
    price DECIMAL(10,2) NOT NULL,
    cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    is_last_minute BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(slot_id) -- One booking per slot
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. Create transactions table (financial ledger)
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    booking_id UUID REFERENCES public.bookings(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. Create referral_rewards table
-- ============================================
CREATE TABLE public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    first_training_completed BOOLEAN DEFAULT false,
    reward_credited BOOLEAN DEFAULT false,
    reward_amount DECIMAL(10,2) DEFAULT 25.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(referred_id)
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. Create notifications table (in-app)
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    is_last_minute BOOLEAN DEFAULT false,
    related_slot_id UUID REFERENCES public.training_slots(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. Create updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_slots_updated_at
    BEFORE UPDATE ON public.training_slots
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. RLS Policies for user_roles
-- ============================================
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 13. RLS Policies for profiles
-- ============================================
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 14. RLS Policies for app_settings
-- ============================================
CREATE POLICY "Anyone authenticated can read settings"
    ON public.app_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify settings"
    ON public.app_settings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 15. RLS Policies for training_slots
-- ============================================
CREATE POLICY "Anyone authenticated can view available slots"
    ON public.training_slots FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage training slots"
    ON public.training_slots FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 16. RLS Policies for bookings
-- ============================================
CREATE POLICY "Clients can view their own bookings"
    ON public.bookings FOR SELECT
    USING (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all bookings"
    ON public.bookings FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can create their own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all bookings"
    ON public.bookings FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 17. RLS Policies for transactions
-- ============================================
CREATE POLICY "Clients can view their own transactions"
    ON public.transactions FOR SELECT
    USING (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all transactions"
    ON public.transactions FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 18. RLS Policies for referral_rewards
-- ============================================
CREATE POLICY "Users can view their referral rewards"
    ON public.referral_rewards FOR SELECT
    USING (
        referrer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        referred_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can view all referral rewards"
    ON public.referral_rewards FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create referral rewards"
    ON public.referral_rewards FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update referral rewards"
    ON public.referral_rewards FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 19. RLS Policies for notifications
-- ============================================
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 20. Helper function to generate referral code
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- ============================================
-- 21. Function to create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    referral_profile_id UUID;
    new_referral_code TEXT;
BEGIN
    -- Generate unique referral code
    LOOP
        new_referral_code := public.generate_referral_code();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_referral_code);
    END LOOP;

    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, referral_code)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        new_referral_code
    );

    -- Assign client role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');

    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 22. Function to get user's profile id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;