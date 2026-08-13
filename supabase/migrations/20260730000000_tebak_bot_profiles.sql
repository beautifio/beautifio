-- Migration: Active bot profiles with DISC personality
-- Task 1: Table + seed 8 bots matching existing users.is_bot = true

CREATE TABLE IF NOT EXISTS tebak_bot_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  disc_type TEXT NOT NULL CHECK (disc_type IN ('D','I','S','C')),
  disc_secondary TEXT CHECK (disc_secondary IN ('D','I','S','C')),
  komunikasi_type TEXT NOT NULL CHECK (komunikasi_type IN ('Langsung','Empatik','Ekspresif','Tenang')),
  consistency_pct INTEGER DEFAULT 80 CHECK (consistency_pct BETWEEN 0 AND 100),
  guess_accuracy_pct INTEGER DEFAULT 40 CHECK (guess_accuracy_pct BETWEEN 0 AND 100),
  answer_delay_min_ms INTEGER DEFAULT 3000,
  answer_delay_max_ms INTEGER DEFAULT 8000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: anyone can read bot profiles (non-secret)
ALTER TABLE tebak_bot_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Bot profiles readable by all" ON tebak_bot_profiles;
CREATE POLICY "Bot profiles readable by all" ON tebak_bot_profiles FOR SELECT USING (true);

-- Seed 8 bots. Match UUIDs with existing bot users (update if different):
-- Run this first to see existing bot UUIDs:
-- SELECT id, full_name, is_bot FROM public.users WHERE is_bot = true LIMIT 10;

-- Pick 8 bots from the pool (low/medium/high win-rate mix)
INSERT INTO tebak_bot_profiles (id, display_name, disc_type, disc_secondary, komunikasi_type, consistency_pct, guess_accuracy_pct)
VALUES
  -- DISC D: Dominance — "Langsung"
  ('a0000000-0000-0000-0000-000000000001', 'Rani',  'D', NULL, 'Langsung',  80, 40),
  ('a0000000-0000-0000-0000-000000000005', 'Putri', 'D', 'I',  'Langsung',  80, 40),
  -- DISC I: Influence — "Ekspresif"
  ('a0000000-0000-0000-0000-000000000002', 'Sinta', 'I', NULL, 'Ekspresif', 80, 40),
  ('a0000000-0000-0000-0000-000000000006', 'Anisa', 'I', 'S',  'Ekspresif', 80, 40),
  -- DISC S: Steadiness — "Empatik"
  ('a0000000-0000-0000-0000-000000000003', 'Dewi',  'S', NULL, 'Empatik',   80, 40),
  ('a0000000-0000-0000-0000-000000000007', 'Lita',  'S', 'C',  'Empatik',   80, 40),
  -- DISC C: Conscientiousness — "Tenang"
  ('a0000000-0000-0000-0000-000000000004', 'Maya',  'C', NULL, 'Tenang',    80, 40),
  ('a0000000-0000-0000-0000-000000000008', 'Karin', 'C', 'D',  'Tenang',    80, 40)
ON CONFLICT (id) DO NOTHING;
