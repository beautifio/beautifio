-- ============================================================================
-- SUPABASE_BOOTSTRAP.sql
-- Beautifio — Complete Database Schema
-- Apply this to a fresh Supabase project after linking.
-- ============================================================================
-- WARNING: This will drop the default `user_profiles` table if it exists.
-- Run in a transaction: wrap with BEGIN / COMMIT if applying manually.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 00001 — USERS TABLE
-- ────────────────────────────────────────────────────────────────────────────

-- Drop Supabase default template table (not used by application code)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  city TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'mentor', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "System can insert profiles"
  ON users FOR INSERT
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 00002 — CERITA (STORIES)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE story_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO story_categories (name, slug, icon, description) VALUES
  ('Education', 'education', 'BookOpen', 'Wawasan dan tips seputar pendidikan'),
  ('Career', 'career', 'Briefcase', 'Panduan membangun karir impian'),
  ('Business', 'business', 'TrendingUp', 'Ide dan strategi bisnis'),
  ('Sports', 'sports', 'Dumbbell', 'Tips olahraga dan hidup aktif'),
  ('Music', 'music', 'Music', 'Belajar dan apresiasi musik'),
  ('Gaming', 'gaming', 'Gamepad2', 'Dunia gaming dan esports'),
  ('Creator', 'creator', 'Camera', 'Menjadi content creator'),
  ('Beauty', 'beauty', 'Sparkles', 'Tips kecantikan dan perawatan diri'),
  ('Technology', 'technology', 'Monitor', 'Teknologi dan inovasi terbaru');

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES story_categories(id),
  reading_time INT NOT NULL DEFAULT 1,
  like_count INT NOT NULL DEFAULT 0,
  save_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE TABLE story_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE story_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('roadmap', 'circle', 'product')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  resource_description TEXT,
  resource_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_category ON stories(category_id) WHERE is_published = true;
CREATE INDEX idx_stories_published_at ON stories(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_story_likes_story ON story_likes(story_id);
CREATE INDEX idx_story_saves_story ON story_saves(story_id);
CREATE INDEX idx_story_comments_story ON story_comments(story_id);
CREATE INDEX idx_story_comments_parent ON story_comments(parent_id);
CREATE INDEX idx_story_recommendations_story ON story_recommendations(story_id);

ALTER TABLE story_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public" ON story_categories
  FOR SELECT USING (true);

CREATE POLICY "Published stories are public" ON stories
  FOR SELECT USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can like" ON story_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can save" ON story_saves
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can comment" ON story_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Recommendations are public" ON story_recommendations
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 00003 — ROADMAP TEMPLATES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE roadmap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  estimated_duration TEXT,
  total_milestones INT NOT NULL DEFAULT 4,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_template_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES roadmap_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_days INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_template_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES roadmap_templates(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES roadmap_template_milestones(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('circle', 'mentor', 'opportunity')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  resource_description TEXT,
  resource_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rtm_templates_slug ON roadmap_templates(slug);
CREATE INDEX idx_rtm_milestones_template ON roadmap_template_milestones(template_id);
CREATE INDEX idx_rtm_recommendations_template ON roadmap_template_recommendations(template_id);

ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_template_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_template_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are public" ON roadmap_templates FOR SELECT USING (true);
CREATE POLICY "Template milestones are public" ON roadmap_template_milestones FOR SELECT USING (true);
CREATE POLICY "Template recommendations are public" ON roadmap_template_recommendations FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 00004 — JOURNALS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  goal_category TEXT,
  roadmap_slug TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  entry_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  reaction_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE journal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('sangat_bahagia', 'bahagia', 'biasa', 'sedih', 'sangat_sedih')),
  day_number INT NOT NULL DEFAULT 1,
  milestone_id UUID REFERENCES journal_milestones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE journal_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id)
);

CREATE TABLE journal_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id, emoji)
);

CREATE INDEX idx_journals_user ON journals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_journals_slug ON journals(slug);
CREATE INDEX idx_journals_public ON journals(is_public) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_journal_entries_journal ON journal_entries(journal_id);
CREATE INDEX idx_journal_entries_day ON journal_entries(journal_id, day_number);
CREATE INDEX idx_journal_milestones_journal ON journal_milestones(journal_id);
CREATE INDEX idx_journal_followers_journal ON journal_followers(journal_id);
CREATE INDEX idx_journal_reactions_journal ON journal_reactions(journal_id);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public journals are viewable by everyone" ON journals
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own journals" ON journals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Journal entries are viewable if journal is public" ON journal_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Users can manage entries in their journals" ON journal_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND user_id = auth.uid())
  );

