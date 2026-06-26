# TEBAK SYNC AUDIT

## BAGIAN 1 — PEMETAAN

### 1. "Sinkronisasi dengan server" — Komponen & Kondisi

**Lokasi:** `apps/web/src/components/tebak/GameRoom.tsx:352`

**Trigger:** `isLoading` (line 98)
```typescript
const isLoading = !currentQ && !revealedQ && !isFinished && !showIntro
```

**`isLoading = true` ketika SEMUA ini terpenuhi:**
- `!currentQ` — tidak ada pertanyaan aktif (filter `roundOf[q.round_id] === session.current_round` gagal)
- `!revealedQ` — tidak ada pertanyaan yang sudah di-reveal
- `!isFinished` — game belum selesai
- `!showIntro` — intro sudah lewat

### 2. Flag isLoading — Set/Unset

**Tidak pernah di-set secara eksplisit** — ini derived state, bukan state variabel.

Dihitung ulang setiap render dari:
- `currentQ` = `findActiveQuestion(questions, gameSession, roundOfRef.current)` — tergantung `questions[]`, `gameSession.current_round`, `roundOfRef`
- `revealedQ` = `findRevealedQuestion(questions, gameSession, roundOfRef.current)` — sama
- `isFinished` = `gameSession.status === 'finished'`
- `showIntro` = state, di-set `false` via `onBegin()` (MatchIntro)

Bisa berubah true saat:
1. Mount awal — `syncFullState` belum selesai
2. Transisi round — `current_round` berubah via realtime, tapi `roundOfRef` belum update
3. Antara question reveal dan advance — `revealedQ` masih terlihat via `isShowingJeda`/`isShowingRoundResult` yang cek `advance_at`
4. Masalah data race — realtime event urutannya menyebabkan `currentQ` null sejenak

### 3. Realtime Channel Subscriptions

**File:** `apps/web/src/lib/tebak/realtime.ts` — 1 channel dengan 3 listener:

| Channel | Event | Table | Filter | Handler |
|---------|-------|-------|--------|---------|
| `tebak:{sessionId}` | `UPDATE` | `tebak_sessions` | `id=eq.{sessionId}` | `setGameSession(s)` |
| `tebak:{sessionId}` | `*` | `tebak_questions` | none (guarded by callback) | `setQuestions(prev => [...prev.filter(p => p.id !== q.id), q])` |
| `tebak:{sessionId}` | `INSERT` | `tebak_answers` | none | `setAnswers(prev => [...prev.filter(p => p.id !== a.id), a])` |

**Tidak ada unsubscribe/re-subscribe** selama lifecycle komponen — subscription di-mount sekali (`useEffect([sessionId])`) dan cleanup di unmount.

**Juga tidak ada subscription `INSERT tebak_rounds`** — round sync dilakukan oleh useEffect terpisah di GameRoom.tsx:129-175 yang watch `gameSession.current_round`.

### 4. State Machine — 3 Titik Transisi

#### (a) Nunggu lawan menjawab
- **Yang terjadi:** `displayQ` ada, tapi `isMyTurn = false`
- **Tampilan:** Pertanyaan + "Menunggu lawan menjawab..." + timer clock
- **Yang ditunggu:** `UPDATE tebak_questions` → status berubah (subject_answered_at di-set, status → 'guesser_guessing', atau status → 'revealed')
- **Event yang diharapkan:** question UPDATE via realtime
- **Jika miss:** Tidak stuck di overlay — tetap di tampilan pertanyaan dengan clock

#### (b) Babak selesai → babak berikutnya
- **Yang terjadi:** Q5 di-reveal → `revealedQ` terisi → `isShowingRoundResult` true (jika round < 4)
- **Tampilan:** RoundResultScreen dengan countdown
- **Yang ditunggu:** `advance_at` countdown habis → `handleAdvance` → RPC `advance_tebak_game` → hasilnya `UPDATE tebak_sessions` (current_round + 1, advance_at = NULL) + `INSERT tebak_rounds` + `INSERT tebak_questions`
- **Realtime events setelah advance:** `UPDATE tebak_sessions` + `* tebak_questions` (5 INSERT events)
- **Rawan miss:** Jika `UPDATE tebak_sessions` tidak sampai, `current_round` tidak berubah → tidak trigger roundOfRef sync → pertanyaan baru tidak pernah dimuat → `currentQ` null → **overlay stuck**

#### (c) Giliran bertukar (subjek↔penebak)
- Sama dengan (b) — RoundResultScreen menampilkan "Giliran Bertukar"
- **Yang ditunggu:** Setelah countdown habis, RPC advance jalan, flip subject_player, set current_subject ke lawan

### 5. Race Condition: Subscribe vs Event Timing

**Tidak ada unsubscribe/re-subscribe antar round** — subscription tetap aktif dari mount sampai unmount komponen.

**Potensi race yang teridentifikasi:**

1. **Realtime event order dalam satu transaksi RPC:** Saat `advance_tebak_game` jalan (satu fungsi PL/pgSQL), ia melakukan:
   - `UPDATE tebak_sessions` (current_round + 1, advance_at = NULL)
   - `INSERT tebak_rounds` (round baru)
   - `INSERT tebak_questions` (5 baris)
   
   PostgreSQL realtime mengirimkan event setelah COMMIT. Urutan event sampai ke client TIDAK dijamin. Bisa:
   - `tebak_questions` INSERT sampai duluan → `roundOfRef` belum punya round_id baru → pertanyaan kefilter habis
   - `tebak_questions` INSERT nyampe, `current_round` belum berubah → `findActiveQuestion` pake `round_number` lama → filter salah
   - Butuh `current_subject` UPDATE untuk set `current_round` baru → tapi current_subject juga di-update di transaksi yang sama

2. **Dua sumber data untuk questions:** Realtime (`* tebak_questions`) DAN useEffect sync (`syncNewRound`) bisa bawa data yang sama → sudah di-dedup

3. **Bot turn vs realtime:** Bot langsung INSERT answer + UPDATE question status dalam satu fungsi server. Client bisa terima `tebak_answers` INSERT sebelum `tebak_questions` UPDATE → answer muncul tanpa question yang sesuai

## BAGIAN 2 — INSTRUMENTASI (SUDAH DIAPPLY)

### Perubahan di GameRoom.tsx

**Penambahan useEffect logging setelah line 99:**

1. Log `[TEBAK_SYNC] LOADING` ketika `isLoading` jadi true — dengan timestamp + snapshot state
2. Log `[TEBAK_SYNC] RESOLVED` ketika `isLoading` kembali false — durasi + state
3. **Watchdog 3 detik:** Jika loading > 3 detik, log `[TEBAK_SYNC] WARN SYNC_STUCK` dengan full dump state

### Lingkup logging:
- `gameSession.current_round`, `current_q_seq`, `status`
- `currentQ?.id`, `revealedQ?.id`
- `roundOfRef` size dan keys
- `questions.length`, `answers.length`
- `isSubject`, `isPlayerA`
- `opponentIsBot`
- `advancingRef.current`

### Cara hapus nanti:
Cari semua `[TEBAK_SYNC]` di GameRoom.tsx dan hapus baris-baris logging-nya.
