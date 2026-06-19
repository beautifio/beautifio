-- Articles: admin policies for redaksi & superadmin
-- so admin API can read/write articles with source='redaksi'

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy first (recreate below)
DROP POLICY IF EXISTS "Articles readable by all" ON articles;

-- Public can read published articles
CREATE POLICY "Articles readable by all"
  ON articles FOR SELECT
  USING (is_published = true);

-- Redaksi & superadmin can read ALL articles (including drafts)
CREATE POLICY "Admin can read all articles"
  ON articles FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

-- Redaksi & superadmin can insert articles
CREATE POLICY "Admin can insert articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

-- Redaksi & superadmin can update articles
CREATE POLICY "Admin can update articles"
  ON articles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

-- Redaksi & superadmin can delete articles
CREATE POLICY "Admin can delete articles"
  ON articles FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));
