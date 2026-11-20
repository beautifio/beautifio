-- 00021 — Re-add option_disc to Tebak bot RPC (bank now has the column).
--
-- After 00019 removed option_disc refs (because bank lacked the column),
-- tebak_questions.option_disc stayed NULL → DISC scoring in GameRoom broke.
-- Now that 00020 added option_disc to tebak_question_bank + seeded DISC
-- questions, re-create both functions WITH option_disc so the mapping
-- (D/I/S/C) is copied to tebak_questions for scoring.

BEGIN;

CREATE OR REPLACE FUNCTION public.activate_tebak_session(p_session_id uuid, p_player_b_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session tebak_sessions;
  v_round_id uuid;
BEGIN
  SELECT * INTO v_session
  FROM tebak_sessions
  WHERE id = p_session_id AND status = 'waiting'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF v_session.player_b_id IS NOT NULL THEN RETURN NULL; END IF;

  UPDATE tebak_sessions SET
    player_b_id = p_player_b_id,
    status = 'active',
    current_subject = NULL   -- R1 DISC: tidak ada subjek
  WHERE id = p_session_id;

  INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
  VALUES (p_session_id, NULL, 1, 'disc', 'both_answering')
  RETURNING id INTO v_round_id;

  INSERT INTO tebak_questions (
    round_id, question_bank_id, question_text, options, option_disc,
    sequence_number, status
  )
  SELECT v_round_id, id, question_text, options, option_disc,
    ROW_NUMBER() OVER (), 'both_answering'
  FROM (
    SELECT id, question_text, options, option_disc
    FROM tebak_question_bank
    WHERE category = 'disc' AND is_active = true
    ORDER BY random()
    LIMIT 5
  ) sub;

  UPDATE tebak_questions
  SET subject_deadline = NOW() + INTERVAL '30 seconds'
  WHERE round_id = v_round_id
    AND sequence_number = 1
    AND subject_deadline IS NULL;

  RETURN v_round_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.advance_tebak_game_v2(p_session_id uuid, p_expected_seq integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session tebak_sessions;
  v_round tebak_rounds;
  v_new_round_id UUID;
  v_new_subject tebak_player;
  v_next_question RECORD;
  v_found boolean;
  v_round_type text;
BEGIN
  UPDATE public.tebak_sessions
  SET advance_at = NULL
  WHERE id = p_session_id AND advance_at IS NOT NULL
  RETURNING * INTO v_session;

  IF NOT FOUND THEN
    SELECT EXISTS(SELECT 1 FROM tebak_sessions WHERE id = p_session_id) INTO v_found;
    IF NOT v_found THEN
      RETURN jsonb_build_object('error', 'session_not_found');
    END IF;
    RETURN jsonb_build_object('status', 'already_advanced');
  END IF;

  IF v_session.status = 'finished' THEN
    RETURN jsonb_build_object('status', 'game_finished', 'new_question', null);
  END IF;

  SELECT * INTO v_round
  FROM tebak_rounds
  WHERE session_id = p_session_id AND round_number = v_session.current_round;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'round_not_found'); END IF;

  v_round_type := v_round.round_type;

  -- ═══════════════════════════════════════════════════════════
  -- CASE 1: Masih ada pertanyaan dalam ronde → advance seq
  -- ═══════════════════════════════════════════════════════════
  IF v_session.current_q_seq < 5 THEN
    UPDATE tebak_sessions SET current_q_seq = v_session.current_q_seq + 1 WHERE id = p_session_id;

    SELECT * INTO v_next_question
    FROM tebak_questions
    WHERE round_id = v_round.id AND sequence_number = v_session.current_q_seq + 1;

    IF v_round_type = 'disc' THEN
      UPDATE tebak_questions
      SET subject_deadline = NOW() + INTERVAL '30 seconds',
          status = 'both_answering'
      WHERE id = v_next_question.id
        AND subject_deadline IS NULL;
    ELSE
      UPDATE tebak_questions
      SET subject_deadline = NOW() + INTERVAL '15 seconds'
      WHERE id = v_next_question.id
        AND subject_deadline IS NULL;
    END IF;

    RETURN jsonb_build_object('status', 'next_question', 'new_question', row_to_json(v_next_question));
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- CASE 2: Semua pertanyaan selesai → transisi ronde
  -- ═══════════════════════════════════════════════════════════

  -- ── R1 (DISC) → R2 (DISC) ──
  IF v_session.current_round = 1 THEN
    INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
    VALUES (p_session_id, NULL, 2, 'disc', 'both_answering')
    RETURNING id INTO v_new_round_id;

    INSERT INTO tebak_questions (
      round_id, question_bank_id, question_text, options, option_disc,
      sequence_number, status
    )
    SELECT v_new_round_id, id, question_text, options, option_disc,
      ROW_NUMBER() OVER (), 'both_answering'
    FROM (
      SELECT id, question_text, options, option_disc
      FROM tebak_question_bank
      WHERE category = 'disc' AND is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    UPDATE tebak_sessions SET
      current_round = 2,
      current_q_seq = 1,
      current_subject = NULL   -- R2 DISC: masih tanpa subjek
    WHERE id = p_session_id;

    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '30 seconds'
    WHERE round_id = v_new_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

    SELECT * INTO v_next_question
    FROM tebak_questions
    WHERE round_id = v_new_round_id AND sequence_number = 1;

    RETURN jsonb_build_object('status', 'round_complete', 'new_question', row_to_json(v_next_question));
  END IF;

  -- ── R2 (DISC) → R3 (tebak) ──
  IF v_session.current_round = 2 THEN
    v_new_subject := CASE WHEN random() > 0.5 THEN 'a'::tebak_player ELSE 'b'::tebak_player END;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
    VALUES (p_session_id, v_new_subject, 3, 'tebak', 'subject_answering')
    RETURNING id INTO v_new_round_id;

    INSERT INTO tebak_questions (
      round_id, question_bank_id, question_text, question_for_guesser,
      options, sequence_number, status
    )
    SELECT v_new_round_id, id, question_text, question_for_guesser,
      options, ROW_NUMBER() OVER (), 'subject_answering'
    FROM (
      SELECT id, question_text, question_for_guesser, options
      FROM tebak_question_bank
      WHERE (category IS NULL OR category != 'disc') AND is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    UPDATE tebak_sessions SET
      current_round = 3,
      current_q_seq = 1,
      current_subject = v_new_subject   -- subjek diisi untuk ronde tebak
    WHERE id = p_session_id;

    SELECT * INTO v_next_question
    FROM tebak_questions
    WHERE round_id = v_new_round_id AND sequence_number = 1;

    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '15 seconds'
    WHERE round_id = v_new_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

    RETURN jsonb_build_object('status', 'round_complete', 'new_question', row_to_json(v_next_question));
  END IF;

  -- ── R3 (tebak) → R4 (tebak, subjek bertukar) ──
  IF v_session.current_round = 3 THEN
    v_new_subject := CASE WHEN v_round.subject_player = 'a'::tebak_player THEN 'b'::tebak_player ELSE 'a'::tebak_player END;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
    VALUES (p_session_id, v_new_subject, 4, 'tebak', 'subject_answering')
    RETURNING id INTO v_new_round_id;

    INSERT INTO tebak_questions (
      round_id, question_bank_id, question_text, question_for_guesser,
      options, sequence_number, status
    )
    SELECT v_new_round_id, id, question_text, question_for_guesser,
      options, ROW_NUMBER() OVER (), 'subject_answering'
    FROM (
      SELECT id, question_text, question_for_guesser, options
      FROM tebak_question_bank
      WHERE (category IS NULL OR category != 'disc') AND is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    UPDATE tebak_sessions SET
      current_round = 4,
      current_q_seq = 1,
      current_subject = v_new_subject
    WHERE id = p_session_id;

    SELECT * INTO v_next_question
    FROM tebak_questions
    WHERE round_id = v_new_round_id AND sequence_number = 1;

    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '15 seconds'
    WHERE round_id = v_new_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

    RETURN jsonb_build_object('status', 'round_complete', 'new_question', row_to_json(v_next_question));
  END IF;

  -- ── R4 (tebak) → FINISH ──
  UPDATE tebak_sessions SET status = 'finished', finished_at = NOW() WHERE id = p_session_id;
  RETURN jsonb_build_object('status', 'game_finished', 'new_question', null);
END;
$function$;

COMMIT;

NOTIFY pgrst, 'reload schema';
