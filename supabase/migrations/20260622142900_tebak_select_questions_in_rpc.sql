-- Migration: Select questions inside RPCs (atomic) to prevent race condition
-- where session activates before questions are inserted

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
  -- 1. Check if user already has a session
  SELECT id, status,
    CASE WHEN player_a_id = p_user_id THEN 'a' ELSE 'b' END
  INTO v_new_id, v_status, v_role
  FROM tebak_sessions
  WHERE (player_a_id = p_user_id OR player_b_id = p_user_id)
    AND status IN ('waiting', 'active')
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'sessionId', v_new_id,
      'playerRole', v_role,
      'isNew', false
    );
  END IF;

  -- 2. Atomically claim a waiting session (race-condition safe)
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

  -- 3. No waiting session found, create a new one
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
  v_subject tebak_player;
  v_round_id uuid;
BEGIN
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
