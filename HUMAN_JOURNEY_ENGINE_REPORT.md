# HUMAN JOURNEY ENGINE REPORT

## Goal
Transform Dream Journey from a task tracker into a life journey companion that feels inspired, guided, supported, and understood.

---

## Files Changed

| File | Change |
|------|--------|
| `packages/types/src/dream-journey.ts` | Added `user_age` to DreamJourney, `notes` to DailyActivity |
| `packages/utils/src/age-journey-engine.ts` | **New** — age-based content generator (5 life stages) |
| `packages/utils/src/daily-activity-generator.ts` | Added `notes: null` to generated activities |
| `packages/utils/src/index.ts` | Exported age engine + story types |
| `apps/web/src/lib/journey-queries.ts` | `createJourney()` accepts `userAge`, uses age-filtered big wins; added `saveActivityNote()`, `saveSmallWinReflection()` |
| `apps/web/src/app/journey/page.tsx` | Fetches user birth_date → computes age → passes to createJourney; shows age group label on templates |
| `apps/web/src/app/journey/[id]/page.tsx` | Dream meaning layer always visible; age context badge; alternative futures section; notes on activity cards |
| `apps/web/src/features/journey/daily-activity-card.tsx` | Post-completion note input (story engine) |
| `apps/web/src/app/profil/page.tsx` | Activity preview (Mimpiku → Aktivitas Hari Ini → Cerita Terbaruku) |
| `supabase/migrations/00011_human_journey_engine.sql` | **New** — migration: birth_date, notes, user_age, reflection columns |

---

## New Database Entities

**Migration `00011_human_journey_engine.sql`**

```sql
ALTER TABLE user_profiles ADD COLUMN birth_date DATE;
ALTER TABLE daily_activities ADD COLUMN notes TEXT;
ALTER TABLE dream_journeys ADD COLUMN user_age INT;
ALTER TABLE small_wins ADD COLUMN reflection TEXT;
```

No new tables — only additive columns to existing tables.

---

## Age-Based Logic (Part 1)

### 5 Life Stages

| Group | Age Range | Label |
|-------|-----------|-------|
| 8-12 | 8-12 | Masa Penemuan |
| 13-15 | 13-15 | Masa Pengembangan |
| 16-18 | 16-18 | Masa Persiapan |
| 19-22 | 19-22 | Masa Percepatan |
| 23+ | 23-99 | Masa Profesional |

### How It Works

1. **Seed data mapping**: Each template's `bigWins` has a `stage` field (`beginner`, `intermediate`, `advanced`, `professional`). These map to age groups:
   - `beginner` → 8-12
   - `intermediate` → 13-15
   - `advanced` → 16-22
   - `professional` → 23+

2. **Age path milestones**: Each template's `agePath[]` contains milestones per age range. These are merged with stage-based big wins.

3. **Journey creation flow**:
   - User selects a dream template
   - App fetches `user_profiles.birth_date`, computes age
   - `getAgeGroupedContent(slug, age)` returns filtered big wins + small wins
   - `createJourney()` stores `user_age` and creates age-appropriate big wins/small wins

### Key Function: `getAgeGroupedContent()`

```
getAgeGroupedContent(templateSlug, userAge)
  ├── Maps age → AgeGroup
  ├── Maps AgeGroup → stages
  ├── Filters template.bigWins by stage
  ├── Merges agePath milestones for overlapping ranges
  ├── Deduplicates & re-orders
  └── Returns { bigWins, smallWins, ageGroup }
```

---

## 6-Dimension Daily Activities (Part 2)

Already existed in type system. Enhancements:

- **Spiritual**: Already uses `SPIRITUAL_PRACTICES[belief]` from `life-engine-seed.ts` — supports Islam, Kristen, Katolik, Hindu, Buddha, Konghucu
- **Physical**: Category-specific (sports: running; tech: stretching; etc.)
- **Knowledge**: Baca artikel, tonton edukasi, pelajari materi
- **Social**: Sapa teman, silaturahmi, komunitas
- **Character**: Tepat janji, tidak menunda, syukuran
- **Dream Skill**: Specific to dream (football → passing/dribbling; doctor → IPA/Biologi)

