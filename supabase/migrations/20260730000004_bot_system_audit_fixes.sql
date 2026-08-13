-- Fix Migration: Bot System Audit Fixes
-- Fixes all RLS, FK, constraint, and missing user issues

-- ============================================
-- FIX 1: Create Bisik bot users in auth.users
-- ============================================
DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
  VALUES
    ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'bot-bisik-1@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'bot-bisik-2@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'bot-bisik-3@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'bot-bisik-4@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'bot-bisik-5@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'bot-bisik-6@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'bot-bisik-7@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'bot-bisik-8@internal', '', NOW(), '{}', NOW(), NOW(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert into public.users
INSERT INTO public.users (id, full_name, email, is_bot, role, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Rani', 'bot-bisik-1@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Bella', 'bot-bisik-2@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'Dewi', 'bot-bisik-3@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'Maya', 'bot-bisik-4@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'Putri', 'bot-bisik-5@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'Anisa', 'bot-bisik-6@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000007', 'Lita', 'bot-bisik-7@internal', true, 'mentor', NOW()),
  ('a0000000-0000-0000-0000-000000000008', 'Karin', 'bot-bisik-8@internal', true, 'mentor', NOW())
ON CONFLICT (id) DO NOTHING;

-- Re-seed tebak_bot_profiles (now that users exist)
INSERT INTO public.tebak_bot_profiles (id, display_name, disc_type, disc_secondary, komunikasi_type, consistency_pct, guess_accuracy_pct)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Rani',  'D', NULL, 'Langsung',  80, 40),
  ('a0000000-0000-0000-0000-000000000005', 'Putri', 'D', 'I',  'Langsung',  80, 40),
  ('a0000000-0000-0000-0000-000000000002', 'Bella', 'I', NULL, 'Ekspresif', 80, 40),
  ('a0000000-0000-0000-0000-000000000006', 'Anisa', 'I', 'S',  'Ekspresif', 80, 40),
  ('a0000000-0000-0000-0000-000000000003', 'Dewi',  'S', NULL, 'Empatik',   80, 40),
  ('a0000000-0000-0000-0000-000000000007', 'Lita',  'S', 'C',  'Empatik',   80, 40),
  ('a0000000-0000-0000-0000-000000000004', 'Maya',  'C', NULL, 'Tenang',    80, 40),
  ('a0000000-0000-0000-0000-000000000008', 'Karin', 'C', 'D',  'Tenang',    80, 40)
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, is_active = true;

-- Update bisik profile data
UPDATE public.tebak_bot_profiles SET bio = 'barista di coffee shop Jaksel, kuliah manajemen semester akhir', interests = ARRAY['kopi','karier','self-improvement'], typing_style = 'singkat', emoji_style = 'jarang' WHERE id = 'a0000000-0000-0000-0000-000000000001';
UPDATE public.tebak_bot_profiles SET bio = 'freelance social media specialist, anak pertama dari 3 bersaudara', interests = ARRAY['social media','film','self-development'], typing_style = 'medium', emoji_style = 'sedikit' WHERE id = 'a0000000-0000-0000-0000-000000000005';
UPDATE public.tebak_bot_profiles SET bio = 'mahasiswi DKV semester 5, part-time jualan sticker di online shop', interests = ARRAY['dkv','drakor','sticker art','kpop'], typing_style = 'medium', emoji_style = 'banyak' WHERE id = 'a0000000-0000-0000-0000-000000000002';
UPDATE public.tebak_bot_profiles SET bio = 'kerja di event organizer, part-time model untuk brand lokal', interests = ARRAY['fashion lokal','event planning','psikologi ringan','mindfulness'], typing_style = 'medium', emoji_style = 'sedikit' WHERE id = 'a0000000-0000-0000-0000-000000000006';
UPDATE public.tebak_bot_profiles SET bio = 'guru TK di sekolah internasional, tinggal sama orang tua dan 3 kucing', interests = ARRAY['anak kecil','kucing','baking','plant parenting'], typing_style = 'medium', emoji_style = 'banyak' WHERE id = 'a0000000-0000-0000-0000-000000000003';
UPDATE public.tebak_bot_profiles SET bio = 'admin di klinik kecantikan, introvert, lebih suka dengerin daripada ngomong', interests = ARRAY['skincare','journaling','novel','podcast true crime'], typing_style = 'singkat', emoji_style = 'jarang' WHERE id = 'a0000000-0000-0000-0000-000000000007';
UPDATE public.tebak_bot_profiles SET bio = 'data analyst di startup, hobi baca buku dan belajar hal baru', interests = ARRAY['data','buku','psikologi','life hack'], typing_style = 'medium', emoji_style = 'sedikit' WHERE id = 'a0000000-0000-0000-0000-000000000004';
UPDATE public.tebak_bot_profiles SET bio = 'arsitek junior, perfectionist, baru pindah ke Jakarta dari Bandung', interests = ARRAY['arsitektur','design','coffee shop hunting','travel'], typing_style = 'singkat', emoji_style = 'jarang' WHERE id = 'a0000000-0000-0000-0000-000000000008';

-- ============================================
-- FIX 2: RLS policies for bot message insert
-- ============================================

-- Bisik: allow bot messages
DROP POLICY IF EXISTS "Bot can insert messages" ON public.bisik_messages;
CREATE POLICY "Bot can insert messages" ON public.bisik_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = sender_id AND is_bot = true)
);

-- Care: allow bot messages
DROP POLICY IF EXISTS "Bot can insert messages" ON public.care_chat_messages;
CREATE POLICY "Bot can insert messages" ON public.care_chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = sender_id AND is_bot = true)
);

-- Care: allow bot to update sessions
DROP POLICY IF EXISTS "Bot can update sessions" ON public.care_chat_sessions;
CREATE POLICY "Bot can update sessions" ON public.care_chat_sessions FOR UPDATE USING (
  is_ai_officer = true
) WITH CHECK (
  is_ai_officer = true
);

-- ============================================
-- FIX 3: care_ai_daily_counter schema fix
-- ============================================
ALTER TABLE public.care_ai_daily_counter DROP CONSTRAINT IF EXISTS care_ai_daily_counter_pkey CASCADE;
ALTER TABLE public.care_ai_daily_counter ADD PRIMARY KEY (volunteer_id, date);

-- ============================================
-- FIX 4: care_officer_schedule unique constraint
-- ============================================
ALTER TABLE public.care_officer_schedule ADD CONSTRAINT care_officer_schedule_category_key UNIQUE (category);

-- ============================================
-- FIX 5: Add bisnis row to care_officer_schedule
-- ============================================
INSERT INTO public.care_officer_schedule (category, is_online, message)
VALUES ('bisnis', false, 'Belum ada volunteer bisnis tersedia saat ini.')
ON CONFLICT (category) DO NOTHING;
