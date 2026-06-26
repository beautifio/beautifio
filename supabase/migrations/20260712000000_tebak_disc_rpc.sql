-- =============================================================================
-- Migration: DISC RPC — mekanik ronde DISC R1-2 (Tahap 3.2) — REVISI
--
-- Tujuan: RPC untuk pembuatan, advance, dan timeout ronde DISC.
-- - R1-2 (DISC): dua pemain jawab serentak, tanpa subjek/penebak, tanpa is_correct
-- - R3-4 (tebak): mekanik LAMA — TIDAK BOLEH BERUBAH
--
-- ════════════════════════════════════════════════════════════════════════════
-- UTANG MIGRASI (perubahan skema yang tidak tercatat di migrasi tracked)
-- ════════════════════════════════════════════════════════════════════════════
--
-- File migrasi ini BUKAN cerminan lengkap DB produksi. Perubahan berikut
-- sudah ada di DB (di-apply manual via SQL Editor) tapi tidak ada di file
-- migrasi tracked:
--   1. `option_disc jsonb` di `tebak_question_bank` (Tahap 1 — manual)
--   2. `category='disc'` dan 6 soal DISC (Tahap 1 — manual)
--   3. `option_disc jsonb` di `tebak_questions`         (Tahap 3.2 — file ini)
--   4. `current_subject` nullable di `tebak_sessions`   (Tahap 3.2 — file ini)
--
-- Konsekuensi: rebuild dari migrasi berturut-turut akan menghasilkan DB yang
-- TIDAK sama dengan produksi. `option_disc` di `tebak_question_bank` dan
-- soal DISC harus ditambahkan manual setelah migrasi 20260701000000.
--
-- Rekonsiliasi: di masa depan, buat migrasi "catch-up" yang mencerminkan
-- keadaan produksi saat ini.
--
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- HASIL VERIFIKASI SKEMA (langsung dari Supabase via anon key)
-- ════════════════════════════════════════════════════════════════════════════
--
-- A. tebak_question_bank:
--    - question_text: text NOT NULL
--    - options: jsonb NOT NULL
--    - option_disc: jsonb — ADA (ditambah manual via SQL Editor di Tahap 1)
--      Nilai sample: ["D","I","S","C"] — parallel index ke options[]
--    - category: text DEFAULT 'umum' — ADA nilai 'disc' (ditambah manual)
--    - question_for_guesser: TEXT, nullable (ditambah migrasi 20260701000000)
--
-- B. tebak_questions & view:
--    - question_for_guesser di tebak_questions: NULLABLE ✅ (TEXT tanpa NOT NULL)
--    - View tebak_questions_for_guesser ADA: kolom = id, round_id, question_text,
--      options, sequence_number, status, correct_answer, guesser_deadline,
--      subject_answered_at. TIDAK SELECT question_for_guesser.
--    - option_disc di tebak_questions: TIDAK ADA → HARUS ditambah di migrasi ini.
--    - View tidak pecah dengan NULL → aman.
--
-- C. Jumlah soal DISC:
--    - 30 total soal (24 original seed + 6 DISC dari Tahap 1)
--    - 6 soal dengan category='disc', semuanya is_active=true ✅ (≥5, LIMIT 5 OK)
--    - Distribusi kategori lain: makanan=3, gaya_hidup=5, hiburan=2,
--      kepribadian=4, hobi=3, umum=4, pendidikan=2, percintaan=1
--
-- D. Mekanisme cron:
--    - BUKAN pg_cron. BUKAN Vercel cron.
--    - Supabase Edge Function: supabase/functions/tebak-advance/index.ts
--    - Dipanggil oleh Supabase-managed cron (~setiap menit, jadwal di Dashboard)
--    - Yang dilakukan sekarang:
--      1. Query tebak_questions WHERE status='subject_answering' AND
--         subject_deadline < NOW → call handle_question_timeout()
--      2. Query tebak_questions WHERE status='guesser_guessing' AND
--         guesser_deadline < NOW → call handle_question_timeout()
--      3. Query tebak_sessions WHERE status='active' AND advance_at < NOW
--         → call advance_tebak_game()
--    - Untuk DISC: edge function HARUS ditambah:
--      a. Query status='both_answering' AND subject_deadline < NOW
--         → call handle_disc_timeout()
--      b. Panggil advance_tebak_game_v2 (bukan advance_tebak_game)
--         untuk sesi dengan round_type='disc'
--      Catatan: Perubahan edge function ada di Tahap 3.4 (TypeScript),
--      BUKAN di SQL ini.
--
-- ════════════════════════════════════════════════════════════════════════════
-- PERBAIKAN BUG (dari revisi sebelumnya)
-- ════════════════════════════════════════════════════════════════════════════
--
-- BUG 1: option_disc tidak di-INSERT ke tebak_questions
--   Perbaikan: (a) ADD COLUMN option_disc jsonb ke tebak_questions
--              (b) SELECT option_disc dari tebak_question_bank di semua
--                  INSERT pertanyaan DISC (BAGIAN 1, 2, 3)
--
-- BUG 2: current_subject di-acak untuk ronde DISC (seharusnya NULL)
--   Perbaikan: (a) ALTER tebak_sessions.current_subject → NULLABLE
--              (b) Saat aktivasi & transisi R1→R2: SET current_subject = NULL
--              (c) current_subject baru diisi saat R2→R3 (transisi ke tebak)
--   Catatan: current_subject TIDAK dibaca oleh kode realtime/UI untuk
--   menentukan peran di R1-2. Semua kode yang membaca current_subject
--   (handle_question_timeout, botPlayTurn, GameRoom.isSubject) hanya
--   relevan untuk R3-4. Aman.
--
-- BUG 3: Race condition timeout↔advance
--   MASALAH: handle_disc_timeout dan submitDiscAnswer (Tahap 3.4) sama-sama
--   memanggil set_session_advance_at dan insert jawaban. Jika keduanya jalan
--   nyaris bersamaan, efek samping bisa tumpuk.
--
--   Perbaikan: SEMUA efek samping (insert __timeout__, set_session_advance_at)
--   hanya jalan jika UPDATE status='revealed' WHERE status='both_answering'
--   BERHASIL (FOUND). Lihat handle_disc_timeout untuk implementasi.
--   submitDiscAnswer (Tahap 3.4) HARUS punya guard yang SAMA: cek FOUND dari
--   UPDATE status, hanya lanjut ke advance_at jika reveal-nya yang menang.
--
-- set_session_advance_at TIDAK idempoten (blind SET). Tapi karena guard di
-- atas memastikan hanya SATU jalur yang mencapai advance_at, tidak perlu
-- idempotency tambahan — FOUND guard sudah cukup.

