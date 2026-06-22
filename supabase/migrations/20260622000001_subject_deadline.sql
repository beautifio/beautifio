-- Migration: Add subject_deadline to tebak_questions
-- Subject now has 20 seconds to answer, otherwise guesser wins

ALTER TABLE tebak_questions ADD COLUMN IF NOT EXISTS subject_deadline TIMESTAMPTZ;

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

    INSERT INTO tebak_questions (round_id, question_bank_id, question_text, options, sequence_number, subject_deadline)
    SELECT v_round_id, id, question_text, options, ROW_NUMBER() OVER (), NOW() + INTERVAL '20 seconds'
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

  INSERT INTO tebak_questions (round_id, question_bank_id, question_text, options, sequence_number, subject_deadline)
  SELECT v_round_id, id, question_text, options, ROW_NUMBER() OVER (), NOW() + INTERVAL '20 seconds'
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
