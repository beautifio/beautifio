-- ============================================================================
-- 00024_curhat_comments.sql
-- Beautifio — Curhat comments with profanity filter
-- ============================================================================

CREATE TABLE IF NOT EXISTS curhat_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curhat_id UUID REFERENCES curhat_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'visible'
    CHECK (status IN ('visible', 'flagged', 'hidden', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curhat_comments_curhat ON curhat_comments(curhat_id, created_at ASC);

ALTER TABLE curhat_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments on visible curhat are readable"
  ON curhat_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM curhat_posts
      WHERE curhat_posts.id = curhat_comments.curhat_id
      AND curhat_posts.status = 'visible'
    )
  );

CREATE POLICY "Users can create comments"
  ON curhat_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments"
  ON curhat_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger function: auto-flag profanity in comments
CREATE OR REPLACE FUNCTION check_comment_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  banned_words TEXT[] := ARRAY[
    'anjing', 'babi', 'bajingan', 'brengsek', 'kampret',
    'kontol', 'memek', 'ngentot', 'ngewe', 'pepek',
    'tolol', 'goblok', 'bodoh', 'idiot', 'bego',
    'keparat', 'setan', 'iblis', 'sialan', 'taik',
    'tai', 'kafir', 'munafik', 'laknat', 'celaka',
    'sampah', 'dajjal', 'jancok', 'asu', 'cuk'
  ];
  word TEXT;
  lower_content TEXT;
BEGIN
  lower_content := LOWER(NEW.content);
  FOREACH word IN ARRAY banned_words
  LOOP
    IF lower_content LIKE '%' || word || '%' THEN
      NEW.status := 'flagged';
      RETURN NEW;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_comment_profanity
  BEFORE INSERT ON curhat_comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_content();
