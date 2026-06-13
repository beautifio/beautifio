# PRODUCT EXPERIENCE AUDIT — Sprint 1

**Persona:** 13 tahun, mimpi jadi Dokter
**Tanggal Audit:** Juni 2026
**Role:** Product Owner / UX Designer / First Time User

---

## 1. STRENGTHS

### 1.1 Home — Fokus & Bersih
- **🎯 Mimpiku** dan **🔥 Target Saat Ini** sangat jelas. Dalam 3 detik anak 13 tahun tahu: "Aku mau jadi Dokter, dan langkahku sekarang adalah lulus SMA dengan nilai bagus."
- ✅ **Hari Ini checklist** sederhana dan actionable. Tidak ada dimensi, tidak ada jargon — cukup centang.
- `TodayList` memberi dopamine dari tiap centang tanpa over-gamifikasi.
- **Empty state** `/journey` → "Pilih Mimpi Pertamaku" jelas dan mengundang.

### 1.2 Journey — "Kenapa langkah ini penting?" sudah ada
- **Current Focus** + 💡 *why_it_matters* di BigWinCard bagus untuk motivasi intrinsik — anak paham *alasan* tiap langkah.
- Tab navigation (Hari Ini / Pencapaian / Cerita / Riwayat) memberi rasa kontrol.
- **Dream Context** di bagian atas selalu mengingatkan "mengapa mimpi ini".

### 1.3 Story — Review mingguan & bulanan relevan
- Pertanyaan review (*Apa yang membuatmu bangga?*, *Apa yang sulit?*) sesuai untuk refleksi diri anak.
- *FormatDate* dengan "Hari ini" / "Kemarin" terasa personal dan manusiawi.

### 1.4 Profile — "Siapa Aku?" konsisten dengan journey
- JourneyIdentity jelas: emoji + title + current big win.
- Cerita Perjalananku (LifeTimeline) kasih konteks ringan.

### 1.5 Bahasa & Nada
- Bahasa Indonesia dominan dan santai, cocok untuk 13 tahun.
- Tidak ada jargon teknis di halaman user-facing.

---

## 2. CONFUSING AREAS

### 2.1 Home — Greeting kehilangan waktu

| Sebelum | Sesudah (sekarang) |
|---|---|
| "Selamat Pagi, Tara" | "Selamat Datang Tara 👋" |

"Selamat Datang" terasa kaku dan seperti *first visit*. Anak 13 tahun yang balik tiap hari akan merasa robotik. Greeting waktu (Pagi/Siang/Malam) memberi kehangatan dan konteks temporal.

### 2.2 Home — TargetCard bisa tiba-tiba hilang

Jika `current_big_win` null — TargetCard tidak nampak. Layout jadi:
```
Selamat Datang Tara 👋
🎯 Mimpiku [Dokter]
✅ Hari Ini [checklist]
📝 Refleksi Terakhir [...]
```
Ada loncatan dari "Mimpiku" langsung ke "Hari Ini". Anak bingung: "Langkahku sekarang apa?"

### 2.3 Home — Refleksi Terakhir menghilang jika belum ada refleksi

Ketika user baru selesai aktivitas tapi belum nulis refleksi, **LastReflection** return null → tidak ada visual cue untuk menulis refleksi. Padahal di Journey halaman ada tombol "Tulis Refleksi Hari Ini". Kurang konsisten.

### 2.4 Journey — Tab "Cerita" vs Profile "Ceritaku"

- **Journey → Cerita**: Menampilkan *reflections only* (dari JourneyStory).
- **Profile → Ceritaku**: Menampilkan timeline penuh + review mingguan/bulanan + page `/profil/story`.

Nama mirip tapi isinya berbeda. Anak 13 tahun akan bingung: "Cerita mana yang benar?"

### 2.5 Journey — "Pencapaian" menampilkan semua Big Wins sekaligus

Untuk journey Dokter, ada ~10+ Big Wins dari "Lulus SMA" sampai "Sumpah Dokter" (rentang 8-12 tahun). Melihat semuanya sekaligus bisa overwhelming. Anak 13 tahun yang baru mulai mungkin merasa: "Ini terlalu panjang... aku belum sampai mana-mana."

### 2.6 Profile — "Dukungan Untukku" links mengarah ke mana?

Circle, Mentor, Safe Space — apakah halaman-halaman ini sudah ada? Jika belum, tombol ini mengarah ke error page atau halaman kosong. Ini *dead navigation*.

