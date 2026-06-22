-- ============================================================================
-- 00041_fix_journey_article_fk_and_rpc.sql
-- Beautifio — Fix journey-to-article integration
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN A: Fix FK constraint on daily_activities.article_id
-- The original FK pointed to stories(id) instead of articles(id)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE daily_activities
  DROP CONSTRAINT IF EXISTS daily_activities_article_id_fkey;

ALTER TABLE daily_activities
  ADD CONSTRAINT daily_activities_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN B: RPC function for fetching pending journey article IDs
-- Used by ArticlePick component on the home page
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_pending_journey_article_ids(p_journey_id UUID)
RETURNS TABLE (article_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT da.article_id
  FROM daily_activities da
  WHERE da.journey_id = p_journey_id
    AND da.is_completed = false
    AND da.article_id IS NOT NULL
    AND da.activity_date = CURRENT_DATE;
END;
$$;
