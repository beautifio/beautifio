# Beautifio — User Flows

**Version:** 1.0
**Status:** Final
**Last Updated:** June 2026

---

## 1. New User Registration Flow

```
[Landing Page]
    │
    ├── Lihat Hero & Fitur
    ├── Scroll ke FAQ
    └── Klik "Gabung Waitlist" / "Daftar"
            │
            ▼
      [Register Page]
            │
            ├── Daftar dengan Email
            │     ├── Input nama lengkap
            │     ├── Input email
            │     ├── Input password
            │     └── Klik "Daftar"
            │
            ├── Daftar dengan Google
            │     └── Pilih akun Google
            │
            └── Sudah punya akun?
                  └── Klik "Masuk"
                        │
                        ▼
                  [Login Page]
                        │
                        ├── Input email & password
                        └── Klik "Masuk"
            │
            ▼
    [Email Verification]
            │
            ├── Kirim kode verifikasi ke email
            ├── Input kode OTP (6 digit)
            └── Klik "Verifikasi"
            │
            ▼
      [Onboarding - Step 1]
            │
            ├── "Halo! Kenalan dulu yuk"
            ├── Pilih status:
            │     ├── Pelajar SMA/SMK
            │     ├── Mahasiswa
            │     └── Fresh Graduate
            ├── Pilih minat (multi-select):
            │     ├── Teknologi
            │     ├── Bisnis & Kewirausahaan
            │     ├── Kreatif & Desain
            │     ├── Kesehatan & Mental Health
            │     ├── Sosial & Lingkungan
            │     ├── Pendidikan & Akademik
            │     └── Lainnya
            └── Klik "Lanjut"
            │
            ▼
      [Onboarding - Step 2]
            │
            ├── "Apa tujuan utamamu?"
            ├── Pilih 1-3 tujuan:
            │     ├── Menentukan karir
            │     ├── Mengembangkan skill
            │     ├── Membangun relasi
            │     ├── Mencari beasiswa
            │     ├── Mendapatkan mentor
            │     └── Memulai bisnis
            └── Klik "Lanjut"
            │
            ▼
    [Goal Selection]
            │
            ├── "Tetapkan Goal pertamamu"
            ├── Pilih kategori:
            │     ├── Karir
            │     ├── Pendidikan
            │     ├── Skill
            │     └── Bisnis
            ├── Input nama goal (e.g. "Jadi Frontend Developer")
            ├── Pilih target waktu
            └── Klik "Simpan Goal"
            │
            ▼
    [Circle Matching]
            │
            ├── "Kami punya rekomendasi Circle untukmu"
            ├── Lihat 3-5 circle yang direkomendasikan
            ├── Tiap card: nama, deskripsi, jumlah anggota
            ├── Klik "Gabung" pada circle yang diminati
            └── Klik "Ke Beranda"
            │
            ▼
        [Home / Dashboard]
```

---

## 2. Circle Flow

```
[Home]
    │
    ├── Tab "Circle"
    │     │
    │     ├── [My Circles]
    │     │     ├── Daftar circle yang diikuti
    │     │     └── Tiap card: nama, anggota, last activity
    │     │
    │     ├── [Explore]
    │     │     ├── Daftar circle yang tersedia
    │     │     ├── Filter: kategori, popularitas
    │     │     └── Klik "Gabung"
    │     │
    │     └── Klik salah satu circle
    │           │
    │           ▼
    │     [Circle Detail]
    │           │
    │           ├── Informasi circle
    │           │     ├── Nama, deskripsi, mentor
    │           │     ├── Jumlah anggota
    │           │     └── Mentor (jika ada)
    │           │
    │           ├── [Messages / Chat]
    │           │     ├── List pesan (descending)
    │           │     ├── Input chat
    │           │     ├── Attach gambar
    │           │     └── Klik "Kirim"
    │           │
    │           ├── [Ask Mentor] (jika ada mentor)
    │           │     ├── Klik "Ajukan Pertanyaan"
    │           │     ├── Input judul
    │           │     ├── Input detail pertanyaan
    │           │     └── Kirim
    │           │
    │           └── [Notifications]
    │                 ├── Ada mentor reply
    │                 ├── Anggota baru
    │                 └── Event circle
    │
    └── Kembali ke Home
```

---

## 3. Roadmap Flow

```
[Home]
    │
    ├── Tab "Roadmap"
    │     │
    │     ├── [Active Roadmap]
    │     │     ├── Nama goal (e.g. "Jadi Frontend Developer")
    │     │     ├── Progress bar (e.g. 3/8 milestones)
    │     │     └── List milestone:
    │     │           ├── [1] Belajar HTML & CSS
    │     │           │     ├── Status: ✅ Completed
    │     │           │     └── Klik → detail
    │     │           ├── [2] Belajar JavaScript
    │     │           │     ├── Status: ⏳ In Progress
    │     │           │     └── Klik → detail + resources
    │     │           ├── [3] Belajar React
    │     │           │     ├── Status: 🔒 Locked
    │     │           │     └── Prerequisite: Milestone 2
    │     │           └── ...
    │     │
    │     ├── [Complete Milestone]
    │     │     ├── Klik "Tandai Selesai"
    │     │     ├── Confirmation modal
    │     │     ├── Progress bar update
    │     │     └── Animasi confetti (jika 100%)
    │     │
    │     └── [Add New Goal]
    │           ├── Klik "+ Goal Baru"
    │           └── Repeat Goal Selection flow
    │
    └── Kembali ke Home
```

