# Tebak Aku — Dokumen Visi DISC + Forum
## Versi 1.0 — 27 Juni 2026

---

## RINGKASAN EKSEKUTIF

Tebak Aku berevolusi dari "game tebak-tebakan" menjadi **alat pencocokan kepribadian** 
dengan alur: **Kenali → Pahami → Terapkan → Terhubung.**

4 ronde: 
- R1 (DISC) + R2 (Gaya Komunikasi) = fase mengumpulkan profil & clue tentang diri sendiri
- R3 + R4 = fase menebak lawan menggunakan clue dari R1-R2
- Ending: analisis kompatibilitas + opsi lanjut ngobrol (chat personal via Bisik)

---

## STRUKTUR 4 RONDE

| Ronde | Isi | Jumlah Soal | Scoring |
|-------|-----|-------------|---------|
| R1 | DISC (D/I/S/C) | 10 soal | TANPA SKOR |
| R2 | Gaya Komunikasi (Direct/Diplomatic/Expressive/Reserved) | 10 soal | TANPA SKOR |
| R3 | Tebak lawan (pakai clue R1+R2) | 5 soal | Skor tebakan |
| R4 | Tebak lagi, giliran bertukar | 5 soal | Skor tebakan |

### R1-R2: No Score (Profil Only)

- Pemain menjawab tentang diri sendiri — tidak ada benar/salah
- Feedback lewat JedaScreen reveal ("Kamu pilih X / Lawan pilih Y")
- ScoreBoard menampilkan progress profil ("5/10 terisi"), bukan angka skor
- Jawaban __timeout__ tidak masuk profil, clue kosong di R3-R4

### R3-R4: Tebak Lawan

- Mekanik tebak lama — subjek jawab, penebak nebak
- Penebak yang benar dapat poin
- Clue dari R1-R2 ditampilkan sebagai petunjuk

---

## ALUR PERMAINAN

```
Panduan R1 (1 layar singkat: "Kamu akan menjawab tentang dirimu sendiri...")
  ↓
R1: 10 soal DISC
  ↓
Jeda R1→R2 (reveal tipe DISC lawan + penjelasan + saran)
  ↓
Panduan R2 (1 layar singkat: "Sekarang tentang gaya komunikasimu...")
  ↓
R2: 10 soal Gaya Komunikasi
  ↓
Jeda R2→R3 (reveal gaya komunikasi lawan + saran)
  ↓
Panduan R3 (1 layar singkat: "Sekarang tebak lawanmu...")
  ↓
R3: 5 soal tebak
  ↓
RoundResult R3
  ↓
R4: 5 soal tebak (giliran bertukar)
  ↓
WinnerScreen: kompatibilitas + [Main Lagi] [Lanjut Ngobrol]
```

### Format Jeda (R1→R2 dan R2→R3)

- **Durasi**: 20 detik default, tombol "Lanjut" aktif setelah 5 detik
- **Auto-advance** di 20 detik kalau tidak diklik
- **Gaya bahasa**: santai, personal, anak muda Indonesia
- **Profil**: 2 unsur utama (contoh: "60% D, 20% I")

Contoh teks jeda R1→R2:
> "Wah, kamu tipe **D — Dominan**! 🦁  
> Kamu tipe yang Gas Pol: to the point, nggak suka basa-basi, suka ambil keputusan cepet.  
> Di tongkrongan, biasanya kamu yang jadi 'ketua geng'.  
> Tapi hati-hati — kadang orang mikir kamu galak padahal kamu cuma efisien aja. ✨  
>  
> **Lawanmu: S — Steady** 🧸  
> Dia tipe yang kalem, setia, pendengar yang baik. Nggak suka konflik & selalu ada buat temennya.  
>  
> **Tips**: Kalau kamu lagi gas, ingat dia butuh waktu. Jangan ngegas terus — kasih dia ruang.  
> Dia justru bisa jadi penyeimbang terbaikmu."

---

## BANK SOAL

### Kebutuhan

| Ronde | Kategori | Target Fase 1 | Target Final |
|-------|----------|---------------|--------------|
| R1 | DISC (`category='disc'`) | **200 soal** (50 × 4 tipe) | 500+ soal |
| R2 | Gaya Komunikasi (`category='komunikasi'`) | **200 soal** (50 × 4 tipe) | 500+ soal |

### Struktur

Setiap soal punya 4 opsi yang masing-masing mewakili tipe tertentu.
Tidak ada "template" — pakai situasi nyata, kasus, atau preferensi.

