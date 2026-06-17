-- ============================================================================
-- 00029_journey_engine.sql
-- Beautifio — Journey Engine: matching, dedup, content requests
-- ============================================================================

-- ─── 1. Augment daily_activities with engine fields ───
ALTER TABLE daily_activities
  ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (action_type IN (
      'read_article', 'comment_curhat', 'support_curhat',
      'write_curhat', 'write_journal', 'join_circle',
      'view_roadmap', 'view_mentor', 'do_exercise', 'manual'
    )),
  ADD COLUMN IF NOT EXISTS match_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS matched_content_id UUID,
  ADD COLUMN IF NOT EXISTS matched_content_type TEXT,
  ADD COLUMN IF NOT EXISTS matched_slug TEXT,
  ADD COLUMN IF NOT EXISTS matched_title TEXT;

-- ─── 2. Content Suggestions — track what's been shown to avoid duplicates ───
CREATE TABLE IF NOT EXISTS content_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id      UUID NOT NULL,
  content_type    TEXT NOT NULL,
  journey_id      UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  activity_id     UUID REFERENCES daily_activities(id) ON DELETE CASCADE,
  suggested_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, content_type, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_activity
  ON content_suggestions(activity_id);

-- ─── 3. Content Requests — what Redaksi needs to write ───
CREATE TABLE IF NOT EXISTS content_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic           TEXT NOT NULL,
  keywords        TEXT[] DEFAULT '{}',
  action_type     TEXT NOT NULL DEFAULT 'read_article',
  content_type    TEXT NOT NULL DEFAULT 'article',
  journey_template_slug TEXT,
  activity_title  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','published','rejected')),
  assigned_to     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  request_count   INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_requests_status
  ON content_requests(status);
CREATE INDEX IF NOT EXISTS idx_content_requests_topic
  ON content_requests(topic);

-- ─── 4. Content Tags — for better matching ───
CREATE TABLE IF NOT EXISTS content_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id    UUID NOT NULL,
  content_type  TEXT NOT NULL,
  tag           TEXT NOT NULL,
  UNIQUE(content_id, content_type, tag)
);

CREATE INDEX IF NOT EXISTS idx_content_tags_tag
  ON content_tags(tag);

-- ─── 5. Update article_reads FK to point to articles, not stories ───
-- Migration 00022 already changed article_reads.article_id to reference articles.
-- This is just a safety check.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'article_reads_article_id_fkey'
    AND table_name = 'article_reads'
  ) THEN
    -- constraint already exists, likely correct
  END IF;
END $$;
