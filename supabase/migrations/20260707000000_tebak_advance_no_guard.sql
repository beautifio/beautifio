-- Migration: Rewrite advance_tebak_game without sequence guard
-- Server-driven advance: cron is king, no more 'already_advanced' race.
-- Function clears advance_at atomically, returns new_question directly,
-- and does NOT reject calls where sequence already advanced
-- (both client and cron may call concurrently — that's intentional).

CREATE OR REPLACE FUNCTION advance_tebak_game(
  p_session_id UUID,
  p_expected_seq INT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session tebak_sessions;
  v_round tebak_rounds;
  v_new_round_id UUID;
  v_new_subject tebak_player;
  v_next_question RECORD;
BEGIN
  -- Atomically clear advance_at and get the current session state
  UPDATE public.tebak_sessions
  SET advance_at = NULL
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'session_not_found'); END IF;
  IF v_session.status = 'finished' THEN RETURN jsonb_build_object('status', 'game_finished', 'new_question', null); END IF;

  -- No sequence guard — server (cron) is the authority.
  -- Both client and cron may call concurrently, that is by design.

  SELECT * INTO v_round FROM tebak_rounds WHERE session_id = p_session_id AND round_number = v_session.current_round;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'round_not_found'); END IF;

  -- CASE 1: Still questions left in the round -> advance sequence
  IF v_session.current_q_seq < 5 THEN
    UPDATE tebak_sessions SET current_q_seq = v_session.current_q_seq + 1 WHERE id = p_session_id;
    SELECT * INTO v_next_question FROM tebak_questions WHERE round_id = v_round.id AND sequence_number = v_session.current_q_seq + 1;

    -- Set subject_deadline server-side so the game progresses even if both clients disconnect
    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '15 seconds'
    WHERE id = v_next_question.id
      AND subject_deadline IS NULL;

    RETURN jsonb_build_object('status', 'next_question', 'new_question', row_to_json(v_next_question));
  END IF;

  -- CASE 2: Round 1 complete -> create round 2
  IF v_session.current_round = 1 THEN
    v_new_subject := CASE WHEN v_round.subject_player = 'a'::tebak_player THEN 'b'::tebak_player ELSE 'a'::tebak_player END;

    UPDATE tebak_sessions SET
      current_round = 2,
      current_q_seq = 1,
      current_subject = v_new_subject
    WHERE id = p_session_id;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number) VALUES (p_session_id, v_new_subject, 2) RETURNING id INTO v_new_round_id;

    INSERT INTO tebak_questions (round_id, question_bank_id, question_text, question_for_guesser, options, sequence_number)
    SELECT v_new_round_id, id, question_text, question_for_guesser, options, ROW_NUMBER() OVER ()
    FROM (SELECT id, question_text, question_for_guesser, options FROM tebak_question_bank WHERE is_active = true ORDER BY random() LIMIT 5) sub;

    SELECT * INTO v_next_question FROM tebak_questions WHERE round_id = v_new_round_id AND sequence_number = 1;

    -- Set subject_deadline server-side so the game progresses even if both clients disconnect
    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '15 seconds'
    WHERE round_id = v_new_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

    RETURN jsonb_build_object('status', 'round_complete', 'new_question', row_to_json(v_next_question));
  END IF;

  -- CASE 3: Round 2 complete -> finish game
  UPDATE tebak_sessions SET status = 'finished', finished_at = NOW() WHERE id = p_session_id;
  RETURN jsonb_build_object('status', 'game_finished', 'new_question', null);
END;
$$;
