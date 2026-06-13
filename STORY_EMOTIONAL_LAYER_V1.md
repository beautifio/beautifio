# STORY EMOTIONAL LAYER V1

**Phase:** 17
**Date:** Juni 2026
**Goal:** Transform Story from database log into personal journal.

---

## Files Modified

| # | File | Change |
|---|---|---|
| 1 | `apps/web/src/lib/journey-queries.ts` | Expanded `StoryEntry` type + reflection query to include `grateful`, `improve` |
| 2 | `apps/web/src/features/story/story-timeline.tsx` | Reflections rendered as journal narrative. Non-reflection entries grouped as timeline. |
| 3 | `apps/web/src/app/(app)/profil/story/page.tsx` | Added WeekSummary & MonthSummary cards at top of timeline tab |

---

## Before vs After

### Feature 1 — Human Story Entries

**Before (database log):**
```
18 Juni
📝 "Aku belajar disiplin"
```

**After (journal entry):**
```
18 Juni 2026

Refleksi

Aku belajar disiplin.

Aku bersyukur ibu terus mengingatkanku.

Besok aku ingin bangun lebih pagi.

Suasana hati: bersemangat
```

Keuntungan:
- Tidak ada data baru — hanya menyajikan ulang `learned` / `grateful` / `improve` dalam bentuk narasi
- Frasa tetap: "Aku bersyukur..." + "Besok aku ingin..." biar konsisten
- Kalau user hanya mengisi `learned`, hanya baris itu yang tampil — tidak memaksa

### Feature 2 — Week Summary Card

**Before:** Tidak ada.

**After** (muncul di atas timeline):
```
☀️ Minggu Ini

⭐ 1 big win   ✓ 2 small win   📝 3 refleksi

Fokus minggu depan: bangun lebih pagi
```

Hanya muncul jika ada entri dalam 7 hari terakhir.

### Feature 3 — Month Summary Card

**Before:** Tidak ada.

**After** (muncul di atas timeline, di bawah week card):
```
📅 Bulan Ini

🎉 1 big win selesai
✅ 4 small win selesai
📝 10 refleksi ditulis

Hal yang kamu syukuri:
"Keluarga yang selalu mendukung"
```

Hanya muncul jika ada entri dalam 30 hari terakhir.

### Feature 4 — Timeline Grouping

**Before:** Entry per item (beberapa baris terpisah untuk hari yang sama).

**After:** Grouped by date — tanggal muncul sekali, semua entry di bawahnya:
```
18 Juni 2026

✓ Menyelesaikan aktivitas

Refleksi
[isi jurnal]

🎯 Menyelesaikan small win
```

---

## Data Flow

```
Supabase DB
  └─ getStoryEntries() → StoryEntry[]
      ├─ dream_journeys.started_at (dream_chosen)
      ├─ big_wins.completed_at (big_win)
      ├─ small_wins.completed_at (small_win)
      ├─ daily_reflections.date (reflection)
      │    ├─ learned
      │    ├─ grateful (baru)
      │    ├─ improve (baru)
      │    └─ mood
      ├─ weekly_reviews.week_start (review_weekly)
      └─ monthly_reviews.month (review_monthly)
           └─ StoryPage
                ├─ WeekSummary (filter daysAgo < 7)
                ├─ MonthSummary (filter daysAgo < 30)
                └─ StoryTimeline
                     ├─ ReflectionEntry (journal narrative)
                     └─ TimelineEntry (other types)
```

---

## Manual Test Results

| Test | Result |
|---|---|
| `build` | ✅ Compiled successfully |
| Timeline — reflection dengan `learned` + `grateful` + `improve` | ✅ Ditampilkan sebagai jurnal 3 paragraf |
| Timeline — reflection dengan `learned` saja | ✅ Hanya 1 paragraf, tanpa paksaan |
| Timeline — non-reflection entries | ✅ Tetap icon + title (dream_chosen, big_win, dll) |
| WeekSummary — ada entri 7 hari | ✅ Card muncul dengan hitungan |
| WeekSummary — tidak ada entri | ✅ Card tidak muncul (return null) |
| MonthSummary — ada entri 30 hari | ✅ Card muncul dengan hitungan |
| MonthSummary — tidak ada entri | ✅ Card tidak muncul |
| WeekSummary + MonthSummary barengan | ✅ Keduanya muncul stacked |
| Tab "Mingguan" → WeeklyReviewSection | ✅ Tidak berubah |
| Tab "Bulanan" → MonthlyReviewSection | ✅ Tidak berubah |

---

## Known Limitations

1. **WeekSummary & MonthSummary hanya hitung dari `entries` yang sudah di-load** — karena `getStoryEntries` hanya memanggil data user, akurat.

2. **Frasa bahasa Indonesia hardcoded** — "Aku bersyukur" + "Besok aku ingin" tidak bisa diganti tanpa edit kode. OK untuk MVP.

3. **Grateful & Improve bisa lowercase** — karena digabung dengan frasa tetap, hasilnya bisa "Aku bersyukur keluarga yang selalu mendukung." (kalimat user tidak diawali huruf kapital). Saya panggil `.toLowerCase()` pada `grateful` dan `improve` untuk menjaga konsistensi.

4. **Mood masih ditampilkan** — tidak diubah. Dipertahankan sebagai metadata.

5. **Tanggal di jurnal pakai format panjang** (18 Juni 2026) — bukan "Hari ini" / "Kemarin" — biar terasa seperti diary yang bisa dibaca kapan saja.

---

## Success Criteria

Seorang user kembali setelah 90 hari:

| Sebelum | Sesudah |
|---|---|
| "18 Jun — 📝 Aku belajar disiplin" | "18 Juni 2026 — Aku belajar disiplin. Aku bersyukur ibu terus mengingatkanku. Besok aku ingin bangun lebih pagi." |
| Rasa: *saya membaca database* | Rasa: *saya membaca jurnal saya* |
| Tidak ada ringkasan | Ringkasan minggu + bulan di atas timeline |
| Entry individual | Group by date + narasi alami |
