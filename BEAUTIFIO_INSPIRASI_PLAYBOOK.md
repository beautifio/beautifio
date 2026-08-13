# BEAUTIFIO INSPIRASI — PLAYBOOK REDAKSI
### Panduan Lengkap untuk Tim Konten

---

## DAFTAR ISI
1. Akses & Login
2. Dashboard — Yang Kamu Lihat
3. Cara Bikin Artikel Manual
4. Cara Generate Artikel Pakai AI
5. Cara Edit, Publish, Schedule, Hapus
6. Decision Tree: Topik Masuk Kategori Mana?
7. Referensi Lengkap 14 Kategori
8. Panduan Konten & Contoh Artikel
9. Tips & Troubleshooting

---

## 1. AKSES & LOGIN

1. Buka `https://beautifio-web.vercel.app/admin/konten/posts`
2. Login dengan akun yang punya role `redaksi` atau `superadmin`
3. Kalau belum punya akun redaksi → minta Tara bikin via Supabase

---

## 2. DASHBOARD — YANG KAMU LIHAT

Setelah login, kamu akan lihat (dari atas ke bawah):

### Baris 1: Header
```
Inspirasi Posts              [Sampah] [Tambah Post] [✨ Generate]
```

### Baris 2: Stats Resume (10 kotak)
```
Total 40 | Published 26 | Draft 13 | Terjadwal 1 |
Mind & Body 19 | Glow 0 | Career 15 | Relationship 2 | ...
```
Menunjukkan jumlah artikel per status dan per kategori.

### Baris 3: Insight Hari Ini (panel kuning)
4 kartu data:
- **💬 Curhat sedang ramai** — topik Curhat paling populer bulan ini
- **🎯 Journey sering gagal** — journey yang paling banyak gagal/pivot
- **👥 Circle paling aktif** — circle dengan member terbanyak
- **💡 Artikel AI** — rekomendasi judul dari AI

Tombol **[✨ Generate Artikel]** di bagian bawah panel.

### Baris 4: Search & Filter
- **🔍 Cari** — ketik judul/excerpt/slug
- **Kategori** — dropdown 14 kategori
- **Status** — Published / Draft / Terjadwal
- **Reset** — muncul kalau ada filter aktif

### Baris 5: Daftar Artikel
Setiap artikel tampil sebagai kartu dengan:
- Badge status (warna beda: hijau=published, abu=draft, biru=terjadwal)
- Badge tipe penulis (biru=redaksi, ungu=mentor, oranye=cerita)
- Badge kategori + arsitektur + tag
- Judul + excerpt
- Author + tanggal + waktu baca

**Tombol aksi per artikel:**
- 📝 Edit
- ✈️ Publish (hijau, hanya draft)
- 📅 Jadwalkan (biru, hanya draft)
- 📦 Archive (kuning, hanya published)
- 🗑️ Hapus (merah)

---

## 3. CARA BIKIN ARTIKEL MANUAL

### Klik **[+ Tambah Post]**

Akan muncul modal form. Isi dari atas ke bawah:

### 3.1 Judul & Slug
- **Title** — wajib diisi. Judul artikel (contoh: "Kenapa Otak Kita Nggak Bisa Berhenti Mikir Pas Mau Tidur")
- **Slug** — otomatis dari judul. Bisa diedit manual (contoh: `otak-overthinking-saat-mau-tidur`)

### 3.2 Kategori
Pilih **satu** dari 14 kategori. Lihat Section 7 untuk panduan lengkap.

### 3.3 Tipe Penulis
- **Redaksi (Kak Nara)** — ditulis oleh tim Beautifio. Isi "Author Name" (default: Kak Nara)
- **Mentor / Ahli** — ditulis oleh profesional. Wajib isi: Nama, Gelar, Institusi, LinkedIn, Foto
- **Cerita Pembaca** — kiriman pembaca. Isi: Nama Anonim (tampil publik), Nama Asli (internal)

