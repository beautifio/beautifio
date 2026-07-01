# Tebak Aku — Laporan Progress (Untuk Partner)

Dokumen ini menjelaskan secara ringkas: apa yang sedang dikerjakan, apa yang sudah 
selesai, dan apa yang akan dikerjakan selanjutnya. Bahasa non-teknis, fokus ke 
produk & pengalaman pemain.

---

## APA YANG SEDANG DIKERJAKAN

**Mekanik DISC** — mengubah Tebak Aku dari game tebak-tebakan biasa menjadi alat 
pencocokan kepribadian. Konsep: **Kenali diri → Kenali lawan → Tebak → Terhubung.**

4 Ronde:
- **Ronde 1 & 2**: Pemain menjawab tentang DIRI SENDIRI (nggak ada benar/salah). 
  Jawaban jadi petunjuk buat lawan menebak di ronde berikutnya.
- **Ronde 3 & 4**: Pemain menebak lawan menggunakan petunjuk dari R1-R2. 
  Tebakan benar dapat poin.

Di akhir game: analisis kompatibilitas + opsi lanjut ngobrol lewat chat personal.

---

## FASE YANG SUDAH SELESAI

### FASE 1 — Mekanik Dasar DISC (100% ✅)

Semua infrastruktur dasar DISC sudah jalan:

| Apa | Status |
|-----|--------|
| DB: struktur ronde DISC (tipe ronde, status "both_answering") | ✅ |
| DB: semua RPC (fungsi server) untuk DISC — buat sesi, advance, timeout | ✅ |
| Edge Function: cron otomatis proses timeout DISC tiap 30 detik | ✅ |
| GameRoom: UI DISC — dua pemain jawab serentak, label "💬 Jawab tentang dirimu" | ✅ |
| JedaScreen DISC: reveal perbandingan jawaban ("Kamu pilih X / Lawan pilih Y") | ✅ |
| RoundResultScreen DISC: varian tanpa benar/salah, tanpa "Giliran Bertukar" | ✅ |
| Rematch (Main Lagi): tombol respons, 2 pemain bisa main lagi | ✅ |
| Timeout DISC: soal yang nggak dijawab akan di-timeout otomatis via cron | ✅ |
| Polling client: jaring pengaman kalau WebSocket realtime putus | ✅ |
| Retry + watchdog: game nggak stuck permanen kalau network blip | ✅ |
| UNIQUE constraint: jawaban nggak bisa dobel per pemain per soal | ✅ |
| Trigger bot: exception-safe (nggak error meski data bot lama bermasalah) | ✅ |
| Git: semua kerja ter-commit (`d970f72`) | ✅ |

### Temp Match — "MatchIntro" (100% ✅)

| Apa | Status |
|-----|--------|
| Countdown 20 detik (server time, dua pemain sinkron) | ✅ |
| Tombol "Mulai" — klik → "Menunggu lawan..." sampai dua-duanya siap | ✅ |
| Auto-dismiss setelah 20 detik (mau klik atau nggak) | ✅ |
| Flag `player_a_ready` / `player_b_ready` di DB + realtime sync | ✅ |

### Panduan Overlay (100% ✅)

| Apa | Status |
|-----|--------|
| Layar info sebelum tiap ronde (R1-R4) | ✅ |
| Countdown 8 detik, tombol "Mulai" | ✅ |
| Ready mechanism (reuse MatchIntro) — dua klik → langsung mulai bareng | ✅ |

### Perbaikan Bug (100% ✅)

| Bug | Status |
|-----|--------|
| Timer DISC mulai sebelum pemain siap (MatchIntro/Panduan belum di-dismiss) | ✅ |
| `start_question_timer` salah set 15s untuk DISC (sekarang DISC tidak disentuh) | ✅ |
| Deadline DISC di-reset tiap detik (guard IS NULL direstore) | ✅ |
| Edge function cron diskonek (auth tanpa Bearer, timeout 5s pendek) | ✅ |
| Cron intermiten gagal proses timeout DISC | ✅ |
| Edge function blok DISC ke-skip kalau blok tebak error | ✅ |
| Tabel `tebak_rematch_offers` tidak ada (migration ditulis tapi belum di-apply) | ✅ |
| Tombol "Main Lagi" tidak respons (inline component React) | ✅ |
| Bot trigger FK violation saat bulk-close sesi | ✅ |
| Sync stuck R1→R2 (setSyncTick) | ✅ |
| 127 baris duplikat `tebak_answers` dibersihkan | ✅ |

---

## FASE YANG AKAN DATANG

### Tahap Selanjutnya — Jeda Edukatif (⬜ 0%)

Setelah R1 selesai dan sebelum R2 mulai, tampilkan layar reveal tipe DISC lawan:

