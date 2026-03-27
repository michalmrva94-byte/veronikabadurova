-- ============================================
-- SwimDesk Coach - Foundation Schema
-- ============================================

-- 1. CLUBS
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES (coaches/admins linked to auth.users)
CREATE TABLE IF NOT EXISTS public.sd_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'coach')),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sd_profiles ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS sd_profiles_user_id_idx ON public.sd_profiles(user_id);

-- 3. GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  coach_id uuid REFERENCES public.sd_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- 4. SWIMMERS
CREATE TABLE IF NOT EXISTS public.swimmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_year int,
  gender text CHECK (gender IN ('M', 'F')),
  paysy_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.swimmers ENABLE ROW LEVEL SECURITY;

-- 5. DISCIPLINES
CREATE TABLE IF NOT EXISTS public.disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  distance int NOT NULL,
  stroke text NOT NULL,
  pool_size int NOT NULL CHECK (pool_size IN (25, 50))
);
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- 6. SZPS LIMITS
CREATE TABLE IF NOT EXISTS public.szps_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
  category text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('M', 'F')),
  competition text NOT NULL,
  valid_year int NOT NULL,
  time_seconds numeric NOT NULL
);
ALTER TABLE public.szps_limits ENABLE ROW LEVEL SECURITY;

-- 7. PERSONAL RECORDS
CREATE TABLE IF NOT EXISTS public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES public.swimmers(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
  time_seconds numeric NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  pool_size int NOT NULL CHECK (pool_size IN (25, 50)),
  competition_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- 8. WORKOUTS
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  coach_id uuid REFERENCES public.sd_profiles(id) ON DELETE SET NULL,
  workout_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('vytrvalost', 'rychlost', 'technika', 'zavod', 'zmiesany')),
  title text NOT NULL DEFAULT '',
  total_meters int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- 9. WORKOUT SETS
CREATE TABLE IF NOT EXISTS public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  set_order int NOT NULL DEFAULT 0,
  phase text NOT NULL CHECK (phase IN ('rozcvicka', 'hlavna', 'upokojenie')),
  description text NOT NULL DEFAULT '',
  meters int NOT NULL DEFAULT 0,
  intensity text NOT NULL CHECK (intensity IN ('nizka', 'stredna', 'vysoka')),
  duration_min int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- 10. SEASON PLANS
