# TEBAK DISC — Riset Komprehensif

> **Tujuan:** Menambahkan mekanik DISC untuk Ronde 1-2 (kedua pemain menjawab simultan tentang diri sendiri) tanpa merusak mekanik tebak yang sudah berfungsi di Ronde 3-4 (subjek menjawab, penebak menebak).
>
> **Dibuat:** 2026-06-26
> **Berdasarkan:** `beautifio/` codebase (commit terbaru)

---

## Ringkasan

Codebase Tebak Aku saat ini dirancang ketat untuk **2 ronde** dengan arsitektur subjek/penebak (`current_subject`, `tebak_player ENUM ('a','b')`, status dua-fase `subject_answering → guesser_guessing`). Setiap pertanyaan memiliki dua phase berurutan dengan deadline terpisah (`subject_deadline`, `guesser_deadline`), jawaban dicatat di `tebak_answers` dengan `guesser_id` dan `is_correct`, dan skor hanya bertambah via `increment_tebak_score` saat tebakan benar. **Tidak ada konsep "ronde DISC"**, tidak ada `category='disc'`, tidak ada mekanik jawaban simultan, dan tidak ada cara merekam jawaban dua pemain tanpa peran subjek/penebak. Ekspansi ke 4 ronde (R1-2 DISC, R3-4 tebak) membutuhkan perubahan struktural di database, RPC, server actions, tipe TypeScript, state management GameRoom, dan hampir semua UI component.

---

## Tabel: Asumsi Peran Subjek/Penebak

### A. Database & TypeScript

| File:Baris | Kode | Asumsi | Dampak ke DISC | Rencana Ubah |
|---|---|---|---|---|
| `supabase/migrations/20260620009000_tebak_aku.sql:3` | `CREATE TYPE tebak_player AS ENUM ('a', 'b');` | Role player hanya 'a' atau 'b' | OK — DISC tidak butuh role baru | Tidak diubah |
| `supabase/migrations/20260620009000_tebak_aku.sql:23` | `current_subject tebak_player` di `tebak_sessions` | Sesi punya 1 subjek aktif | DISC: tidak ada subjek → field bisa NULL atau diabaikan | `current_subject` tetap untuk R3-4; DISC pakai flag `is_disc_round()` atau cek round_number |
| `supabase/migrations/20260620009000_tebak_aku.sql:32` | `subject_player tebak_player NOT NULL` di `tebak_rounds` | Setiap ronde punya 1 subjek | DISC: tidak ada subjek → kolom ini tidak bermakna | Buat NULLABLE atau kolom terpisah `round_type`; atau biarkan `subject_player=NULL` untuk DISC |
| `supabase/migrations/20260620009000_tebak_aku.sql:33` | `round_number int CHECK (round_number IN (1, 2))` | Hanya 2 ronde | HARUS DIUBAH: perlu 4 ronde | Ubah constraint menjadi `CHECK (round_number BETWEEN 1 AND 4)` |
| `supabase/migrations/20260620009000_tebak_aku.sql:2` | `tebak_round_status ENUM ('subject_answering', 'guesser_guessing', 'revealed', 'done')` | Question status 2-fase | DISC butuh phase simultan → status baru atau reuse 'subject_answering' untuk kedua pemain | Tambah `'both_answering'` ke enum, atau reuse 'subject_answering' secara kondisional |
| `apps/web/src/lib/tebak/queries.ts:10` | `current_subject: 'a' \| 'b' \| null` di `TebakSession` | Subjek bisa null (saat waiting) | DISC: null berarti tidak relevan, bukan error | Tidak diubah — null sudah didukung |
| `apps/web/src/lib/tebak/queries.ts:19` | `subject_player: 'a' \| 'b'` di `TebakRound` | Wajib ada subjek per ronde | DISC: tidak punya subjek | Ubah jadi `subject_player: 'a' \| 'b' \| null` |
| `apps/web/src/lib/tebak/queries.ts:33-35` | `subject_answered_at`, `guesser_deadline`, `subject_deadline` | Deadline 2-fase | DISC: cukup 1 deadline bersama | Tambah `answers_deadline` atau reuse `subject_deadline` |
| `apps/web/src/lib/tebak/queries.ts:42-44` | `guesser_id: string`, `is_correct: boolean \| null` di `TebakAnswer` | Jawaban selalu dari guesser, is_correct relevan | DISC: kedua pemain "menjawab", bukan "menebak" | Kolom `guesser_id` tetap dipakai (siapa yang jawab), `is_correct=NULL` untuk DISC, atau tambah tabel `tebak_player_answers` terpisah |

### B. Server Actions (`actions.ts`)