-- KEPUTUSAN TERKUNCI:
-- - Deadline DISC = 30 detik (INTERVAL '30 seconds')
-- - Timeout DISC dipicu oleh cron (Edge Function), bukan client
-- - option_disc disimpan di tebak_questions untuk akses cepat
--   (tanpa JOIN ke tebak_question_bank)
--   KONSEKUENSI: edit mapping DISC di tebak_question_bank TIDAK retroaktif
--   ke sesi yang sudah dimulai. Untuk game sesi pendek, ini fine — sesi
--   sudah selesai sebelum mapping bank berubah.
-- - current_subject = NULL untuk R1-2

-- KONFIRMASI DESAIN (tidak mengubah logika):
-- 1. option_disc di-duplikasi ke tebak_questions: sengaja agar self-contained.
--    Konsekuensi: lihat di atas — tidak retroaktif.
-- 2. handle_disc_timeout menulis answer='__timeout__' dengan is_correct=NULL.
--    Tahap 4 (scoring DISC) HARUS memperlakukan '__timeout__' sebagai
--    non-jawaban, BUKAN pilihan D/I/S/C yang sah. is_correct=NULL menandakan
--    tidak ada jawaban — scoring profile DISC hanya menghitung nilai untuk
--    jawaban yang valid (bukan '__timeout__').
--
-- ════════════════════════════════════════════════════════════════════════════
-- Cara apply: Copy-paste ke Supabase SQL Editor. BAGIAN 1-6 bisa sekali jalan.
-- =============================================================================

-- =============================================================================
-- BAGIAN 0: VERIFIKASI SEBELUM APPLY
-- =============================================================================

-- -- Cek kolom option_disc ada di tebak_question_bank
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'tebak_question_bank' AND column_name = 'option_disc';
--
-- -- Cek current_subject nullable
-- SELECT is_nullable FROM information_schema.columns
-- WHERE table_name = 'tebak_sessions' AND column_name = 'current_subject';
--
-- -- Cek round_type ada & subject_player nullable
-- SELECT column_name, is_nullable FROM information_schema.columns
-- WHERE table_name = 'tebak_rounds' AND column_name IN ('round_type', 'subject_player');
--
-- -- Cek ENUM both_answering ada
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = 'tebak_round_status'::regtype ORDER BY enumsortorder;
--
-- -- Cek fungsi-fungsi yang akan dimodifikasi
-- SELECT proname FROM pg_proc WHERE proname IN (
--   'find_or_create_tebak_session', 'activate_tebak_session',
--   'advance_tebak_game', 'handle_question_timeout'
-- ) ORDER BY proname;

