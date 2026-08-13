-- Care CRM System: multi-volunteer queue + auto-assign + transfer
-- Run all at once

-- 1. Extend care_officers
ALTER TABLE public.care_officers
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_sessions INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS specialization TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Extend care_chat_sessions
ALTER TABLE public.care_chat_sessions
  ADD COLUMN IF NOT EXISTS transferred_from UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS transferred_to UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ;

-- 3. Queue table
CREATE TABLE IF NOT EXISTS public.care_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.care_chat_sessions(id) ON DELETE CASCADE UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.care_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Queue readable by all" ON public.care_queue;
CREATE POLICY "Queue readable by all" ON public.care_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "Queue manageable by admin" ON public.care_queue;
CREATE POLICY "Queue manageable by admin" ON public.care_queue FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','superadmin')));

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_care_queue_category ON public.care_queue(category, created_at);
CREATE INDEX IF NOT EXISTS idx_care_officers_online ON public.care_officers(is_online) WHERE is_online = true;