---

## 4. Opportunity Hub Flow

```
[Home]
    │
    ├── Tab "Opportunity"
    │     │
    │     ├── [Opportunity Hub]
    │     │     ├── Search bar
    │     │     ├── Filter:
    │     │     │     ├── Kategori (Beasiswa, Magang, Kompetisi, Workshop)
    │     │     │     ├── Deadline (Minggu ini, Bulan ini, Semua)
    │     │     │     └── Sort by (Terbaru, Deadline terdekat)
    │     │     │
    │     │     └── List opportunity cards:
    │     │           ├── Title
    │     │           ├── Organization
    │     │           ├── Kategori badge
    │     │           ├── Deadline
    │     │           └── Action: "Lihat Detail" / "Simpan"
    │     │
    │     ├── [Detail Opportunity]
    │     │     ├── Title
    │     │     ├── Organization + logo
    │     │     ├── Full description
    │     │     ├── Requirements
    │     │     ├── Deadline
    │     │     ├── Cara mendaftar
    │     │     └── Buttons:
    │     │           ├── "Daftar Sekarang" → external link
    │     │           └── "Simpan" → bookmark
    │     │
    │     ├── [Saved Opportunities]
    │     │     └── List opportunity yang di-save
    │     │
    │     └── [History]
    │           └── Lamaran yang sudah dikirim
    │
    └── Kembali ke Home
```

---

## 5. Mentor Flow

```
[Mentor Login]
    │
    ├── Login sebagai mentor (role: mentor)
    │
    ▼
[Mentor Dashboard]
    │
    ├── [Overview]
    │     ├── Jumlah mentee
    │     ├── Pertanyaan pending
    │     ├── Sesi terjadwal
    │     └── Rating
    │
    ├── [Questions]
    │     ├── List pertanyaan dari circle
    │     ├── Filter: unanswered, answered
    │     ├── Klik salah satu:
    │     │     ├── Lihat detail pertanyaan
    │     │     ├── Tulis jawaban (rich text)
    │     │     └── Kirim
    │     └── Mark as answered
    │
    ├── [Weekly Update]
    │     ├── Posting update untuk circle
    │     ├── Rich text editor
    │     ├── Attach link / file
    │     └── Publish
    │
    ├── [Sessions]
    │     ├── Buat sesi baru
    │     │     ├── Pilih tanggal & waktu
    │     │     ├── Tentukan durasi
    │     │     ├── Tema sesi
    │     │     └── Publish ke circle
    │     ├── List sesi mendatang
    │     └── Riwayat sesi
    │
    └── [Profile Settings]
          ├── Edit bio
          ├── Edit expertise
          └── Verification status
```

---

## 6. Admin Flow

```
[Admin Login]
    │
    ▼
[Admin Dashboard]
    │
    ├── [Overview]
    │     ├── Total users
    │     ├── Active circles
    │     ├── Total mentors
    │     ├── Opportunities posted
    │     └── Chart: weekly active users
    │
    ├── [Users]
    │     ├── Tabel all users
    │     ├── Filter: role, status, date
    │     ├── Search
    │     ├── Klik user → detail
    │     │     ├── Lihat profile
    │     │     ├── Lihat goals
    │     │     ├── Lihat circles
    │     │     ├── Suspend / Ban
    │     │     └── Change role
    │
    ├── [Circles]
    │     ├── Tabel all circles
    │     ├── Filter: category, status
    │     ├── Create circle
    │     ├── Edit circle
    │     └── Assign mentor
    │
    ├── [Mentors]
    │     ├── Tabel all mentors
    │     ├── Verification queue
    │     ├── Approve / Reject
    │     └── Lihat aktivitas mentor
    │
    ├── [Opportunities]
    │     ├── Tabel all opportunities
    │     ├── Create opportunity
    │     ├── Edit / Delete
    │     └── Featured toggle
    │
    ├── [Moderation]
    │     ├── Reported content
    │     ├── Lihat report detail
    │     ├── Warn user
    │     ├── Remove content
    │     └── Ban user
    │
    └── [Analytics]
          ├── User growth
          ├── Circle engagement
          ├── Mentor response rate
          ├── Opportunity click rate
          └── Milestone completion rate
```

---

## 7. Edge Cases & Error Flows

### 7.1 Registration
- **Email already registered** → Redirect ke login, pesan "Email already registered"
- **Invalid email format** → Error inline, "Please enter a valid email"
- **Password too weak** → Show password requirements checklist
- **OTP expired** → "Kode expired. Kirim ulang?" → resend OTP

### 7.2 Login
- **Wrong password** → "Password salah. {N} percobaan tersisa"
- **Account suspended** → "Akun dinonaktifkan. Hubungi support."
- **Session expired** → Redirect ke login + toast "Sesi berakhir, silakan login ulang"

### 7.3 Circle
- **Circle full** → "Circle penuh. Gabung waiting list?"
- **Already member** → Show "Anda sudah menjadi anggota"
- **Leave circle** → Konfirmasi modal "Yakin keluar dari circle?"

### 7.4 Roadmap
- **Complete all milestones** → Confetti + "Selamat! Goal tercapai."
- **Delete goal** → "Akan menghapus semua progress. Yakin?"

### 7.5 Opportunity
- **Deadline passed** → "Pendaftaran ditutup" (disabled state)
- **Already applied** → "Sudah mendaftar" badge
- **Broken external link** → Fallback info kontak
