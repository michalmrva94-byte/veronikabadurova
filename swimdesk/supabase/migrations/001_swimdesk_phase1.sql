-- ============================================================
-- SwimDesk Phase 1 — Multi-club public website schema
-- ============================================================

-- ---- ENUM TYPES ----

CREATE TYPE public.club_admin_role AS ENUM ('owner', 'admin', 'editor');

CREATE TYPE public.swimmer_group AS ENUM (
  'benjamini',    -- ~6-9 rokov
  'ziaci',        -- ~10-12 rokov
  'juniori',      -- ~13-17 rokov
  'seniori'       -- 18+
);

CREATE TYPE public.swim_discipline AS ENUM (
  'volny',        -- voľný spôsob
  'znak',         -- znak
  'prsia',        -- prsia
  'motyl',        -- motýlik
  'kombinacia'    -- polohová kombinácia
);

CREATE TYPE public.day_of_week AS ENUM (
  'pondelok', 'utorok', 'streda', 'stvrtok',
  'piatok', 'sobota', 'nedela'
);

-- ---- CLUBS (multi-club root) ----

CREATE TABLE public.clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,           -- "pezinok" → /pezinok
  name             TEXT NOT NULL,                  -- "PK Pezinok"
  full_name        TEXT,                           -- "Plavecký klub Pezinok"
  founded_year     INTEGER,
  city             TEXT,
  country          TEXT NOT NULL DEFAULT 'SK',
  logo_url         TEXT,
  cover_image_url  TEXT,
  primary_color    TEXT NOT NULL DEFAULT '#0EA5E9',
  accent_color     TEXT NOT NULL DEFAULT '#0284C7',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active clubs"
  ON public.clubs FOR SELECT USING (is_active = true);

-- ---- CLUB CONTENT (CMS-lite) ----

CREATE TABLE public.club_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  section     TEXT NOT NULL,   -- 'hero_headline', 'hero_subline', 'about', 'contact_address', …
  content_sk  TEXT,
  content_en  TEXT,
  media_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, section)
);

ALTER TABLE public.club_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible content"
  ON public.club_content FOR SELECT USING (is_visible = true);

CREATE POLICY "Club admins manage content"
  ON public.club_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = club_content.club_id AND user_id = auth.uid()
    )
  );

-- ---- CLUB ADMINS ----

CREATE TABLE public.club_admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       club_admin_role NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see own membership"
  ON public.club_admins FOR SELECT USING (user_id = auth.uid());

-- ---- COACHES ----

CREATE TABLE public.coaches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id          UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  title            TEXT,             -- "Hlavný tréner", "Asistent trénera"
  bio_sk           TEXT,
  photo_url        TEXT,
  specialization   swim_discipline[],
  groups           swimmer_group[],
  email            TEXT,
  phone            TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active coaches"
  ON public.coaches FOR SELECT USING (is_active = true);

CREATE POLICY "Club admins manage coaches"
  ON public.coaches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = coaches.club_id AND user_id = auth.uid()
    )
  );

-- ---- TRAINING GROUPS ----

CREATE TABLE public.training_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  slug         swimmer_group NOT NULL,
  display_name TEXT NOT NULL,
  age_from     INTEGER,
  age_to       INTEGER,
  description_sk TEXT,
  color        TEXT,
  icon_emoji   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, slug)
);

ALTER TABLE public.training_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active groups"
  ON public.training_groups FOR SELECT USING (is_active = true);

CREATE POLICY "Club admins manage groups"
  ON public.training_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = training_groups.club_id AND user_id = auth.uid()
    )
  );

-- ---- TRAINING SCHEDULE ----

