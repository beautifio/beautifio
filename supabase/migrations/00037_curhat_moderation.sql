-- Migration 00037: Curhat moderation panel
-- Adds moderation columns + admin RLS policies for curhat_posts and curhat_comments

-- === curhat_posts: moderation columns ===
ALTER TABLE curhat_posts ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE curhat_posts ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE curhat_posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- === curhat_comments: moderation columns ===
ALTER TABLE curhat_comments ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE curhat_comments ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE curhat_comments ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Trigger: set flagged_at when status = 'flagged' on insert/update of curhat_posts
CREATE OR REPLACE FUNCTION set_curhat_flagged_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'flagged' AND OLD.status IS DISTINCT FROM 'flagged' THEN
    NEW.flagged_at = COALESCE(NEW.flagged_at, NOW());
  ELSIF NEW.status IS DISTINCT FROM 'flagged' THEN
    NEW.flagged_at = NULL;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_curhat_posts_flagged_at ON curhat_posts;
CREATE TRIGGER trg_curhat_posts_flagged_at
  BEFORE INSERT OR UPDATE OF status ON curhat_posts
  FOR EACH ROW EXECUTE FUNCTION set_curhat_flagged_at();

DROP TRIGGER IF EXISTS trg_curhat_comments_flagged_at ON curhat_comments;
CREATE TRIGGER trg_curhat_comments_flagged_at
  BEFORE INSERT OR UPDATE OF status ON curhat_comments
  FOR EACH ROW EXECUTE FUNCTION set_curhat_flagged_at();

-- === RLS: admin policies for curhat_posts ===
DROP POLICY IF EXISTS "Admin can view all curhat posts" ON curhat_posts;
CREATE POLICY "Admin can view all curhat posts" ON curhat_posts
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

DROP POLICY IF EXISTS "Admin can update curhat posts" ON curhat_posts;
CREATE POLICY "Admin can update curhat posts" ON curhat_posts
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

-- === RLS: admin policies for curhat_comments ===
DROP POLICY IF EXISTS "Admin can view all curhat comments" ON curhat_comments;
CREATE POLICY "Admin can view all curhat comments" ON curhat_comments
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

DROP POLICY IF EXISTS "Admin can update curhat comments" ON curhat_comments;
CREATE POLICY "Admin can update curhat comments" ON curhat_comments
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );
