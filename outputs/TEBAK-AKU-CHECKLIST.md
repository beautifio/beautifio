# Tebak Aku — Checklist Benchmark (dari TEBAK-AKU-VISI.md)
## Update: 27 Juni 2026

---

## FASE 1 — Infrastruktur Mekanik DISC ✅ 100%

| # | Item | Status |
|---|------|--------|
| 1 | DB: `tebak_rounds.round_type`, constraint kondisional | ✅ |
| 2 | DB: `subject_player` nullable, `current_subject` nullable | ✅ |
| 3 | DB: ENUM `both_answering` | ✅ |
| 4 | DB: `tebak_questions.option_disc` | ✅ |
| 5 | DB: UNIQUE constraint `tebak_answers(question_id, guesser_id)` | ✅ |
| 6 | RPC: `find_or_create_tebak_session` (R1=DISC, 30s) | ✅ |
| 7 | RPC: `activate_tebak_session` (R1=DISC) | ✅ |
| 8 | RPC: `advance_tebak_game_v2` (4-ronde penuh) | ✅ |
| 9 | RPC: `handle_disc_timeout` (atomic guard) | ✅ |
| 10 | RPC: `start_disc_question_timer` | ✅ |
| 11 | Edge Function: DISC timeout query + isolasi blok + allSettled | ✅ |
| 12 | Cron: `Bearer` auth + `timeout_milliseconds=30000` | ✅ |
| 13 | TypeScript types: `round_type`, `option_disc`, nullable | ✅ |
| 14 | Server action: `submitDiscAnswer` (atomic + 2-player check) | ✅ |
| 15 | Server action: `handleDiscTimeout` | ✅ |
| 16 | Server action: `advanceGame` → `advance_tebak_game_v2` | ✅ |
| 17 | GameRoom: 18 titik branching DISC | ✅ |
| 18 | GameRoom: `handleDiscAnswer` (optimistic update) | ✅ |
| 19 | GameRoom: `setSyncTick` (sync stuck fix) | ✅ |
| 20 | GameRoom: health-check polling 5s + onTimeout reconcile | ✅ |
| 21 | GameRoom: retry + watchdog + idempotency advance | ✅ |
| 22 | JedaScreen: varian DISC (reveal perbandingan) | ✅ |
| 23 | RoundResultScreen: varian DISC | ✅ |
| 24 | WinnerScreen: tombol "Main Lagi" fix (RematchUI inline) | ✅ |
| 25 | Rematch: tabel `tebak_rematch_offers` + RLS + realtime | ✅ |
| 26 | Trigger: `update_bot_stats` exception-safe | ✅ |

**Total Fase 1: 26/26 items (100%)**

---

## FASE 2 — Scoring & Tampilan DISC ⬜ 17%

| # | Item | Status |
|---|------|--------|
| 27 | ScoreBoard: progress "Profil X/10" di R1-R2 (bukan angka skor) | ✅ |
| 28 | Matikan scoring R1-R2 — pastikan `increment_tebak_score` tidak kepanggil | ✅ (sudah dari awal) |
| 29 | Bank Soal: 10 soal DISC per game (sekarang: **6 soal**) | ❌ |
| 30 | Bank Soal: 10 soal Gaya Komunikasi per game (sekarang: **0 soal**) | ❌ |
| 31 | Bank Soal: tulis 200 soal DISC Fase 1 | ❌ |
| 32 | Bank Soal: tulis 200 soal Komunikasi Fase 1 | ❌ |
| 33 | Bank Soal: `category='komunikasi'` di `tebak_question_bank` | ❌ |
| 34 | Panduan singkat sebelum R1 ("Kamu akan menjawab tentang dirimu...") | ❌ |
| 35 | Jeda R1→R2: reveal tipe DISC lawan + penjelasan + saran | ❌ |
| 36 | Panduan singkat sebelum R2 ("Sekarang tentang gaya komunikasimu...") | ❌ |
| 37 | Jeda R2→R3: reveal gaya komunikasi lawan + saran | ❌ |
| 38 | Panduan singkat sebelum R3 ("Sekarang tebak lawanmu...") | ❌ |

**Total Fase 2: 2/12 items (17%)**

---

## FASE 3 — Kompatibilitas Ending ⬜ 0%

| # | Item | Status |
|---|------|--------|
| 39 | Radar chart DISC (kamu vs lawan) di WinnerScreen | ❌ |
| 40 | Label kompatibilitas: 🎯 Satu Frekuensi / 🔄 Saling Melengkapi / 🔥 Perlu Usaha | ❌ |
| 41 | Penjelasan per tipe pasangan + tips | ❌ |
| 42 | Ganti "Tingkat kecocokan" di WinnerScreen (logika tebak lama) | ❌ |

**Total Fase 3: 0/4 items (0%)**

---

## FASE 4 — Post-Game ⬜ 0%

| # | Item | Status |
|---|------|--------|
| 43 | Tombol "Lanjut Ngobrol" di WinnerScreen | ❌ |
| 44 | Integrasi chat personal via Bisik (dua setuju → buka chat) | ❌ |
| 45 | Layar refleksi untuk game lawan bot (ganti "Lanjut Ngobrol") | ❌ |

**Total Fase 4: 0/3 items (0%)**

---

## FASE 5 — Forum (Jangka Panjang) ⬜ 0%

| # | Item | Status |
|---|------|--------|
| 46 | Forum tematik per tipe ("Forum para Dominan 🦁") | ❌ |
| 47 | Moderator mengarahkan ke forum minat-bakat | ❌ |
| 48 | Konten edukatif + tantangan mingguan + sesi mentoring | ❌ |

**Total Fase 5: 0/4 items (0%)**

---

## REKAP

| Fase | Items | Done | Progress |
|------|-------|------|----------|
| Fase 1 — Infrastruktur Mekanik DISC | 26 | 26 | ✅ 100% |
| Fase 2 — Scoring & Tampilan DISC | 12 | 2 | ⬜ 17% |
| Fase 3 — Kompatibilitas Ending | 4 | 0 | ⬜ 0% |
| Fase 4 — Post-Game | 3 | 0 | ⬜ 0% |
| Fase 5 — Forum (Jangka Panjang) | 4 | 0 | ⬜ 0% |
| **TOTAL** | **49** | **28** | **57%** |

---

Fase 2 nomor 29-38 (Bank Soal) dan 34-38 (Jeda Edukatif) adalah pekerjaan konten + komponen UI yang masih pending. Nomor 27-28 sudah selesai (ScoreBoard progress + scoring dimatikan).

Fase 3-5 seluruhnya masih pending.
