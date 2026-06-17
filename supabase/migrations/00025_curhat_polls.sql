-- ============================================================================
-- 00025_curhat_polls.sql
-- Beautifio — Polling untuk curhat: tabel poll + votes
-- ============================================================================

CREATE TABLE IF NOT EXISTS curhat_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curhat_id UUID REFERENCES curhat_posts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  options TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curhat_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES curhat_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  selected_option INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON curhat_poll_votes(poll_id);

ALTER TABLE curhat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE curhat_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Polls readable by all"
  ON curhat_polls FOR SELECT
  USING (true);

CREATE POLICY "Poll votes readable by all"
  ON curhat_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote once"
  ON curhat_poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
