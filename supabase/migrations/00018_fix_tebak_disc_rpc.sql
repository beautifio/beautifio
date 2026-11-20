-- 00018 — Fix find_or_create_tebak_session crash on option_disc.
--
-- Root cause: the RPC referenced column `option_disc` in tebak_question_bank,
-- but that column does NOT exist there (it only exists in tebak_questions).
-- The migration 20260712000000 assumed it was added manually via SQL Editor,
-- but production DB never got it. Result: every "Mulai Bermain" (path 2,
-- second player joining a waiting session) threw
--   "column option_disc does not exist" → server action failed.
--
-- Fix: drop option_disc from the INSERT into tebak_questions for the DISC
-- round. The column stays nullable in tebak_questions (no NOT NULL), so it
-- defaults to NULL. Scoring still works via options[] + question_for_guesser.
-- (DISC questions bank currently has 0 rows, so the round simply gets 0
-- questions until seeded — but the session creation no longer crashes.)

BEGIN;

CREATE OR REPLACE FUNCTION public.find_or_create_tebak_session(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id uuid;
  v_status tebak_status;
  v_role text;
  v_new_id uuid;
  v_round_id uuid;
BEGIN
  -- 1) Sudah punya sesi waiting?
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

  -- 2) Ada sesi waiting dari user lain? Gabung.
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
      current_subject = NULL
    WHERE id = v_new_id;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
    VALUES (v_new_id, NULL, 1, 'disc', 'both_answering')
    RETURNING id INTO v_round_id;

    -- DISC questions: ambil dari bank (option_disc tidak ada di bank,
    -- jadi tidak di-copy; kolom nullable → NULL).
    INSERT INTO tebak_questions (
      round_id, question_bank_id, question_text, options,
      sequence_number, status
    )
    SELECT v_round_id, id, question_text, options,
      ROW_NUMBER() OVER (), 'both_answering'
    FROM (
      SELECT id, question_text, options
      FROM tebak_question_bank
      WHERE category = 'disc' AND is_active = true
      ORDER BY random()
      LIMIT 5
    ) sub;

    -- Deadline 30 detik untuk Q1 DISC
    UPDATE tebak_questions
    SET subject_deadline = NOW() + INTERVAL '30 seconds'
    WHERE round_id = v_round_id
      AND sequence_number = 1
      AND subject_deadline IS NULL;

    RETURN jsonb_build_object(
      'sessionId', v_new_id,
      'playerRole', 'b',
      'isNew', true
    );
  END IF;

  -- 3) Tidak ada sesi waiting → buat baru (menunggu pasangan)
  INSERT INTO tebak_sessions (player_a_id, status)
  VALUES (p_user_id, 'waiting')
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'sessionId', v_new_id,
    'playerRole', 'a',
    'isNew', true
  );
END;
$function$;

COMMIT;

NOTIFY pgrst, 'reload schema';
