-- Migration 00039: CMS konten — SEO fields + indexes for inspirasi_posts
-- Adds slug, SEO columns, and performance indexes

ALTER TABLE inspirasi_posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE inspirasi_posts ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT '';
ALTER TABLE inspirasi_posts ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
ALTER TABLE inspirasi_posts ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE inspirasi_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Generate slugs for existing rows that don't have one
UPDATE inspirasi_posts SET slug = regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g') || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Make slug unique and not null after backfill
ALTER TABLE inspirasi_posts ALTER COLUMN slug SET NOT NULL;
ALTER TABLE inspirasi_posts ADD CONSTRAINT inspirasi_posts_slug_key UNIQUE (slug);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inspirasi_posts_status ON inspirasi_posts(status);
CREATE INDEX IF NOT EXISTS idx_inspirasi_posts_category ON inspirasi_posts(category);
CREATE INDEX IF NOT EXISTS idx_inspirasi_posts_published_at ON inspirasi_posts(published_at DESC) WHERE status = 'published';

-- Admin RLS for stories table (not yet covered)
DROP POLICY IF EXISTS "Admin can view all stories" ON stories;
CREATE POLICY "Admin can view all stories" ON stories
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

DROP POLICY IF EXISTS "Admin can update stories" ON stories;
CREATE POLICY "Admin can update stories" ON stories
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

DROP POLICY IF EXISTS "Admin can insert stories" ON stories;
CREATE POLICY "Admin can insert stories" ON stories
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );

DROP POLICY IF EXISTS "Admin can delete stories" ON stories;
CREATE POLICY "Admin can delete stories" ON stories
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin', 'redaksi'))
  );
