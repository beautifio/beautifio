-- Seed test banners for BannerCarousel
INSERT INTO public.home_banners (title, image_url, redirect_url, redirect_label, is_active, display_order)
SELECT 'Mulai Perjalananmu', value, '/mimpi', 'Cari Mimpi', true, 0
FROM app_settings WHERE key = 'hero_image_url';

INSERT INTO public.home_banners (title, image_url, redirect_url, redirect_label, is_active, display_order)
SELECT 'Tumbuh Setiap Hari', value, '/journey', 'Mulai Journey', true, 1
FROM app_settings WHERE key = 'hero_image_url';