Format di `tebak_question_bank`:
- `question_text`: teks pertanyaan
- `options`: jsonb `["A","B","C","D"]`
- `option_disc`: jsonb `["D","I","S","C"]` (parallel index ke `options[]`)
- `category`: `'disc'` atau `'komunikasi'`
- `is_active`: `true`

### Kategori Ide Soal (supaya variatif)

| Kategori | Contoh Topik |
|----------|-------------|
| Keseharian | Rutinitas pagi, akhir pekan, belanja, masak |
| Relasi | Konflik temen, pacar, keluarga, grup chat |
| Kerja/Kuliah | Deadline, meeting, tugas kelompok, presentasi |
| Hiburan | Film, musik, buku, konten favorit |
| Nilai hidup | Uang, waktu, persahabatan, kejujuran |
| Fantasi/Skenario | "Kalau kamu bisa...", "Kamu terjebak di..." |
| Dilema moral | Pilihan sulit, prioritas bertabrakan |
| Tokoh/Fandom | Tokoh dunia, karakter fiksi, seleb |
| Travel | Gaya traveling, destinasi, persiapan |
| Komunikasi | Cara ngomong, debat, ngasih kritik, dipuji |

### Contoh Soal DISC

**Kategori "Tokoh Dunia"**
```
Soal: "Kalau kamu bisa jadi salah satu tokoh ini, siapa?"
A. Steve Jobs — visioner, nggak kompromi (D)
B. Oprah Winfrey — mempengaruhi lewat bicara & empati (I)
C. Dalai Lama — tenang, damai, dipercaya banyak orang (S)
D. Marie Curie — teliti, dedikasi pada ilmu (C)
```

**Kategori "Kehidupan Sehari-hari"**
```
Soal: "Sabtu sore hujan, kamu di rumah. Ngapain?"
A. Susun ulang isi lemari & bikin rencana minggu depan (D)
B. Telepon temen lama, ngobrol 2 jam (I)
C. Masak comfort food sambil dengerin podcast santai (S)
D. Baca buku non-fiksi, catat poin-poin penting (C)
```

**Kategori "Konflik"**
```
Soal: "Temenmu curhat: pasangannya sering bikin dia cemburu. Responmu?"
A. 'Putusin aja. Dia toxic, kamu pantes yang lebih.' (D)
B. 'Cerita lagi dong, aku dengerin. Kamu baper di bagian mana?' (I)
C. 'Sabar ya. Semua hubungan ada ujiannya. Kamu kuat.' (S)
D. 'Coba kita breakdown: kapan persisnya dia bikin kamu cemburu? Polanya gimana?' (C)
```

### Contoh Soal Gaya Komunikasi

**Kategori "Feedback"**
```
Soal: "Temenmu presentasi kurang bagus. Kamu kasih masukan gimana?"
A. 'Terlalu lambat, slide-nya banyak banget. Lain kali lebih singkat aja.' (Direct)
B. 'Kamu udah bagus banget sih! Cuma mungkin satu-dua slide bisa dipadatkan... (Diplomatic)
C. 'WOW presentasi kamu keren! Sumpah aku ngakak pas bagian anekdot tadi. (Expressive)
D. *nunggu ditanya dulu, baru kasih masukan pelan-pelan* (Reserved)
```

### Rencana Bertahap

**Fase 1 (sekarang):** 50 soal per tipe × 4 tipe = 200 soal DISC + 200 soal Komunikasi = **400 soal total.** Cukup untuk variasi sangat tinggi (tiap game ambil 10 dari 200 → kombinasi masif).

**Fase 2 (nanti):** tambah bertahap ke 100, 200, 500. Format sudah standar — tinggal INSERT baru ke `tebak_question_bank`.

**Cara nambah soal:** semudah INSERT ke tabel `tebak_question_bank` dengan `category='disc'` atau `category='komunikasi'`, `option_disc` sesuai mapping. Tidak perlu ubah schema.

---

## KOMPATIBILITAS

### DISC × DISC

| Pasangan | Label | Penjelasan |
|----------|-------|------------|
| D + D | 🔥 Perlu Usaha | Dua pemimpin = potensi tabrakan. Kuncinya: bagi wilayah kekuasaan |
| D + I | 🔄 Saling Melengkapi | Action + Social. Dia bikin rencana, kamu bikin seru |
| D + S | 🔥 Perlu Usaha | Gas vs Rem. Dia buru-buru, kamu santai. Butuh kesabaran |
| D + C | 🔄 Saling Melengkapi | Taktik + Presisi. Dia gambar besarnya, kamu detilnya |
| I + I | 🎯 Satu Frekuensi | Dua-duanya ekspresif. Seru, tapi kadang rebutan panggung |
| I + S | 🔄 Saling Melengkapi | Pembicara + Pendengar. Alami dan seimbang |
| I + C | 🔥 Perlu Usaha | Spontan vs Terstruktur. Dia kaget kamu kaku, kamu kaget dia impulsif |
| S + S | 🎯 Satu Frekuensi | Dua penenang. Harmonis, tapi bisa stuck kalau nggak ada yang mulai |
| S + C | 🎯 Satu Frekuensi | Tenang + Teliti. Mirip ritmenya, saling nyaman |
| C + C | 🔥 Perlu Usaha | Dua analis. Overthink bareng, tapi presisi tinggi |