-- =============================================================================
-- BAGIAN 0.5: Schema additions for DISC
-- =============================================================================

-- Tambah kolom option_disc di tebak_questions (untuk scoring DISC / Tahap 4)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tebak_questions' AND column_name = 'option_disc'
  ) THEN
    ALTER TABLE tebak_questions ADD COLUMN option_disc jsonb;
  END IF;
END;
$$;

-- Ubah current_subject di tebak_sessions menjadi nullable
-- (R1-2 DISC tidak punya subjek → NULL)
--
-- ⚠️ JANGAN DROP DEFAULT: semua INSERT INTO tebak_sessions yang ada (6 titik
-- di tracked migrations) menggunakan pola:
--   INSERT INTO tebak_sessions (player_a_id, status) VALUES (...)
-- TANPA menyebut current_subject. Mereka mengandalkan DEFAULT 'a'.
-- Jika default di-drop → INSERT yang tidak menyebut current_subject akan
-- mendapat NULL, yang bisa merusak jalur tebak (R3-4) yang butuh subjek.
--
-- DEFAULT dipertahankan: kode baru (DISC) harus SET current_subject=NULL
-- secara eksplisit.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tebak_sessions'
    AND column_name = 'current_subject'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tebak_sessions ALTER COLUMN current_subject DROP NOT NULL;
    -- DEFAULT 'a' TETAP DIPERTAHANKAN — lihat komentar di atas
  END IF;
END;
$$;

-- =============================================================================
-- BAGIAN 1: MODIFIKASI find_or_create_tebak_session — R1 sebagai DISC
-- =============================================================================
-- Perubahan dari V5:
-- - round_type='disc', subject_player=NULL, status='both_answering'
-- - current_subject = NULL (tidak ada subjek di DISC)
-- - Questions: SELECT option_disc dari bank, INSERT ke tebak_questions
-- - category='disc' (bukan dari bank umum)

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
      current_subject = NULL   -- R1 DISC: tidak ada subjek
    WHERE id = v_new_id;

    INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
    VALUES (v_new_id, NULL, 1, 'disc', 'both_answering')
    RETURNING id INTO v_round_id;

    -- DISC questions: sertakan option_disc untuk scoring
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

-- =============================================================================
-- BAGIAN 2: MODIFIKASI activate_tebak_session — R1 sebagai DISC
-- =============================================================================
-- Perubahan identik dengan BAGIAN 1.

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
$$;

-- =============================================================================
-- BAGIAN 3: RPC BARU — advance_tebak_game_v2 (flow 4 ronde penuh)
-- =============================================================================
-- RPC ini MENGGANTIKAN advance_tebak_game untuk flow 4-ronde.
-- advance_tebak_game LAMA tetap utuh (tidak dipanggil oleh client baru).
--
-- ═══ SYARAT PEMANGGILAN ═══
-- ⚠️ RPC ini TIDAK aman dipanggil sebelum kedua jawaban DISC dipastikan.
-- Gating ada di submitDiscAnswer (Tahap 3.4) + handle_disc_timeout (cron).
-- advance DISC hanya boleh terjadi setelah:
--   (a) submitDiscAnswer mendeteksi count=2 → set_session_advance_at, ATAU
--   (b) handle_disc_timeout reveal → set_session_advance_at
-- Jika dipanggil lebih awal, status question masih 'both_answering' dan
-- q_seq akan maju meski hanya 0 atau 1 pemain yang sudah jawab. JANGAN.
--
-- ═══ ISI ═══
-- 1. Atomically clear advance_at (guard double-advance).
-- 2. Deteksi round_type — DISC vs tebak.
-- 3. CASE 1: Masih ada pertanyaan → advance current_q_seq.
--    - DISC: set status='both_answering', deadline 30s
--    - Tebak: set status='subject_answering', deadline 15s
-- 4. CASE 2: Semua pertanyaan selesai → transisi ronde.
--    - R1→R2: DISC (current_subject=NULL)
--    - R2→R3: tebak (current_subject=random)
--    - R3→R4: tebak (current_subject=swap)
--    - R4→finish

