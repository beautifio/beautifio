-- Migration: Dual question format — Subject & Guesser see different framing
-- + advance flash fix (subject_deadline for round 2) + guesser deadline +500ms buffer

-- 1. Add question_for_guesser to question bank
ALTER TABLE tebak_question_bank ADD COLUMN IF NOT EXISTS question_for_guesser TEXT;

-- 2. Add question_for_guesser and question_for_subject to questions
ALTER TABLE tebak_questions ADD COLUMN IF NOT EXISTS question_for_guesser TEXT;

-- 3. Seed question_for_guesser for all existing question bank entries
UPDATE tebak_question_bank SET question_for_guesser =
  CASE question_text
    WHEN 'Makanan favorit kamu adalah?' THEN 'Apa makanan favorit {NamaSubject}?'
    WHEN 'Kalau weekend, kamu lebih suka?' THEN 'Kalau weekend, {NamaSubject} lebih suka?'
    WHEN 'Film yang paling sering kamu tonton ulang?' THEN 'Film apa yang paling sering {NamaSubject} tonton ulang?'
    WHEN 'Reaksi kamu saat kaget adalah?' THEN 'Kalau kaget, reaksi {NamaSubject} biasanya?'
    WHEN 'Jam berapa kamu biasanya bangun pagi?' THEN '{NamaSubject} biasanya bangun pagi jam berapa?'
    WHEN 'Minuman yang selalu ada di tanganmu?' THEN 'Minuman apa yang selalu ada di tangan {NamaSubject}?'
    WHEN 'Kalau sedih, kamu cenderung?' THEN 'Kalau sedih, {NamaSubject} cenderung?'
    WHEN 'Hobi yang paling sering kamu lakukan?' THEN 'Hobi apa yang paling sering {NamaSubject} lakukan?'
    WHEN 'Warna favorit kamu?' THEN 'Apa warna favorit {NamaSubject}?'
    WHEN 'Tempat liburan impian?' THEN 'Di mana {NamaSubject} ingin liburan?'
    WHEN 'Hewan peliharaan favorit?' THEN 'Hewan apa yang paling {NamaSubject} sukai?'
    WHEN 'Genre musik favorit?' THEN 'Apa genre musik favorit {NamaSubject}?'
    WHEN 'Aplikasi yang paling sering dibuka?' THEN 'Aplikasi apa yang paling sering {NamaSubject} buka?'
    WHEN 'Skill yang ingin kamu kuasai?' THEN 'Skill apa yang ingin {NamaSubject} kuasai?'
    WHEN 'Tipe orang yang kamu sukai?' THEN 'Tipe orang seperti apa yang {NamaSubject} sukai?'
    WHEN 'Makanan pedas level berapa yang kamu sanggup?' THEN 'Level pedas berapa yang {NamaSubject} sanggup?'
    WHEN 'Lebih suka belajar dengan cara?' THEN '{NamaSubject} lebih suka belajar dengan cara?'
    WHEN 'Tempat favorit untuk mengerjakan tugas?' THEN 'Di mana {NamaSubject} paling suka mengerjakan tugas?'
    WHEN 'Zodiak kamu?' THEN 'Apa zodiak {NamaSubject}?'
    WHEN 'Kalau punya uang lebih langsung?' THEN 'Kalau punya uang lebih, apa yang {NamaSubject} lakukan?'
    WHEN 'Aktivitas favorit saat hujan?' THEN 'Aktivitas apa yang {NamaSubject} suka lakukan saat hujan?'
    WHEN 'Game genre favorit?' THEN 'Genre game apa favorit {NamaSubject}?'
    WHEN 'Tipe pacar idaman?' THEN 'Tipe pacar idaman {NamaSubject} seperti apa?'
    WHEN 'Bahasa asing yang ingin dikuasai?' THEN 'Bahasa asing apa yang ingin {NamaSubject} kuasai?'
    ELSE question_text
  END
WHERE question_for_guesser IS NULL;

-- 4. Update advance_tebak_game RPC — include question_for_guesser in round 2 CREATE + set subject_deadline
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
  SELECT * INTO v_session
  FROM tebak_sessions
  WHERE id = p_session_id
  FOR UPDATE;

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
    v_new_subject := CASE WHEN v_session.current_subject = 'a'::tebak_player THEN 'b'::tebak_player ELSE 'a'::tebak_player END;

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

    -- Set subject_deadline for round 2 question 1 immediately (Bug #4 fix)
    UPDATE tebak_questions SET
      subject_deadline = NOW() + INTERVAL '20 seconds'
    WHERE round_id = v_new_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

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

-- 5. Update find_or_create_tebak_session RPC — include question_for_guesser
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

    INSERT INTO tebak_questions (round_id, question_bank_id, question_text, question_for_guesser, options, sequence_number)
    SELECT v_round_id, id, question_text, question_for_guesser, options, ROW_NUMBER() OVER ()
    FROM (
      SELECT id, question_text, question_for_guesser, options
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

-- 6. Update activate_tebak_session RPC — include question_for_guesser
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

  RETURN v_round_id;
END;
$$;

-- 7. Fix Bug #5: Guesser deadline +500ms buffer in submitSubjectAnswer
-- This is a server action, not an RPC, but we document the intent here.
-- The actual fix is in actions.ts (submitSubjectAnswer): NOW() + 15.5 seconds instead of 15.

-- 8. Add fadeSlideUp and card-flip keyframes to Tailwind
-- Handled in globals.css
