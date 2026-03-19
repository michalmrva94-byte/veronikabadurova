-- ============================================================
-- SwimDesk Phase 2 Migration
-- Parent profiles, swimmers, Paysy integration, push subs
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend existing tables
-- ------------------------------------------------------------

ALTER TABLE public.training_schedule
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Assign sequential sort_order to existing rows within each (club_id, day_of_week)
UPDATE public.training_schedule ts
SET sort_order = sub.rn
FROM (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY club_id, day_of_week ORDER BY start_time) AS rn
  FROM public.training_schedule
) sub
WHERE ts.id = sub.id;

ALTER TABLE public.competition_results
  ADD COLUMN IF NOT EXISTS import_batch_id UUID,
  ADD COLUMN IF NOT EXISTS import_source TEXT NOT NULL DEFAULT 'manual';

-- ------------------------------------------------------------
-- 2. parent_profiles
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_swimdesk_parent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only create a parent_profile when app = 'swimdesk'
  IF (NEW.raw_user_meta_data->>'app') = 'swimdesk' THEN
    INSERT INTO public.parent_profiles (user_id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.email, '')
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Guard the existing handle_new_user trigger to skip swimdesk users
-- (this function already exists in the Veronika Swim schema)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Skip Veronika Swim profile creation for SwimDesk users
  IF (NEW.raw_user_meta_data->>'app') = 'swimdesk' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop and re-create to ensure both triggers fire
DROP TRIGGER IF EXISTS on_auth_user_created_swimdesk ON auth.users;
CREATE TRIGGER on_auth_user_created_swimdesk
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_swimdesk_parent();

-- updated_at trigger for parent_profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_parent_profiles_updated_at ON public.parent_profiles;
CREATE TRIGGER set_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent can see own profile"
  ON public.parent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "parent can update own profile"
  ON public.parent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Club admins can read parent profiles for swimmers in their clubs
CREATE POLICY "club admin can read parent profiles"
  ON public.parent_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins ca
      JOIN public.swimmers sw ON sw.parent_id = parent_profiles.id
      WHERE ca.user_id = auth.uid() AND ca.club_id = sw.club_id
    )
  );

-- ------------------------------------------------------------
-- 3. swimmers
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.swimmers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  parent_id       UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  birth_year      INT,
  group_id        UUID REFERENCES public.training_groups(id) ON DELETE SET NULL,
  paysy_member_id TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_swimmers_updated_at ON public.swimmers;
CREATE TRIGGER set_swimmers_updated_at
  BEFORE UPDATE ON public.swimmers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.swimmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent can see own swimmers"
  ON public.swimmers FOR SELECT
  USING (
    parent_id IN (
      SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "parent can insert own swimmers"
  ON public.swimmers FOR INSERT
  WITH CHECK (
    parent_id IN (
      SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "parent can update own swimmers"
  ON public.swimmers FOR UPDATE
  USING (
    parent_id IN (
      SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "club admin can read all club swimmers"
  ON public.swimmers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = swimmers.club_id
    )
  );

CREATE POLICY "club admin or owner can delete swimmers"
  ON public.swimmers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = swimmers.club_id
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "club admin can update swimmers"
  ON public.swimmers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = swimmers.club_id
    )
  );

-- ------------------------------------------------------------
-- 4. paysy_import_batches
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.paysy_import_batches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  imported_by UUID NOT NULL REFERENCES auth.users(id),
  row_count   INT NOT NULL DEFAULT 0,
  filename    TEXT,
  season      TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.paysy_import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "club admin can manage import batches"
  ON public.paysy_import_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = paysy_import_batches.club_id
        AND role IN ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------
-- 5. paysy_member_status
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.paysy_member_status (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  swimmer_id      UUID REFERENCES public.swimmers(id) ON DELETE SET NULL,
  paysy_member_id TEXT NOT NULL,
  full_name_csv   TEXT NOT NULL,
  status          TEXT NOT NULL,
  season          TEXT,
  valid_until     DATE,
  override_status TEXT,
  override_note   TEXT,
  override_by     UUID REFERENCES auth.users(id),
  overridden_at   TIMESTAMPTZ,
  import_batch_id UUID NOT NULL REFERENCES public.paysy_import_batches(id),
  imported_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, paysy_member_id, import_batch_id)
);

DROP TRIGGER IF EXISTS set_paysy_member_status_updated_at ON public.paysy_member_status;
CREATE TRIGGER set_paysy_member_status_updated_at
  BEFORE UPDATE ON public.paysy_member_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.paysy_member_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent can read own swimmers paysy status"
  ON public.paysy_member_status FOR SELECT
  USING (
    swimmer_id IN (
      SELECT sw.id FROM public.swimmers sw
      JOIN public.parent_profiles pp ON pp.id = sw.parent_id
      WHERE pp.user_id = auth.uid()
    )
  );

CREATE POLICY "club admin can read all paysy status"
  ON public.paysy_member_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = paysy_member_status.club_id
    )
  );

CREATE POLICY "club admin can insert paysy status"
  ON public.paysy_member_status FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = paysy_member_status.club_id
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "club admin can update paysy status"
  ON public.paysy_member_status FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = paysy_member_status.club_id
        AND role IN ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------
-- 6. swimdesk_push_subscriptions
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.swimdesk_push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id      UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.swimdesk_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user manages own push subscriptions"
  ON public.swimdesk_push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "club admin can read push subscriptions"
  ON public.swimdesk_push_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE user_id = auth.uid() AND club_id = swimdesk_push_subscriptions.club_id
    )
  );

-- ------------------------------------------------------------
-- 7. club_admin_role helper function
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.club_admin_role(
  _user_id UUID,
  _club_id UUID
) RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM public.club_admins
  WHERE user_id = _user_id AND club_id = _club_id
  LIMIT 1
$$;
