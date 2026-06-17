-- ============================================================================
-- 00022_inspirasi_migration.sql
-- Beautifio — Migrasi Inspirasi: Hardcoded → Database + Curhat Persisten
--
-- Bagian A: Buat tabel articles (pengganti hardcoded data)
-- Bagian B: Buat tabel curhat_posts (curhat persisten)
-- Bagian C: Buat tabel curhat_support (reaksi dukungan)
-- Bagian D: Update FK article_reads → articles
-- Bagian E: Function increment_support_count
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN A: TABEL articles
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'story'
    CHECK (type IN ('story', 'anonymous', 'journal', 'mentor', 'community')),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  cover_emoji TEXT DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  initials TEXT DEFAULT '',
  read_time_minutes INTEGER DEFAULT 5,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  related_slugs TEXT[] DEFAULT '{}',
  related_template_slugs TEXT[] DEFAULT '{}',
  related_dimensions TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(type);
CREATE INDEX IF NOT EXISTS idx_articles_template_slugs ON articles USING GIN(related_template_slugs);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles readable by all"
  ON articles FOR SELECT
  USING (is_published = true);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN B: TABEL curhat_posts
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS curhat_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT '',
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'visible'
    CHECK (status IN ('visible', 'flagged', 'hidden', 'removed')),
  flag_reason TEXT DEFAULT '',
  support_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curhat_status ON curhat_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curhat_category ON curhat_posts(category);

ALTER TABLE curhat_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curhat visible posts readable by all authenticated"
  ON curhat_posts FOR SELECT
  USING (status = 'visible' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own curhat"
  ON curhat_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own curhat regardless of status"
  ON curhat_posts FOR SELECT
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN C: TABEL curhat_support
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS curhat_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curhat_id UUID REFERENCES curhat_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  support_type TEXT DEFAULT 'hug'
    CHECK (support_type IN ('hug', 'relate', 'strength')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curhat_id, user_id)
);

ALTER TABLE curhat_support ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support readable by all authenticated"
  ON curhat_support FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can give support"
  ON curhat_support FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN D: Update FK article_reads → articles
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE article_reads
  DROP CONSTRAINT IF EXISTS article_reads_article_id_fkey;

ALTER TABLE article_reads
  ADD CONSTRAINT article_reads_article_id_fkey
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN E: Function increment_support_count
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_support_count(p_curhat_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE curhat_posts
  SET support_count = support_count + 1
  WHERE id = p_curhat_id;
END;
$$;