| File:Baris | Kode | Asumsi | Dampak ke DISC | Rencana Ubah |
|---|---|---|---|---|
| `apps/web/src/lib/tebak/actions.ts:251-263` | `submitSubjectAnswer()` | Set `correct_answer`, `subject_answered_at`, `guesser_deadline`, status→'guesser_guessing' | DISC: tidak ada `correct_answer` (jawaban tentang diri sendiri), tidak ada `guesser_deadline` | Buat `submitDiscAnswer()` yang tidak set `correct_answer` atau `guesser_deadline`, cukup catat jawaban player, cek jika kedua sudah jawab → reveal |
| `apps/web/src/lib/tebak/actions.ts:265-344` | `submitGuesserAnswer()` | Membaca `correct_answer`, cek `guesser_deadline`, insert `is_correct`, increment score jika benar | DISC: tidak ada `correct_answer` untuk dicek, tidak ada skor berdasarkan benar/salah | JANGAN panggil ini untuk DISC. DISC pakai `submitDiscAnswer()` |
| `apps/web/src/lib/tebak/actions.ts:346-351` | `handleSubjectTimeout()` | Panggil RPC `handle_question_timeout` | RPC ini asumsikan ada guesser | Untuk DISC, perlu `handleDiscTimeout()` sendiri |
| `apps/web/src/lib/tebak/actions.ts:281` | `handleGuesserTimeout` | Submit `__timeout__` via `submitGuesserAnswer` | DISC: tidak ada guesser | Tidak dipanggil untuk DISC |
| `apps/web/src/lib/tebak/actions.ts:65-151` | `botPlayTurn()` | Cek `isBotSubject`, bedakan jawab sebagai subject vs guesser | DISC: bot perlu mekanik jawab simultan | Tambah cabang untuk DISC round |
| `apps/web/src/lib/tebak/actions.ts:226-239` | `advanceGame()` | Panggil RPC `advance_tebak_game` | RPC saat ini hardcode round 1→2→finish | Lihat bagian **Advance Logic** di bawah |

### C. GameRoom.tsx — Derived State & Handlers

| File:Baris | Kode | Asumsi | Dampak ke DISC | Rencana Ubah |
|---|---|---|---|---|
| `GameRoom.tsx:92` | `const isSubject = gameSession.current_subject === (isPlayerA ? "a" : "b")` | Sesi selalu punya subject | DISC: `current_subject` mungkin NULL → `isSubject` false untuk kedua player — tapi logika UI tetap dipanggil | Tambah `isDiscRound()` yang override `isSubject` jadi null/tidak relevan |
| `GameRoom.tsx:93` | `const subjectName = isSubject ? myName : opponentName` | Hanya subjectName yang relevan | DISC: kedua pemain adalah "subject" → butuh `myName` saja | Untuk DISC, `subjectName` = `myName`, tidak perlu `opponentName` sebagai subject |
| `GameRoom.tsx:263-269` | `handleSubjectAnswer()` | Hanya subject yang bisa jawab | DISC: kedua pemain jawab | Buat `handleDiscAnswer()` yang panggil `submitDiscAnswer()` |
| `GameRoom.tsx:271-276` | `handleGuesserGuess()` | Hanya guesser yang nebak | DISC: tidak dipanggil | Dijaga oleh `isDiscRound()` |
| `GameRoom.tsx:278-281` | `handleSubjectTimeout()` / `handleGuesserTimeout()` | Timeout spesifik peran | DISC: perlu timeout simultan | Buat `handleDiscTimeout()` |
| `GameRoom.tsx:312-349` | `handleAdvance()` | Panggil `advanceGame()` | RPC `advance_tebak_game` belum tahu DISC | Harus bercabang atau RPC diubah |
| `GameRoom.tsx:383-384` | `myDots` / `theirDots` cari `is_correct` | Dot = benar/salah tebakan | DISC: `is_correct` = NULL → dots jadi null semua? | Mungkin DISC tidak pakai dots, atau dots = sudah jawab/belum |
| `GameRoom.tsx:386-393` | `resultType` kalkulasi `subject_timeout`, `guesser_timeout`, `correct`, `wrong` | 4 tipe hasil | DISC: perlu tipe hasil baru — "kedua jawab", "A timeout", "B timeout", "kedua timeout" | Tambah `'disc_done'`, `'disc_timeout_a'`, `'disc_timeout_b'`, `'disc_both_timeout'` |

### D. UI Components

| Component | Asumsi | Dampak ke DISC |
|---|---|---|
| `GameRoom.tsx:394-396` | `questionText` pakai `isSubject` untuk pilih `question_text` vs `question_for_guesser` | DISC: kedua pemain lihat `question_text` (pertanyaan tentang diri sendiri) |
| `GameRoom.tsx:395` | `roleLabel`: `🎯 Pertanyaan untukmu` vs `🔍 Tebaklah pikiran {subjectName}` | DISC: label baru — `💬 Jawab tentang dirimu` |
| `GameRoom.tsx:396` | `isMyTurn = isSubject ? status==='subject_answering' : status==='guesser_guessing'` | DISC: giliran = status === 'both_answering' (atau apapun nama statusnya) |
| `GameRoom.tsx:421-425` | Label giliran: "Pilih jawabanmu" vs "Menunggu lawan menjawab..." | DISC: dua label baru — kedua pemain melihat "Pilih jawabanmu" secara simultan |
| `GameRoom.tsx:431` | `isSubmitted = isSubject ? submitting : locked \|\| submittedRef.current` | DISC: submitted = sudah kirim jawaban |
| `GameRoom.tsx:464` | `if (isSubject) handleSubjectAnswer(opt); else handleGuesserGuess(opt);` | DISC: panggil `handleDiscAnswer(opt)` |
| `GameRoom.tsx:475-476` | Dua timer terpisah (`subject_deadline` + `guesser_deadline`) | DISC: satu timer bersama |
| `GameRoom.tsx:407-408` | Render `RoundResultScreen` / `JedaScreen` dengan props `subjectName`, `guesserName` | DISC: screen baru atau modifikasi screen yang ada |
| `JedaScreen.tsx:9-10` | `resultType` 4 nilai, `subjectName`, `guesserName` | DISC: perlu tipe hasil baru |
| `JedaScreen.tsx:62-78` | Switch case `correct`/`wrong`/`subject_timeout`/`guesser_timeout` | DISC: messaging berbeda |
| `RoundResultScreen.tsx:42-56` | Filter answer by `guesser_id`, hitung `is_correct` | DISC: tidak ada `is_correct`, hitung "cocok" beda |