CREATE POLICY "Milestones are viewable if journal is public" ON journal_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Users can manage milestones in their journals" ON journal_milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND user_id = auth.uid())
  );

CREATE POLICY "Followers are viewable if journal is public" ON journal_followers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Authenticated users can follow journals" ON journal_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow" ON journal_followers
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable if journal is public" ON journal_reactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Authenticated users can react" ON journal_reactions
  FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_journal_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE journals SET entry_count = entry_count + 1, updated_at = now() WHERE id = NEW.journal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE journals SET entry_count = GREATEST(entry_count - 1, 0), updated_at = now() WHERE id = OLD.journal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS journal_entries_count_trigger ON journal_entries;
CREATE TRIGGER journal_entries_count_trigger
  AFTER INSERT OR DELETE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_journal_entry_count();

CREATE OR REPLACE FUNCTION update_journal_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE journals SET follower_count = follower_count + 1 WHERE id = NEW.journal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE journals SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.journal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS journal_followers_count_trigger ON journal_followers;
CREATE TRIGGER journal_followers_count_trigger
  AFTER INSERT OR DELETE ON journal_followers
  FOR EACH ROW EXECUTE FUNCTION update_journal_follower_count();

-- ────────────────────────────────────────────────────────────────────────────
-- 00005 — BEAUTIFIO FAMILIA
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE familia_merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  merchant_code TEXT UNIQUE NOT NULL,
  daily_pin TEXT NOT NULL DEFAULT '0000',
  monthly_quota INT NOT NULL DEFAULT 30,
  voucher_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_vouchers INT NOT NULL DEFAULT 0,
  total_redeemed INT NOT NULL DEFAULT 0,
  total_expired INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE familia_affiliate_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  partner_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tokopedia', 'shopee', 'tiktok', 'website')),
  goal_category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  click_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE familia_achievement_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('discovery_complete', 'roadmap_milestones', 'circle_days', 'mentor_program', 'journal_entries', 'story_posted')),
  trigger_value INT NOT NULL DEFAULT 1,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('voucher', 'discount', 'special_benefit')),
  reward_description TEXT,
  reward_merchant_id UUID REFERENCES familia_merchants(id) ON DELETE SET NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE familia_voucher_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES familia_merchants(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  pin_required TEXT NOT NULL DEFAULT '0000',
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE familia_redemption_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES familia_merchants(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL,
  pin_entered TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'invalid_pin', 'expired', 'duplicate')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE familia_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES familia_achievement_rewards(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE familia_event_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date TIMESTAMPTZ,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'nominal', 'free')),
  discount_value TEXT NOT NULL,
  code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_familia_merchants_active ON familia_merchants(is_active);
CREATE INDEX idx_familia_merchants_category ON familia_merchants(category);
CREATE INDEX idx_familia_affiliate_featured ON familia_affiliate_deals(is_featured) WHERE is_featured = true;
CREATE INDEX idx_familia_affiliate_category ON familia_affiliate_deals(category);
CREATE INDEX idx_familia_achievement_active ON familia_achievement_rewards(is_active);
CREATE INDEX idx_familia_voucher_user ON familia_voucher_sessions(user_id, status);
CREATE INDEX idx_familia_voucher_merchant ON familia_voucher_sessions(merchant_id);
CREATE INDEX idx_familia_redemption_user ON familia_redemption_log(user_id, merchant_id, redeemed_at);
CREATE INDEX idx_familia_user_achievements_user ON familia_user_achievements(user_id);

ALTER TABLE familia_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_affiliate_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_achievement_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_voucher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_redemption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_event_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants are public" ON familia_merchants FOR SELECT USING (true);
CREATE POLICY "Admins can manage merchants" ON familia_merchants FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Deals are public" ON familia_affiliate_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Achievements are public" ON familia_achievement_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own voucher sessions" ON familia_voucher_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voucher sessions" ON familia_voucher_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON familia_voucher_sessions FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Users can view own redemption log" ON familia_redemption_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON familia_user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Event benefits are public" ON familia_event_benefits FOR SELECT USING (is_active = true);