CREATE TABLE public.training_schedule (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  group_id    UUID NOT NULL REFERENCES public.training_groups(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  location    TEXT,
  pool_lane   TEXT,
  coach_id    UUID REFERENCES public.coaches(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.training_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active schedule"
  ON public.training_schedule FOR SELECT USING (is_active = true);

CREATE POLICY "Club admins manage schedule"
  ON public.training_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = training_schedule.club_id AND user_id = auth.uid()
    )
  );

-- ---- NEWS ----

CREATE TABLE public.news (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  title_sk        TEXT NOT NULL,
  body_sk         TEXT NOT NULL,
  cover_image_url TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published    BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(club_id, slug)
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published news"
  ON public.news FOR SELECT USING (is_published = true);

CREATE POLICY "Club admins manage news"
  ON public.news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = news.club_id AND user_id = auth.uid()
    )
  );

-- ---- COMPETITION RESULTS ----

CREATE TABLE public.competition_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id           UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  competition_name  TEXT NOT NULL,
  competition_date  DATE NOT NULL,
  location          TEXT,
  swimmer_name      TEXT NOT NULL,
  group_id          UUID REFERENCES public.training_groups(id) ON DELETE SET NULL,
  discipline        swim_discipline NOT NULL,
  distance_m        INTEGER NOT NULL,
  result_time_ms    INTEGER NOT NULL,   -- milisekundy (plavecká presnosť)
  place             INTEGER,
  is_personal_record BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.competition_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read results"
  ON public.competition_results FOR SELECT USING (true);

CREATE POLICY "Club admins manage results"
  ON public.competition_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.club_admins
      WHERE club_id = competition_results.club_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- SEED — PK Pezinok (pilot klub)
-- ============================================================

INSERT INTO public.clubs (slug, name, full_name, founded_year, city, primary_color, accent_color)
VALUES ('pezinok', 'PK Pezinok', 'Plavecký klub Pezinok', 1978, 'Pezinok', '#0EA5E9', '#0284C7');

-- CMS content blocks for PK Pezinok
WITH club AS (SELECT id FROM public.clubs WHERE slug = 'pezinok')
INSERT INTO public.club_content (club_id, section, content_sk) VALUES
  ((SELECT id FROM club), 'hero_headline',   'Plávame s vášňou od roku 1978'),
  ((SELECT id FROM club), 'hero_subline',    'Plavecký klub Pezinok — tréningy, preteky, komunita. Pridaj sa k nám.'),
  ((SELECT id FROM club), 'about',           'PK Pezinok je jeden z najstarších plaveckých klubov na Slovensku. Vychoval desiatky reprezentantov a stovky plaveckých nadšencov. Trénujeme v krytej 25-metrovej bazéne v Pezinku, od prípravky až po seniorov.'),
  ((SELECT id FROM club), 'contact_address', 'Športová 1, 902 01 Pezinok'),
  ((SELECT id FROM club), 'contact_email',   'info@pkpezinok.sk'),
  ((SELECT id FROM club), 'contact_phone',   '+421 905 000 000');

-- Training groups
WITH club AS (SELECT id FROM public.clubs WHERE slug = 'pezinok')
INSERT INTO public.training_groups (club_id, slug, display_name, age_from, age_to, description_sk, color, icon_emoji, sort_order)
VALUES
  ((SELECT id FROM club), 'benjamini', 'Benjamíni',  6,  9, 'Prípravka — prvé kroky vo vode. Dôraz na techniku a lásku k plávaniu.', '#22D3EE', '🐠', 1),
  ((SELECT id FROM club), 'ziaci',     'Žiaci',      10, 12, 'Základná tréningová skupina — rozvoj techniky všetkých spôsobov.', '#0EA5E9', '🐬', 2),
  ((SELECT id FROM club), 'juniori',   'Juniori',    13, 17, 'Výkonnostná skupina — preteky, osobné rekordy, SZPS.', '#0284C7', '🦈', 3),
  ((SELECT id FROM club), 'seniori',   'Seniori',    18, NULL,'Dospelí plavci — výkonnostné aj rekreačné tréningy.', '#1E40AF', '🏊', 4);
