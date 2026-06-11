-- ============================================================================
-- 00009_dream_journey.sql
-- Beautifio — Dream Journey System
--
-- Replaces: Roadmap, Journal, Daily Wins, Life Engine,
--           Growth Tracker, Reflections, Life Capital
--
-- One unified system: Dream → Big Wins → Small Wins → Daily Activities
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- dream_templates
-- Pre-built journey templates (seed data from roadmaps)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE dream_templates (
  slug              TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  emoji             TEXT,
  color             TEXT,
  category          TEXT NOT NULL,
  duration          TEXT,
  description       TEXT,
  why_matters       TEXT,
  career_options    TEXT[],
  success_examples  JSONB,       -- [{name, role, story}]
  big_wins          JSONB NOT NULL,    -- [{title, description, why_it_matters, alternative_path, order}]
  small_wins        JSONB NOT NULL,    -- [{big_win_title, title, description, order}]
  daily_activities  JSONB,             -- {spiritual, physical, knowledge, social, character, dream_skill}
  alternative_futures JSONB,           -- [{title, description, skills[]}]
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dream_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dream templates are public" ON dream_templates
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- dream_journeys
-- One active journey per user, supports pivoting
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE dream_journeys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_slug   TEXT NOT NULL REFERENCES dream_templates(slug),
  title           TEXT NOT NULL,
  emoji           TEXT,
  category        TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'pivoted')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dream_journeys_user ON dream_journeys(user_id);
CREATE INDEX idx_dream_journeys_user_active ON dream_journeys(user_id) WHERE status = 'active';

ALTER TABLE dream_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journeys" ON dream_journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journeys" ON dream_journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON dream_journeys
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- previous_dreams
-- Pivot history — preserves past journeys
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE previous_dreams (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_journey_id  UUID REFERENCES dream_journeys(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  emoji             TEXT,
  category          TEXT,
  pivot_reason      TEXT,
  transferable_skills TEXT[],
  lessons_learned   TEXT,
  alternative_path  TEXT,
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_previous_dreams_user ON previous_dreams(user_id);

ALTER TABLE previous_dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own previous dreams" ON previous_dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own previous dreams" ON previous_dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- big_wins
-- Major milestones within a journey
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE big_wins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id       UUID NOT NULL REFERENCES dream_journeys(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  why_it_matters   TEXT,
  alternative_path TEXT,        -- what to do if this path doesn't work out
  order_index      INT NOT NULL DEFAULT 0,
  is_completed     BOOLEAN NOT NULL DEFAULT false,
  is_failed        BOOLEAN NOT NULL DEFAULT false,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_big_wins_journey ON big_wins(journey_id, order_index);

ALTER TABLE big_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own big wins" ON big_wins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM dream_journeys WHERE id = big_wins.journey_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own big wins" ON big_wins
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM dream_journeys WHERE id = big_wins.journey_id AND user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────────────────
-- small_wins
-- Sub-milestones within a big win
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE small_wins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  big_win_id     UUID NOT NULL REFERENCES big_wins(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  is_completed   BOOLEAN NOT NULL DEFAULT false,
  completed_at   TIMESTAMPTZ,
  notes          TEXT,
  reflection     TEXT,
  evidence_url   TEXT,              -- link to photo / screenshot / document
  order_index    INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_small_wins_big_win ON small_wins(big_win_id, order_index);

ALTER TABLE small_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own small wins" ON small_wins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM big_wins b JOIN dream_journeys j ON b.journey_id = j.id WHERE b.id = small_wins.big_win_id AND j.user_id = auth.uid())
  );

CREATE POLICY "Users can update own small wins" ON small_wins
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM big_wins b JOIN dream_journeys j ON b.journey_id = j.id WHERE b.id = small_wins.big_win_id AND j.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────────────────
-- daily_activities
-- 6 dimensions: spiritual, physical, knowledge, social, character, dream_skill
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE daily_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id      UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  dimension       TEXT NOT NULL
                    CHECK (dimension IN ('spiritual', 'physical', 'knowledge', 'social', 'character', 'dream_skill')),
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at    TIMESTAMPTZ,
  activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_custom       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_activities_user_date ON daily_activities(user_id, activity_date);
CREATE INDEX idx_daily_activities_journey_date ON daily_activities(journey_id, activity_date);

ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activities" ON daily_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily activities" ON daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activities" ON daily_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- daily_reflections
-- One per user per day: learned, grateful, improve
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE daily_reflections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id   UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  learned      TEXT,
  grateful     TEXT,
  improve      TEXT,
  mood         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_reflections_journey ON daily_reflections(journey_id, date);

ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- small_win_reflections
-- Reflection triggered when a small win is completed
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE small_win_reflections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  small_win_id UUID NOT NULL REFERENCES small_wins(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE small_win_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own small win reflections" ON small_win_reflections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM small_wins sw JOIN big_wins b ON sw.big_win_id = b.id JOIN dream_journeys j ON b.journey_id = j.id WHERE sw.id = small_win_reflections.small_win_id AND j.user_id = auth.uid())
  );

CREATE POLICY "Users can create own small win reflections" ON small_win_reflections
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM small_wins sw JOIN big_wins b ON sw.big_win_id = b.id JOIN dream_journeys j ON b.journey_id = j.id WHERE sw.id = small_win_reflections.small_win_id AND j.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────────────────
-- big_win_reflections
-- Reflection triggered when a big win is completed
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE big_win_reflections (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  big_win_id           UUID NOT NULL REFERENCES big_wins(id) ON DELETE CASCADE,
  most_memorable_moment TEXT,
  who_helped            TEXT,
  biggest_lesson        TEXT,
  next_steps            TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE big_win_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own big win reflections" ON big_win_reflections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM big_wins b JOIN dream_journeys j ON b.journey_id = j.id WHERE b.id = big_win_reflections.big_win_id AND j.user_id = auth.uid())
  );

CREATE POLICY "Users can create own big win reflections" ON big_win_reflections
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM big_wins b JOIN dream_journeys j ON b.journey_id = j.id WHERE b.id = big_win_reflections.big_win_id AND j.user_id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────────────────────
-- spiritual_preferences
-- User's belief and selected practices
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE spiritual_preferences (
  user_id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  belief             TEXT NOT NULL
                       CHECK (belief IN ('islam', 'kristen', 'katholik', 'hindu', 'buddha', 'konghucu', 'agnostic', 'other')),
  selected_practices TEXT[],     -- subset of available practices they want to track
  custom_practices   TEXT[],     -- user-created practices
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE spiritual_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spiritual preferences" ON spiritual_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spiritual preferences" ON spiritual_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spiritual preferences" ON spiritual_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- growth_timeline_events
-- Unified timeline of all journey activity
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE growth_timeline_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id      UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                      'activity_completed', 'reflection_written',
                      'small_win_completed', 'big_win_completed',
                      'big_win_failed', 'journey_pivoted',
                      'circle_joined', 'mentor_interaction'
                    )),
  title           TEXT NOT NULL,
  description     TEXT,
  reference_id    UUID,         -- id of the related entity
  reference_type  TEXT,         -- 'daily_activities', 'daily_reflections', 'small_wins', 'big_wins', etc.
  metadata        JSONB,
  event_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_user_date ON growth_timeline_events(user_id, event_date DESC);
CREATE INDEX idx_timeline_journey ON growth_timeline_events(journey_id, event_date DESC);

ALTER TABLE growth_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline" ON growth_timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert timeline events" ON growth_timeline_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