### Modifikasi oleh Gaya Komunikasi

| Kondisi | Efek |
|---------|------|
| Komunikasi **sama** (Direct+Direct, Diplomatic+Diplomatic, dll) | **Naik 1 level**: 🔥→🔄→🎯 |
| Komunikasi **bertabrakan** (Direct vs Diplomatic) | **Turun 1 level**: 🎯→🔄→🔥 |
| **Expressive + Reserved** | Selalu 🔄 Saling Melengkapi (natural) |

### Visual di Ending

- **Radar chart** kecil: 4 dimensi DISC kamu vs lawan
- **3 label** dengan penjelasan: 🎯 Satu Frekuensi / 🔄 Saling Melengkapi / 🔥 Perlu Usaha
- **Bukan vonis** "cocok/nggak cocok" — semua kombinasi bisa jalan. Label menunjukkan **apa yang perlu dijaga**
- Format penjelasan:
  - "Kelebihan kalian..."
  - "Yang perlu dijaga..."
  - "Tips biar makin nyambung..."

---

## POST-GAME

### Fase 1 — Chat Personal (sekarang)

- Setelah WinnerScreen: "[Main Lagi] [Lanjut Ngobrol]"
- Kalau dua pemain klik "Lanjut Ngobrol" → otomatis buka chat personal via **Bisik**
- Kalau lawan = **bot**: tidak ada opsi chat. Ganti dengan layar refleksi:
  > "Kamu baru main sama Bot! 🤖  
  > Coba deh di kehidupan nyata, perhatikan orang-orang di sekitarmu.  
  > Siapa yang mirip tipe D? Gimana cara mereka ngomong?"

### Fase 2 — Forum Tematik (nanti)

- Forum per tipe: "Forum para Dominan 🦁", "Forum para Diplomat 🕊️"
- Bukan per-game, tapi per-kategori — semua orang dengan tipe yang sama masuk ke situ
- Dari chat personal, kalau cocok, bisa diundang ke forum yang lebih besar
- Moderator bisa mengarahkan peserta ke forum minat-bakat

### Fase 3 — Ruang Tumbuh (visi jangka panjang)

- Konten edukatif sesuai tipe
- Tantangan mingguan
- Sesi mentoring
- Moderator Beautifio aktif mengkurasi

---

## APA YANG SUDAH JALAN (✅)

- ✅ Mekanik DISC R1-R2 (dua pemain jawab serentak)
- ✅ Timeout DISC via cron (otomatis, edge function dengan isolasi blok)
- ✅ JedaScreen DISC ("Jawaban tersimpan! / Kamu pilih X / Lawan pilih Y")
- ✅ RoundResultScreen DISC ("Babak selesai / Kalian berdua sudah berbagi")
- ✅ Rematch dua-sisi (via tabel `tebak_rematch_offers`)
- ✅ Tombol "Main Lagi" respons
- ✅ Trigger `update_bot_stats` tahan-banting
- ✅ UNIQUE constraint `tebak_answers(question_id, guesser_id)`
- ✅ Polling client 5s + onTimeout reconcile (realtime safety net)
- ✅ Retry + watchdog + idempotency advance
- ✅ 4-ronde via `advance_tebak_game_v2`
- ✅ Cron: `Bearer` auth + `timeout_milliseconds=30000`

## APA YANG BELUM (❌)

### Blocker (harus beres sebelum game bisa "terasa DISC")

- ❌ Matiin scoring R1-R2 (sekarang masih ngasih 10 poin per jawaban DISC)
- ❌ ScoreBoard R1-R2 jadi progress profil ("5/10 terisi"), bukan angka

### Jeda Edukatif

- ❌ Jeda R1→R2: reveal tipe DISC + penjelasan + saran (30+ konten berbeda)
- ❌ Jeda R2→R3: reveal gaya komunikasi + saran (30+ konten berbeda)
- ❌ Panduan sebelum tiap ronde (3 layar singkat)