---

## Fungsi/Komponen yang Harus Bercabang per Jenis Ronde

Berikut semua titik yang harus mendeteksi `isDiscRound()` (R1-2) vs `isTebakRound()` (R3-4) dan bercabang:

### 1. RPC SQL (Database Layer)

| RPC | File Migrasi | Cabang yang Diperlukan |
|---|---|---|
| `create_tebak_rounds` (saat aktivasi sesi) | `20260709000000_tebak_activate_deadline.sql`, `20260622142900_tebak_select_questions_in_rpc.sql`, dll. | Saat round_number=1 atau 2: INSERT ronde DISC (tanpa `subject_player` atau dengan flag). Saat round_number=3 atau 4: INSERT ronde tebak seperti sekarang |
| `advance_tebak_game` | `20260710000000_tebak_advance_guard.sql` (latest) | **Kasus baru:** advance dalam ronde DISC (cek kedua jawab → reveal), advance R1→R2, R2→R3 (baru), R3→R4 (baru), R4→finish |
| `handle_question_timeout` | `20260708000000_tebak_handle_timeout.sql` | **Asumsi guesser:** Jika DISC, tidak ada guesser → timeout berarti kedua player tidak menjawab? Atau timeout per-player? |
| `start_question_timer` | `20260622000002_tebak_fixes.sql` | Set `subject_deadline` → untuk DISC, set deadline bersama (nama kolom bisa `answers_deadline` atau tetap `subject_deadline`) |
| `set_session_advance_at` | `20260703000000_tebak_server_timed_advance.sql` | OK — tidak perlu ubah (generik) |
| `increment_tebak_score` | `20260620009000_tebak_aku.sql` | DISC: skor mungkin dihitung berbeda (misal, +5 per jawaban tepat waktu, bukan +10 untuk tebakan benar) |
| `find_or_create_tebak_session` | Multiple migrations | Saat aktivasi, buat round 1 (DISC) bukan round 1 (tebak). Juga insert questions dengan format DISC |
| `activate_tebak_session` | `20260709000000_tebak_activate_deadline.sql` | Sama — aktivasi harus buat round DISC 1, bukan tebak |

### 2. Server Actions (`actions.ts`)

| Fungsi | Cabang |
|---|---|
| `submitSubjectAnswer()` | Tidak dipanggil untuk DISC. DISC punya `submitAnswer()` sendiri |
| `submitGuesserAnswer()` | Tidak dipanggil untuk DISC |
| Baru: `submitDiscAnswer(questionId, playerId, answer)` | Catat jawaban player. Jika kedua sudah jawab → reveal + set advance_at. Tidak set `correct_answer` atau `guesser_deadline` |
| `handleSubjectTimeout()` | Tidak dipanggil untuk DISC |
| `handleGuesserTimeout` | Tidak dipanggil untuk DISC |
| Baru: `handleDiscTimeout(questionId, playerId)` | Catat bahwa player X timeout. Jika kedua timeout atau salah satu timeout dan yang lain sudah jawab → reveal |
| `advanceGame()` / `advance_tebak_game` RPC | RPC harus detect round_type dan bercabang |
| `botPlayTurn()` | Untuk DISC round, bot pilih jawaban random tentang dirinya (tanpa `correct_answer`), langsung submit |

### 3. GameRoom.tsx — State & Derived

| Bagian | Cabang |
|---|---|
| `isSubject` | Untuk DISC: false untuk kedua player → logika UI tidak pakai `isSubject` |
| `findActiveQuestion()` | Status untuk DISC: `'both_answering'` (atau status baru) bukan `'subject_answering'` / `'guesser_guessing'` |
| `isMyTurn` | Untuk DISC: selalu true selama status = `'both_answering'` (dua pemain jawab simultan) |
| `questionText` | DISC: kedua pemain lihat `question_text` tanpa substitusi `{NamaSubject}` |
| `roleLabel` | DISC: label baru |
| `resultType` (line 387-393) | DISC: `'disc_complete'`, `'disc_timeout_a'`, `'disc_timeout_b'`, `'disc_both_timeout'` |
| `myDots` / `theirDots` | DISC: dots tidak berdasarkan `is_correct`. Alternatif: dots = sudah jawab (hijau) / belum (abu-abu) / timeout (merah) |
| `isShowingJeda` / `isShowingRoundResult` | DISC: logika yang sama tapi `current_round` sekarang 1-4 |
| `handleAdvance` | RPC harus handle DISC advance |

### 4. UI Components

