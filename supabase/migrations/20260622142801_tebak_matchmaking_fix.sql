-- Migration: Fix Tebak Aku matchmaking race condition
-- Atomically find or create a session using FOR UPDATE SKIP LOCKED
-- NO pg_sleep — everything runs instantly

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
    FROM tebak_sessions WHERE id = v_new_id;

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

-- Activate session with bot (or second player) — handles tebak_player cast
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

  RETURN v_round_id;
END;
$$;

-- Switch subject for round 2
CREATE OR REPLACE FUNCTION switch_tebak_subject(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current tebak_player;
  v_new tebak_player;
BEGIN
  SELECT current_subject INTO v_current FROM tebak_sessions WHERE id = p_session_id;
  v_new := CASE WHEN v_current = 'a'::tebak_player THEN 'b'::tebak_player ELSE 'a'::tebak_player END;

  UPDATE tebak_sessions SET
    current_round = 2,
    current_subject = v_new,
    current_q_seq = 1
  WHERE id = p_session_id;
END;
$$;
