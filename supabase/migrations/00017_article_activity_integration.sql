-- ============================================================================
-- 00017_article_activity_integration.sql
-- Beautifio — Integrasi Artikel & Daily Activities
--
-- Bagian A: Tambah kolom ke daily_activities (link ke artikel)
-- Bagian B: Buat tabel article_reads (tracking bacaan user)
-- Bagian C: RLS policy untuk article_reads
-- Bagian D: Tambah kolom ke tabel stories
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN A: UPDATE TABEL daily_activities
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS
  article_id UUID REFERENCES stories(id) ON DELETE SET NULL;

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS
  activity_type TEXT DEFAULT 'general'
  CHECK (activity_type IN ('general', 'knowledge', 'physical', 'social', 'spiritual', 'character', 'dream_skill'));

ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS
  estimated_minutes INTEGER DEFAULT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN B: BUAT TABEL article_reads (tracking bacaan user)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS article_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES daily_activities(id) ON DELETE SET NULL,
  journey_id UUID REFERENCES dream_journeys(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  scroll_percentage INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, article_id, activity_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN C: RLS POLICY untuk article_reads
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE article_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own article_reads"
  ON article_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article_reads"
  ON article_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own article_reads"
  ON article_reads FOR UPDATE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- BAGIAN D: TAMBAH KOLOM ke tabel stories
-- ────────────────────────────────────────────────────────────────────────────

-- catatan: stories sudah punya column reading_time (INT, DEFAULT 1)
-- yang berfungsi sebagai estimated_reading_minutes → tidak perlu duplikasi

ALTER TABLE stories ADD COLUMN IF NOT EXISTS
  journey_tags TEXT[] DEFAULT '{}';
  -- array kategori dream yang relevan: {'sports','health','business',...}