### 3.4 Arsitektur Konten
Pilih salah satu:
- **Pilar** — artikel panjang 4.000-5.000 kata, evergreen, ToC, deep dive
- **Kluster** — 1.000-2.000 kata, sub-topik, actionable
- **Trending** — 500-1.000 kata, real-time, ringkas
- **(Kosongkan)** — tidak ada arsitektur khusus

### 3.5 Series (Opsional)
Pilih dari dropdown jika artikel bagian dari series.

### 3.6 Tags
Ketik tag, tekan **Enter** untuk menambah. Auto-suggest muncul saat mengetik.
- Contoh: `mental-health`, `self-care`, `overthinking`

### 3.7 Content
Rich text editor. Toolbar: Bold, Italic, Underline, Heading 1-3, Bullet, Number, Quote, Link, Image upload, Table, YouTube embed.

### 3.8 Excerpt
Deskripsi singkat 1-2 kalimat (muncul di card & SEO).

### 3.9 Read Time
Estimasi waktu baca dalam menit (default: 5).

### 3.10 Jadwalkan Publikasi
Set tanggal & jam untuk publish otomatis. Kosongkan untuk langsung publish.

### 3.11 Cover Image
Upload gambar (16:9 disarankan) atau paste URL.

### 3.12 Disclaimer
- **None** — tidak ada disclaimer
- **Kuning** — topik sensitif ringan (medis/finansial)
- **Merah** — topik sensitif berat (mental health krisis)

### 3.13 SEO Settings (klik untuk buka)
- Meta Title — judul SEO (50-60 karakter)
- Meta Description — deskripsi SEO (140-160 karakter)
- OG Image URL — gambar untuk social share

### 3.14 Simpan
Klik **Simpan** → artikel tersimpan sebagai **Draft**.

---

## 4. CARA GENERATE ARTIKEL PAKAI AI

### Klik **[✨ Generate]**

### Step 1: Pilih Arsitektur
Klik salah satu: **Pilar** | **Kluster** | **Trending**

### Step 2: Isi Keyword
Contoh: `overthinking pada remaja`, `cara atur keuangan mahasiswa`, `review sunscreen lokal`

### Step 3: Pilih Kategori
Dropdown 14 kategori

### Step 4: Pilih Gaya Penulisan
- **📝 Standar** — artikel inspiratif (tutorial, panduan, review)
- **📖 Cerpen** — cerita pendek naratif (orang pertama, alur cerita)

### Step 5: Klik Generate
AI akan:
1. Baca Panduan Konten (Bible)
2. Lihat Contoh Artikel untuk kategori yang dipilih
3. Generate artikel lengkap dengan semua field
4. Buka form editor dengan hasilnya

### Step 6: Review & Edit
- Baca hasil generate
- Edit seperlunya (tone, fakta, struktur)
- Isi field yang kosong (cover image, dll)
- Klik **Simpan**

### Tips Generate
- **Keyword spesifik** = hasil lebih fokus. "overthinking saat mau tidur" > "overthinking"
- **Arsitektur** pengaruhi panjang & kedalaman
- Hasil generate pakai persona **Kak Nara** — "aku", personal, naratif
- Kalau hasil kurang pas: ganti arsitektur atau tambah detail di keyword

---

## 5. CARA EDIT, PUBLISH, SCHEDULE, HAPUS

### Edit
1. Di list artikel, klik ikon 📝 di kartu artikel
2. Modal form terbuka dengan data terisi
3. Edit yang perlu
4. Klik **Simpan**

### Publish (dari Draft)
1. Artikel harus status **Draft**
2. Klik ikon ✈️ hijau di kartu artikel
3. Status berubah jadi **Published** — langsung tayang di `/inspirasi`

### Schedule (jadwal publish)
1. Artikel harus status **Draft**
2. Klik ikon 📅 biru di kartu artikel
3. Popup muncul — pilih tanggal & jam
4. Klik **Atur** — status jadi **Terjadwal**
5. Artikel akan auto-publish di waktu yang dijadwalkan

