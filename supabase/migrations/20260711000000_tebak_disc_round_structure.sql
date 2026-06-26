-- =============================================================================
-- Migration: DISC Round Structure (Tahap 3.1)
-- 
-- Tujuan: Menyiapkan schema database untuk ronde DISC (R1-2) di Tebak Aku.
-- - Ronde DISC = dua pemain jawab serentak, tanpa subjek/penebak, tanpa is_correct
-- - Ronde tebak (R3-4) = existing, TIDAK boleh berubah behavior
-- 
-- Keputusan desain:
-- - Sumber kebenaran jenis ronde: kolom `round_type` EKSPLISIT ('disc'|'tebak'),
--   bukan deteksi via round_number. Ini fleksibel untuk perubahan masa depan.
-- - subject_player: NULLABLE, ronde DISC = NULL. Ditegakkan dengan CHECK constraint
--   kondisional (bukan trigger) — lebih sederhana, no function maintenance.
-- - is_correct di tebak_answers: SUDAH nullable dari schema asli → aman untuk DISC.
-- 
-- Cara apply: Copy-paste ke Supabase SQL Editor. Jalankan PER BAGIAN (ada yang
-- tidak bisa dalam 1 transaksi — ALTER TYPE ADD VALUE).
-- =============================================================================

-- =============================================================================
-- BAGIAN 0: VERIFIKASI SEBELUM APPLY
-- =============================================================================
-- Jalankan query ini DULU untuk melihat state terkini kolom & constraint.
-- Catat hasilnya, cocokkan dengan komentar di BAGIAN 1-5.

-- -- Cek constraint round_number saat ini
-- SELECT conname, consrc
-- FROM   pg_constraint
-- WHERE  conrelid = 'tebak_rounds'::regclass
-- AND    conname LIKE '%round_number%';

-- -- Cek subject_player nullable & type
-- SELECT column_name, is_nullable, udt_name
-- FROM   information_schema.columns
-- WHERE  table_name = 'tebak_rounds'
-- AND    column_name = 'subject_player';

-- -- Cek tipe kolom is_correct (harus boolean, nullable)
-- SELECT column_name, is_nullable, data_type
-- FROM   information_schema.columns
-- WHERE  table_name = 'tebak_answers'
-- AND    column_name = 'is_correct';

-- -- Cek apakah round_type sudah ada
-- SELECT column_name FROM information_schema.columns
-- WHERE  table_name = 'tebak_rounds'
-- AND    column_name = 'round_type';

-- -- Cek nilai ENUM tebak_round_status saat ini
-- SELECT enumlabel FROM pg_enum
-- WHERE  enumtypid = 'tebak_round_status'::regtype
-- ORDER BY enumsortorder;

-- =============================================================================
-- BAGIAN 1: Kolom round_type
-- =============================================================================
-- Kolom ini adalah sumber kebenaran jenis ronde.
-- Default 'tebak' agar data existing (semua ronde yang sudah ada) tetap valid.
-- Ronde DISC (R1-2) akan diisi 'disc' oleh RPC pembuat ronde di Tahap 3.2.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tebak_rounds' AND column_name = 'round_type'
  ) THEN
    ALTER TABLE tebak_rounds
      ADD COLUMN round_type text NOT NULL DEFAULT 'tebak'
      CHECK (round_type IN ('disc', 'tebak'));
  END IF;
END;
$$;

-- =============================================================================
-- BAGIAN 2: Constraint round_number → BETWEEN 1 AND 4
-- =============================================================================
-- Tahap 2 sudah mengubah advance logic secara fungsional (CASE 2 current_round<4),
-- tapi constraint di tabel masih IN (1,2). Migration ini menyelaraskan schema.
-- Data existing: hanya ada round 1 dan 2 → constraint baru tetap valid.
-- Ronde 3 dan 4 akan dibuat oleh RPC di Tahap 3.2.

DO $$
DECLARE
  old_constraint_name text;
BEGIN
  -- Cari nama constraint round_number yang ada (bisa berbeda antar lingkungan)
  SELECT con.conname INTO old_constraint_name
  FROM   pg_constraint con
  WHERE  con.conrelid = 'tebak_rounds'::regclass
  AND    con.contype = 'c'
  AND    pg_get_constraintdef(con.oid) LIKE '%round_number%';

  IF old_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE tebak_rounds DROP CONSTRAINT %I', old_constraint_name);
  END IF;

  -- Tambah constraint baru
  ALTER TABLE tebak_rounds
    ADD CONSTRAINT tebak_rounds_round_number_check
    CHECK (round_number BETWEEN 1 AND 4);
