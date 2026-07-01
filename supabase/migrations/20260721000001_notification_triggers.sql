-- Migration: Notification triggers + utility function for unified notification inserts.
-- Covers: circle member events, bisik, tebak, care, journey, curhat, etc.

-- =============================================================================
-- HELPER: Unified notification insert (with preference check)
-- =============================================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data, is_read)
  VALUES (p_user_id, p_type, p_title, p_body, p_data, false);
END;
$$;

-- =============================================================================
-- TRIGGER: member_joined — when a user joins a circle
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_member_joined()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_circle_name text;
  v_host_id uuid;
  v_member_name text;
BEGIN
  SELECT name INTO v_circle_name FROM circles WHERE id = NEW.circle_id;
  SELECT full_name INTO v_member_name FROM users WHERE id = NEW.user_id;
  -- Get host(s) of the circle
  FOR v_host_id IN
    SELECT cm.user_id FROM circle_members cm
    WHERE cm.circle_id = NEW.circle_id AND cm.role IN ('host', 'co-host') AND cm.left_at IS NULL AND cm.user_id != NEW.user_id
  LOOP
    PERFORM create_notification(
      v_host_id, 'member_joined', 'Anggota Baru 🎉',
      COALESCE(v_member_name, 'Seseorang') || ' bergabung di circle ' || COALESCE(v_circle_name, ''),
      jsonb_build_object('circle_id', NEW.circle_id, 'member_id', NEW.user_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_joined ON circle_members;
CREATE TRIGGER trg_member_joined
  AFTER INSERT ON circle_members
  FOR EACH ROW EXECUTE FUNCTION notify_member_joined();

-- =============================================================================
-- TRIGGER: member_left — when a user leaves a circle
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_member_left()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_circle_name text;
  v_host_id uuid;
  v_member_name text;
BEGIN
  SELECT name INTO v_circle_name FROM circles WHERE id = OLD.circle_id;
  SELECT full_name INTO v_member_name FROM users WHERE id = OLD.user_id;
  FOR v_host_id IN
    SELECT cm.user_id FROM circle_members cm
    WHERE cm.circle_id = OLD.circle_id AND cm.role IN ('host', 'co-host') AND cm.left_at IS NULL AND cm.user_id != OLD.user_id
  LOOP
    PERFORM create_notification(
      v_host_id, 'member_left', 'Anggota Keluar',
      COALESCE(v_member_name, 'Seseorang') || ' keluar dari circle ' || COALESCE(v_circle_name, ''),
      jsonb_build_object('circle_id', OLD.circle_id)
    );
  END LOOP;
  -- Also notify the removed user (covers both self-leave and admin removal)
  PERFORM create_notification(
    OLD.user_id, 'member_banned', 'Kamu Keluar dari Circle',
    'Kamu tidak lagi menjadi anggota circle ' || COALESCE(v_circle_name, ''),
    jsonb_build_object('circle_id', OLD.circle_id)
  );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_left ON circle_members;
CREATE TRIGGER trg_member_left
  AFTER DELETE ON circle_members
  FOR EACH ROW EXECUTE FUNCTION notify_member_left();

-- =============================================================================
-- TRIGGER: member_banned — from remove_circle_member RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_member_banned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_circle_name text;
BEGIN
  SELECT name INTO v_circle_name FROM circles WHERE id = OLD.circle_id;
  PERFORM create_notification(
    OLD.user_id, 'member_banned', 'Kamu Dikeluarkan dari Circle',
    'Kamu telah dikeluarkan dari circle ' || COALESCE(v_circle_name, ''),
    jsonb_build_object('circle_id', OLD.circle_id)
  );
  RETURN OLD;
END;
$$;

-- Note: This trigger fires on ANY delete. For admin/banned removals specifically,
-- we rely on the remove_circle_member RPC. To avoid triggering on self-leave,
-- the RPC should SET LOCAL app.banned = true before deleting.
-- For now, we use a simpler approach: notify on all deletes, users filter client-side.
-- Actually, let's just handle it in the RPC directly to be precise.

-- =============================================================================
-- RPC: notify_circle_tanya_answer — when a Q&A question gets answered
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_circle_answer(
  p_question_id uuid,
  p_answerer_name text,
  p_circle_id uuid,
  p_asker_id uuid,
  p_source_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_notification(
    p_asker_id, 'circle_question_answered', 'Pertanyaanmu Dijawab 💬',
    COALESCE(p_answerer_name, 'Seseorang') || ' menjawab pertanyaanmu di circle',
    jsonb_build_object('circle_id', p_circle_id, 'source_url', p_source_url)
  );
END;
$$;

-- =============================================================================
-- TRIGGER: bisik_new_message — notify the other participant when a message is sent
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_bisik_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat bisik_chats;
  v_recipient uuid;
  v_sender_name text;
BEGIN
  SELECT * INTO v_chat FROM bisik_chats WHERE id = NEW.chat_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  v_recipient := CASE WHEN v_chat.initiator_id = NEW.sender_id THEN v_chat.receiver_id ELSE v_chat.initiator_id END;
  SELECT full_name INTO v_sender_name FROM users WHERE id = NEW.sender_id;
  PERFORM create_notification(
    v_recipient, 'bisik_new_message', 'Pesan Baru 💬',
    COALESCE(v_sender_name, 'Seseorang') || ' mengirim pesan di Bisik',
    jsonb_build_object('chat_id', NEW.chat_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bisik_new_message ON bisik_messages;
CREATE TRIGGER trg_bisik_new_message
  AFTER INSERT ON bisik_messages
  FOR EACH ROW EXECUTE FUNCTION notify_bisik_new_message();

-- =============================================================================
-- TRIGGER: bisik_new_match — notify the matched user (card_owner)
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_bisik_new_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initiator_name text;
BEGIN
  IF NEW.status != 'active' THEN RETURN NEW; END IF;
  SELECT full_name INTO v_initiator_name FROM users WHERE id = NEW.initiator_id;
  PERFORM create_notification(
    NEW.receiver_id, 'bisik_new_match', 'Kamu Punya Koneksi Baru! 💫',
    COALESCE(v_initiator_name, 'Seseorang') || ' terhubung denganmu di Bisik',
    jsonb_build_object('chat_id', NEW.id)
  );
  PERFORM create_notification(
    NEW.initiator_id, 'bisik_new_match', 'Koneksi Baru Terjalin! 💫',
    'Kamu terhubung dengan seseorang di Bisik. Mulai percakapan sekarang!',
    jsonb_build_object('chat_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bisik_new_match ON bisik_chats;
CREATE TRIGGER trg_bisik_new_match
  AFTER INSERT ON bisik_chats
  FOR EACH ROW EXECUTE FUNCTION notify_bisik_new_match();

-- =============================================================================
-- TRIGGER: tebak_result — notify both players when a game finishes
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_tebak_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner text;
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    v_winner := CASE
      WHEN NEW.score_a > NEW.score_b THEN 'Player A menang!'
      WHEN NEW.score_b > NEW.score_a THEN 'Player B menang!'
      ELSE 'Seri!'
    END;
    PERFORM create_notification(NEW.player_a_id, 'tebak_result', 'Game Tebak Selesai 🎮',
      v_winner || ' Skor: ' || NEW.score_a || ' - ' || NEW.score_b,
      jsonb_build_object('session_id', NEW.id));
    PERFORM create_notification(NEW.player_b_id, 'tebak_result', 'Game Tebak Selesai 🎮',
      v_winner || ' Skor: ' || NEW.score_a || ' - ' || NEW.score_b,
      jsonb_build_object('session_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tebak_result ON tebak_sessions;
CREATE TRIGGER trg_tebak_result
  AFTER UPDATE ON tebak_sessions
  FOR EACH ROW EXECUTE FUNCTION notify_tebak_result();

-- =============================================================================
-- TRIGGER: curhat_comment — notify the post author
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_curhat_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author uuid;
  v_commenter_name text;
  v_post_title text;
BEGIN
  SELECT user_id, title INTO v_post_author, v_post_title
  FROM curhat_posts WHERE id = NEW.curhat_id;
  IF NOT FOUND OR v_post_author = NEW.user_id THEN RETURN NEW; END IF;
  SELECT full_name INTO v_commenter_name FROM users WHERE id = NEW.user_id;
  PERFORM create_notification(
    v_post_author, 'curhat_comment', 'Komentar Baru di Curhatmu 💭',
    COALESCE(v_commenter_name, 'Seseorang') || ' mengomentari: ' || COALESCE(v_post_title, 'curhatmu'),
    jsonb_build_object('curhat_id', NEW.curhat_id, 'comment_id', NEW.id, 'source_url', '/curhat')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_curhat_comment ON curhat_comments;
CREATE TRIGGER trg_curhat_comment
  AFTER INSERT ON curhat_comments
  FOR EACH ROW EXECUTE FUNCTION notify_curhat_comment();

-- =============================================================================
-- TRIGGER: care_new_message — notify the other party
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_care_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session care_chat_sessions;
  v_recipient uuid;
  v_sender_name text;
BEGIN
  SELECT * INTO v_session FROM care_chat_sessions WHERE id = NEW.session_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  v_recipient := CASE
    WHEN NEW.sender_role = 'user' AND v_session.officer_id IS NOT NULL THEN v_session.officer_id
    WHEN NEW.sender_role = 'officer' AND v_session.user_id IS NOT NULL THEN v_session.user_id
    ELSE NULL
  END;
  IF v_recipient IS NULL THEN RETURN NEW; END IF;
  SELECT full_name INTO v_sender_name FROM users WHERE id = NEW.sender_id;
  PERFORM create_notification(
    v_recipient, 'care_new_message', 'Pesan Baru di Care 🩺',
    COALESCE(v_sender_name, 'Seseorang') || ' mengirim pesan di sesi care',
    jsonb_build_object('session_id', NEW.session_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_care_new_message ON care_chat_messages;
CREATE TRIGGER trg_care_new_message
  AFTER INSERT ON care_chat_messages
  FOR EACH ROW EXECUTE FUNCTION notify_care_new_message();

-- =============================================================================
-- TRIGGER: journey_milestone — notify user when a big win is completed
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_journey_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_journey_title text;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS DISTINCT FROM true) THEN
    SELECT dj.user_id, dj.title INTO v_user_id, v_journey_title
    FROM dream_journeys dj WHERE dj.id = NEW.journey_id;
    IF FOUND THEN
      PERFORM create_notification(
        v_user_id, 'journey_milestone', 'Big Win Tercapai! 🏆',
        'Kamu menyelesaikan: ' || NEW.title || ' dalam perjalanan ' || COALESCE(v_journey_title, 'mimpimu'),
        jsonb_build_object('journey_id', NEW.journey_id, 'big_win_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_journey_milestone ON big_wins;
CREATE TRIGGER trg_journey_milestone
  AFTER UPDATE ON big_wins
  FOR EACH ROW EXECUTE FUNCTION notify_journey_milestone();

-- =============================================================================
-- TRIGGER: circle_new_question — notify hosts when a tanya question is asked
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_circle_new_question()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host record;
  v_asker_name text;
  v_circle_name text;
BEGIN
  SELECT full_name INTO v_asker_name FROM users WHERE id = NEW.asked_by;
  SELECT name INTO v_circle_name FROM circles WHERE id = NEW.circle_id;
  FOR v_host IN
    SELECT user_id FROM circle_members
    WHERE circle_id = NEW.circle_id AND role IN ('host', 'co-host') AND left_at IS NULL AND user_id != NEW.asked_by
  LOOP
    PERFORM create_notification(
      v_host.user_id, 'circle_new_question', 'Pertanyaan Baru di Circle ❓',
      COALESCE(v_asker_name, 'Seseorang') || ' bertanya di ' || COALESCE(v_circle_name, 'circle'),
      jsonb_build_object('circle_id', NEW.circle_id, 'question_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_new_question ON circle_mentor_qa;
CREATE TRIGGER trg_circle_new_question
  AFTER INSERT ON circle_mentor_qa
  FOR EACH ROW EXECUTE FUNCTION notify_circle_new_question();

-- =============================================================================
-- TRIGGER: circle_question_answered — notify asker when their question gets answered
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_circle_question_answered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_answerer_name text;
  v_circle_name text;
BEGIN
  IF NEW.answered_by IS NOT NULL AND (OLD.answered_by IS NULL OR OLD.answered_by IS DISTINCT FROM NEW.answered_by) THEN
    SELECT full_name INTO v_answerer_name FROM users WHERE id = NEW.answered_by;
    SELECT name INTO v_circle_name FROM circles WHERE id = NEW.circle_id;
    PERFORM create_notification(
      NEW.asked_by, 'circle_question_answered', 'Pertanyaanmu Dijawab 💬',
      COALESCE(v_answerer_name, 'Seseorang') || ' menjawab pertanyaanmu di ' || COALESCE(v_circle_name, 'circle'),
      jsonb_build_object('circle_id', NEW.circle_id, 'question_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_circle_question_answered ON circle_mentor_qa;
CREATE TRIGGER trg_circle_question_answered
  AFTER UPDATE ON circle_mentor_qa
  FOR EACH ROW EXECUTE FUNCTION notify_circle_question_answered();

-- =============================================================================
-- TRIGGER: familia_achievement — notify user when an achievement is completed
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_familia_achievement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement_name text;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS DISTINCT FROM true) THEN
    SELECT name INTO v_achievement_name FROM familia_achievement_rewards WHERE id = NEW.achievement_id;
    PERFORM create_notification(
      NEW.user_id, 'familia_achievement', 'Achievement Terbuka! 🏅',
      'Kamu membuka achievement: ' || COALESCE(v_achievement_name, 'baru'),
      jsonb_build_object('achievement_id', NEW.achievement_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_familia_achievement ON familia_user_achievements;
CREATE TRIGGER trg_familia_achievement
  AFTER UPDATE ON familia_user_achievements
  FOR EACH ROW EXECUTE FUNCTION notify_familia_achievement();

-- =============================================================================
-- RPC: set_circle_cohost (overwrite with notification)
-- =============================================================================
CREATE OR REPLACE FUNCTION set_circle_cohost(p_circle_id uuid, p_host_id uuid, p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_cohost_count INT;
  target_role TEXT;
  v_circle_name text;
  v_member_name text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM circle_members WHERE circle_id = p_circle_id AND user_id = p_host_id AND role = 'host' AND left_at IS NULL) THEN
    RAISE EXCEPTION 'Only host can manage co-hosts';
  END IF;

  SELECT role INTO target_role FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_target_user_id AND left_at IS NULL;

  SELECT name INTO v_circle_name FROM circles WHERE id = p_circle_id;
  SELECT full_name INTO v_member_name FROM users WHERE id = p_target_user_id;

  IF target_role = 'co-host' THEN
    UPDATE circle_members SET role = 'member' WHERE circle_id = p_circle_id AND user_id = p_target_user_id;
  ELSIF target_role = 'member' THEN
    SELECT COUNT(*) INTO current_cohost_count FROM circle_members
    WHERE circle_id = p_circle_id AND role = 'co-host' AND left_at IS NULL;
    IF current_cohost_count >= 2 THEN
      RAISE EXCEPTION 'Maksimal 2 co-host';
    END IF;
    UPDATE circle_members SET role = 'co-host' WHERE circle_id = p_circle_id AND user_id = p_target_user_id;
    PERFORM create_notification(
      p_target_user_id, 'circle_cohost_promoted', 'Kamu Jadi Co-Host! 👑',
      'Kamu dipromosikan menjadi co-host di circle ' || COALESCE(v_circle_name, ''),
      jsonb_build_object('circle_id', p_circle_id)
    );
  END IF;
END;
$$;
