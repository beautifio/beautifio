-- 00010 — Storage buckets referenced by the app but missing in production.
--
-- storage.objects already had RLS policies for 'avatars' and
-- 'circle-attachments' (public read + owner-only write), but the buckets
-- themselves were never created, so getPublicUrl()/upload() had nothing to
-- target. Buckets are public because the app uses getPublicUrl().

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('circle-attachments', 'circle-attachments', true, 10485760, NULL)
ON CONFLICT (id) DO NOTHING;
