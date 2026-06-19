-- Media Manager: home_banners table + logo_url + hero_image_url cleanup

-- 1. Pastikan hero_image_url ada
INSERT INTO app_settings (key, value) VALUES ('hero_image_url', '') ON CONFLICT (key) DO NOTHING;

-- 2. Tambah key logo_url
INSERT INTO app_settings (key, value) VALUES ('logo_url', '') ON CONFLICT (key) DO NOTHING;

-- 3. Tabel banner beranda
CREATE TABLE IF NOT EXISTS public.home_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  redirect_url TEXT,
  redirect_label TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active banners"
ON public.home_banners FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin can manage banners"
ON public.home_banners FOR ALL
USING (public.user_has_role(ARRAY['admin', 'superadmin']));
