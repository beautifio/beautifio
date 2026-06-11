-- === BEAUTIFIO FAMILIA Module ===
-- Membership benefits ecosystem: vouchers, affiliate deals, event perks, achievement rewards

-- Merchants table
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

-- Affiliate deals
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

-- Achievement rewards
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

-- User voucher sessions
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

-- User redeemed history (for anti-fraud: one per merchant per user per day)
CREATE TABLE familia_redemption_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES familia_merchants(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL,
  pin_entered TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'invalid_pin', 'expired', 'duplicate')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User achievement progress
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

-- Event benefits
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

-- Indexes
CREATE INDEX idx_familia_merchants_active ON familia_merchants(is_active);
CREATE INDEX idx_familia_merchants_category ON familia_merchants(category);
CREATE INDEX idx_familia_affiliate_featured ON familia_affiliate_deals(is_featured) WHERE is_featured = true;
CREATE INDEX idx_familia_affiliate_category ON familia_affiliate_deals(category);
CREATE INDEX idx_familia_achievement_active ON familia_achievement_rewards(is_active);
CREATE INDEX idx_familia_voucher_user ON familia_voucher_sessions(user_id, status);
CREATE INDEX idx_familia_voucher_merchant ON familia_voucher_sessions(merchant_id);
CREATE INDEX idx_familia_redemption_user ON familia_redemption_log(user_id, merchant_id, redeemed_at);
CREATE INDEX idx_familia_user_achievements_user ON familia_user_achievements(user_id);

-- RLS
ALTER TABLE familia_merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_affiliate_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_achievement_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_voucher_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_redemption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_event_benefits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Merchants are public" ON familia_merchants FOR SELECT USING (true);
CREATE POLICY "Deals are public" ON familia_affiliate_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Achievements are public" ON familia_achievement_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own voucher sessions" ON familia_voucher_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voucher sessions" ON familia_voucher_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own redemption log" ON familia_redemption_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON familia_user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Event benefits are public" ON familia_event_benefits FOR SELECT USING (is_active = true);

-- Seed data: merchants
INSERT INTO familia_merchants (name, slug, category, description, merchant_code, daily_pin, monthly_quota, voucher_types, is_active, total_vouchers, total_redeemed, total_expired) VALUES
  ('Soto Pak Slamet', 'soto-pak-slamet', 'makanan', 'Soto ayam khas Lamongan dengan bumbu rahasia turun-temurun', 'SOTO01', '3817', 30, ARRAY['free_drink', 'bogof', 'discount', 'free_addon'], true, 30, 5, 3),
  ('Kopi Nusantara', 'kopi-nusantara', 'minuman', 'Kopi specialty dari berbagai daerah di Indonesia', 'KOPI01', '2745', 50, ARRAY['free_drink', 'discount'], true, 50, 12, 2),
  ('Bakso Boedjangan', 'bakso-boedjangan', 'makanan', 'Bakso sapi ukuran jumbo dengan kuah kaldu sapi asli', 'BAKS01', '5923', 40, ARRAY['buy1get1', 'free_addon', 'discount'], true, 40, 8, 4),
  ('Stationery Hub', 'stationery-hub', 'belanja', 'Toko alat tulis dan perlengkapan kreatif', 'STAH01', '4361', 25, ARRAY['discount', 'free_addon'], true, 25, 3, 1),
  ('Cafe Ruang Baca', 'cafe-ruang-baca', 'minuman', 'Cafe cozy dengan koleksi buku untuk dibaca', 'CAFE01', '8152', 35, ARRAY['free_drink', 'discount'], true, 35, 6, 2);

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
  ('Laptop Ringan untuk Mahasiswa', 'laptop-mahasiswa', 'Laptop ringan dan bertenaga untuk kebutuhan belajar', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80', 'teknologi', 'Shopee', 'https://shopee.co.id', 'shopee', 'pendidikan', false);

-- Seed data: achievement rewards
INSERT INTO familia_achievement_rewards (title, description, trigger_type, trigger_value, reward_type, reward_description, icon, color, is_active) VALUES
  ('New Member', 'Selesaikan Discovery untuk mendapatkan voucher perdana', 'discovery_complete', 1, 'voucher', 'Voucher minuman gratis di Kopi Nusantara', 'Sparkles', 'from-yellow-500 to-orange-500', true),
  ('Pebelajar Sejati', 'Selesaikan 10 milestone di roadmap untuk voucher makan siang', 'roadmap_milestones', 10, 'voucher', 'Voucher diskon di Bakso Boedjangan', 'Trophy', 'from-blue-500 to-purple-500', true),
  ('Anggota Setia', 'Bergabung dengan Circle selama 30 hari untuk diskon event', 'circle_days', 30, 'discount', 'Diskon 20% tiket event Beautifio', 'Users', 'from-green-500 to-teal-500', true),
  ('Mentee Aktif', 'Ikuti program mentor untuk mendapatkan benefit spesial', 'mentor_program', 1, 'special_benefit', 'Akses eksklusif webinar mentor tamu', 'Heart', 'from-pink-500 to-rose-500', true),
  ('Rajin Menulis', 'Tulis 20 entri jurnal untuk reward spesial', 'journal_entries', 20, 'voucher', 'Free drink di Cafe Ruang Baca', 'BookOpen', 'from-indigo-500 to-purple-500', true);

-- Seed data: event benefits
INSERT INTO familia_event_benefits (title, description, event_date, discount_type, discount_value, code, is_active) VALUES
  ('Workshop Personal Branding', 'Workship offline personal branding untuk anggota Familia', '2026-08-15T09:00:00Z', 'percentage', '25%', 'FAMBRAND25', true),
  ('Career Expo 2026', 'Pameran karir dengan perusahaan top Indonesia', '2026-09-20T09:00:00Z', 'free', 'Gratis Tiket Masuk', 'FAMEXPO26', true),
  ('Bootcamp Coding Intensif', 'Bootcamp 3 hari full-stack development', '2026-10-10T08:00:00Z', 'nominal', 'Rp200.000', 'FAMCODE200', true);