### Kompatibilitas di Ending

- ❌ Radar chart DISC (kamu vs lawan)
- ❌ Label kompatibilitas + penjelasan + tips
- ❌ Ganti "Tingkat kecocokan: Kurang cocok" (logika tebak lama)

### Post-Game

- ❌ Opsi "Lanjut Ngobrol" → chat personal via Bisik
- ❌ Layar refleksi untuk game lawan bot

### Bank Soal

- ❌ 200 soal DISC (baru 6 yang ada)
- ❌ 200 soal Gaya Komunikasi (nol)
- ❌ Kategori `'komunikasi'` di `tebak_question_bank`

### Infrastruktur

- ❌ Tabel `users` butuh kolom profil (untuk simpan hasil DISC/komunikasi permanen)
- ❌ RPC atau server action untuk hitung profil DISC dari jawaban

---

## STATUS TEKNIS SAAT INI

| Komponen | Status |
|----------|--------|
| DB: `tebak_rounds` (round_type, constraint) | ✅ |
| DB: `tebak_questions` (option_disc) | ✅ |
| DB: `tebak_answers` (UNIQUE constraint) | ✅ |
| DB: `tebak_rematch_offers` | ✅ |
| RPC: `find_or_create_tebak_session` (DISC) | ✅ |
| RPC: `activate_tebak_session` (DISC) | ✅ |
| RPC: `advance_tebak_game_v2` (4-ronde) | ✅ |
| RPC: `handle_disc_timeout` | ✅ |
| RPC: `start_disc_question_timer` | ✅ |
| Edge Function: `tebak-advance` (isolasi blok) | ✅ |
| Cron: `Bearer` + 30s timeout | ✅ |
| Actions: `submitDiscAnswer` + `advanceGame→v2` | ✅ |
| GameRoom: 18 titik branching DISC | ✅ |
| JedaScreen: varian DISC | ✅ |
| RoundResultScreen: varian DISC | ✅ |
| WinnerScreen: tombol Main Lagi | ✅ |
| Types: `round_type`, `option_disc`, nullable | ✅ |
| Git: commit `d970f72` | ✅ |

---

## RENCANA KERJA

### Tahap 4a — Scoring DISC (backend)
1. Temukan & matikan scoring R1-R2 (di mana 10 poin di-assign)
2. Ganti ScoreBoard R1-R2: progress profil, bukan angka

### Tahap 4b — Bank Soal
1. Tambah `category='komunikasi'` untuk R2
2. Tulis 200 soal DISC + 200 soal Komunikasi (Fase 1)
3. INSERT ke `tebak_question_bank`

### Tahap 4c — Jeda Edukatif
1. JedaScreen R1→R2: reveal tipe DISC + saran (komponen baru atau extend JedaScreen)
2. JedaScreen R2→R3: reveal gaya komunikasi + saran
3. Panduan sebelum tiap ronde (komponen MatchIntro-style)

### Tahap 4d — Kompatibilitas (ending)
1. Radar chart DISC (pakai library charting sederhana)
2. Label + penjelasan + tips berdasarkan tabel kompatibilitas
3. Ganti WinnerScreen "Tingkat Kecocokan"

### Tahap 4e — Post-Game
1. Opsi "Lanjut Ngobrol" di WinnerScreen
2. Integrasi chat personal via Bisik
3. Layar refleksi untuk bot

### Dokumen Konten (paralel, bukan koding)
1. Tulis 30+ penjelasan tipe (4 DISC × variasi + 4 Komunikasi × variasi)
2. Tulis 200+ soal bank (bisa bertahap)
3. Review konten oleh ahli psikologi (opsional tapi disarankan)

---

## CATATAN PENTING

- **Konten bukan AI-generate massal.** Harus dikurasi manual, terutama penjelasan tipe &
  saran yang menyangkut psikologi. AI boleh bantu draft, final harus lewat review manusia.
- **Framing harus memberdayakan.** Target audiens: perempuan muda Indonesia. Tidak boleh
  ada bahasa yang menghakimi, menstereotipkan, atau merendahkan.
- **Jangan overclaim.** Dengan 10 soal, ini "gambaran cepat kepribadian", bukan diagnosis.
  Cantumkan disclaimer halus di jeda/ending.
- **Semua perubahan scoring R1-R2 HARUS tidak menyentuh R3-R4.** Mekanik tebak lama
  (R3-R4) tidak boleh berubah perilakunya.

---

*Dokumen ini adalah cetak biru desain — bukan spesifikasi teknis. Detail implementasi 
akan ditulis per-tahap saat memasuki fase koding.*