### Batalkan Schedule
- Klik ikon ❌ di artikel terjadwal → kembali ke Draft

### Archive (dari Published)
- Klik ikon 📦 kuning → artikel di-archive (tidak tayang, bisa dikembalikan)

### Hapus (soft delete)
1. Klik ikon 🗑️ merah → konfirmasi
2. Artikel masuk **Sampah** (30 hari sebelum dihapus permanen)

### Lihat & Pulihkan Sampah
1. Klik tombol **[Sampah]** di header
2. Lihat artikel yang dihapus + sisa hari
3. Klik **Pulihkan** untuk mengembalikan
4. Klik **Hapus Permanen** untuk menghapus selamanya

---

## 6. DECISION TREE: TOPIK MASUK KATEGORI MANA?

### "Aku mau nulis tentang..."

**...kesehatan mental?**
→ Mind & Body (psikologis) ATAU Wellness (fisik/biologis)
- Overthinking, anxiety, burnout → **Mind & Body**
- Kurang tidur karena fisik, zat besi, menstruasi → **Wellness**

**...skincare/makeup?**
→ Beauty & Skincare

**...olahraga/fitness?**
→ Olahraga (umum) ATAU Wellness (sisi kesehatan) ATAU Mind & Body (yoga/meditasi)

**...makanan/kuliner?**
→ Lifetainment (ada koneksi ke tren/hiburan) ATAU Wellness (resep sehat/nutrisi)

**...drakor/film/musik?**
→ Entertainment (review/rekomendasi) ATAU Lifetainment (makanan di drakor)

**...karir/keuangan/bisnis?**
→ Level Up & Career

**...pertemanan/pacaran/keluarga?**
→ Relationship

**...menulis/journaling/seni?**
→ Creative Space

**...AI/gaming/gadget?**
→ Tech & Gaming

**...fashion/outfit/belanja?**
→ Style & Shopping

**...opini/isu sosial/kritik?**
→ Opini & Aksi (ambil stance, argumentatif)

**...berita/pengumuman/event?**
→ Update & Berita (faktual, straight news)

**...profil tokoh?**
→ Tokoh (biografi, inspiratif) ATAU kategori sesuai bidang tokoh

---

## 7. REFERENSI LENGKAP 14 KATEGORI

### ❤️ Mind & Body
**Isi:** Mental health, self-care, overthinking, anxiety, burnout, body image, mindfulness, self-love

**Contoh judul:**
- "Kenapa Otak Kita Nggak Bisa Berhenti Mikir Pas Mau Tidur"
- "Kamu Bukan Pemalas — Kamu Cuma Burnout"
- "Surat untuk Diriku yang Nggak Percaya Diri"

**Tone:** Hangat, personal, gak terburu-buru kasih solusi

---

### ✨ Beauty & Skincare
**Isi:** Skincare routine, makeup pemula, review produk lokal, nail care, hair care, fragrance

**Contoh judul:**
- "Review Jujur: 5 Sunscreen Lokal yang Aku Coba Sendiri"
- "Panduan Skincare dari Nol untuk Pelajar"
- "Ini Bahan Skincare yang Cocok untuk Kulit Berminyak"

**Tone:** Santai, relatable, ngomongin realita budget pelajar

---

### 🏃 Wellness
**Isi:** Nutrisi, fitness, siklus menstruasi, feminine health, tidur, zat besi, hidrasi

**Contoh judul:**
- "Kenapa Kamu Selalu Lelah Meski Udah Tidur 8 Jam"
- "Yang Terjadi di Tubuhmu Sebelum Menstruasi"
- "Gym untuk Pemula: Ini yang Perlu Kamu Tahu"

**Tone:** Informatif tapi tetap hangat, berbasis sains tapi gak kering

---