| Component | DISC Changes |
|---|---|
| `GameRoom.tsx` (question card) | Label "Pertanyaan {n}/5" tetap. Tapi label peran: "Jawab tentang dirimu" bukan "Pertanyaan untukmu" / "Tebaklah pikiran..." |
| `GameRoom.tsx` (timer line 475-476) | Satu timer bersama, bukan dua timer terpisah |
| `GameRoom.tsx` (option button line 464) | Handler jadi `handleDiscAnswer(opt)` |
| `JedaScreen.tsx` | Props baru + messaging untuk DISC |
| `RoundResultScreen.tsx` | Untuk DISC: tidak ada "Giliran Bertukar" antar ronde DISC; stats dihitung beda |
| `WinnerScreen.tsx` | OK — hanya lihat skor akhir, tidak perlu tahu jenis ronde |
| `ScoreBoard.tsx` | Dots: untuk DISC, dots mungkin tidak ditampilkan atau diartikan beda |

---

## Flag Risiko

### R1: `advance_tebak_game` — Risiko PALING TINGGI

**Apa yang salah:** `advance_tebak_game` adalah RPC paling kompleks dan paling sering dimigrasi (6+ versi). Ia mengatur:
- Increment `current_q_seq`
- Deteksi "all revealed" (berdasarkan `status='revealed'`)
- Pembuatan ronde baru dengan SUBJECT
- Finalisasi game

RPC ini saat ini hanya tahu ronde 1 dan 2. Mengubahnya untuk menangani ronde 1-4, dengan dua tipe ronde berbeda (DISC vs tebak), dan dua mekanik advance berbeda, **sangat berisiko regresi pada R3-4**.

**Cara Isolasi:**
1. **Jangan ubah `advance_tebak_game` yang ada.** Buat RPC baru: `advance_tebak_game_v2` yang handle seluruh logika 4 ronde. Di `actions.ts`, `advanceGame()` panggil RPC baru. RPC lama ditinggalkan untuk backward compat.
2. **Atau:** Tambah parameter `p_round_type` ke RPC yang ada dengan default 'tebak' — tidak mengubah behavior untuk panggilan yang tidak menyertakan parameter.
3. **PENTING:** Setiap cabang harus di-test dengan ronde tebak (R3-4) untuk memastikan behavior identik dengan sebelum perubahan.

### R2: `handle_question_timeout` — Risiko TINGGI

**Apa yang salah:** RPC ini (migrasi `20260708000000`) mengasumsikan:
- Ada `current_subject` → menentukan guesser → beri poin ke guesser jika subject timeout
- `sequence_number = 5 AND round_number = 1` → set `advance_at` 8s (delay antar ronde)
- Hanya handle `subject_answering` dan `guesser_guessing` status

Untuk DISC, timeout berarti pemain tidak menjawab. Tidak ada guesser yang bisa diberi poin. Round_number sekarang 1-4, bukan hanya 1-2.

**Cara Isolasi:**
1. Tambah guard di awal: `IF ronde DISC THEN panggil handle_disc_timeout()`
2. Atau buat RPC `handle_disc_timeout` terpisah
3. Pastikan cron job yang panggil `handle_question_timeout` masih berfungsi untuk R3-4

### R3: `submitSubjectAnswer` dan `submitGuesserAnswer` — Risiko SEDANG

Kedua fungsi ini mengupdate `tebak_questions` dengan asumsi dua-fase. Untuk DISC:
- `submitSubjectAnswer` akan salah karena set `correct_answer` (yang untuk DISC adalah jawaban pribadi, bukan "kunci jawaban") dan set `guesser_deadline`
- `submitGuesserAnswer` akan gagal karena `correct_answer` tidak bermakna dan `guesser_deadline` mungkin tidak diset

**Cara Isolasi:**
1. JANGAN ubah `submitSubjectAnswer` / `submitGuesserAnswer` — biarkan utuh untuk R3-4
2. Buat fungsi baru `submitDiscAnswer` yang:
   - INSERT ke `tebak_answers` dengan `guesser_id` = player ybs, `answer`, `is_correct=NULL`, `time_ms`
   - Set `subject_answered_at` (kolom reuse untuk catat waktu jawab player)
   - Jika kedua sudah jawab: UPDATE `status='revealed'`, panggil `set_session_advance_at`
   - Jika timeout sebagian: biarkan status tetap sampai semua timeout atau timeout total

### R4: `tebak_rounds.round_number CHECK (1,2)` — Risiko SEDANG

Constraint database hanya mengizinkan round_number 1 atau 2. Ini HARUS diubah menjadi 1-4.

**Cara Isolasi:**
1. Migration baru: `ALTER TABLE tebak_rounds DROP CONSTRAINT tebak_rounds_round_number_check;`
2. `ALTER TABLE tebak_rounds ADD CONSTRAINT tebak_rounds_round_number_check CHECK (round_number BETWEEN 1 AND 4);`
3. Semua RPC yang INSERT ke `tebak_rounds` harus diperiksa — pastikan mereka mengisi `round_number` dengan benar (1-4)

### R5: `is_correct` di UI — Risiko SEDANG

`GameRoom.tsx:383-384`:
```typescript
const myDots = questions.map(q => answers.find(ans => ans.question_id === q.id && ans.guesser_id === userId)?.is_correct ?? null)
const theirDots = questions.map(q => answers.find(ans => ans.question_id === q.id && ans.guesser_id === opponentId)?.is_correct ?? null)
```

Untuk DISC, `is_correct` = NULL → dots jadi null → ScoreBoard render dot kosong. Ini OK secara visual (dot abu-abu), tapi kehilangan informasi.