CREATE TABLE IF NOT EXISTS public.season_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES public.swimmers(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
  target_time_seconds numeric NOT NULL,
  weeks int NOT NULL DEFAULT 12,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  ai_plan_json jsonb,
  created_by uuid REFERENCES public.sd_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.season_plans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Clubs: users can see their own club
CREATE POLICY "Users see own club" ON public.clubs
  FOR SELECT USING (
    id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create club" ON public.clubs
  FOR INSERT WITH CHECK (true);

-- SD Profiles
CREATE POLICY "Users see own profile" ON public.sd_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users see club profiles" ON public.sd_profiles
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own profile" ON public.sd_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.sd_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Groups: club members can see, admin/coach can manage
CREATE POLICY "Club members see groups" ON public.groups
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Club admin/coach manage groups" ON public.groups
  FOR ALL USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

-- Swimmers: club members can see, admin/coach can manage
CREATE POLICY "Club members see swimmers" ON public.swimmers
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Club admin/coach manage swimmers" ON public.swimmers
  FOR ALL USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

-- Disciplines: everyone can read
CREATE POLICY "Anyone can read disciplines" ON public.disciplines
  FOR SELECT USING (true);

-- SZPS Limits: everyone can read
CREATE POLICY "Anyone can read szps_limits" ON public.szps_limits
  FOR SELECT USING (true);

-- Personal Records: club members can see/manage
CREATE POLICY "Club members see personal_records" ON public.personal_records
  FOR SELECT USING (
    swimmer_id IN (
      SELECT id FROM public.swimmers
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Club members manage personal_records" ON public.personal_records
  FOR ALL USING (
    swimmer_id IN (
      SELECT id FROM public.swimmers
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

-- Workouts: club members see, admin/coach manage
CREATE POLICY "Club members see workouts" ON public.workouts
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Club admin/coach manage workouts" ON public.workouts
  FOR ALL USING (
    club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
  );

-- Workout Sets: via workout access
CREATE POLICY "Club members see workout_sets" ON public.workout_sets
  FOR SELECT USING (
    workout_id IN (
      SELECT id FROM public.workouts
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Club members manage workout_sets" ON public.workout_sets
  FOR ALL USING (
    workout_id IN (
      SELECT id FROM public.workouts
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

-- Season Plans: club members
CREATE POLICY "Club members see season_plans" ON public.season_plans
  FOR SELECT USING (
    swimmer_id IN (
      SELECT id FROM public.swimmers
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Club members manage season_plans" ON public.season_plans
  FOR ALL USING (
    swimmer_id IN (
      SELECT id FROM public.swimmers
      WHERE club_id IN (SELECT club_id FROM public.sd_profiles WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- SEED DATA: DISCIPLINES
-- ============================================

INSERT INTO public.disciplines (code, name, distance, stroke, pool_size) VALUES
  -- Voľný štýl 25m
  ('50VS25', '50m voľný štýl', 50, 'volny', 25),
  ('100VS25', '100m voľný štýl', 100, 'volny', 25),
  ('200VS25', '200m voľný štýl', 200, 'volny', 25),
  ('400VS25', '400m voľný štýl', 400, 'volny', 25),
  ('800VS25', '800m voľný štýl', 800, 'volny', 25),
  ('1500VS25', '1500m voľný štýl', 1500, 'volny', 25),
  -- Voľný štýl 50m
  ('50VS50', '50m voľný štýl', 50, 'volny', 50),
  ('100VS50', '100m voľný štýl', 100, 'volny', 50),
  ('200VS50', '200m voľný štýl', 200, 'volny', 50),
  ('400VS50', '400m voľný štýl', 400, 'volny', 50),
  -- Znak 25m
  ('50ZN25', '50m znak', 50, 'znak', 25),
  ('100ZN25', '100m znak', 100, 'znak', 25),
  ('200ZN25', '200m znak', 200, 'znak', 25),
  -- Prsia 25m
  ('50PR25', '50m prsia', 50, 'prsia', 25),
  ('100PR25', '100m prsia', 100, 'prsia', 25),
  ('200PR25', '200m prsia', 200, 'prsia', 25),
  -- Motýlik 25m
  ('50MO25', '50m motýlik', 50, 'motylik', 25),
  ('100MO25', '100m motýlik', 100, 'motylik', 25),
  ('200MO25', '200m motýlik', 200, 'motylik', 25),
  -- Polohový 25m
  ('100PO25', '100m polohový', 100, 'polohovy', 25),
  ('200PO25', '200m polohový', 200, 'polohovy', 25),
  ('400PO25', '400m polohový', 400, 'polohovy', 25)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SEED DATA: SZPS LIMITS 2026 - MSR_ziaci (starsiziaci)
-- ============================================

-- Helper: insert limits by discipline code
DO $$
DECLARE
  v_disc_id uuid;
BEGIN
  -- CHLAPCI (M)
  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 31.50);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 68.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '200VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 148.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50ZN25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 37.50);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100ZN25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 82.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50PR25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 40.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100PR25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 88.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50MO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 36.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100MO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 84.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '200PO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 158.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '400PO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'M', 'MSR_ziaci', 2026, 340.00);

  -- DIEVČATÁ (F)
  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 33.50);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 73.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '200VS25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 158.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50ZN25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 39.50);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100ZN25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 87.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50PR25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 43.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100PR25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 95.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '50MO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 38.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '100MO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 91.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '200PO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 168.00);

  SELECT id INTO v_disc_id FROM public.disciplines WHERE code = '400PO25';
  INSERT INTO public.szps_limits (discipline_id, category, gender, competition, valid_year, time_seconds) VALUES (v_disc_id, 'starsiziaci', 'F', 'MSR_ziaci', 2026, 360.00);
END $$;
