-- ============================================================================
-- 00026_curhat_comment_replies.sql
-- Beautifio — Reply 1 level di komentar curhat
-- ============================================================================

ALTER TABLE curhat_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES curhat_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_parent ON curhat_comments(parent_id);