CREATE OR REPLACE FUNCTION advance_tebak_game_v2(
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
$$;

-- =============================================================================
-- BAGIAN 4: RPC BARU — handle_disc_timeout
-- =============================================================================
-- Timeout untuk pertanyaan DISC. Berbeda dengan handle_question_timeout:
-- - Tidak ada guesser → tidak ada poin pinalti (increment_tebak_score)
-- - Tidak ada is_correct → timeout dicatat dengan is_correct=NULL
-- - Mencatat timeout untuk KEDUA pemain yang belum jawab
-- - Reveal + set advance_at setelah timeout
--
-- ═══ RACE CONDITION GUARD ═══
-- UPDATE status WHERE status='both_answering' adalah penjaga ATOMIK.
-- TIGA jalur yang bisa reveal:
--   1. handle_disc_timeout (cron — ini)
--   2. submitDiscAnswer (Tahap 3.4 — client, saat count=2)
--   3. advance_tebak_game_v2 (TIDAK reveal — hanya advance seq)
--
-- STRATEGI: SEMUA efek samping (insert __timeout__, set_session_advance_at)
-- hanya jalan jika UPDATE status BERHASIL (affected_rows > 0). Jika
-- submitDiscAnswer sudah reveal duluan, UPDATE di sini kena 0 row → RETURN.
--
-- ═══ PEMICU ═══
-- Dipanggil oleh cron (Edge Function tebak-advance) yang akan ditambah
-- query untuk status='both_answering' AND subject_deadline < NOW().
-- Juga bisa dipanggil client sebagai fallback (sama seperti
-- handle_question_timeout yang dipanggil client & cron).

CREATE OR REPLACE FUNCTION handle_disc_timeout(p_question_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question tebak_questions;
  v_round tebak_rounds;
  v_session tebak_sessions;
  v_player_a_id UUID;
  v_player_b_id UUID;
BEGIN
  UPDATE tebak_questions
  SET status = 'revealed'
  WHERE id = p_question_id
    AND status = 'both_answering'
  RETURNING * INTO v_question;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  SELECT * INTO v_round FROM tebak_rounds WHERE id = v_question.round_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'round_not_found');
  END IF;

  SELECT * INTO v_session FROM tebak_sessions WHERE id = v_round.session_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'session_not_found');
  END IF;

  v_player_a_id := v_session.player_a_id;
  v_player_b_id := v_session.player_b_id;

  INSERT INTO tebak_answers (question_id, guesser_id, answer, is_correct, time_ms)
  SELECT p_question_id, v_player_a_id, '__timeout__', NULL, 30000
  WHERE NOT EXISTS (
    SELECT 1 FROM tebak_answers
    WHERE question_id = p_question_id AND guesser_id = v_player_a_id
  );

  INSERT INTO tebak_answers (question_id, guesser_id, answer, is_correct, time_ms)
  SELECT p_question_id, v_player_b_id, '__timeout__', NULL, 30000
  WHERE NOT EXISTS (
    SELECT 1 FROM tebak_answers
    WHERE question_id = p_question_id AND guesser_id = v_player_b_id
  );

  IF v_question.sequence_number = 5 THEN
    PERFORM set_session_advance_at(v_session.id, 8);
  ELSE
    PERFORM set_session_advance_at(v_session.id, 3);
  END IF;

  RETURN jsonb_build_object(
    'status', 'disc_timeout_processed',
    'sequence_number', v_question.sequence_number,
    'round_number', v_round.round_number
  );
END;
$$;

-- =============================================================================
-- BAGIAN 5: RPC BARU — start_disc_question_timer
-- =============================================================================
-- Set deadline untuk pertanyaan DISC. Reuse kolom subject_deadline.
-- Tidak set guesser_deadline (tidak ada guesser di DISC).
-- Juga set status = 'both_answering' jika belum (idempotent).
--
-- start_question_timer LAMA tetap utuh — dia hanya set subject_deadline
-- dan bisa dipakai untuk DISC. Fungsi ini adalah versi eksplisit yang
-- juga memastikan status yang benar.

