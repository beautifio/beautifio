-- Migration: Server-side question timeout handler
-- Closes the self-healing gap: when both clients disconnect during a question,
-- the cron calls this RPC to process the timeout and set advance_at,
-- so the game keeps progressing without any client involvement.

CREATE OR REPLACE FUNCTION handle_question_timeout(p_question_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question tebak_questions;
  v_round tebak_rounds;
  v_session tebak_sessions;
  v_guesser_id UUID;
  v_guesser_col TEXT;
BEGIN
  -- Lock the question row to prevent double-processing
  SELECT * INTO v_question
  FROM tebak_questions
  WHERE id = p_question_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'question_not_found');
  END IF;

  -- Idempotency: only process if still in a timeout-able state
  IF v_question.status NOT IN ('subject_answering', 'guesser_guessing') THEN
    RETURN jsonb_build_object('status', 'already_processed', 'current_status', v_question.status);
  END IF;

  SELECT * INTO v_round FROM tebak_rounds WHERE id = v_question.round_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'round_not_found');
  END IF;

  SELECT * INTO v_session FROM tebak_sessions WHERE id = v_round.session_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'session_not_found');
  END IF;

  -- Determine guesser based on current_subject
  IF v_session.current_subject = 'a' THEN
    v_guesser_id := v_session.player_b_id;
    v_guesser_col := 'score_b';
  ELSE
    v_guesser_id := v_session.player_a_id;
    v_guesser_col := 'score_a';
  END IF;

  -- Only insert answer and score if no answer exists yet.
  -- Client's submitGuesserAnswer early-return may have already inserted a row
  -- without revealing, which would otherwise cause silent double-insert.
  IF NOT EXISTS (SELECT 1 FROM tebak_answers WHERE question_id = p_question_id) THEN
    IF v_question.status = 'subject_answering' THEN
      -- Subject timed out: guesser gets 10 points
      PERFORM increment_tebak_score(v_session.id, v_guesser_col, 10);

      INSERT INTO tebak_answers (question_id, guesser_id, answer, is_correct, time_ms)
      VALUES (p_question_id, v_guesser_id, '__subject_timeout__', false, 15000);

    ELSIF v_question.status = 'guesser_guessing' THEN
      -- Guesser timed out: no points, just mark
      INSERT INTO tebak_answers (question_id, guesser_id, answer, is_correct, time_ms)
      VALUES (p_question_id, v_guesser_id, '__timeout__', false, 15000);
    END IF;
  END IF;

  -- Always reveal and advance — deadline has passed regardless of who inserts
  UPDATE tebak_questions SET status = 'revealed' WHERE id = p_question_id;

  IF v_question.sequence_number = 5 AND v_round.round_number = 1 THEN
    PERFORM set_session_advance_at(v_session.id, 8);
  ELSE
    PERFORM set_session_advance_at(v_session.id, 3);
  END IF;

  RETURN jsonb_build_object(
    'status', 'timeout_processed',
    'previous_status', v_question.status,
    'sequence_number', v_question.sequence_number,
    'round_number', v_round.round_number
  );
END;
$$;
