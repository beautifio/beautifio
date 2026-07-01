-- Migration: Fix vague/incorrect notification messages.
-- Fixes: mention wrong name, tanya_answer empty body, bisik details, care context.

-- =============================================================================
-- FIX 1: notify_mentions — show ACTOR name, not target name. Add body for tanya_answer.
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_mentions(
  p_text text,
  p_source text,
  p_source_id text,
  p_source_url text,
  p_actor_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mention_pattern text := '@(\w[\w\s]{0,24}\w)';
  matched_name text;
  target_user record;
  actor_name text;
  circle_name text;
  article_title text;
BEGIN
  SELECT full_name INTO actor_name FROM users WHERE id = p_actor_id;

  FOR matched_name IN
    SELECT DISTINCT trim(m[1]) AS name
    FROM regexp_matches(p_text, mention_pattern, 'g') AS m
  LOOP
    IF length(matched_name) < 2 THEN CONTINUE; END IF;

    SELECT id, full_name INTO target_user
    FROM users
    WHERE full_name ILIKE matched_name
    LIMIT 1;

    IF NOT FOUND THEN CONTINUE; END IF;
    IF target_user.id = p_actor_id THEN CONTINUE; END IF;

    IF EXISTS (
      SELECT 1 FROM notification_preferences
      WHERE user_id = target_user.id
        AND notification_type = p_source
        AND enabled = true
    ) THEN
      circle_name := '';
      article_title := '';

      IF p_source = 'circle_mention' THEN
        SELECT name INTO circle_name FROM circles WHERE id = p_source_id::uuid;
      ELSIF p_source = 'inspirasi_mention' THEN
        SELECT title INTO article_title FROM stories WHERE id = p_source_id::uuid;
      END IF;

      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        target_user.id,
        p_source,
        'Kamu disebut oleh @' || COALESCE(actor_name, 'seseorang'),
        CASE
          WHEN circle_name != '' THEN 'Di forum "' || circle_name || '"'
          WHEN article_title != '' THEN 'Di artikel "' || article_title || '"'
          WHEN p_source = 'tanya_answer' THEN 'Di sesi tanya jawab'
          ELSE 'Di Beautifio'
        END,
        jsonb_build_object(
          'source_url', p_source_url,
          'source_id', p_source_id,
          'actor_id', p_actor_id
        )
      );
    END IF;
  END LOOP;
END;
$$;

-- =============================================================================
-- FIX 2: bisik_new_message — include message preview (first 60 chars)
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
  v_preview text;
BEGIN
  SELECT * INTO v_chat FROM bisik_chats WHERE id = NEW.chat_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  v_recipient := CASE WHEN v_chat.initiator_id = NEW.sender_id THEN v_chat.receiver_id ELSE v_chat.initiator_id END;
  SELECT full_name INTO v_sender_name FROM users WHERE id = NEW.sender_id;
  v_preview := left(NEW.content, 60);
  IF length(NEW.content) > 60 THEN v_preview := v_preview || '...'; END IF;
  PERFORM create_notification(
    v_recipient, 'bisik_new_message', COALESCE(v_sender_name, 'Seseorang'),
    v_preview,
    jsonb_build_object('chat_id', NEW.chat_id)
  );
  RETURN NEW;
END;
$$;

-- =============================================================================
-- FIX 3: bisik_new_match — tell initiator WHO they matched with
-- =============================================================================
CREATE OR REPLACE FUNCTION notify_bisik_new_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initiator_name text;
  v_receiver_name text;
BEGIN
  IF NEW.status != 'active' THEN RETURN NEW; END IF;
  SELECT full_name INTO v_initiator_name FROM users WHERE id = NEW.initiator_id;
  SELECT full_name INTO v_receiver_name FROM users WHERE id = NEW.receiver_id;
  PERFORM create_notification(
    NEW.receiver_id, 'bisik_new_match', 'Kamu Punya Koneksi Baru! 💫',
    COALESCE(v_initiator_name, 'Seseorang') || ' terhubung denganmu di Bisik',
    jsonb_build_object('chat_id', NEW.id)
  );
  PERFORM create_notification(
    NEW.initiator_id, 'bisik_new_match', 'Koneksi Baru Terjalin! 💫',
    'Kamu terhubung dengan ' || COALESCE(v_receiver_name, 'seseorang') || ' di Bisik. Mulai percakapan sekarang!',
    jsonb_build_object('chat_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

-- =============================================================================
-- FIX 4: care_new_message — include category context
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
    v_recipient, 'care_new_message', COALESCE(v_sender_name, 'Seseorang'),
    'Pesan baru di sesi ' || COALESCE(v_session.category, 'care') || ' — ' || left(NEW.content, 40) || CASE WHEN length(NEW.content) > 40 THEN '...' ELSE '' END,
    jsonb_build_object('session_id', NEW.session_id)
  );
  RETURN NEW;
END;
$$;
