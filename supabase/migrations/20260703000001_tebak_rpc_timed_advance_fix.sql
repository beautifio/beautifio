-- Migration: Update advance_tebak_game RPC to clear advance_at timestamp

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
  v_all_revealed BOOLEAN;
  v_q_count INT;
  v_revealed_count INT;
BEGIN
  -- Atomically clear the advance_at timestamp to prevent re-triggering
  UPDATE public.tebak_sessions
  SET advance_at = NULL
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'session_not_found');
  END IF;

  IF v_session.status = 'finished' THEN
    RETURN jsonb_build_object('status', 'game_finished');
  END IF;

  IF v_session.current_q_seq != p_expected_seq THEN
    RETURN jsonb_build_object(
      'status', 'already_advanced',
      'current_round', v_session.current_round,
      'current_q_seq', v_session.current_q_seq
    );
  END IF;

  SELECT * INTO v_round
  FROM tebak_rounds
  WHERE session_id = p_session_id AND round_number = v_session.current_round;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'round_not_found');
  END IF;

  SELECT COUNT(*) INTO v_q_count FROM tebak_questions WHERE round_id = v_round.id;
  SELECT COUNT(*) INTO v_revealed_count FROM tebak_questions WHERE round_id = v_round.id AND status = 'revealed';

  v_all_revealed := (v_q_count > 0 AND v_q_count = v_revealed_count);

  -- CASE 1: Still questions left → advance sequence
  IF NOT v_all_revealed THEN
    UPDATE tebak_sessions SET current_q_seq = v_session.current_q_seq + 1 WHERE id = p_session_id;
    RETURN jsonb_build_object(
      'status', 'next_question',
      'current_round', v_session.current_round,
      'current_q_seq', v_session.current_q_seq + 1
    );
  END IF;

  -- Mark current round done
  UPDATE tebak_rounds SET status = 'done' WHERE id = v_round.id;

  -- CASE 2: Round 1 complete → create round 2
  IF v_session.current_round = 1 THEN
    v_new_subject := CASE WHEN v_round.subject_player = 'a'::tebak_player THEN 'b'::tebak_player ELSE 'a'::tebak_player END;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number)
    VALUES (p_session_id, v_new_subject, 2)
    RETURNING id INTO v_new_round_id;

    INSERT INTO tebak_questions (round_id, question_bank_id, question_text, question_for_guesser, options, sequence_number)
    SELECT v_new_round_id, id, question_text, question_for_guesser, options, ROW_NUMBER() OVER ()
    FROM (
      SELECT id, question_text, question_for_guesser, options
      FROM tebak_question_bank
      WHERE is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    UPDATE tebak_sessions SET
      current_round = 2,
      current_q_seq = 1,
      current_subject = v_new_subject
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
      'status', 'round_complete',
      'current_round', 2,
      'current_q_seq', 1
    );
  END IF;

  -- CASE 3: Round 2 complete → finish game
  UPDATE tebak_sessions SET
    status = 'finished',
    finished_at = NOW()
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'status', 'game_finished',
    'current_round', 2,
    'current_q_seq', v_session.current_q_seq
  );
END;
$$;
