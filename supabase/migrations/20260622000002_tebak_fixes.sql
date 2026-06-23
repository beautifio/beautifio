-- Migration: Remove subject_deadline from RPC INSERT, add start_question_timer, add media_assets

-- 1. Remove subject_deadline from find_or_create_tebak_session
CREATE OR REPLACE FUNCTION find_or_create_tebak_session(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_status tebak_status;
  v_role text;
  v_new_id uuid;
  v_round_id uuid;
BEGIN
  SELECT id, status,
    CASE WHEN player_a_id = p_user_id THEN 'a' ELSE 'b' END
  INTO v_new_id, v_status, v_role
  FROM tebak_sessions
  WHERE (player_a_id = p_user_id OR player_b_id = p_user_id)
    AND status = 'waiting'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'sessionId', v_new_id,
      'playerRole', v_role,
      'isNew', false
    );
  END IF;

  SELECT id INTO v_new_id
  FROM tebak_sessions
  WHERE status = 'waiting'
    AND player_a_id IS NOT NULL
    AND player_a_id != p_user_id
    AND player_b_id IS NULL
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    UPDATE tebak_sessions SET
      player_b_id = p_user_id,
      status = 'active',
      current_subject = CASE WHEN random() > 0.5 THEN 'a'::tebak_player ELSE 'b'::tebak_player END
    WHERE id = v_new_id;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number)
    SELECT v_new_id, current_subject, 1
    FROM tebak_sessions WHERE id = v_new_id
    RETURNING id INTO v_round_id;

    INSERT INTO tebak_questions (round_id, question_bank_id, question_text, options, sequence_number)
    SELECT v_round_id, id, question_text, options, ROW_NUMBER() OVER ()
    FROM (
      SELECT id, question_text, options
      FROM tebak_question_bank
      WHERE is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    RETURN jsonb_build_object(
      'sessionId', v_new_id,
      'playerRole', 'b',
      'isNew', true
    );
  END IF;

  INSERT INTO tebak_sessions (player_a_id, status)
  VALUES (p_user_id, 'waiting')
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'sessionId', v_new_id,
    'playerRole', 'a',
    'isNew', true
  );
END;
$$;

-- 2. Remove subject_deadline from activate_tebak_session
CREATE OR REPLACE FUNCTION activate_tebak_session(
  p_session_id uuid,
  p_player_b_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session tebak_sessions;
  v_subject tebak_player;
  v_round_id uuid;
BEGIN
  SELECT * INTO v_session
  FROM tebak_sessions
  WHERE id = p_session_id AND status = 'waiting'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF v_session.player_b_id IS NOT NULL THEN RETURN NULL; END IF;

  v_subject := CASE WHEN random() > 0.5 THEN 'a'::tebak_player ELSE 'b'::tebak_player END;

  UPDATE tebak_sessions SET
    player_b_id = p_player_b_id,
    status = 'active',
    current_subject = v_subject
  WHERE id = p_session_id;

  INSERT INTO tebak_rounds (session_id, subject_player, round_number)
  VALUES (p_session_id, v_subject, 1)
  RETURNING id INTO v_round_id;

  INSERT INTO tebak_questions (round_id, question_bank_id, question_text, options, sequence_number)
  SELECT v_round_id, id, question_text, options, ROW_NUMBER() OVER ()
  FROM (
    SELECT id, question_text, options
    FROM tebak_question_bank
    WHERE is_active = true
    ORDER BY random()
    LIMIT 5
  ) sub;

  RETURN v_round_id;
END;
$$;

-- 3. Create start_question_timer RPC
CREATE OR REPLACE FUNCTION start_question_timer(
  p_session_id uuid,
  p_seq int
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round_id uuid;
  v_deadline timestamptz;
BEGIN
  SELECT id INTO v_round_id
  FROM tebak_rounds
  WHERE session_id = p_session_id
    AND round_number = (SELECT current_round FROM tebak_sessions WHERE id = p_session_id);

  IF NOT FOUND THEN RETURN NULL; END IF;

  UPDATE tebak_questions
  SET subject_deadline = NOW() + INTERVAL '15 seconds'
  WHERE round_id = v_round_id
    AND sequence_number = p_seq
    AND subject_deadline IS NULL
  RETURNING subject_deadline INTO v_deadline;

  RETURN v_deadline;
END;
$$;

-- 4. Create media_assets table for banner slots
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO media_assets (slot, url)
VALUES ('tebak_jeda_banner', '')
ON CONFLICT (slot) DO NOTHING;