`RoundResultScreen.tsx:51-56`:
```typescript
const myCorrect = myRoundAnswers.filter(a => a.is_correct).length
```
Untuk DISC, `a.is_correct` = NULL → filter jadi 0 → "Kebenaran" player di DISC selalu 0. Ini SALAH.

**Cara Isolasi:**
1. `RoundResultScreen`: tambah `isDiscRound` prop. Jika true, jangan hitung `is_correct`. Hitung metrik relevan (misal, jumlah jawab tepat waktu, atau "kecocokan" jawaban).
2. `ScoreBoard` dots: untuk DISC, dots = answered (true) / unanswered (null) / timeout (false) — mapping ulang.

### R6: `botPlayTurn` — Risiko RENDAH

Bot untuk DISC round perlu:
- Pilih jawaban random (seperti bot sebagai subject saat ini)
- TAPI: tidak set `correct_answer`, tidak set `guesser_deadline`
- Langsung INSERT ke `tebak_answers` dengan `is_correct=NULL`

Tambahkan cabang `if (isDiscRound)` di `botPlayTurn`.

### R7: `findOrCreateSession` / `activateSession` — Risiko SEDANG

Sesi baru saat ini langsung buat round 1 dengan `subject_player`. Untuk DISC, round 1 harus tanpa `subject_player` atau dengan `subject_player=NULL`.

**Cara Isolasi:**
1. Migration baru update `find_or_create_tebak_session` dan `activate_tebak_session`:
   - INSERT `tebak_rounds` dengan `subject_player=NULL` untuk round 1
   - INSERT questions dengan format DISC (mungkin `question_for_guesser=NULL`, atau question_text yang diubah)
2. Atau: tambah fungsi baru `create_disc_round()` yang dipanggil setelah aktivasi

---

## Urutan Sub-Tahap Usulan

### 3.1: Perubahan Database — Struktur

1. **Migration: Ubah constraint round_number**
   ```sql
   ALTER TABLE tebak_rounds DROP CONSTRAINT tebak_rounds_round_number_check;
   ALTER TABLE tebak_rounds ADD CONSTRAINT tebak_rounds_round_number_check
     CHECK (round_number BETWEEN 1 AND 4);
   ```

2. **Migration: Ubah `subject_player` jadi nullable**
   ```sql
   ALTER TABLE tebak_rounds ALTER COLUMN subject_player DROP NOT NULL;
   ```

3. **Migration: Tambah `round_type` (optional — atau deteksi via round_number)**
   ```sql
   ALTER TABLE tebak_rounds ADD COLUMN round_type text
     CHECK (round_type IN ('disc', 'tebak'))
     DEFAULT 'tebak';
   ```

4. **Migration: Update `tebak_round_status` ENUM**
   ```sql
   ALTER TYPE tebak_round_status ADD VALUE 'both_answering' BEFORE 'revealed';
   ```
   *Catatan: `ALTER TYPE ... ADD VALUE` tidak bisa dalam transaksi, perlu `NOT VALID` atau migration terpisah.*

5. **Migration: Tambah kolom `answers_deadline` di `tebak_questions`** (optional — reuse `subject_deadline`)
   ```sql
   ALTER TABLE tebak_questions ADD COLUMN answers_deadline timestamptz;
   ```

6. **Migration: Update `tebak_question_bank`** untuk mendukung pertanyaan DISC (tentang diri sendiri)
   - Pastikan `question_text` diformat sebagai pertanyaan orang pertama ("Makanan favorit kamu adalah?")
   - `question_for_guesser` tidak relevan untuk DISC (bisa NULL)

7. **Enable Realtime untuk `tebak_rounds` INSERT** (jika belum)
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE tebak_rounds;
   ```
   *Saat ini tidak ada subscription INSERT tebak_rounds — sync dilakukan via polling useEffect. Untuk DISC, round transition perlu realtime.*

### 3.2: Perubahan RPC SQL

1. **Update `advance_tebak_game`** (versi baru `advance_tebak_game_v2`):
   - Terima parameter tambahan (atau deteksi dari `tebak_rounds.round_type`)
   - **Untuk DISC (R1-2):**
     - Advance question: cek apakah kedua jawab sudah masuk (via `tebak_answers` count == 2) atau timeout sebagian
     - Advance round R1→R2: buat round 2 (DISC), insert 5 questions
     - Advance round R2→R3: buat round 3 (tebak) dengan `subject_player` random/tukar, insert 5 questions
   - **Untuk tebak (R3-4):** behavior identik dengan existing (cek `status='revealed'` untuk semua questions)
   - Advance round R3→R4: buat round 4 dengan subject_player bertukar
   - Advance round R4→finish

2. **Update `handle_question_timeout`:**
   - Tambah deteksi tipe round
   - Untuk DISC: catat timeout di `tebak_answers` tanpa `is_correct`, tanpa `increment_tebak_score`
   - Jika kedua timeout → reveal + set advance_at
   - Jika salah satu timeout → reveal + set advance_at (biarkan yang sudah jawab)

3. **Update `start_question_timer`:**
   - Untuk DISC: set `answers_deadline` (atau `subject_deadline`) = NOW + 20s (waktu yang sama untuk kedua player)
   - Jangan set `guesser_deadline`

4. **Update `find_or_create_tebak_session` dan `activate_tebak_session`:**
   - Saat buat round 1: set `round_type='disc'`, `subject_player=NULL`, `status='both_answering'`
   - Insert questions dengan `question_for_guesser=NULL`

5. **Fungsi baru: `create_tebak_round`** untuk membuat round tebak (R3, R4)
   - Parameter: session_id, round_number, subject_player
   - Insert round + 5 questions seperti existing

### 3.3: Perubahan TypeScript Types

File `apps/web/src/lib/tebak/queries.ts`:

```typescript
export type TebakRound = {
  id: string
  session_id: string
  subject_player: 'a' | 'b' | null    // nullable untuk DISC
  round_number: number                  // 1-4, bukan 1-2
  round_type: 'disc' | 'tebak'         // baru
  status: string
}