END;
$$;

-- =============================================================================
-- BAGIAN 3: subject_player → NULLABLE
-- =============================================================================
-- Ronde DISC tidak punya subjek. Kolom tetap dipakai untuk ronde tebak (R3-4).
-- Data existing: semua ronde punya subject_player → tetap NOT NULL secara data.
-- Constraint kondisional di BAGIAN 4 yang memastikan konsistensi ke depan.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tebak_rounds'
    AND column_name = 'subject_player'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tebak_rounds ALTER COLUMN subject_player DROP NOT NULL;
  END IF;
END;
$$;

-- =============================================================================
-- BAGIAN 4: CONSTRAINT KONDISIONAL round_type ↔ subject_player
-- =============================================================================
-- Menegakkan:
--   round_type='tebak' → subject_player IS NOT NULL
--   round_type='disc'  → subject_player IS NULL
--
-- CHECK constraint dipilih di atas trigger karena:
-- 1. Lebih sederhana — tidak perlu fungsi + trigger maintenance
-- 2. Performa lebih baik — dicek di row level tanpa function call overhead
-- 3. Error message langsung dari PostgreSQL (jelas constraint mana yang gagal)
-- 4. Tidak bisa dilupakan — trigger bisa di-disable tanpa sengaja
--
-- Kekurangan CHECK constraint: tidak bisa cek tabel lain atau panggil fungsi.
-- Tapi untuk kasus ini (cek dalam 1 baris yang sama), CHECK sudah cukup.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'tebak_rounds'::regclass
    AND conname = 'tebak_rounds_round_type_subject_check'
  ) THEN
    ALTER TABLE tebak_rounds
      ADD CONSTRAINT tebak_rounds_round_type_subject_check
      CHECK (
        (round_type = 'tebak' AND subject_player IS NOT NULL) OR
        (round_type = 'disc'  AND subject_player IS NULL)
      );
  END IF;
END;
$$;

-- =============================================================================
-- BAGIAN 5: Status ENUM — tambah 'both_answering'
-- =============================================================================
-- 'both_answering' adalah status untuk pertanyaan DISC: kedua pemain menjawab
-- serentak, tanpa fase subjek/penebak.
--
-- ⚠️ PENTING: ALTER TYPE ... ADD VALUE TIDAK BISA dijalankan dalam transaksi.
-- Jalankan baris di bawah SECARA TERPISAH (blok sendiri di SQL Editor),
-- BERSAMAAN dengan transaksi lain akan gagal.

ALTER TYPE tebak_round_status ADD VALUE IF NOT EXISTS 'both_answering' BEFORE 'revealed';

-- Setelah menjalankan di atas, verifikasi:
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = 'tebak_round_status'::regtype
-- ORDER BY enumsortorder;

-- =============================================================================
-- BAGIAN 6: Realtime publication — pastikan tebak_rounds ada di publikasi
-- =============================================================================
-- Saat ini tidak ada subscription INSERT tebak_rounds; sync dilakukan via
-- polling (useEffect + doSyncNewRound). Untuk round transition DISC yang lebih
-- mulus di masa depan, tambahkan ke publikasi.

DO $$
BEGIN
  -- Cek apakah tebak_rounds sudah ada di publikasi
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'tebak_rounds'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tebak_rounds;
  END IF;
END;
$$;

-- =============================================================================
-- VERIFIKASI PASCA-APPLY
-- =============================================================================
-- Jalankan query ini SETELAH semua bagian di atas selesai, untuk memastikan
-- perubahan sudah benar.

-- -- 1. Cek kolom baru
-- SELECT column_name, data_type, is_nullable
-- FROM   information_schema.columns
-- WHERE  table_name = 'tebak_rounds'
-- ORDER BY ordinal_position;

-- -- 2. Cek constraint lengkap
-- SELECT con.conname, pg_get_constraintdef(con.oid) as consrc
-- FROM   pg_constraint con
-- WHERE  con.conrelid = 'tebak_rounds'::regclass
-- ORDER BY con.conname;