-- Seed data: merchants
INSERT INTO familia_merchants (name, slug, category, description, merchant_code, daily_pin, monthly_quota, voucher_types, is_active, total_vouchers, total_redeemed, total_expired) VALUES
  ('Soto Pak Slamet', 'soto-pak-slamet', 'makanan', 'Soto ayam khas Lamongan dengan bumbu rahasia turun-temurun', 'SOTO01', '3817', 30, ARRAY['free_drink', 'bogof', 'discount', 'free_addon'], true, 30, 5, 3),
  ('Kopi Nusantara', 'kopi-nusantara', 'minuman', 'Kopi specialty dari berbagai daerah di Indonesia', 'KOPI01', '2745', 50, ARRAY['free_drink', 'discount'], true, 50, 12, 2),
  ('Bakso Boedjangan', 'bakso-boedjangan', 'makanan', 'Bakso sapi ukuran jumbo dengan kuah kaldu sapi asli', 'BAKS01', '5923', 40, ARRAY['buy1get1', 'free_addon', 'discount'], true, 40, 8, 4),
  ('Stationery Hub', 'stationery-hub', 'belanja', 'Toko alat tulis dan perlengkapan kreatif', 'STAH01', '4361', 25, ARRAY['discount', 'free_addon'], true, 25, 3, 1),
  ('Cafe Ruang Baca', 'cafe-ruang-baca', 'minuman', 'Cafe cozy dengan koleksi buku untuk dibaca', 'CAFE01', '8152', 35, ARRAY['free_drink', 'discount'], true, 35, 6, 2)
ON CONFLICT DO NOTHING;