CREATE OR REPLACE FUNCTION start_disc_question_timer(
  p_session_id uuid,
  p_seq int
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round_id uuid;
  v_deadline timestamptz;
BEGIN
  SELECT r.id INTO v_round_id
  FROM tebak_rounds r
  JOIN tebak_sessions s ON s.id = r.session_id
  WHERE r.session_id = p_session_id
    AND r.round_number = s.current_round;

  IF NOT FOUND THEN RETURN NULL; END IF;

  UPDATE tebak_questions
  SET subject_deadline = NOW() + INTERVAL '30 seconds',
      status = 'both_answering'
  WHERE round_id = v_round_id
    AND sequence_number = p_seq
    AND subject_deadline IS NULL
  RETURNING subject_deadline INTO v_deadline;

  RETURN v_deadline;
END;
$$;

-- =============================================================================
-- VERIFIKASI PASCA-APPLY
-- =============================================================================

-- -- 1. Cek kolom option_disc di tebak_questions
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
-- WHERE table_name = 'tebak_questions' AND column_name = 'option_disc';
--
-- -- 2. Cek current_subject nullable
-- SELECT is_nullable FROM information_schema.columns
-- WHERE table_name = 'tebak_sessions' AND column_name = 'current_subject';
--
-- -- 3. Cek semua fungsi baru/modifikasi terdaftar
-- SELECT proname, pronargs FROM pg_proc WHERE proname IN (
--   'find_or_create_tebak_session', 'activate_tebak_session',
--   'advance_tebak_game_v2', 'handle_disc_timeout', 'start_disc_question_timer',
--   'advance_tebak_game', 'handle_question_timeout', 'start_question_timer'
-- ) ORDER BY proname;

-- =============================================================================
-- ROLLBACK
-- =============================================================================

-- -- 1. Kembalikan find_or_create_tebak_session, activate_tebak_session (lihat lampiran)
-- -- 2. Hapus RPC baru
-- DROP FUNCTION IF EXISTS advance_tebak_game_v2(UUID, INT);
-- DROP FUNCTION IF EXISTS handle_disc_timeout(UUID);
-- DROP FUNCTION IF EXISTS start_disc_question_timer(UUID, INT);
-- -- 3. Hapus kolom option_disc dari tebak_questions
-- ALTER TABLE tebak_questions DROP COLUMN IF EXISTS option_disc;
-- -- 4. Kembalikan current_subject ke NOT NULL
-- UPDATE tebak_sessions SET current_subject = 'a' WHERE current_subject IS NULL;
-- ALTER TABLE tebak_sessions ALTER COLUMN current_subject SET NOT NULL;
-- ALTER TABLE tebak_sessions ALTER COLUMN current_subject SET DEFAULT 'a';
-- -- 5. Kembalikan fungsi lama (lihat lampiran)

-- =============================================================================
-- DEPENDENSI KE TAHAP BERIKUT (selain yang sudah di 3.1)
-- =============================================================================
--
-- 3.4 (Server Actions):
-- - `advanceGame()` → panggil `advance_tebak_game_v2` (bukan `advance_tebak_game`)
-- - `submitDiscAnswer()`: INSERT jawaban, cek count=2, UPDATE status='revealed'
--   WHERE status='both_answering'. GUARD: set_session_advance_at hanya boleh
--   dipanggil jika UPDATE status BERHASIL (FOUND). JANGAN jalankan efek samping
--   di luar guard — lihat FIX 2 di handle_disc_timeout untuk pola yang sama.
-- - `handleDiscTimeout()`: panggil `handle_disc_timeout` RPC
-- - Edge Function `tebak-advance/index.ts` HARUS ditambah:
--   (a) Query status='both_answering' → call handle_disc_timeout
--   (b) Panggil advance_tebak_game_v2 untuk sesi yang advance_at-nya lewat
--       (tidak dibedakan round_type — advance_tebak_game_v2 handle sendiri)
--
-- 3.5 (GameRoom):
-- - `isDiscRound()` → deteksi dari round_type (fetch via roundOfRef dengan join)
-- - `isSubject` → jika current_subject=NULL, kedua pemain bukan "subject"
-- - Timer DISC 30 detik → reuse DigitalClock dengan label berbeda
-- - UI: dua pemain jawab simultan
-- - current_subject baru dibaca untuk R3-4 (saat sudah terisi)
--
-- ════════════════════════════════════════════════════════════════════════════
-- LAMPIRAN: Fungsi lama untuk referensi rollback
-- ════════════════════════════════════════════════════════════════════════════
--
-- find_or_create_tebak_session (V5 — tebak R1, dari 20260701000000):
-- CREATE OR REPLACE FUNCTION find_or_create_tebak_session(p_user_id uuid) ...
-- (lihat file migrasi 20260701000000 baris 160-238)
--
-- activate_tebak_session (V6 — tebak R1 dg deadline, dari 20260709000000):
-- CREATE OR REPLACE FUNCTION activate_tebak_session(...) ...
-- (lihat file migrasi 20260709000000 baris 7-59)
-- =============================================================================
