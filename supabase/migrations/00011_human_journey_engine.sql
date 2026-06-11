-- ============================================================================
-- 00011_human_journey_engine.sql
-- Beautifio — Human Journey Engine
--
-- Age-based journeys, story notes, birth_date for age calculation
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- user_profiles: add birth_date for age-based journey generation
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- ────────────────────────────────────────────────────────────────────────────
-- daily_activities: add notes field for story engine (short user notes)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE daily_activities
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ────────────────────────────────────────────────────────────────────────────
-- dream_journeys: store user's age at journey creation for reference
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE dream_journeys
  ADD COLUMN IF NOT EXISTS user_age INT;

-- ────────────────────────────────────────────────────────────────────────────
-- small_wins: add reflection field for story engine (already has notes,
-- but add reflection as separate richer field)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE small_wins
  ADD COLUMN IF NOT EXISTS reflection TEXT;