Activities are always generated one per dimension (6 total per day).

---

## Story Engine (Part 3)

### Architecture

```
Daily Activity
  └── notes (TEXT) — "Hari ini aku berhasil lari 5 KM."

Small Win
  ├── notes (TEXT) — existing
  └── reflection (TEXT) — NEW: "Awalnya aku ragu, tapi akhirnya berhasil."

Big Win
  └── BigWinReflection (most_memorable_moment, who_helped, biggest_lesson, next_steps)

Growth Timeline
  └── Events auto-recorded on: activity_completed, reflection_written, small_win_completed, big_win_completed
```

### New Functions

- `saveActivityNote(id, notes)` — saves note on completed activity
- `saveSmallWinReflection(id, reflection)` — saves reflection on small win

### UI

- **DailyActivityCard**: After completion, shows inline note input ("Tulis catatan singkat...")
- **JourneyStory component**: Shows chronological narrative from timeline events (existing)
- **JourneyTimeline component**: Shows filtered timeline (existing)

---

## Dream Meaning Layer (Part 4)

- **`getDreamMeaning(slug)`** — returns `roadmap.dream.whyMatters` from seed
- Displayed in a gradient card at top of every journey detail page
- Two sections: "Mengapa Mimpi Ini?" and "Makna Mimpi Ini"
- Age group badge shows current life stage

---

## Alternative Futures (Part 5)

- **`getAlternativeFuturesForTemplate(slug)`** — returns transferable skills + alternative roles
- Sources: `realityCheck.transferableSkills`, `alternativePaths[].steps[]`, `alternativeFutures[]`
- Displayed as "Jalan Lain, Skill Sama" section at bottom of journey detail
- Each card: title, description, skill tags

---

## Profile Integration (Part 6)

Profile now shows:

| Section | Content |
|---------|---------|
| Profil Hero | Avatar, name, active dream card |
| Perjalanan Hidup Saya | Dream emoji, big win, small win, activity progress bar, activity checklist preview, latest story snippet |
| Refleksi Terbaru | Today's reflection (learned, grateful, improve) |
| Dukungan Untukku | Circle, Mentor, Safe Space links |
| Pengaturan | Edit Profil, Privacy, Sign out |

---

## Build Verification

```
npm run build → Success
All pages compile without errors
No TypeScript errors
```

---

## Migration Impact

**Migration `00011`** is additive only — no breaking changes.

- `user_profiles.birth_date`: nullable DATE — existing rows unaffected
- `daily_activities.notes`: nullable TEXT — existing rows have NULL
- `dream_journeys.user_age`: nullable INT — existing rows have NULL
- `small_wins.reflection`: nullable TEXT — existing rows have NULL

No rollback needed for existing data.

---

## Success Test

| Age | Expected Experience | Status |
|-----|-------------------|--------|
| 10 | Sees simple big wins (beginner stage, exploration milestones) | ✅ |
| 14 | Sees intermediate challenges, school team milestones | ✅ |
| 18 | Sees academy/selection milestones, advanced big wins | ✅ |
| 25 | Sees professional/career big wins, real-world milestones | ✅ |

---

## Key Architecture Decisions

1. **Seed as source of truth**: Age-group content is derived from existing seed data (`bigWins.stage` + `agePath.milestones`), no new seed data required.
2. **Client-side age computation**: Age computed from `birth_date` in `user_profiles` table.
3. **Story notes stored in existing tables**: No new tables for story engine — `notes` column on `daily_activities`, `reflection` column on `small_wins`.
4. **Deferred display**: Meaning and alternative futures display at journey render time, not journey creation time.