export type TebakQuestion = {
  // tambah:
  answers_deadline: string | null       // deadline bersama untuk DISC
}

export type TebakSession = {
  // current_subject sudah nullable — OK
  // tambah (optional):
  // rounds?: TebakRound[]  // untuk deteksi round_type
}
```

### 3.4: Perubahan Server Actions

File `apps/web/src/lib/tebak/actions.ts`:

1. **Fungsi baru: `submitDiscAnswer(questionId, playerId, answer, startedAt)`**
   ```typescript
   export async function submitDiscAnswer(
     questionId: string, playerId: string, answer: string, startedAt: number
   ): Promise<void> {
     const supabase = await createServerClient()
     const now = new Date()
     const timeTaken = Date.now() - startedAt

     // Cek deadline — reuse subject_deadline atau answers_deadline
     const { data: q } = await supabase
       .from('tebak_questions')
       .select('subject_deadline, round_id, sequence_number, status')
       .eq('id', questionId).single()
     if (!q) throw new Error('Question not found')

     // Idempotency: jika sudah reveal, skip
     if (q.status !== 'both_answering') return

     // Cek timeout
     if (q.subject_deadline && new Date(q.subject_deadline) < now) {
       // Catat timeout
       await supabase.from('tebak_answers').insert({
         question_id: questionId, guesser_id: playerId,
         answer: '__timeout__', is_correct: null, time_ms: 20000,
       })
       return
     }

     // Catat jawaban
     await supabase.from('tebak_answers').insert({
       question_id: questionId, guesser_id: playerId,
       answer, is_correct: null, time_ms: timeTaken,
     })

     // Cek apakah kedua sudah jawab
     const { count } = await supabase
       .from('tebak_answers')
       .select('*', { count: 'exact', head: true })
       .eq('question_id', questionId)

     if (count === 2) {
       // Kedua jawab → reveal
       await supabase.from('tebak_questions')
         .update({ status: 'revealed' })
         .eq('id', questionId)

       // Set advance_at
       const { data: r } = await supabase
         .from('tebak_rounds').select('session_id, round_number')
         .eq('id', q.round_id).single()
       if (r) {
         const isLastQ = q.sequence_number === 5
         await supabase.rpc('set_session_advance_at', {
           p_session_id: r.session_id,
           p_delay_seconds: isLastQ ? 8 : 3,
         })
       }
     }
   }
   ```

2. **Fungsi baru: `handleDiscTimeout(questionId, playerId)`** — mirror `handleQuestionTimeout` untuk DISC

3. **Update `advanceGame`**: panggil RPC baru `advance_tebak_game_v2`

4. **Update `botPlayTurn`**: tambah cabang DISC:
   ```typescript
   // Deteksi round type
   const { data: round } = await supabase
     .from('tebak_rounds')
     .select('round_type')
     .eq('id', q.round_id).single()

   if (round?.round_type === 'disc') {
     // Pilih jawaban random, submit via submitDiscAnswer path
     const answer = options[Math.floor(Math.random() * options.length)]
     // langsung INSERT tanpa is_correct, tanpa guesser_deadline
     await supabase.from('tebak_answers').insert({
       question_id: questionId, guesser_id: botUserId,
       answer, is_correct: null,
       time_ms: Math.floor(Math.random() * 10000) + 3000,
     })
     // Cek kedua sudah jawab...
   } else {
     // existing logic
   }
   ```

### 3.5: Perubahan GameRoom.tsx

1. **Deteksi round type:**
   ```typescript
   const isDiscRound = gameSession.current_round <= 2
   ```
   Atau dari `roundOfRef` + `tebak_rounds.round_type`.

2. **`isSubject` override:**
   ```typescript
   const isSubject = isDiscRound ? false : gameSession.current_subject === (isPlayerA ? "a" : "b")
   ```

3. **`isMyTurn` untuk DISC:**
   ```typescript
   const isMyTurn = displayQ ? (
     isDiscRound
       ? displayQ.status === "both_answering"  // atau status apapun
       : (isSubject ? displayQ.status === "subject_answering" : displayQ.status === "guesser_guessing")
   ) : false
   ```

4. **`questionText` untuk DISC:**
   ```typescript
   const questionText = displayQ ? (
     isDiscRound
       ? displayQ.question_text  // langsung, tanpa substitusi
       : (isSubject ? displayQ.question_text : (displayQ.question_for_guesser ?? displayQ.question_text).replace(/\{NamaSubject\}/g, subjectName ?? 'Lawan'))
   ) : ''
   ```

5. **`roleLabel` untuk DISC:**
   ```typescript
   const roleLabel = displayQ ? (
     isDiscRound
       ? { icon: '💬', text: 'Jawab tentang dirimu' }
       : (isSubject ? { icon: '🎯', text: 'Pertanyaan untukmu' } : { icon: '🔍', text: `Tebaklah pikiran ${subjectName ?? 'Lawan'}` })
   ) : null
   ```

6. **Handler jawab:**
   ```typescript
   const handleAnswer = async (answer: string) => {
     if (!currentQ || submitting) return
     if (isDiscRound) {
       // panggil submitDiscAnswer
     } else if (isSubject) {
       handleSubjectAnswer(answer)
     } else {
       handleGuesserGuess(answer)
     }
   }
   ```
   Di button onClick:
   ```typescript
   onClick={() => { if (!isClickable) return; handleAnswer(opt); }}
   ```

7. **Timer untuk DISC:**
   ```typescript
   {isDiscRound && displayQ.subject_deadline && (
     <div className="mb-4">
       <DigitalClock deadline={displayQ.subject_deadline} onTimeout={handleDiscTimeout} label="Jawab sebelum waktu habis" isUrgent={true} />
     </div>
   )}
   {!isDiscRound && displayQ.status === "subject_answering" && displayQ.subject_deadline && ...}
   {!isDiscRound && displayQ.status === "guesser_guessing" && displayQ.guesser_deadline && ...}
   ```

8. **Dots untuk DISC:**
   ```typescript
   const myDots = questions.map(q => {
     const ans = answers.find(a => a.question_id === q.id && a.guesser_id === userId)
     if (isDiscRound) {
       if (!ans) return null          // belum jawab
       if (ans.answer === '__timeout__') return false  // timeout
       return true                     // sudah jawab
     }
     return ans?.is_correct ?? null
   })
   ```

9. **`resultType` untuk DISC:**
   ```typescript
   let resultType: 'correct' | 'wrong' | 'subject_timeout' | 'guesser_timeout' | 'disc_done' | 'disc_timeout' = 'correct';
   if (revealedQ) {
     if (isDiscRound) {
       const myAns = answers.find(a => a.question_id === revealedQ.id && a.guesser_id === userId)
       const theirAns = answers.find(a => a.question_id === revealedQ.id && a.guesser_id === opponentId)
       if (myAns?.answer === '__timeout__' && theirAns?.answer === '__timeout__') resultType = 'disc_timeout'
       else resultType = 'disc_done'
     } else {
       if (!revealedQ.subject_answered_at) resultType = 'subject_timeout'
       else if (currentAnswer?.answer === '__timeout__') resultType = 'guesser_timeout'
       else if (currentAnswer?.is_correct === true) resultType = 'correct'
       else resultType = 'wrong'
     }
   }
   ```

### 3.6: Perubahan JedaScreen & RoundResultScreen

**`JedaScreen.tsx`:**
- Tambah tipe `'disc_done'`, `'disc_timeout'` ke union type `resultType`
- Tambah messaging:
  ```typescript
  case 'disc_done':
    title = 'Keduanya sudah menjawab!'
    subtitle = 'Lihat jawaban kalian berdua'
    break
  case 'disc_timeout':
    title = 'Waktu habis!'
    subtitle = 'Salah satu atau keduanya tidak sempat menjawab'
    break
  ```

**`RoundResultScreen.tsx`:**
- Terima prop `isDiscRound`
- Jika DISC:
  - Jangan tampilkan "Giliran Bertukar" (untuk R1→R2)
  - Tampilkan statistik partisipasi (berapa jawab tepat waktu) bukan kebenaran
  - Hitung `is_correct` tidak relevan
  - Untuk R2→R3 (DISC→tebak): tampilkan "Siap-siap! Ronde selanjutnya: Tebak pikiran lawan!"

### 3.7: Perubahan Realtime

**File `apps/web/src/lib/tebak/realtime.ts`:**
- Saat ini subscribe ke `tebak_sessions` (UPDATE), `tebak_questions` (*), `tebak_answers` (INSERT)
- Untuk DISC, perlu juga subscribe ke `tebak_rounds` (INSERT) — agar roundOfRef sinkron realtime, bukan polling
- Tambah listener:
  ```typescript
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'tebak_rounds',
    filter: `session_id=eq.${sessionId}`
  }, (p) => callbacks.onRoundInserted(p.new as TebakRound))
  ```

**Race condition potensial untuk DISC:**
- Kedua player submit jawaban hampir bersamaan → dua INSERT `tebak_answers` untuk question yang sama
- `submitDiscAnswer` cek `count === 2` — ada race: kedua koneksi bisa lihat count = 1 dan tidak reveal
- **Solusi:** Gunakan `FOR UPDATE` atau fungsi RPC atomic yang lock question, cek count, update status. Buat RPC `submit_disc_answer` yang handling race.
- Atau: setelah INSERT, jalankan `SELECT COUNT(*)` dalam transaksi yang sama.

**Rekomendasi:** Buat RPC `submit_disc_answer`:
```sql
CREATE OR REPLACE FUNCTION submit_disc_answer(
  p_question_id UUID,
  p_player_id UUID,
  p_answer TEXT,
  p_time_ms INT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_question tebak_questions;
  v_answer_count INT;
BEGIN
  -- Lock question untuk cegah race
  SELECT * INTO v_question FROM tebak_questions WHERE id = p_question_id FOR UPDATE;

  -- Idempotency: cek apakah player sudah jawab
  IF EXISTS (SELECT 1 FROM tebak_answers WHERE question_id = p_question_id AND guesser_id = p_player_id) THEN
    RETURN jsonb_build_object('status', 'already_answered');
  END IF;

  -- Insert jawaban
  INSERT INTO tebak_answers (question_id, guesser_id, answer, is_correct, time_ms)
  VALUES (p_question_id, p_player_id, p_answer, NULL, p_time_ms);

  -- Cek jumlah jawaban
  SELECT COUNT(*) INTO v_answer_count FROM tebak_answers WHERE question_id = p_question_id;

  IF v_answer_count >= 2 THEN
    UPDATE tebak_questions SET status = 'revealed' WHERE id = p_question_id;
    -- Panggil set_session_advance_at
    RETURN jsonb_build_object('status', 'revealed');
  END IF;

  RETURN jsonb_build_object('status', 'waiting_for_opponent');
END;
$$;
```

### 3.8: Mode Development & Testing

**Lingkungan terisolasi:**
1. Buat branch fitur baru (`feat/disc-rounds`)
2. Migration DB baru — jangan modifikasi migration yang sudah ada
3. E2E test untuk R3-4 sebelum perubahan sebagai baseline
4. Implementasi bertahap dengan feature flag

**Feature Flag:**
```typescript
// apps/web/src/lib/tebak/feature-flags.ts
export const TEBAK_DISC_ENABLED = process.env.NEXT_PUBLIC_TEBAK_DISC_ENABLED === 'true'
```
Di semua titik cabang: `if (TEBAK_DISC_ENABLED && isDiscRound) { ... } else { existing code }`

Setelah stabil, feature flag bisa dihapus.

**Test Checklist untuk R3-4 (tidak boleh berubah):**
- [ ] Subject mendapat pertanyaan, memilih jawaban → status jadi 'guesser_guessing'
- [ ] Guesser mendapat `question_for_guesser` dengan `{NamaSubject}` tersubstitusi
- [ ] Guesser deadline 15s
- [ ] Guesser benar → +10 poin, dot hijau
- [ ] Guesser salah → dot merah
- [ ] Subject timeout → guesser dapat +10 poin
- [ ] Guesser timeout → tidak ada poin
- [ ] Advance Q1→Q2→...→Q5
- [ ] Round 3→4 tukar peran
- [ ] Round 4 selesai → game finished
- [ ] Bot bermain sebagai subject dan guesser dengan benar
- [ ] Realtime sync bekerja

---

## Lampiran: Inventaris Lengkap Titik Sentuh

### Semua file yang perlu diubah (atau dicek tidak berubah):

| File | Perubahan |
|---|---|
| `supabase/migrations/YYYYMMDDHHMMSS_tebak_disc.sql` | **BARU** — semua perubahan DB |
| `supabase/migrations/20260620009000_tebak_aku.sql` | **TIDAK** — hanya baca |
| `apps/web/src/lib/tebak/queries.ts` | **UBAH** — tipe TebakRound, TebakQuestion |
| `apps/web/src/lib/tebak/actions.ts` | **UBAH** — tambah submitDiscAnswer, handleDiscTimeout, update advanceGame, update botPlayTurn |
| `apps/web/src/lib/tebak/realtime.ts` | **UBAH** — tambah listener tebak_rounds INSERT |
| `apps/web/src/components/tebak/GameRoom.tsx` | **UBAH** — cabang DISC di seluruh komponen |
| `apps/web/src/components/tebak/JedaScreen.tsx` | **UBAH** — tipe hasil baru |
| `apps/web/src/components/tebak/RoundResultScreen.tsx` | **UBAH** — statistik untuk DISC |
| `apps/web/src/components/tebak/ScoreBoard.tsx` | **MUNGKIN** — interpretasi dots |
| `apps/web/src/components/tebak/DigitalClock.tsx` | **TIDAK** — generik |
| `apps/web/src/components/tebak/Timer.tsx` | **TIDAK** — wrapper saja |
| `apps/web/src/components/tebak/WinnerScreen.tsx` | **TIDAK** — hanya skor akhir |
| `apps/web/src/components/tebak/MatchIntro.tsx` | **MUNGKIN** — label "Round 1" |
| `apps/web/src/components/tebak/TebakWaiting.tsx` | **TIDAK** |

### Semua RPC yang perlu diubah atau dibuat:

| RPC | Status |
|---|---|
| `advance_tebak_game` | **UBAH** atau duplikasi jadi `advance_tebak_game_v2` |
| `handle_question_timeout` | **UBAH** — tambah cabang DISC |
| `start_question_timer` | **UBAH** — untuk DISC set deadline bersama |
| `find_or_create_tebak_session` | **UBAH** — buat round DISC, bukan tebak |
| `activate_tebak_session` | **UBAH** — buat round DISC |
| `increment_tebak_score` | **MUNGKIN** — untuk DISC, skor alternatif |
| `set_session_advance_at` | **TIDAK** — generik |
| **BARU:** `submit_disc_answer` | **BARU** — atomic answer + reveal |
| **BARU:** `handle_disc_timeout` | **BARU** — timeout handler untuk DISC |

---

*Dokumen ini selesai ditulis berdasarkan pembacaan menyeluruh seluruh codebase Tebak Aku pada 26 Juni 2026.*