### 🛍️ Style & Shopping
**Isi:** Outfit ideas, fashion tips, haul review, thrift, Shopee/Tokopedia finds, OOTD

**Contoh judul:**
- "Haul Shopee Baju Kondangan Budget 150 Ribu"
- "Capsule Wardrobe untuk Anak Kuliahan"
- "Thrift Guide: Cara Dapat Baju Murah & Keren"

**Tone:** Fun, relatable, fokus ke budget-friendly

---

### 🎬 Entertainment
**Isi:** Review drakor, film, musik, K-pop, webtoon, anime, podcast

**Contoh judul:**
- "5 Drakor yang Wajib Ditonton Kalau Kamu Butuh Nangis"
- "Webtoon Romance Underrated yang Harus Kamu Baca"
- "Album Baru [Artis]: Review Track by Track"

**Tone:** Paling santai, personal, kayak rekomendasi temen

---

### 🍽️ Lifetainment
**Isi:** Kuliner + hiburan. Makanan di drakor/film, cafe aesthetic, food review fun

**Contoh judul:**
- "5 Makanan Drakor yang Ada Versi Murahnya di Indonesia"
- "Cafe Aesthetic di Jogja yang Cocok Buat Nugas"
- "Viral Food yang Aku Coba: Mana yang Worth It?"

**Tone:** Fun, opinionated, "aku udah coba jadi kamu gak perlu"

---

### 👥 Relationship
**Isi:** Pertemanan, toxic friendship, keluarga, romance, boundaries, ghosting

**Contoh judul:**
- "Anatomy of a Toxic Friendship"
- "Kenapa Kita Sering Tau Tapi Nggak Bisa Pergi"
- "Cara Bilang 'Tidak' ke Teman Tanpa Merasa Bersalah"

**Tone:** Jujur, relatable, gak menggurui

---

### 📈 Level Up & Career
**Isi:** Karir, magang, bisnis, finance, side hustle, personal branding, CV, investasi

**Contoh judul:**
- "Side Hustle yang Realistis Dimulai Pas Masih Kuliah"
- "CV Kamu Ditolak? Ini 5 Hal yang Harus Diperbaiki"
- "Uang Pertamamu Sendiri: Panduan Finansial Anak Muda"

**Tone:** Actionable, realistis, gak toxic positivity

---

### ✏️ Creative Space
**Isi:** Menulis kreatif, journaling, puisi, esai personal, literasi, buku

**Contoh judul:**
- "Journaling Bukan Buat yang Hidupnya Aesthetic"
- "Cara Mulai Nulis Cerpen (Meski Kamu Nggak Merasa Jago)"
- "5 Buku yang Mengubah Cara Aku Melihat Diri Sendiri"

**Tone:** Supportif, gak gatekeeping, "semua orang bisa mulai"

---

### 🖥️ Tech & Gaming
**Isi:** AI untuk belajar, gaming, gadget budget, keamanan digital, perempuan di tech

**Contoh judul:**
- "Cara Pakai AI untuk Skripsi Tanpa Kena Plagiarisme"
- "Game yang Cocok Dimainkan Perempuan (dan Kenapa Itu Penting)"
- "Gadget Budget 3 Juta untuk Mahasiswa"

**Tone:** Casual, accessible, "tech itu buat semua orang"

---

### 📰 Opini & Aksi
**Isi:** Opini, stance, advokasi, isu sosial, lingkungan, pendidikan, kritik budaya

**Contoh judul:**
- "Kenapa Kuliah di Indonesia Terasa Seperti Survival Game"
- "Mental Health Harus Masuk Kurikulum Sekolah — Ini Alasannya"
- "Plastik Sekali Pakai: Kenapa Kita Harus Berhenti Sekarang"

**Tone:** Argumentatif, berani, ada stance jelas

---

### 📢 Update & Berita
**Isi:** Straight news, update kebijakan, event, pengumuman, beasiswa, lomba

