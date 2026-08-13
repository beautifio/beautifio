-- Migration: Bisik AI Bot System
-- extends tebak_bot_profiles + creates bisik_bot_chats + weekly limits

-- 1. Extend tebak_bot_profiles with full identity columns
ALTER TABLE public.tebak_bot_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS typing_style TEXT DEFAULT 'medium' CHECK (typing_style IN ('singkat','medium','panjang')),
  ADD COLUMN IF NOT EXISTS emoji_style TEXT DEFAULT 'sedikit' CHECK (emoji_style IN ('banyak','sedikit','jarang')),
  ADD COLUMN IF NOT EXISTS active_chat_count INT DEFAULT 0;

-- 2. Bisik bot chat sessions (user-bot weekly pair)
CREATE TABLE IF NOT EXISTS public.bisik_bot_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.bisik_chats(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  reply_count INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','frozen','ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.bisik_bot_chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Bot chats readable by participants" ON public.bisik_bot_chats;
CREATE POLICY "Bot chats readable by participants" ON public.bisik_bot_chats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Bot chats readable by bot owner" ON public.bisik_bot_chats;
CREATE POLICY "Bot chats manageable by system" ON public.bisik_bot_chats FOR ALL USING (true);

-- 3. Weekly bot user counter (max 3 users per bot per week)
CREATE TABLE IF NOT EXISTS public.bisik_bot_weekly (
  bot_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  user_count INT DEFAULT 1,
  mood_variant INT DEFAULT 1,
  PRIMARY KEY (bot_id, week_start)
);

ALTER TABLE public.bisik_bot_weekly ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Bot weekly readable" ON public.bisik_bot_weekly;
CREATE POLICY "Bot weekly readable" ON public.bisik_bot_weekly FOR SELECT USING (true);
DROP POLICY IF EXISTS "Bot weekly manageable" ON public.bisik_bot_weekly;
CREATE POLICY "Bot weekly manageable" ON public.bisik_bot_weekly FOR ALL USING (true);

-- 4. Index for active bot searches
CREATE INDEX IF NOT EXISTS idx_bisik_bot_chats_user_week ON public.bisik_bot_chats(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_bisik_bot_chats_bot_week ON public.bisik_bot_chats(bot_id, week_start);
CREATE INDEX IF NOT EXISTS idx_bisik_bot_chats_chat ON public.bisik_bot_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_bisik_bot_weekly_bot_week ON public.bisik_bot_weekly(bot_id, week_start);
