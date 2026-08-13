-- Care CRM: Survey, Meeting, Metrics Tables

-- 1. Satisfaction Survey
CREATE TABLE IF NOT EXISTS public.care_satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.care_chat_sessions(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  officer_id UUID REFERENCES public.users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.care_satisfaction_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own surveys" ON public.care_satisfaction_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own surveys" ON public.care_satisfaction_surveys FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin')));

-- 2. Meeting Invites
CREATE TABLE IF NOT EXISTS public.care_meeting_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.care_chat_sessions(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('zoom','google_meet')),
  link TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','joined','missed','cancelled'))
);

ALTER TABLE public.care_meeting_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants can view meeting" ON public.care_meeting_invites FOR SELECT USING (
  EXISTS (SELECT 1 FROM care_chat_sessions WHERE id = session_id AND (user_id = auth.uid() OR officer_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);
CREATE POLICY "Officers can insert meetings" ON public.care_meeting_invites FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM care_chat_sessions WHERE id = session_id AND officer_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- 3. Session Metrics (auto-calculated via trigger on session close)
CREATE TABLE IF NOT EXISTS public.care_session_metrics (
  session_id UUID PRIMARY KEY REFERENCES public.care_chat_sessions(id) ON DELETE CASCADE,
  first_response_at TIMESTAMPTZ,
  response_time_seconds INT DEFAULT 0,
  resolution_time_seconds INT DEFAULT 0,
  message_count_user INT DEFAULT 0,
  message_count_officer INT DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.care_session_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Metrics readable by admins" ON public.care_session_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
);

-- 4. Trigger: auto-calculate metrics when session closes
CREATE OR REPLACE FUNCTION calc_care_session_metrics()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_first_officer_msg TIMESTAMPTZ;
  v_first_user_msg TIMESTAMPTZ;
  v_user_count INT;
  v_officer_count INT;
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    -- First response: time from first user message to first officer message
    SELECT MIN(created_at) INTO v_first_user_msg FROM care_chat_messages WHERE session_id = NEW.id AND sender_role = 'user';
    SELECT MIN(created_at) INTO v_first_officer_msg FROM care_chat_messages WHERE session_id = NEW.id AND sender_role = 'officer';
    
    -- Message counts
    SELECT COUNT(*) INTO v_user_count FROM care_chat_messages WHERE session_id = NEW.id AND sender_role = 'user';
    SELECT COUNT(*) INTO v_officer_count FROM care_chat_messages WHERE session_id = NEW.id AND sender_role = 'officer';

    INSERT INTO care_session_metrics (session_id, first_response_at, response_time_seconds, resolution_time_seconds, message_count_user, message_count_officer)
    VALUES (
      NEW.id,
      v_first_officer_msg,
      CASE WHEN v_first_user_msg IS NOT NULL AND v_first_officer_msg IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (v_first_officer_msg - v_first_user_msg))::INT ELSE 0 END,
      EXTRACT(EPOCH FROM (NOW() - NEW.created_at))::INT,
      v_user_count,
      v_officer_count
    )
    ON CONFLICT (session_id) DO UPDATE SET
      resolution_time_seconds = EXTRACT(EPOCH FROM (NOW() - NEW.created_at))::INT,
      calculated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_care_metrics ON care_chat_sessions;
CREATE TRIGGER trg_care_metrics
  AFTER UPDATE ON care_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION calc_care_session_metrics();
