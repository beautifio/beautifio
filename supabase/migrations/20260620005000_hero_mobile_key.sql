-- Add hero mobile image key
INSERT INTO app_settings (key, value) VALUES ('hero_image_mobile_url', '') ON CONFLICT (key) DO NOTHING;
