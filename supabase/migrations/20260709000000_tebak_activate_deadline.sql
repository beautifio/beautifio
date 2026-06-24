-- Migration: Set subject_deadline for Round 1 Question 1
-- Without this, the first question of every game has no server-side deadline.
-- If both clients disconnect at game start, no client calls startQuestionTimer,
-- the cron's timeout handler can't match it (deadline IS NULL), and the game sticks
-- on the very first question.

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

  INSERT INTO tebak_questions (round_id, question_bank_id, question_text, question_for_guesser, options, sequence_number)
  SELECT v_round_id, id, question_text, question_for_guesser, options, ROW_NUMBER() OVER ()
  FROM (
    SELECT id, question_text, question_for_guesser, options
    FROM tebak_question_bank
    WHERE is_active = true
    ORDER BY random()
    LIMIT 5
  ) sub;

  -- Set server-side deadline for the first question so self-healing works from Q1
  UPDATE tebak_questions
  SET subject_deadline = NOW() + INTERVAL '15 seconds'
  WHERE round_id = v_round_id
    AND sequence_number = 1
    AND subject_deadline IS NULL;

  RETURN v_round_id;
END;
$$;
