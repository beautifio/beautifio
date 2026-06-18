-- Migration: 20260618235000_life_capital_points.sql
-- Tabel life_capital_points + fungsi get_life_capital

CREATE TABLE IF NOT EXISTS life_capital_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN (
    'character', 'dream_skill', 'knowledge',
    'physical', 'social', 'spiritual'
  )),
  points INTEGER NOT NULL DEFAULT 10,
  source_type TEXT NOT NULL DEFAULT 'daily_activity'
    CHECK (source_type IN ('daily_activity', 'milestone', 'reflection')),
  source_id UUID,
  journey_id UUID REFERENCES dream_journeys(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_capital_user ON life_capital_points(user_id, dimension);
CREATE INDEX IF NOT EXISTS idx_life_capital_created ON life_capital_points(user_id, created_at);

ALTER TABLE life_capital_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life capital"
  ON life_capital_points FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life capital"
  ON life_capital_points FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_life_capital(p_user_id UUID)
RETURNS TABLE (
  dimension TEXT,
  total_points BIGINT,
  recent_30d_points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lcp.dimension,
    SUM(lcp.points)::BIGINT as total_points,
    SUM(CASE WHEN lcp.created_at > NOW() - INTERVAL '30 days'
        THEN lcp.points ELSE 0 END)::BIGINT as recent_30d_points
  FROM life_capital_points lcp
  WHERE lcp.user_id = p_user_id
  GROUP BY lcp.dimension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
