# Beautifio — Product Requirements Document

**Version:** 1.0
**Status:** Draft
**Last Updated:** June 2026

---

## 1. Product Overview

### 1.1 Product Name
**Beautifio**

### 1.2 Tagline
Masa Depan Dimulai Hari Ini

### 1.3 Vision
Menjadi platform nomor satu di Indonesia yang membantu anak muda menemukan arah hidup, peluang, mentor, dan lingkungan yang tepat untuk membangun masa depan yang lebih baik.

### 1.4 Mission
- Membantu pengguna menentukan tujuan hidup
- Menghubungkan pengguna dengan komunitas yang relevan
- Menyediakan akses ke mentor berpengalaman
- Membuka peluang beasiswa, magang, dan kompetisi
- Membantu pengguna mencapai milestone nyata

### 1.5 Problem Statement
Banyak anak muda Indonesia mengalami:
- Kebingungan setelah lulus sekolah
- Salah jurusan
- Sulit mendapat pekerjaan
- Tidak memiliki mentor
- Tidak memiliki lingkungan pendukung

Beautifio hadir untuk mengubah kebingungan menjadi langkah nyata.

---

## 2. Target Market

### 2.1 Primary User
| Demografi | Detail |
|-----------|--------|
| Usia | 17–24 tahun |
| Pendidikan | SMA, Mahasiswa, Fresh Graduate |
| Karakteristik | Mencari arah, butuh bimbingan, aktif digital |

### 2.2 Secondary User
| Demografi | Detail |
|-----------|--------|
| Usia | 25–40 tahun |
| Pekerjaan | Profesional, Founder, Mentor |
| Karakteristik | Ingin berbagi pengalaman, membangun legacy |

---

## 3. Core Features

### 3.1 Goal Selection
- Pengguna memilih tujuan hidup (karir, pendidikan, skill)
- Sistem merekomendasikan jalur berdasarkan tujuan
- Progress tracking per tujuan

### 3.2 Circle
- Komunitas berdasarkan minat dan tujuan
- Chat & diskusi antar anggota
- Mentor dapat bergabung sebagai pembimbing
- Kapasitas dan status circle

### 3.3 Roadmap
- Panduan langkah demi langkah yang personal
- Milestone yang dapat dicentang
- Progress bar visual
- Rekomendasi berdasarkan tujuan

### 3.4 Opportunity Hub
- Beasiswa
- Magang
- Kompetisi
- Workshop
- Filter berdasarkan kategori dan deadline
- Save & apply tracking

### 3.5 Mentor Dashboard
- Profil mentor dengan verifikasi
- Menjawab pertanyaan dari circle
- Posting update mingguan
- Menjadwalkan sesi mentoring

### 3.6 Admin Dashboard
- Manajemen users, circles, mentors, opportunities
- Moderation tools
- Analytics & reporting

---

## 4. User Journey

```
Landing Page
    ↓
Register (Email/Google)
    ↓
Email Verification
    ↓
Onboarding (Minat, Tujuan, Background)
    ↓
Goal Selection (Pilih 1-3 tujuan)
    ↓
Circle Matching (AI-based recommendation)
    ↓
Join Circle
    ↓
Akses Roadmap
    ↓
Jelajahi Opportunity Hub
    ↓
Selesaikan Milestone
    ↓
(Mentee dapat menjadi Mentor)
```

---

## 5. MVP Scope

### 5.1 Included
- Authentication (Email & Google OAuth)
- Onboarding flow
- Goal Selection
- Circle (browse, join, chat)
- Roadmap dengan milestone
- Opportunity Hub
- Mentor Dashboard
- Admin Dashboard

### 5.2 Excluded (Post-MVP)
- Marketplace
- AI Mentor (chatbot)
- Livestream
- Video Course
- Native Mobile App

---

## 6. Success Metrics

| Metric | Type |
|--------|------|
| **North Star:** Milestone Completed | Core engagement |
| Weekly Active Users (WAU) | Engagement |
| Circle Activity (messages sent) | Retention |
| Mentor Response Rate | Quality |
| Opportunity Click Rate | Feature adoption |
| Retention D30 | Retention |

---

## 7. Technical Requirements

### 7.1 Platform
- Web-first (Responsive)
- Mobile-first design (390px base)
- PWA support (post-MVP)

### 7.2 Tech Stack (Recommended)
- **Frontend:** React + TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Deployment:** Vercel

### 7.3 Performance
- Lighthouse score ≥ 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

---

## 8. Non-Functional Requirements

- Waktu muat halaman < 2 detik
- Support 10.000 concurrent users (MVP)
- Semua data terenkripsi (TLS 1.3)
- Compliance dengan UU Perlindungan Data Pribadi
- Aksesibilitas WCAG 2.1 Level AA
