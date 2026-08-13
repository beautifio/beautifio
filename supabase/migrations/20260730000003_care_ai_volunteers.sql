-- Migration: Care AI Volunteer System
-- AI "kakak pembimbing sementara" yang standby saat human volunteer offline

-- 1. Extend care_chat_sessions for AI
ALTER TABLE public.care_chat_sessions
  ADD COLUMN IF NOT EXISTS is_ai_officer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_category_override TEXT;

-- 2. Care AI volunteers table
CREATE TABLE IF NOT EXISTS public.care_ai_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  credential TEXT NOT NULL,
  bio TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('psikologi','agama','umum','bisnis')),
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  disc_type TEXT DEFAULT 'S',
  typing_style TEXT DEFAULT 'medium' CHECK (typing_style IN ('singkat','medium','panjang')),
  is_active BOOLEAN DEFAULT true,
  daily_session_count INT DEFAULT 0,
  max_daily_sessions INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.care_ai_volunteers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AI volunteers readable by all" ON public.care_ai_volunteers;
CREATE POLICY "AI volunteers readable by all" ON public.care_ai_volunteers FOR SELECT USING (true);

-- 3. Daily session counter reset
CREATE TABLE IF NOT EXISTS public.care_ai_daily_counter (
  volunteer_id UUID PRIMARY KEY REFERENCES public.care_ai_volunteers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_count INT DEFAULT 0
);

ALTER TABLE public.care_ai_daily_counter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AI counter readable" ON public.care_ai_daily_counter;
CREATE POLICY "AI counter readable" ON public.care_ai_daily_counter FOR SELECT USING (true);
CREATE POLICY "AI counter manageable" ON public.care_ai_daily_counter FOR ALL USING (true);

-- 4. Seed 6 AI volunteers (using existing bot user UUIDs)
-- Create bot users first if not exist
DO $$
DECLARE
  bot_ids UUID[] := ARRAY[
    'b0000000-0000-0000-0000-000000000001'::UUID,
    'b0000000-0000-0000-0000-000000000002'::UUID,
    'b0000000-0000-0000-0000-000000000003'::UUID,
    'b0000000-0000-0000-0000-000000000004'::UUID,
    'b0000000-0000-0000-0000-000000000005'::UUID,
    'b0000000-0000-0000-0000-000000000006'::UUID
  ];
  b UUID;
BEGIN
  FOREACH b IN ARRAY bot_ids LOOP
    INSERT INTO public.users (id, full_name, is_bot, role, created_at)
    VALUES (b, 'AI Volunteer', true, 'care_volunteer', NOW())
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

INSERT INTO public.care_ai_volunteers (user_id, display_name, credential, bio, category, specializations, disc_type, typing_style)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Dinda', 'Mahasiswi Psikologi UI semester 7', 'magang di klinik konseling kampus, suka dengerin cerita orang', 'psikologi', ARRAY['anxiety','overthinking','quarter-life-crisis','stress'], 'S', 'medium'),
  ('b0000000-0000-0000-0000-000000000002', 'Raka', 'Mahasiswa Psikologi UGM semester 7', 'aktif di himpunan, pernah magang HR, suka bantu orang susun rencana', 'psikologi', ARRAY['career','karier','passion','pekerjaan','fresh-graduate'], 'D', 'medium'),
  ('b0000000-0000-0000-0000-000000000003', 'Mila', 'Mahasiswi Psikologi Unpad semester 5', 'volunteer di komunitas konseling remaja, paling ngerti soal relationship', 'psikologi', ARRAY['relationship','toxic','friendship','self-esteem','body-image'], 'I', 'medium'),
  ('b0000000-0000-0000-0000-000000000004', 'Zahra', 'Aktivis Rohis, hafidzah 5 juz', 'ngajar ngaji anak-anak, suka sharing perspektif Islam yg menenangkan', 'agama', ARRAY['islam','spiritual','ketenangan hati','sabar','tawakal'], 'S', 'medium'),
  ('b0000000-0000-0000-0000-000000000005', 'Yosef', 'Aktivis PMK kampus, pemusik gereja', 'volunteer di youth ministry, sharing kasih dan pengharapan', 'agama', ARRAY['kristen','pengharapan','kasih','pemulihan','purpose'], 'S', 'medium'),
  ('b0000000-0000-0000-0000-000000000006', 'Tara', 'Ex-startup founder, 5 tahun digital marketing', 'mentor UMKM gratis, udah 3x gagal startup, sekarang ngajarin yg praktis aja', 'bisnis', ARRAY['bisnis','marketing','branding','jualan online','side-hustle'], 'D', 'singkat')
ON CONFLICT (user_id) DO NOTHING;
