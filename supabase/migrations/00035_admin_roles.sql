-- 00035 — Add redaksi & superadmin roles, quotes & inspirasi tables

-- Step 1: Alter the CHECK constraint to accept new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'mentor', 'admin', 'redaksi', 'superadmin'));

-- Step 2: Update existing admin policies to also allow superadmin
DROP POLICY IF EXISTS "Admins can manage merchants" ON familia_merchants;
CREATE POLICY "Admins can manage merchants" ON familia_merchants
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "Admins can view all sessions" ON familia_voucher_sessions;
CREATE POLICY "Admins can view all sessions" ON familia_voucher_sessions
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin')));

-- Step 3: Superadmin can manage all users
CREATE POLICY "Superadmins can manage all users" ON users
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin'));

-- Step 4: Quotes table (for redaksi)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'umum',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Redaksi can manage quotes" ON quotes
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

CREATE POLICY "Anyone can read active quotes" ON quotes
  FOR SELECT USING (is_active = true);

-- Step 5: Inspirasi posts table (for redaksi)
CREATE TABLE IF NOT EXISTS inspirasi_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'artikel',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  author_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inspirasi_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Redaksi can manage inspirasi" ON inspirasi_posts
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

CREATE POLICY "Anyone can read published inspirasi" ON inspirasi_posts
  FOR SELECT USING (status = 'published');