---

## 3. EMOTIONAL GAPS

### 3.1 Tidak ada momen "Aku berubah"

Setelah 30 hari, user kembali dan lihat:
- Home: sama seperti kemarin (Mimpiku, Target, Hari Ini). Tidak ada sense of progress.
- Story: timeline database. "Tanggal X: menyelesaikan small win. Tanggal Y: nulis refleksi."
- Tidak ada momen yang bilang: *"Kamu sekarang berbeda dari 30 hari yang lalu."*

**Dampak:** Anak merasa aplikasi ini *catatan*, bukan *teman bertumbuh*.

### 3.2 Tidak ada perayaan kecil (kecuali Big Win)

Small win selesai? Tidak ada feedback. Checklist tercentang selesai? Tidak ada ucapan. Satu-satunya perayaan adalah modal **BigWinCelebration** yang berat (bisa muncul setelah berminggu-minggu). Untuk anak 13 tahun, *gap reward* terlalu panjang.

### 3.3 Cerita di Story terasa seperti database, bukan diary

Timeline menampilkan:
```
📅 12 Juni 2026
🎯 Memilih mimpi: Dokter
✅ Small win selesai: Belajar biologi
```

Ini *log entry*, bukan *cerita*. Tidak ada:
- Narasi yang mengalir
- Hubungan antar kejadian ("setelah itu aku merasa...")
- Highlight momen spesial

**Diary juga punya struktur, tapi ada suara hati. Story tidak punya suara.**

### 3.4 Profile "Siapa Aku?" menjawab "Apa yang kulakukan?" bukan "Siapa aku menjadi"

Section Siapa Aku menampilkan:
- Emoji + title mimpi
- Current big win title + description

Ini *status update*. Tidak ada yang bilang:
- "Aku sedang dalam perjalanan menjadi seorang Dokter"
- "Aku sudah berkembang di bidang X"
- "Nilai-nilai yang aku bangun: disiplin, ingin tahu, peduli"

Anak 13 tahun: "Aku belum jadi dokter. Tapi aku sedang menjadi seseorang yang..."

### 3.5 Tidak ada ruang untuk "Aku hari ini merasa..."

Refleksi harian (learned, grateful, improve) adalah data entry — pertanyaan template. Tidak ada prompt *bagaimana perasaanmu hari ini?* dalam bentuk naratif. Untuk anak 13 tahun, emosi adalah bagian besar dari perjalanan.

---

## 4. UX PROBLEMS

### 4.1 Loading state di semua halaman — skeleton tanpa pesan
Skeleton loading baik, tapi untuk koneksi lambat (umum di Indonesia), skeleton kosong selama >3 detik membuat user curiga app-nya error.

### 4.2 Navigation naming inconsistency
| Label di Tab | Label di Halaman |
|---|---|
| Beranda | "Selamat Datang" |
| Journey | "Perjalanan Mimpiku" |
| Profil | "Siapa Aku?" |

Tidak ada masalah besar, tapi untuk 13 tahun, konsistensi = kepercayaan.

### 4.3 error state hanya "Coba Lagi"
Ketika `dataError` muncul, tombol satu-satunya adalah "Coba Lagi". Tidak ada penjelasan kenapa error, atau fallback offline.

### 4.4 Story page memuat ulang setiap tab switch
Setiap ganti tab (Timeline → Mingguan → Bulanan), data di-reload via `onReviewSaved`. Ini menyebabkan loading flash. Harusnya cukup cache atau load sekali.

### 4.5 Profile terlalu panjang untuk di-scroll
Ada 6+ section dalam satu scroll: Hero → Siapa Aku → Perjalanan Karakter → Ceritaku link → LifeTimeline → Dukungan → Pengaturan. Untuk 13 tahun, terlalu banyak informasi sekaligus.

---

## 5. RECOMMENDED FIXES

### 5.1 Kembalikan Greeting waktu di Home
```
"Selamat Pagi {name} 🌅"
"Selamat Siang {name} ☀️"
"Selamat Malam {name} 🌙"
```
Bukan hanya hangat — ini memberi konteks *waktu* dan rutinitas. Anak jadi merasa aplikasi ini "tahu" kapan mereka buka.

### 5.2 TargetCard: jangan hilang, kasih fallback
Jika `current_big_win` null, tampilkan:
```
🔥 Target Saat Ini
Belum ada langkah yang dimulai.
Aktifkan journey-mu untuk memulai.
```
Supaya layout konsisten dan user tidak bertanya-tanya.