-- Seed data: affiliate deals
INSERT INTO familia_affiliate_deals (title, slug, description, image_url, category, partner_name, partner_url, platform, goal_category, is_featured) VALUES
  ('Sepatu Lari Terbaik 2026', 'sepatu-lari', 'Dapatkan diskon eksklusif sepatu lari dari brand ternama', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', 'olahraga', 'SportsDirect', 'https://www.tokopedia.com', 'tokopedia', 'kesehatan', true),
  ('Buku Panduan Masuk Fakultas Kedokteran', 'buku-kedokteran', 'Buku persiapan masuk FK dengan tips dari dokter senior', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80', 'pendidikan', 'Gramedia', 'https://www.tokopedia.com', 'tokopedia', 'pendidikan', true),
  ('Paket Canva Pro 6 Bulan', 'canva-pro', 'Canva Pro untuk konten kreator dengan harga spesial', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80', 'kreator', 'Canva', 'https://www.tokopedia.com', 'tokopedia', 'skill', true),
  ('Mikrofon USB Profesional', 'mikrofon-usb', 'Mikrofon berkualitas untuk content creator pemula', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80', 'kreator', 'Shopee', 'https://shopee.co.id', 'shopee', 'skill', true),
  ('Perlengkapan Futsal', 'perlengkapan-futsal', 'Sepatu, jersey, dan bola futsal dengan harga afiliasi', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80', 'olahraga', 'SportsStation', 'https://www.tokopedia.com', 'tokopedia', 'kesehatan', false),
  ('Set Peralatan Golf Pemula', 'peralatan-golf', 'Set stick golf dan aksesoris untuk pegolf pemula', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80', 'olahraga', 'Shopee', 'https://shopee.co.id', 'shopee', 'kesehatan', false),
  ('Skincare Routine Set', 'skincare-set', 'Paket skincare lengkap untuk kulit sehat bercahaya', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', 'kecantikan', 'Tokopedia', 'https://www.tokopedia.com', 'tokopedia', 'bisnis', true),
  ('Kursus Public Speaking Online', 'public-speaking', 'Belajar public speaking dari mentor berpengalaman', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80', 'pendidikan', 'TikTok Shop', 'https://www.tiktok.com', 'tiktok', 'pendidikan', false),
  ('Keyboard Mechanical untuk Coding', 'keyboard-mekanikal', 'Keyboard nyaman untuk programmer dan produktivitas', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80', 'teknologi', 'Tokopedia', 'https://www.tokopedia.com', 'tokopedia', 'skill', true),
  ('Laptop Ringan untuk Mahasiswa', 'laptop-mahasiswa', 'Laptop ringan dan bertenaga untuk kebutuhan belajar', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80', 'teknologi', 'Shopee', 'https://shopee.co.id', 'shopee', 'pendidikan', false)
ON CONFLICT DO NOTHING;

-- Seed data: achievement rewards
INSERT INTO familia_achievement_rewards (title, description, trigger_type, trigger_value, reward_type, reward_description, icon, color, is_active) VALUES
  ('New Member', 'Selesaikan Discovery untuk mendapatkan voucher perdana', 'discovery_complete', 1, 'voucher', 'Voucher minuman gratis di Kopi Nusantara', 'Sparkles', 'from-yellow-500 to-orange-500', true),
  ('Pebelajar Sejati', 'Selesaikan 10 milestone di roadmap untuk voucher makan siang', 'roadmap_milestones', 10, 'voucher', 'Voucher diskon di Bakso Boedjangan', 'Trophy', 'from-blue-500 to-purple-500', true),
  ('Anggota Setia', 'Bergabung dengan Circle selama 30 hari untuk diskon event', 'circle_days', 30, 'discount', 'Diskon 20% tiket event Beautifio', 'Users', 'from-green-500 to-teal-500', true),
  ('Mentee Aktif', 'Ikuti program mentor untuk mendapatkan benefit spesial', 'mentor_program', 1, 'special_benefit', 'Akses eksklusif webinar mentor tamu', 'Heart', 'from-pink-500 to-rose-500', true),
  ('Rajin Menulis', 'Tulis 20 entri jurnal untuk reward spesial', 'journal_entries', 20, 'voucher', 'Free drink di Cafe Ruang Baca', 'BookOpen', 'from-indigo-500 to-purple-500', true)
ON CONFLICT DO NOTHING;

-- Seed data: event benefits
INSERT INTO familia_event_benefits (title, description, event_date, discount_type, discount_value, code, is_active) VALUES
  ('Workshop Personal Branding', 'Workship offline personal branding untuk anggota Familia', '2026-08-15T09:00:00Z', 'percentage', '25%', 'FAMBRAND25', true),
  ('Career Expo 2026', 'Pameran karir dengan perusahaan top Indonesia', '2026-09-20T09:00:00Z', 'free', 'Gratis Tiket Masuk', 'FAMEXPO26', true),
  ('Bootcamp Coding Intensif', 'Bootcamp 3 hari full-stack development', '2026-10-10T08:00:00Z', 'nominal', 'Rp200.000', 'FAMCODE200', true)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 00006 — CORE APPLICATION TABLES (MISSING FROM ORIGINAL MIGRATIONS)
-- Tables the application code queries but no migration defined.
-- ────────────────────────────────────────────────────────────────────────────

-- user_goals
-- Referenced by: queries.ts (select, insert), onboarding/page.tsx (insert), types/index.ts (Goal)
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_category TEXT NOT NULL CHECK (goal_category IN ('karir', 'pendidikan', 'skill', 'bisnis')),
  target_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- circles
-- Referenced by: queries.ts (select), types/index.ts (Circle)
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_category TEXT NOT NULL,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_url TEXT,
  capacity INT NOT NULL DEFAULT 50,
  member_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_circles_category ON circles(goal_category);

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circles are public" ON circles
  FOR SELECT USING (true);

-- circle_members
-- Referenced by: queries.ts (select, insert), types/index.ts (CircleMember)
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'co-host')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ
);

CREATE INDEX idx_circle_members_user ON circle_members(user_id);
CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
CREATE UNIQUE INDEX idx_circle_members_active ON circle_members(circle_id, user_id) WHERE left_at IS NULL;

ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own memberships" ON circle_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join circles" ON circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- messages
-- Referenced by: queries.ts (insert), circle/[id]/page-client.tsx (realtime subscription), types/index.ts (Message)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_circle ON messages(circle_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(circle_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by circle members" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );

CREATE POLICY "Circle members can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );

-- milestones
-- Referenced by: queries.ts (select, update), types/index.ts (Milestone)
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_goal ON milestones(goal_id);
CREATE INDEX idx_milestones_user ON milestones(user_id);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- opportunities
-- Referenced by: queries.ts (select), types/index.ts (Opportunity)
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beasiswa', 'magang', 'pekerjaan', 'turnamen', 'kompetisi', 'relawan', 'pendanaan', 'program-kreator')),
  organization TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_active ON opportunities(is_active);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities are public" ON opportunities
  FOR SELECT USING (is_active = true);

-- saved_opportunities
-- Referenced by: queries.ts (insert)
CREATE TABLE saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX idx_saved_opps_user ON saved_opportunities(user_id);

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave opportunities" ON saved_opportunities
  FOR DELETE USING (auth.uid() = user_id);
