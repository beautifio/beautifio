-- ============================================================================
-- 00018_benchmark_phases.sql
-- Beautifio — Benchmark-based Phase System
-- 
-- Bagian A: Kolom baru di dream_templates
-- Bagian B: Tabel dream_phases (fase per mimpi)
-- Bagian C: Tabel small_win_templates (small win per fase)
-- Bagian D: Tabel user_phase_status (progress user)
-- Bagian E: RLS policies
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN A: TAMBAH KOLOM KE dream_templates
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE dream_templates ADD COLUMN IF NOT EXISTS
  journey_duration_years TEXT DEFAULT NULL;

ALTER TABLE dream_templates ADD COLUMN IF NOT EXISTS
  onboarding_questions JSONB DEFAULT '[]'::jsonb;

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN B: TABEL dream_phases
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dream_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_template_slug TEXT NOT NULL REFERENCES dream_templates(slug) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  age_min INTEGER,
  age_max INTEGER,
  big_win_title TEXT NOT NULL,
  big_win_description TEXT,
  industry_benchmark TEXT,
  over_achievement TEXT,
  behind_schedule_signal TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dream_phases_template ON dream_phases(dream_template_slug);
CREATE INDEX IF NOT EXISTS idx_dream_phases_order ON dream_phases(dream_template_slug, sort_order);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN C: TABEL small_win_templates
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS small_win_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES dream_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value TEXT,
  target_unit TEXT,
  how_to_measure TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_small_win_templates_phase ON small_win_templates(phase_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN D: TABEL user_phase_status
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_phase_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES dream_journeys(id) ON DELETE CASCADE,
  dream_phase_id UUID NOT NULL REFERENCES dream_phases(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'ahead')),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(journey_id, dream_phase_id)
);

CREATE INDEX IF NOT EXISTS idx_user_phase_status_journey ON user_phase_status(journey_id);
CREATE INDEX IF NOT EXISTS idx_user_phase_status_user ON user_phase_status(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN E: RLS POLICIES
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE dream_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_win_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_phase_status ENABLE ROW LEVEL SECURITY;

-- dream_phases: readable by all authenticated users (template data, not user-specific)
CREATE POLICY "Dream phases are readable by all authenticated users"
  ON dream_phases FOR SELECT
  USING (auth.role() = 'authenticated');

-- small_win_templates: readable by all authenticated users
CREATE POLICY "Small win templates are readable by all authenticated users"
  ON small_win_templates FOR SELECT
  USING (auth.role() = 'authenticated');

-- user_phase_status: user-specific
CREATE POLICY "Users can read own phase status"
  ON user_phase_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phase status"
  ON user_phase_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phase status"
  ON user_phase_status FOR UPDATE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN F: FUNGSI DETERMINE PHASE
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION determine_current_phase(
  p_user_age INTEGER,
  p_template_slug TEXT
)
RETURNS TABLE (
  phase_id UUID,
  phase_number INTEGER,
  phase_name TEXT,
  age_min INTEGER,
  age_max INTEGER,
  big_win_title TEXT,
  industry_benchmark TEXT,
  over_achievement TEXT,
  behind_schedule_signal TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.phase_number,
    dp.phase_name,
    dp.age_min,
    dp.age_max,
    dp.big_win_title,
    dp.industry_benchmark,
    dp.over_achievement,
    dp.behind_schedule_signal
  FROM dream_phases dp
  WHERE dp.dream_template_slug = p_template_slug
    AND (
      (dp.age_min IS NULL OR p_user_age >= dp.age_min)
      AND (dp.age_max IS NULL OR p_user_age <= dp.age_max)
    )
  ORDER BY dp.sort_order
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