### 5.3 Home: link ke refleksi jika belum ada
Di LastReflection, jika null:
```
📝 Refleksi Terakhir
Kamu belum menulis refleksi hari ini.
→ Tulis refleksi di Journey
```
Konsisten dengan tombol yang ada di Journey detail.

### 5.4 Journey "Pencapaian": hanya tampilkan Big Win aktif + 2-3 ke depan
Jangan load semua 10+ Big Wins. Cukup:
- Yang sedang dikerjakan (current)
- 1-2 berikutnya sebagai preview
- Tombol "Lihat semua" untuk expand

Ini mengurangi overwhelm dan memberi rasa progres bertahap.

### 5.5 Story Timeline: tambahkan narasi mingguan otomatis
Setelah 30 hari, daripada hanya menampilkan event log, buat ringkasan naratif:
```
"Minggu ini kamu menyelesaikan 3 aktivitas dan 1 small win.
Kamu merasa bersyukur karena dukungan keluarga.
Fokusmu minggu depan: belajar biologi lebih konsisten."
```
Ini mengubah database → diary. Prompt bisa diambil dari refleksi harian.

### 5.6 Profile: tambahkan "Aku sedang bertumbuh..." section
Ganti atau tambahi "Siapa Aku?" dengan:
- **Aku sedang menjadi:** Dokter
- **Nilai yang aku bangun:** Disiplin (dari konsistensi aktivitas), Keingintahuan (dari refleksi)
- **Progressku:** "Sudah 3 minggu dalam perjalanan. 1 big win sedang dikerjakan."

Ini menjawab *who am I becoming*, bukan *what am I doing*.

### 5.7 Perayaan small win — minimal
Setiap small win selesai, kasih feedback sederhana tanpa modal:
- Toast: "🎉 Selangkah lebih dekat ke big win-mu!"
Atau:
- Di checklist, teks berubah jadi "Selesai! 🎉" dengan animasi ringan

Reward interval lebih pendek = motivasi lebih terjaga untuk 13 tahun.

### 5.8 Dead navigation di Profile → sembunyikan atau kasih fallback
Jika Circle / Mentor / Safe Space belum diimplementasi, sembunyikan section "Dukungan Untukku" atau ganti dengan teks "Coming soon". Jangan biarkan user klik ke halaman kosong.

### 5.9 Error states: tambahkan penjelasan
Daripada "Coba Lagi", tulis:
```
"Koneksi terputus. Periksa internetmu, ya."
```
Anak 13 tahun lebih paham *apa yang salah*.

### 5.10 Profile: tata ulang hirarki informasi
Prioritaskan:
1. **Hero** (nama + avatar)
2. **Aku sedang menjadi...** (identity + values + progress)
3. **Ceritaku** (link ke story page — timeline + review)
4. **Pengaturan** (edit profil, logout)

Pindahkan "Perjalanan Karakter" (dimension summary) ke dalam Story atau Journey — terlalu analitis untuk halaman identitas. Pindahkan "Dukungan" ke bawah atau hidden jika belum siap.

---

## SUMMARY

| Area | Rating 1-5 | Alasan |
|---|---|---|
| **Home clarity** | 4 | Mimpiku & Target jelas. Greeting bisa lebih hangat. |
| **Journey pathway** | 3 | "Kenapa penting" bagus. Overwhelm dengan semua big win. Tab Cerita redundant. |
| **Story emotion** | 2 | Database, bukan diary. Tidak ada narasi pertumbuhan. |
| **Profile identity** | 2 | Menjawab "Apa yang kulakukan", bukan "Siapa aku menjadi". Terlalu panjang. |
| **Emotional support** | 2 | Reward interval terlalu panjang. Tidak ada ruang perasaan. |

**Urutan prioritas fix (high impact, low effort):**

1. 🔴 Greeting personal + waktu (Home)
2. 🔴 TargetCard fallback saat null (Home)
3. 🔴 Refleksi prompt saat belum diisi (Home)
4. 🟡 Big Win preview only, bukan semua (Journey)
5. 🟡 Story → narasi mingguan otomatis
6. 🟡 Small win celebration ringan (toast)
7. 🟡 Profile identity → "Siapa aku menjadi" + nilai
8. 🟢 Hapus/hidden dead navigation (Dukungan)
9. 🟢 Error message manusiawi
10. 🟢 Profile tata ulang hierarki
