-- ============================================================================
-- 00010_dream_journey_age.sql
-- Beautifio — Add age group support to dream templates
-- ============================================================================

ALTER TABLE dream_templates
  ADD COLUMN IF NOT EXISTS min_age INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_age INT DEFAULT 99;
