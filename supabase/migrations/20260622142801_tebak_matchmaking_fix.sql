-- Migration: Fix Tebak Aku matchmaking race condition
-- Atomically find or create a session using FOR UPDATE SKIP LOCKED

CREATE OR REPLACE FUNCTION find_or_create_tebak_session(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_player_role text;
  v_status tebak_status;
  v_role text;
  v_new_id uuid;
  v_retry int := 0;
  v_user_a_id uuid;
  v_user_b_id uuid;
BEGIN
  LOOP
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
    SELECT id, player_a_id, player_b_id
    INTO v_new_id, v_user_a_id, v_user_b_id
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
        current_subject = CASE WHEN random() > 0.5 THEN 'a' ELSE 'b' END
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

    -- 3. Create new waiting session
    INSERT INTO tebak_sessions (player_a_id, status)
    VALUES (p_user_id, 'waiting')
    RETURNING id INTO v_new_id;

    -- 4. Double-check: another session may have been created concurrently.
    -- We briefly pause and try again to claim someone else's session.
    PERFORM pg_sleep(0.3);

    SELECT id INTO v_session_id
    FROM tebak_sessions
    WHERE status = 'waiting'
      AND player_a_id IS NOT NULL
      AND player_a_id != p_user_id
      AND player_b_id IS NULL
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF FOUND THEN
      -- Delete our own waiting session and join this one
      DELETE FROM tebak_rounds WHERE session_id = v_new_id;
      DELETE FROM tebak_questions WHERE round_id IN (SELECT id FROM tebak_rounds WHERE session_id = v_new_id);
      DELETE FROM tebak_sessions WHERE id = v_new_id;

      UPDATE tebak_sessions SET
        player_b_id = p_user_id,
        status = 'active',
        current_subject = CASE WHEN random() > 0.5 THEN 'a' ELSE 'b' END
      WHERE id = v_session_id;

      INSERT INTO tebak_rounds (session_id, subject_player, round_number)
      SELECT v_session_id, current_subject, 1
      FROM tebak_sessions WHERE id = v_session_id;

      RETURN jsonb_build_object(
        'sessionId', v_session_id,
        'playerRole', 'b',
        'isNew', true
      );
    END IF;

    -- Check if someone joined OUR session while we slept
    SELECT status INTO v_status
    FROM tebak_sessions WHERE id = v_new_id;

    IF v_status = 'active' THEN
      SELECT player_b_id INTO v_session_id
      FROM tebak_sessions WHERE id = v_new_id;

      -- Questions were created by the player who joined us
      RETURN jsonb_build_object(
        'sessionId', v_new_id,
        'playerRole', 'a',
        'isNew', true
      );
    END IF;

    v_retry := v_retry + 1;
    EXIT WHEN v_retry >= 2;
  END LOOP;

  -- After retries, return our own waiting session
  RETURN jsonb_build_object(
    'sessionId', v_new_id,
    'playerRole', 'a',
    'isNew', true
  );
END;
$$;