-- -- 3. Cek nilai ENUM
-- SELECT enumlabel FROM pg_enum
-- WHERE  enumtypid = 'tebak_round_status'::regtype
-- ORDER BY enumsortorder;

-- -- 4. Cek publikasi
-- SELECT tablename FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- AND schemaname = 'public'
-- ORDER BY tablename;

-- -- 5. Tes constraint (INSERT simulasi — rollback)
-- -- Harus GAGAL (tebak tanpa subject):
-- -- INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
-- -- VALUES ('00000000-0000-0000-0000-000000000001', NULL, 3, 'tebak', 'subject_answering');
-- --
-- -- Harus GAGAL (disc dengan subject):
-- -- INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
-- -- VALUES ('00000000-0000-0000-0000-000000000001', 'a', 1, 'disc', 'both_answering');
-- --
-- -- Harus BERHASIL (disc tanpa subject):
-- -- INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
-- -- VALUES ('00000000-0000-0000-0000-000000000001', NULL, 1, 'disc', 'both_answering');
-- --
-- -- Harus BERHASIL (tebak dengan subject):
-- -- INSERT INTO tebak_rounds (session_id, subject_player, round_number, round_type, status)
-- -- VALUES ('00000000-0000-0000-0000-000000000001', 'a', 3, 'tebak', 'subject_answering');

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- Jalankan PER BARIS, URUTAN TERBALIK, untuk membatalkan perubahan:

-- -- 1. Hapus constraint kondisional
-- ALTER TABLE tebak_rounds DROP CONSTRAINT IF EXISTS tebak_rounds_round_type_subject_check;

-- -- 2. subject_player dikembalikan ke NOT NULL
-- UPDATE tebak_rounds SET subject_player = 'a' WHERE subject_player IS NULL;
-- ALTER TABLE tebak_rounds ALTER COLUMN subject_player SET NOT NULL;

-- -- 3. Constraint round_number dikembalikan
-- ALTER TABLE tebak_rounds DROP CONSTRAINT IF EXISTS tebak_rounds_round_number_check;
-- ALTER TABLE tebak_rounds ADD CONSTRAINT tebak_rounds_round_number_check
--   CHECK (round_number IN (1, 2));

-- -- 4. Hapus kolom round_type
-- ALTER TABLE tebak_rounds DROP COLUMN IF EXISTS round_type;

-- -- 5. Hapus nilai ENUM (tidak bisa dihapus langsung di PostgreSQL —
-- --    hanya bisa dengan ALTER TYPE ... RENAME + CREATE + DROP.
-- --    Biarkan saja — value tidak terpakai tidak mengganggu.)
-- -- ALTER TYPE tebak_round_status DROP VALUE 'both_answering';  -- TIDAK VALID DI PG

-- -- 6. Hapus tebak_rounds dari publikasi
-- ALTER PUBLICATION supabase_realtime DROP TABLE tebak_rounds;

-- =============================================================================
-- DEPENDENSI KE TAHAP BERIKUT
-- =============================================================================
-- Migration ini hanya schema. Logic pengisian & penggunaan ada di tahap berikut:
--
-- 3.2 (RPC):
-- - `create_tebak_rounds` / `find_or_create_tebak_session`: saat INSERT round,
--   set `round_type` = 'disc' untuk R1-2, 'tebak' untuk R3-4.
--   Set `subject_player = NULL` untuk R1-2.
--   Set status = 'both_answering' untuk R1-2.
-- - `advance_tebak_game`: deteksi `round_type` untuk tentukan advance logic.
-- - `start_question_timer`: untuk DISC, set deadline di `subject_deadline`
--   (reuse kolom), jangan set `guesser_deadline`.
-- - `handle_question_timeout`: untuk DISC, timeout berbeda (tanpa guesser).
--
-- 3.3 (Types): subject_player nullable, round_type field di tipe TebakRound.
--
-- 3.4 (Server Actions): `submitDiscAnswer()` tidak pakai is_correct,
--   tidak set correct_answer, tidak set guesser_deadline.
--
-- 3.5 (GameRoom): deteksi `isDiscRound()` via round_number atau round_type
--   (butuh fetch round_type — pakai roundOfRef atau tambahan).
-- =============================================================================
