-- Hero Landing Page Image — Supabase Storage + Settings

-- 1. Bucket untuk assets landing page
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('landing-assets', 'landing-assets', true, 5242880, '{"image/png","image/jpeg","image/webp"}')
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: publik bisa baca file di bucket ini
DROP POLICY IF EXISTS "Public read landing assets" ON storage.objects;
CREATE POLICY "Public read landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-assets');

-- 3. Policy: hanya admin/superadmin yang bisa upload
DROP POLICY IF EXISTS "Admin upload landing assets" ON storage.objects;
CREATE POLICY "Admin upload landing assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'landing-assets'
  AND public.user_has_role(ARRAY['admin', 'superadmin'])
);

-- 4. Policy: admin/superadmin bisa update/delete
DROP POLICY IF EXISTS "Admin manage landing assets" ON storage.objects;
CREATE POLICY "Admin manage landing assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'landing-assets' AND public.user_has_role(ARRAY['admin', 'superadmin']));

DROP POLICY IF EXISTS "Admin delete landing assets" ON storage.objects;
CREATE POLICY "Admin delete landing assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'landing-assets' AND public.user_has_role(ARRAY['admin', 'superadmin']));

-- 5. Tabel app_settings untuk menyimpan URL hero
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read app_settings"
ON public.app_settings FOR SELECT
USING (true);

CREATE POLICY "Admin can manage app_settings"
ON public.app_settings FOR ALL
USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 6. Seed default (belum ada gambar)
INSERT INTO public.app_settings (key, value)
VALUES ('hero_image_url', '')
ON CONFLICT (key) DO NOTHING;
