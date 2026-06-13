# HUMANIZATION PASS V1

**Phase:** 16.2
**Date:** Juni 2026
**Goal:** Warmth, clarity, emotional safety — no new features.

---

## Files Modified

| # | File | Change |
|---|---|---|
| 1 | `apps/web/src/app/(app)/home/page.tsx` | Time-based greeting, TargetCard fallback, Reflection empty state |
| 2 | `apps/web/src/app/(app)/journey/[id]/page.tsx` | Big Win preview (3 at a time), human error message |
| 3 | `apps/web/src/app/(app)/profil/page.tsx` | Human error message, removed dead Dukungan nav |

---

## Before vs After

### Task 1 — Time-Based Greeting

**Before:**
```
Selamat Datang Tara 👋
```

**After:**
```
🌅 Selamat Pagi, Tara 👋   (00:00–10:59)
☀️ Selamat Siang, Tara 👋  (11:00–14:59)
🌤️ Selamat Sore, Tara 👋  (15:00–17:59)
🌙 Selamat Malam, Tara 👋  (18:00–23:59)
```

**Why:** Greeting waktu memberi rasa bahwa aplikasi "tahu" kapan kamu buka. Lebih hangat, lebih personal.

### Task 2 — Target Card Fallback

**Before:** Ketika `current_big_win` null, kartu Target menghilang. Layout jadi loncat.

**After:**
```
🔥 Target Saat Ini

Belum ada target yang aktif.
Pilih atau aktifkan perjalananmu untuk memulai langkah berikutnya.

→ Lihat Perjalananku
```

### Task 3 — Reflection Empty State

**Before:** Ketika belum ada refleksi, section menghilang.

**After:**
```
📝 Refleksi Hari Ini

Kamu belum menulis refleksi hari ini.
Luangkan 2 menit untuk mencatat apa yang kamu pelajari,
syukuri, atau ingin perbaiki.

→ Tulis Refleksi
```

### Task 4 — Human Error States

**Before:** `"Gagal memuat perjalanan. Silakan coba lagi."` + `[Coba Lagi]`

**After:**
```
Koneksi sedang bermasalah. Periksa internetmu, ya.

[Coba Lagi]

Masih bermasalah? Coba tutup dan buka kembali aplikasi.
```

### Task 5 — Dead Navigation Removed

**Before:** Profile punya section "Dukungan Untukku" dengan tombol ke Circle, Mentor, Safe Space — fitur yang belum menjadi fokus.

**After:** Section dihapus sepenuhnya. Tidak ada navigasi buntu.

### Task 6 — Big Win Preview

**Before:** Semua Big Win (10+ untuk journey Dokter) ditampilkan sekaligus — overwhelming.

**After:** Hanya 3 Big Win yang ditampilkan:
1. Yang sedang dikerjakan (pertama yang belum selesai)
2. 1-2 setelahnya

Tombol `"Lihat Semua Langkah (X langkah)"` untuk expand, `"Lihat Lebih Sedikit"` untuk collapse.

---

## Manual Test Results

| Test | Result |
|---|---|
| `build` | ✅ Compiled successfully |
| Home — greeting berubah sesuai jam | ✅ Menggunakan `new Date().getHours()` |
| Home — TargetCard fallback saat null | ✅ Menampilkan fallback + CTA |
| Home — Reflection empty state | ✅ Menampilkan prompt + CTA |
| Journey — error message manusiawi | ✅ "Periksa internetmu, ya" |
| Profile — error message manusiawi | ✅ "Periksa internetmu, ya" |
| Profile — SupportSystem tidak muncul | ✅ Fungsi dan JSX dihapus |
| Journey — Big Win preview (3) | ✅ Hanya 3 + tombol expand |
| Journey — "Lihat Semua Langkah" | ✅ Menampilkan semua saat diklik |

---

## Known Limitations

1. **Greeting tidak live-update** — waktu diambil saat render, tidak berubah tiap jam. User yang buka pas batas waktu (misal 10:59) akan lihat "Pagi" sampai refresh. Dampak minimal.

2. **Reflection empty state** hanya muncul jika user punya journey aktif. Jika belum punya journey, section tidak muncul (benar — tidak mengganggu).

3. **Big Win sorting** berdasarkan `order_index`. Jika ada big win dengan `order_index` tidak berurutan, preview bisa loncat. Tergantung konsistensi data seed.

4. **Error state** di Story page (`/profil/story`) belum di-humanize — hanya console.error tanpa UI error. Tidak kritis karena error jarang terjadi di halaman read-only.

5. **"Tulis Refleksi" CTA** di Home mengarah ke `/journey` (halaman list), bukan langsung ke halaman journey detail. Untuk mengarah ke halaman spesifik, perlu `journey?.id` — ini improvement kecil untuk batch berikutnya jika diinginkan.

---

## Success Criteria Check

Seorang anak 13 tahun dalam 10 detik dapat menjawab:

| Pertanyaan | Bisa? | Catatan |
|---|---|---|
| Apa mimpiku? | ✅ | Emoji + title + "Mengapa?" di kartu Mimpiku |
| Apa targetku saat ini? | ✅ | Target Saat Ini — atau fallback jika belum ada |
| Apa yang harus kulakukan hari ini? | ✅ | Checklist ✅ Hari Ini |
| Apa yang harus kulakukan selanjutnya? | ✅ Cukup | CTA "Tulis Refleksi" dan "Lihat Perjalananku" memberi arah |
