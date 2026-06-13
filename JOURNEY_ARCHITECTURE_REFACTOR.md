# JOURNEY ARCHITECTURE REFACTOR

**Phase:** 17.1
**Date:** Juni 2026

---

## Files Changed

| # | File | Change |
|---|---|---|
| 1 | `packages/types/src/dream-journey.ts` | Added `slug` to `DreamJourney`, `is_journey_activity` to `DailyActivity` |
| 2 | `apps/web/src/lib/journey-queries.ts` | Added `getJourneyBySlug`, `getMonthActivities`, modified `createJourney` to generate slug |
| 3 | `packages/utils/src/daily-activity-generator.ts` | Added `is_journey_activity: true` to generated activities |
| 4 | `apps/web/src/app/(app)/home/page.tsx` | **Simplified** — only greeting + dream + target + CTA. Removed activities/reflection. |
| 5 | `apps/web/src/app/(app)/journey/page.tsx` | Routes updated from UUID to slug |
| 6 | `apps/web/src/app/(app)/journey/[slug]/page.tsx` | **Renamed from [id]**. Accepts slug (primary) + UUID (backward compat with redirect) |
| 7 | `apps/web/src/app/(app)/profil/page.tsx` | Link updated from UUID to slug |
| 8 | `apps/web/src/features/story/calendar-history.tsx` | **NEW** — Month calendar with day-by-day browsing |
| 9 | `apps/web/src/app/(app)/profil/story/page.tsx` | Added "Kalender" tab with `CalendarHistory` |
| 10 | `supabase/migrations/00014_journey_slug.sql` | **NEW** — Add slug column to dream_journeys |
| 11 | `supabase/migrations/00015_activity_types.sql` | **NEW** — Add is_journey_activity to daily_activities |

---

## Architecture Changes

### Task 1: Home Simplified

**Before:**
```
Home
├── Greeting
├── 🎯 Mimpiku
├── 🔥 Target Saat Ini
├── ✅ Hari Ini (checklist)     ← duplicated from Journey
├── 📝 Refleksi Terakhir         ← duplicated from Journey
```

**After:**
```
Home (DI DIRECTION)
├── 🌅 Selamat Pagi Tara
├── 🎯 Mimpiku (dream + meaning)
├── 🔥 Target Saat Ini (big win + progress)
└── [ Lanjutkan Journey → ]
```

### Task 2: Journey = Workspace

Journey now owns:
- ✅ Aktivitas Hari Ini (checklist)
- 📝 Refleksi (write + view)
- 🏆 Pencapaian (big wins + small wins)
- 📖 Cerita (journey story)
- 📋 Riwayat (timeline)

### Task 3: Human-Friendly URLs

**Before:**
```
/journey/b31743f5-3388-45cd-a31a-3659bc183ce6
```

**After:**
```
/journey/entrepreneur-abc1
/journey/dokter-xyz2
```

- Slug generated from template title + 4-char suffix
- Old UUID URLs still work (auto-redirect to slug)
- `getJourneyBySlug(userId, slug)` for lookups

### Task 4: Activity Types

```
daily_activities
├── is_journey_activity: true   → counts toward journey progress
└── is_journey_activity: false  → general life activity (future use)
```

### Task 5: Relevance Confirmation (Foundation)

Not implemented yet — depends on external activity tracking (future phase).

### Task 6: Calendar History

**Story page → Tab "Kalender":**
```
[Timeline] [Kalender] [Mingguan] [Bulanan]

      Januari 2026
    <           >

 S  S  R  K  J  S  M
             1  2  3
 4  5  6  7  8  9 10
 11 12 13 14 15 16 17
 18 19 20 21 22 23 24
 25 26 27 28 29 30 31

 ● Aktivitas  ✏ Refleksi  🏆 Pencapaian

 ── selected day ──
 18 Januari 2026

 Aktivitas
 ✓ Belajar biologi
 ✓ Baca buku anatomi

 Refleksi
 Hari ini aku belajar...
 Bersyukur: ...

```

---

## Manual Testing

| Test | Result |
|---|---|
| `build` | ✅ Compiled successfully |
| Home — no activities/reflection | ✅ Hanya greeting + dream + target + CTA |
| Home — "Lanjutkan Journey" navigasi | ✅ Mengarah ke `/journey/{slug}` |
| Journey URL dengan slug | ✅ `/journey/entrepreneur-xxxx` |
| Journey URL lama dengan UUID | ✅ Redirect ke slug |
| Journey — aktivitas masih berfungsi | ✅ Tab Hari Ini tetap lengkap |
| Calendar — navigasi bulan | ✅ Prev/Next month |
| Calendar — dot indicators | ✅ ● ✏ 🏆 |
| Calendar — klik hari lihat detail | ✅ Tampil aktivitas + refleksi |
| Story — tab baru "Kalender" | ✅ 4 tab berfungsi |

---

## Known Limitations

1. **Slug generated once** — tidak berubah jika user mengganti title. Cukup untuk MVP.
2. **Calendar hanya lihat** — belum bisa add/delete dari calendar. Hanya review.
3. **Calendar DayDetail query per klik** — tidak di-cache. OK untuk MVP karena jarang diklik.
4. **General activities** (`is_journey_activity: false`) belum ada UI untuk membuatnya — baru foundation schema.
5. **4 tabs di Story** — mungkin terlalu banyak untuk mobile. Pertimbangkan dropdown atau merge Mingguan+Bulanan di masa depan.

---

## Future Considerations

- **Relevance confirmation** (Task 5) bisa dibangun saat ada fitur "tambah aktivitas umum" dari luar journey
- **Calendar bisa diklik ganda** untuk lihat bulan lain atau tahun lain
- **Slug bisa diedit** user di pengaturan journey