| Apa | Status |
|-----|--------|
| Hitung tipe DISC dari jawaban R1 (pakai `option_disc` mapping) | ⬜ |
| Reveal tipe DISC lawan di jeda R1→R2 + penjelasan + saran | ⬜ |
| Reveal gaya komunikasi di jeda R2→R3 | ⬜ |
| Durasi jeda: 20 detik + tombol "Lanjut" | ⬜ |

### Kompatibilitas Ending (⬜ 0%)

| Apa | Status |
|-----|--------|
| Radar chart DISC (kamu vs lawan) | ⬜ |
| Label kompatibilitas: 🎯 Satu Frekuensi / 🔄 Saling Melengkapi / 🔥 Perlu Usaha | ⬜ |
| Penjelasan per tipe pasangan + tips | ⬜ |

### Post-Game (⬜ 0%)

| Apa | Status |
|-----|--------|
| Tombol "Lanjut Ngobrol" di WinnerScreen | ⬜ |
| Integrasi chat personal via Bisik (dua setuju → buka chat) | ⬜ |
| Layar refleksi untuk game lawan bot | ⬜ |

### Bank Soal (⬜ 0%)

| Apa | Status |
|-----|--------|
| Saat ini: 6 soal DISC (minimal 10 dibutuhkan, target 200) | ⬜ |
| Soal Gaya Komunikasi untuk R2: 0 (target 200) | ⬜ |
| 10 soal DISC + 10 soal Komunikasi per game | ⬜ |

### Forum (Jangka Panjang, ⬜ 0%)

| Apa | Status |
|-----|--------|
| Forum tematik per tipe kepribadian | ⬜ |
| Moderator mengarahkan ke forum minat-bakat | ⬜ |

---

## PROGRESS TOTAL

| Fase | Selesai | Total | Progress |
|------|---------|-------|----------|
| Fase 1 — Infrastruktur Mekanik DISC | 26 | 26 | ✅ 100% |
| Fase 2 — Scoring & Tampilan DISC | 2 | 12 | ⬜ 17% |
| Fase 3 — Kompatibilitas Ending | 0 | 4 | ⬜ 0% |
| Fase 4 — Post-Game | 0 | 3 | ⬜ 0% |
| Fase 5 — Forum (Jangka Panjang) | 0 | 4 | ⬜ 0% |
| **TOTAL** | **28** | **49** | **~57%** |

---

## TEKNIS: YANG SUDAH ADA DI DATABASE

### Tabel
- `tebak_rounds`: kolom `round_type` (disc/tebak), constraint kondisional
- `tebak_questions`: kolom `option_disc` (mapping D/I/S/C)
- `tebak_answers`: UNIQUE constraint (question_id, guesser_id)
- `tebak_sessions`: `current_subject` nullable, `player_a_ready`/`player_b_ready`
- `tebak_rematch_offers`: tabel + RLS + realtime
- `tebak_question_bank`: 24 soal tebak + 6 soal DISC (manual)

### RPC (Fungsi Server)
- `find_or_create_tebak_session`: buat sesi baru, R1 = DISC
- `activate_tebak_session`: aktivasi sesi, R1 = DISC
- `advance_tebak_game_v2`: advance 4-ronde penuh (DISC + tebak)
- `handle_disc_timeout`: timeout DISC (guard atomik)
- `start_disc_question_timer`: set deadline DISC
- `start_question_timer`: set deadline tebak (15s + guard IS NULL)
- `set_session_advance_at`: set advance_at untuk cron
- `update_bot_stats`: statistik bot (exception-safe)

### Cron
- `tebak-advance-cron`: tiap 30 detik, panggil edge function
- Auth: Bearer token, timeout 30 detik

### Edge Function
- `tebak-advance`: query timeout DISC + tebak, isolasi blok error, always 200

### Kode (TypeScript/React)
- `actions.ts`: `submitDiscAnswer`, `handleDiscTimeout`, `signalMatchIntroReady`,
  `resetReadyFlags`, `advanceGame→v2`
- `GameRoom.tsx`: 18 titik branching DISC, timer DISC, handler DISC, 
  MatchIntro ready, Panduan ready, health-check polling, retry+watchdog
- `JedaScreen.tsx`: varian DISC (reveal perbandingan)
- `RoundResultScreen.tsx`: varian DISC
- `ScoreBoard.tsx`: progress "Profil X/10" di R1-R2
- `MatchIntro.tsx`: countdown 20s + ready mechanism
- `PanduanOverlay.tsx`: countdown 8s + ready mechanism
- `WinnerScreen.tsx`: tombol Main Lagi fix

---

*Laporan ini di-generate 27 Juni 2026. Detail teknis lengkap di 
`outputs/TEBAK-AKU-CHECKLIST.md` dan `outputs/TEBAK-AKU-VISI.md`.*