**Contoh judul:**
- "Ribuan Kuota Beasiswa KIP Kuliah 2026 Resmi Dibuka"
- "Pemerintah Umumkan Kebijakan Baru UKT"
- "Hackathon Nasional 2026: Pendaftaran Dibuka"

**Tone:** Faktual, cepat, to-the-point. APA, SIAPA, KAPAN, DI MANA.

---

### 🏆 Olahraga
**Isi:** Fitness, gym, workout, running, yoga, basket, futsal, bulutangkis, renang, sports event

**Contoh judul:**
- "Gym untuk Pemula: Panduan Minggu Pertama"
- "Hasil Liga 1 Pekan Ini: Klasemen & Highlight"
- "Yoga di Kos: Rutinitas 15 Menit Sebelum Kuliah"

**Tone:** Enerjik, praktis, bisa news atau tutorial

---

### ⭐ Tokoh
**Isi:** Profil tokoh inspiratif, biografi singkat, perjalanan hidup, lessons learned

**Contoh judul:**
- "R.A. Kartini: Lebih dari Sekadar Hari Kartini"
- "Perjalanan [Nama]: Dari Kos ke CEO Startup"
- "5 Pelajaran Hidup dari [Tokoh]"

**Tone:** Inspiratif, naratif, "ini perjalanan mereka, ini yang bisa kita pelajari"

---

## 8. PANDUAN KONTEN & CONTOH ARTIKEL

### Cara Akses
Buka `/admin/settings/bible`

### Yang Ada di Halaman Ini

**Atas: Panduan Konten**
- Tab **[📝 Standar]** — aturan penulisan artikel inspiratif
- Tab **[📖 Cerpen]** — aturan penulisan cerita pendek
- Tombol **Edit Panduan** (🔒 perlu PIN) — buka editor
- Tombol **Reset ke Default** — kembalikan ke aturan bawaan

**Tengah: Contoh Artikel per Kategori**
- 14 tab kategori — pilih salah satu
- Tampil contoh artikel lengkap (judul + konten)
- Tombol **Edit Contoh** (🔒 perlu PIN) — buka editor
- AI Generate akan lihat contoh ini sebagai referensi

**Bawah: Panduan Kategori — "Masuk Mana?"**
- Grid 14 kategori dengan deskripsi singkat
- **Mapping Khusus** — 3 kolom: Olahraga, Tokoh, Berita
  - Menunjukkan ke mana konten spesifik harus masuk

### Cara Edit Panduan (Butuh PIN)
1. Klik **Edit Panduan**
2. Masukkan PIN (default: `575757`)
3. Edit teks panduan
4. Klik **Simpan Panduan**

### Cara Ganti PIN (Superadmin Only)
1. Klik **Edit Panduan** → popup PIN muncul
2. Klik **Ganti PIN** di bagian bawah popup
3. Masukkan PIN baru (4-6 digit)
4. Klik **Ganti**

---

## 9. TIPS & TROUBLESHOOTING

### AI Generate gagal / hasil kosong?
- Cek koneksi internet
- Pastikan OpenAI API key aktif & ada saldo
- Coba lagi — kadang OpenAI rate limit

### Kategori tidak muncul di dropdown?
- Refresh halaman (Ctrl+Shift+R)
- Pastikan deploy terbaru sudah jalan

### Tags tidak tersimpan?
- Pastikan klik **Simpan** setelah tambah tags
- Tags tersimpan sebagai array di database

### Artikel tidak muncul di publik?
- Cek status: harus **Published**
- Cek `is_published = true` di database

### Mau ganti model AI?
- Default: `gpt-4o`
- Tambah env `OPENAI_MODEL` di Vercel (misal: `gpt-4o-mini` untuk lebih murah)
- Redeploy

### Lupa PIN Panduan Konten?
- Minta superadmin untuk reset PIN
- Atau cek di Supabase: `SELECT value FROM app_settings WHERE key = 'bible_pin'`

---

*Playbook v1.0 — Beautifio Editorial Team*
