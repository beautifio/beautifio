-- 00020 — Add option_disc column to tebak_question_bank + seed DISC questions.
--
-- Root cause: migration 20260712000000 claimed option_disc in tebak_question_bank
-- was "added manually via SQL Editor in Tahap 1", but production DB never got it.
-- Result: every INSERT/SELECT referencing option_disc in tebak_question_bank
-- crashed. Plus: tebak_question_bank has 0 rows category='disc' → DISC round R1
-- gets 0 questions → game stuck.
--
-- Fix:
--   1. ALTER TABLE tebak_question_bank ADD COLUMN option_disc jsonb (idempotent).
--   2. Seed 6 DISC questions with option_disc (parallel to options[]).
--   3. Re-add option_disc to activate/advance functions (migration 00021).
--
-- Idempotent: ADD COLUMN IF NOT EXISTS; seed only if no active disc question.

BEGIN;

ALTER TABLE public.tebak_question_bank
  ADD COLUMN IF NOT EXISTS option_disc jsonb;

-- Allow 'disc' category (missing from original check constraint).
ALTER TABLE public.tebak_question_bank DROP CONSTRAINT IF EXISTS tebak_question_bank_category_check;
ALTER TABLE public.tebak_question_bank ADD CONSTRAINT tebak_question_bank_category_check
  CHECK (category = ANY (ARRAY['umum'::text,'makanan'::text,'hobi'::text,'kepribadian'::text,'hiburan'::text,'gaya_hidup'::text,'pendidikan'::text,'percintaan'::text,'disc'::text]));

INSERT INTO public.tebak_question_bank (question_text, options, option_disc, category, is_active)
SELECT q.question_text, q.options::jsonb, q.option_disc::jsonb, 'disc', true
FROM (VALUES
  ('Saat kerja kelompok, kamu cenderung?', '["Memimpin","Bicara","Mendukung","Analisis"]', '["D","I","S","C"]'),
  ('Kalau ada masalah, reaksimu biasanya?', '["Langsung bertindak","Bicarakan","Diam sebentar","Cari data dulu"]', '["D","I","S","C"]'),
  ('Kamu merasa paling nyaman saat?', '["Mengontrol","Menghibur","Menyelaraskan","Mempelajari"]', '["D","I","S","C"]'),
  ('Kalau diminta presentasi, kamu?', '["Tegas & cepat","Antusias & fun","Tenang & rapi","Detail & terstruktur"]', '["D","I","S","C"]'),
  ('Saat bertemu orang baru, kamu?', '["Dominan","Ramah","Pendengar","Observan"]', '["D","I","S","C"]'),
  ('Kalau rencana berubah mendadak, kamu?', '["Ambil alih","Nyesuaikan & lanjut","Tetap sabar","Evaluasi ulang"]', '["D","I","S","C"]')
) AS q(question_text, options, option_disc)
WHERE NOT EXISTS (SELECT 1 FROM public.tebak_question_bank WHERE category='disc' AND is_active=true);

COMMIT;

NOTIFY pgrst, 'reload schema';
