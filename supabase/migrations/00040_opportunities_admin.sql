-- Migration 00040: Opportunities admin management
-- Adds slug/location columns + admin RLS policies

ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- Generate slugs for existing rows
UPDATE opportunities SET slug = regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g') || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE opportunities ALTER COLUMN slug SET NOT NULL;
ALTER TABLE opportunities ADD CONSTRAINT opportunities_slug_key UNIQUE (slug);

-- Admin RLS for opportunities
DROP POLICY IF EXISTS "Admin can view all opportunities" ON opportunities;
CREATE POLICY "Admin can view all opportunities" ON opportunities
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );

DROP POLICY IF EXISTS "Admin can insert opportunities" ON opportunities;
CREATE POLICY "Admin can insert opportunities" ON opportunities
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );

DROP POLICY IF EXISTS "Admin can update opportunities" ON opportunities;
CREATE POLICY "Admin can update opportunities" ON opportunities
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );

DROP POLICY IF EXISTS "Admin can delete opportunities" ON opportunities;
CREATE POLICY "Admin can delete opportunities" ON opportunities
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );

-- Admin RLS for saved_opportunities (view all, not just own)
DROP POLICY IF EXISTS "Admin can view all saved opportunities" ON saved_opportunities;
CREATE POLICY "Admin can view all saved opportunities" ON saved_opportunities
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );
