-- ============================================================
-- 1. Fix message_type CHECK — align with code values
-- ============================================================
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages
ADD CONSTRAINT messages_message_type_check
CHECK (message_type IN ('text', 'image', 'system', 'chat', 'weekly_post', 'announcement', 'question'));

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_attachment ON messages(attachment_url) WHERE attachment_url IS NOT NULL;

-- ============================================================
-- 2. Create circle_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  meet_url      TEXT,
  notes         TEXT,
  recording_url TEXT,
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE circle_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view sessions' AND tablename = 'circle_sessions') THEN
    CREATE POLICY "Members can view sessions" ON circle_sessions FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_sessions.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Co-host can create sessions' AND tablename = 'circle_sessions') THEN
    CREATE POLICY "Co-host can create sessions" ON circle_sessions FOR INSERT
      WITH CHECK (
        EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_sessions.circle_id AND circle_members.user_id = auth.uid() AND circle_members.role IN ('co-host') AND circle_members.left_at IS NULL)
      );
  END IF;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE circle_sessions;

-- ============================================================
-- 3. Create circle_session_rsvp
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_session_rsvp (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES circle_sessions(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

ALTER TABLE circle_session_rsvp ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view RSVPs' AND tablename = 'circle_session_rsvp') THEN
    CREATE POLICY "Members can view RSVPs" ON circle_session_rsvp FOR SELECT
      USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can RSVP' AND tablename = 'circle_session_rsvp') THEN
    CREATE POLICY "Members can RSVP" ON circle_session_rsvp FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

-- ============================================================
-- 4. Create circle_mentor_qa (general Q&A, not just mentors)
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_mentor_qa (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  asked_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  answer_text   TEXT,
  answered_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  is_answered   BOOLEAN NOT NULL DEFAULT false,
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at   TIMESTAMPTZ
);

ALTER TABLE circle_mentor_qa ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view Q&A' AND tablename = 'circle_mentor_qa') THEN
    CREATE POLICY "Members can view Q&A" ON circle_mentor_qa FOR SELECT
      USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_mentor_qa.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can ask questions' AND tablename = 'circle_mentor_qa') THEN
    CREATE POLICY "Members can ask questions" ON circle_mentor_qa FOR INSERT WITH CHECK (asked_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can answer questions' AND tablename = 'circle_mentor_qa') THEN
    CREATE POLICY "Members can answer questions" ON circle_mentor_qa FOR UPDATE
      USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_mentor_qa.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL))
      WITH CHECK (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_mentor_qa.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL));
  END IF;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE circle_mentor_qa;

-- ============================================================
-- 5. Create increment_circle_member_count RPC
-- ============================================================
CREATE OR REPLACE FUNCTION increment_circle_member_count(circle_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE circles SET member_count = member_count + 1 WHERE id = circle_id;
END;
$$;

-- ============================================================
-- 6. Create attachment_reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS attachment_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  reporter_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, reporter_id)
);

ALTER TABLE attachment_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can report attachments' AND tablename = 'attachment_reports') THEN
    CREATE POLICY "Members can report attachments" ON attachment_reports FOR INSERT
      WITH CHECK (
        reporter_id = auth.uid() AND EXISTS (
          SELECT 1 FROM circle_members WHERE circle_members.circle_id = attachment_reports.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view reports for their circle' AND tablename = 'attachment_reports') THEN
    CREATE POLICY "Members can view reports for their circle" ON attachment_reports FOR SELECT
      USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = attachment_reports.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL));
  END IF;
END;
$$;

-- ============================================================
-- 7. Create circle_bans table
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_bans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL DEFAULT 'Melanggar kebijakan forum',
  banned_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  banned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  is_permanent  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(circle_id, user_id)
);

ALTER TABLE circle_bans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Members can view bans' AND tablename = 'circle_bans') THEN
    CREATE POLICY "Members can view bans" ON circle_bans FOR SELECT
      USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circle_bans.circle_id AND circle_members.user_id = auth.uid() AND circle_members.left_at IS NULL));
  END IF;
END;
$$;

-- ============================================================
-- 8. RPCs for report/ban logic
-- ============================================================

-- Check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(p_circle_id uuid, p_user_id uuid)
RETURNS TABLE(is_banned boolean, ban_reason text, expires_at timestamptz, is_permanent boolean)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT TRUE, cb.reason, cb.expires_at, cb.is_permanent
  FROM circle_bans cb
  WHERE cb.circle_id = p_circle_id AND cb.user_id = p_user_id
    AND (cb.expires_at IS NULL OR cb.expires_at > now());
END;
$$;

-- Auto-ban (3rd violation = 30 days, repeat = permanent)
CREATE OR REPLACE FUNCTION auto_ban_member(p_circle_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  prev_ban_count INT;
BEGIN
  SELECT COUNT(*) INTO prev_ban_count
  FROM circle_bans
  WHERE circle_id = p_circle_id AND user_id = p_user_id;

  IF prev_ban_count >= 1 THEN
    INSERT INTO circle_bans (circle_id, user_id, reason, is_permanent)
    VALUES (p_circle_id, p_user_id, 'Dilarang permanen: melanggar kebijakan forum setelah 3 kali peringatan', TRUE)
    ON CONFLICT (circle_id, user_id) DO UPDATE SET
      is_permanent = TRUE, expires_at = NULL, banned_at = now(),
      reason = 'Dilarang permanen: melanggar kebijakan forum setelah 3 kali peringatan';
  ELSE
    INSERT INTO circle_bans (circle_id, user_id, reason, expires_at)
    VALUES (p_circle_id, p_user_id, 'Dilarang 30 hari: melanggar kebijakan forum', now() + INTERVAL '30 days')
    ON CONFLICT (circle_id, user_id) DO UPDATE SET
      expires_at = now() + INTERVAL '30 days', is_permanent = FALSE, banned_at = now(),
      reason = 'Dilarang 30 hari: melanggar kebijakan forum';
  END IF;
END;
$$;

-- Get report count vs threshold
CREATE OR REPLACE FUNCTION get_report_count(p_message_id uuid, p_circle_id uuid)
RETURNS TABLE(report_count bigint, member_count bigint, threshold bigint, should_hide boolean)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  total_members bigint;
  total_reports bigint;
  threshold_val bigint;
BEGIN
  SELECT COUNT(*) INTO total_members
  FROM circle_members
  WHERE circle_id = p_circle_id AND left_at IS NULL;

  SELECT COUNT(*) INTO total_reports
  FROM attachment_reports
  WHERE message_id = p_message_id;

  threshold_val := CEIL(total_members * 0.2);

  RETURN QUERY
  SELECT total_reports, total_members, threshold_val, total_reports >= threshold_val;
END;
$$;

-- Add template_slug and created_by to circles if missing
ALTER TABLE circles
ADD COLUMN IF NOT EXISTS template_slug TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
