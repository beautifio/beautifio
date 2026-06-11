# DREAM JOURNEY SYSTEM — Core Refactor Plan

> **Phase:** X  
> **Goal:** Replace 7 fragmented systems with one unified Dream Journey  
> **Status:** Design / Pre-Implementation  
> **Date:** June 2026  

---

## Systems Being Replaced

| System | Current Location | Fate |
|--------|-----------------|------|
| Roadmap (V3) | `features/roadmap/` (18 components) | Absorbed into Dream Journey |
| Journal | `features/journal/` (4 components) + DB tables | Absorbed into Journey Reflections |
| Daily Wins | localStorage + Roadmap detail tab | Absorbed into Daily Activities |
| Life Engine | `packages/utils/src/life-engine.ts` (939 lines) | Data migrated into Growth History |
| Growth Tracker | `RoadmapV3` derivative component | Absorbed into Journey timeline |
| Reflections | Roadmap Reflections tab + localStorage | Absorbed into Journey Reflection system |
| Life Capital | localStorage + Life Engine profile | Replaced by activity-based growth history |

**Result:** 7 systems → **1 system** called Dream Journey.

---

## Part 1 — DATA MODEL

### New Schema: 9 tables replace ~10+ tables + localStorage

```
dream_journeys
big_wins
small_wins
daily_activities
daily_reflections
small_win_reflections
big_win_reflections
spiritual_preferences
dream_templates
```

### Table 1: `dream_journeys` — One per user, one active at a time

```sql
create table dream_journeys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_slug text not null,                      -- references dream_templates
  title         text not null,                      -- "Pemain Sepak Bola Profesional"
  emoji         text,                                -- "⚽"
  category      text,                                -- sports / health / tech / creative / business
  status        text not null default 'active'       -- active | completed | pivoted
                  check (status in ('active', 'completed', 'pivoted')),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index: user_id + status for "get active journey"
create index idx_dream_journeys_user_active
  on dream_journeys (user_id) where status = 'active';
```

**Replaces:** `user_goals` table partially, localStorage `beautifio_life_profile` partially.

### Table 2: `previous_dreams` — Pivot/journal of past dreams

```sql
create table previous_dreams (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  dream_journey_id    uuid references dream_journeys(id) on delete set null,
  title               text not null,
  emoji               text,
  category            text,
  pivot_reason        text,
  transferable_skills text[],
  lessons_learned     text,
  alternative_path    text,                          -- what user chose instead
  started_at          timestamptz not null,
  ended_at            timestamptz not null,
  created_at          timestamptz not null default now()
);
```

### Table 3: `big_wins` — Major milestones in a journey

```sql
create table big_wins (
  id               uuid primary key default gen_random_uuid(),
  journey_id       uuid not null references dream_journeys(id) on delete cascade,
  title            text not null,
  description      text,
  why_it_matters   text,
  alternative_path text,                -- what to do if this path fails
  order_index      int not null default 0,
  is_completed     boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_big_wins_journey on big_wins (journey_id, order_index);
```

**Replaces:** `milestones` table, `journal_milestones` table, `roadmap_template_milestones` table, RoadmapV3 `bigWins` seed data.

### Table 4: `small_wins` — Sub-milestones within a big win

```sql
create table small_wins (
  id             uuid primary key default gen_random_uuid(),
  big_win_id     uuid not null references big_wins(id) on delete cascade,
  title          text not null,
  description    text,
  is_completed   boolean not null default false,
  completed_at   timestamptz,
  notes          text,
  reflection     text,
  evidence_url   text,                  -- link to photo/screenshot/document
  order_index    int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_small_wins_big_win on small_wins (big_win_id, order_index);
```

**Replaces:** RoadmapV3 `smallWins` (skills with 4 levels), `journal_entries` partially.

### Table 5: `daily_activities` — Today's tasks from 6 dimensions

```sql
create table daily_activities (
  id              uuid primary key default gen_random_uuid(),
  journey_id      uuid references dream_journeys(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  description     text,
  dimension       text not null           -- spiritual | physical | knowledge | social | character | dream_skill
                    check (dimension in ('spiritual', 'physical', 'knowledge', 'social', 'character', 'dream_skill')),
  is_completed    boolean not null default false,
  completed_at    timestamptz,
  activity_date   date not null default current_date,
  is_custom       boolean not null default false,  -- user-created vs system-generated
  created_at      timestamptz not null default now()
);

create index idx_daily_activities_user_date
  on daily_activities (user_id, activity_date);

create index idx_daily_activities_journey_date
  on daily_activities (journey_id, activity_date);
```

**Replaces:** localStorage `beautifio_roadmap_dailywins_{slug}*` keys, RoadmapV3 `dailyWins` seed data.

### Table 6: `daily_reflections` — End-of-day reflection, one per day per user

```sql
create table daily_reflections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  journey_id   uuid references dream_journeys(id) on delete cascade,
  date         date not null default current_date,
  learned      text,                    -- "Apa yang saya pelajari hari ini?"
  grateful     text,                    -- "Apa yang saya syukuri hari ini?"
  improve      text,                    -- "Apa yang akan saya perbaiki besok?"
  mood         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, date)
);

create index idx_daily_reflections_journey on daily_reflections (journey_id, date);
```

**Replaces:** `journal_entries` table partially, localStorage `beautifio_roadmap_reflections`, `journal_entries` daily entries.

### Table 7: `small_win_reflections` — Reflection on completing a small win

```sql
create table small_win_reflections (
  id           uuid primary key default gen_random_uuid(),
  small_win_id uuid not null references small_wins(id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now()
);
```

### Table 8: `big_win_reflections` — Reflection on completing a big win

```sql
create table big_win_reflections (
  id                   uuid primary key default gen_random_uuid(),
  big_win_id           uuid not null references big_wins(id) on delete cascade,
  most_memorable_moment text,
  who_helped            text,
  biggest_lesson        text,
  next_steps            text,
  created_at           timestamptz not null default now()
);
```

### Table 9: `spiritual_preferences` — User's belief configuration

```sql
create table spiritual_preferences (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  belief          text not null     -- islam | kristen | katholik | hindu | buddha | konghucu | agnostic | other
                    check (belief in ('islam', 'kristen', 'katholik', 'hindu', 'buddha', 'konghucu', 'agnostic', 'other')),
  selected_practices text[],        -- subset of available practices they want to track
  custom_practices   text[],        -- user-created practices
  updated_at      timestamptz not null default now()
);
```

**Replaces:** Life Engine's `SPIRITUAL_PRACTICES` seed + Life Engine profile spiritual preference.

### Table 10: `dream_templates` — Pre-built journey templates (seed data)

```sql
create table dream_templates (
  slug          text primary key,      -- "football-player"
  title         text not null,
  emoji         text,
  color         text,
  category      text not null,
  duration      text,                   -- "8-15 tahun"
  description   text,
  why_matters   text,
  career_options text[],
  success_examples jsonb,              -- [{name, role, story}]
  big_wins      jsonb not null,        -- [{title, description, why_it_matters, alternative_path, order}]
  small_wins    jsonb not null,        -- [{big_win_order, title, description, order}]
  default_daily jsonb,                 -- default set of 6 daily activities {spiritual, physical, knowledge, social, character, dream_skill}
  alternative_futures jsonb,           -- [{title, description}] for failure system
  created_at    timestamptz not null default now()
);
```

**Stores what is currently in:** `roadmap-v3-seed.ts`, `roadmap-life-pillars-seed.ts`, `roadmap-seed.ts`.

---

### Data Model Map: Current → Dream Journey

| Current (7 systems) | Dream Journey (1 system) |
|---------------------|-------------------------|
| RoadmapV3 dream → title, description, why matters, career possibilities, success examples | `dream_templates` + `dream_journeys` |
| RoadmapV3 bigWins | `big_wins` (seeded from `dream_templates.big_wins`) |
| RoadmapV3 smallWins / skills | `small_wins` (4 levels → checklist) |
| RoadmapV3 dailyWins / daily habits | `daily_activities` (dimension: dream_skill) |
| RoadmapV3 lifePillars habits | `daily_activities` (dimensions: spiritual, physical, knowledge, social, character) |
| RoadmapV3 blueprint | Content absorbed into big_win descriptions + why_it_matters |
| RoadmapV3 masterclass / agePath / timeline | Content absorbed into big_win order + alternative_path |
| RoadmapV3 alternativeFutures | Alternative futures stored in `dream_templates.alternative_futures`, surfaced on failure |
| Life Engine life capital (6 dimensions) | Replaced by daily_activities completion history (6 dimensions) |
| Life Engine growth zone | Removed (too abstract for 12-year-old) |
| Life Engine life level | Removed (too gamey) |
| Life Engine capital decay | Removed (never punish) |
| Life Engine unlock system | Removed (everything accessible) |
| Life Engine pivot | `previous_dreams` table |
| Journal entries | `daily_reflections` (general) + `small_win_reflections` + `big_win_reflections` |
| Journal milestones | `big_wins` |
| Journal followers / reactions | Removed (social layer deferred) |
| Growth Tracker stats | Derived from SQL aggregation of activity/win completion |
| Daily Wins (home + roadmap) | `daily_activities` with active journey filter |

---

## Part 2 — UI ARCHITECTURE

### Routes: 7 removed, 2 renamed, 3 new

| Current Route | Fate | Dream Journey Route |
|---------------|------|--------------------|
| `/roadmap` | Kept (dream marketplace) | `/roadmap` — browse dream templates |
| `/roadmap/[slug]` | Replaced | `/journey/[id]` — active journey dashboard |
| `/life` | Removed | Absorbed into `/journey/[id]` |
| `/life/start` | Removed | Absorbed into dream selection flow |
| `/jurnal` | Removed | Absorbed into `/journey/[id]/reflections` |
| `/jurnal/[slug]` | Removed | Absorbed |
| `/jurnal/buat` | Removed | No longer needed (one journal per journey) |
| `/jurnal/[slug]/tulis` | Removed | Replaced by inline daily reflection modal |
| `/home` | Kept (simplified) | Shows today's activities + current journey card |
| `/profil` | Kept (simplified) | Shows journey timeline, current big/small win |
| `/onboarding` | Kept (simplified) | Dream selection only, no multi-step |

**New routes:**

| Route | Purpose |
|-------|---------|
| `/journey/[id]` | Active journey dashboard: today's activities, progress, reflections |
| `/journey/[id]/big-wins` | Big wins list view |
| `/journey/[id]/reflections` | Reflection history |
| `/journey/new` | Start a new dream journey (replaces discovery + life/start) |

### Component Map: Current → Dream Journey

| Current Component | Fate | Dream Journey Component |
|-------------------|------|------------------------|
| `RoadmapCard.tsx` | Rename | `DreamTemplateCard.tsx` |
| `RoadmapV3DreamSection.tsx` | Absorbed | `JourneyHeader.tsx` |
| `RoadmapV3DailyWinsSection.tsx` | Replaced | `DailyActivityList.tsx` |
| `RoadmapV3SmallWinsSection.tsx` | Replaced | `SmallWinChecklist.tsx` |
| `RoadmapV3BigWinsSection.tsx` | Replaced | `BigWinTimeline.tsx` |
| `RoadmapV3BlueprintSection.tsx` | Removed | Content merged into Big Win descriptions |
| `RoadmapV3MasterclassSection.tsx` | Removed | Content merged into Big Win alternative_path |
| `RoadmapV3LifePillarsSection.tsx` | Replaced | Daily activities dimension filter |
| `RoadmapV3AlternativeFuturesSection.tsx` | Removed | Shown on failure only |
| `RoadmapV3LearningVault.tsx` | Removed | Post-MVP |
| `RoadmapV3DailyReflections.tsx` | Replaced | `DailyReflectionModal.tsx` |
| `MilestoneTimeline.tsx` | Replaced | `JourneyTimeline.tsx` |
| `GrowthReflectionSection.tsx` | Removed | Absorbed into journey dashboard |
| `GrowthTracker.tsx` | Removed | Replaced by derived stats |
| `StageAdaptedContent.tsx` | Removed | No more life stages |
| `JournalCard.tsx` | Removed | Replaced by reflection history |
| `JournalEntryForm.tsx` | Replaced | `DailyReflectionModal.tsx` |
| `JournalMilestoneList.tsx` | Removed | Absorbed into BigWinTimeline |
| `JournalTimeline.tsx` | Removed | Absorbed into JourneyTimeline |
| `LifeCoachPanel.tsx` | Keep (simplified) | Shows today's focus + encouragement |
| `EcosystemSection.tsx` | Keep (moved) | Shown on journey detail |
| `SafeSpaceModal.tsx` | Keep | Unchanged |
| `VoucherClaimModal.tsx` | Keep | Unchanged |

### New Component Tree

```
journey/
├── JourneyPage.tsx              # /journey/[id] — main dashboard
├── JourneyHeader.tsx            # Dream title, emoji, current status, progress ring
├── DailyActivityList.tsx        # 6 daily tasks (one per dimension), check-off
├── DailyActivityCard.tsx        # Single activity, dimension badge, check button
├── BigWinTimeline.tsx           # Vertical timeline of big wins
├── BigWinCard.tsx               # Single big win with progress to small wins
├── SmallWinChecklist.tsx        # Checkbox list within a big win
├── JourneyTimeline.tsx          # Full journey history (big wins + small wins + days)
├── DailyReflectionModal.tsx     # 3-question reflection: learned, grateful, improve
├── SmallWinReflectionModal.tsx  # Reflection on completing a small win
├── BigWinReflectionModal.tsx    # 4-question reflection on big win completion
├── FailureGuidance.tsx          # Shows when user marks a big win as failed
├── AlternativeFuturesCard.tsx   # Shown on failure/pivot: what else you can do
├── PivotFlow.tsx                # "Change Dream" flow with transferable skills
├── JourneyCard.tsx              # Summary card for home page / profile
└── JourneyTimelineFeed.tsx      # Chronological mix of activities + wins + reflections
```

### New Page Compositions

**`/journey/[id]` (Active Journey Dashboard):**

```
┌─────────────────────────────────┐
│ JourneyHeader                   │
│  ⚽ Pemain Sepak Bola            │
│  🏆 Big Win: Masuk Akademi      │
│  🎯 Small Win: Latihan 3x/minggu│
│  [Progress Ring 40%]            │
├─────────────────────────────────┤
│ "Today's Activities"            │
│ ┌─────────────────────────────┐ │
│ │ ☐ Spiritual — Sholat 5 waktu│ │
│ │ ☐ Physical — Jalan 10 menit │ │
│ │ ☐ Knowledge — Baca artikel  │ │
│ │ ☐ Social — Chat di circle   │ │
│ │ ☐ Character — Selesaikan    │ │
│ │ ☐ Dream Skill — Latihan     │ │
│ │   passing                   │ │
│ └─────────────────────────────┘ │
│ [Tulis Refleksi Hari Ini]       │
├─────────────────────────────────┤
│ BigWinTimeline                  │
│ ┌─ ✅ Masuk SSB ─────────────┐ │
│ │  🗸 Latihan rutin           │ │
│ │  🗸 Ikut seleksi            │ │
│ └─────────────────────────────┘ │
│ ┌─ 🔄 Masuk Akademi (active) ─┐│
│ │  ☐ Latihan 3x/minggu        ││
│ │  ☐ Nilai fisik 80+          ││
│ │  ☐ Konsisten stretching     ││
│ └─────────────────────────────┘│
│ ┌─ ⏳ Debut Profesional ──────┐│
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ [Ganti Mimpi] [Lihat Semua      │
│  Aktivitas] [Riwayat Refleksi]  │
└─────────────────────────────────┘
```

**`/home` (Simplified):**

```
┌─────────────────────────────────┐
│ Selamat Pagi, Adi!              │
│  🔥 Streak: 5 hari              │
├─────────────────────────────────┤
│ Current Journey                 │
│ ┌─────────────────────────────┐ │
│ │ ⚽ Pemain Sepak Bola         │ │
│ │ 🏆 Big Win: Masuk Akademi   │ │
│ │ 🎯 Small Win: Latihan hari  │ │
│ │   ini ☐ ☐ ☐                 │ │
│ │ [Lihat Journey →]           │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Today's Activities (3/6 done)   │
│ ☑ Spiritual  ☑ Physical  ☐ K...│
├─────────────────────────────────┤
│ Aktivitas Terbaru               │
│ • Adi menyelesaikan Latihan     │
│ • Adi menulis refleksi          │
└─────────────────────────────────┘
```

**`/profil` (Simplified — "My Journey"):**

```
┌─────────────────────────────────┐
│ Profil Adi                      │
│ ⚽ Pemain Sepak Bola            │
│ 🔥 Streak 5 hari                │
├─────────────────────────────────┤
│ Journey Timeline                │
│ [Visual timeline of big wins,   │
│  small wins, and daily streaks] │
├─────────────────────────────────┤
│ Recent Reflections              │
│ • Hari ini: "Belajar passing..."│
│ • Kemarin: "Latihan fisik..."   │
├─────────────────────────────────┤
│ Previous Dreams                 │
│ • 🎵 Musisi (pivot: 2025)      │
└─────────────────────────────────┘
```

---

## Part 3 — DAILY ACTIVITY GENERATION ENGINE

This replaces Life Engine's `generateDailyWins()` and `CAPITAL_SOURCES`.

### Algorithm

```
For each day, generate 6 activities:

1. SPIRITUAL
   Source: spiritual_preferences
   Template: [practice from user's selected practices]
   Fallback: "Merenung / Refleksi diri"

2. PHYSICAL
   Source: dream_templates.default_daily (generic)
   Template: "Jalan 10 menit" / "Stretching" / "Minum air putih"

3. KNOWLEDGE
   Source: dream_templates.default_daily + content system
   Template: "Baca artikel tentang [dream]" / "Tonton video edukasi"

4. SOCIAL
   Source: generic
   Template: "Sapa teman" / "Chat di circle" / "Bantu seseorang"

5. CHARACTER
   Source: generic
   Template: "Selesaikan satu tugas" / "Tulis satu hal yang disyukuri"

6. DREAM SKILL
   Source: dream_templates.default_daily.dream_skill
   Template: specific to dream (e.g., "Latihan passing 15 menit")
```

### Implementation

```typescript
// packages/utils/src/daily-activity-generator.ts

function generateDailyActivities(
  journey: DreamJourney,
  spiritualPref: SpiritualPreferences,
  date: Date
): DailyActivity[]

function generateSpiritualActivity(pref: SpiritualPreferences): DailyActivity
function generatePhysicalActivity(): DailyActivity
function generateKnowledgeActivity(journey: DreamJourney): DailyActivity
function generateSocialActivity(): DailyActivity
function generateCharacterActivity(): DailyActivity
function generateDreamSkillActivity(journey: DreamJourney): DailyActivity
```

### Completion Tracking

When a user checks off an activity:

```typescript
function completeActivity(activityId: string): void {
  // 1. Mark activity as completed
  // 2. Record completion in growth_history (derived)
  // 3. Update journey streak
  // 4. Check if small_win conditions met
  // 5. If all small wins in big win complete → prompt big win reflection
}
```

**Removed:** Life Engine's 25 `CAPITAL_SOURCES`, `applyCapitalDecay()`, `detectGrowthZone()`, `getLifeLevel()`, `UNLOCK_REQUIREMENTS`, `CAPITAL_MISSIONS`, `CapitalBalanceTip`.

---

## Part 4 — REFLECTION SYSTEM

### Daily Reflection Modal

Triggered: End of day or when user checks off last activity.

```typescript
// 3 questions, 200 characters each
interface DailyReflectionInput {
  learned: string;   // "Apa yang saya pelajari hari ini?"
  grateful: string;  // "Apa yang saya syukuri hari ini?"
  improve: string;   // "Apa yang akan saya perbaiki besok?"
  mood: string;      // optional mood emoji
}
```

**Replaces:** `journal_entries` daily entries, `RoadmapV3DailyReflections`.

### Small Win Reflection

Triggered: When all items in a small win are completed.

```typescript
interface SmallWinReflectionInput {
  content: string;  // Free text: what did this mean to you?
}
```

### Big Win Reflection

Triggered: When all small wins in a big win are completed.

```typescript
interface BigWinReflectionInput {
  most_memorable_moment: string;
  who_helped: string;
  biggest_lesson: string;
  next_steps: string;
}
```

---

## Part 5 — FAILURE SYSTEM

Never punish. Never shame.

### Trigger

User marks a big win or small win as "tidak tercapai" (not achieved).

### Response

```typescript
function handleFailure(bigWin: BigWin, journey: DreamJourney): FailureResponse {
  return {
    lesson_learned: "Kamu sudah belajar [skills from completed items]",
    skills_gained: deriveCompletedSkills(bigWin),
    alternative_futures: getAlternativeFutures(journey.templateSlug),
    encouragement: generateEncouragement(journey),
    // Option to pivot
    pivot_options: getPivotOptions(journey)
  };
}
```

### What user sees

```
┌─────────────────────────────────┐
│ 😔 Tidak apa-apa.               │
│                                 │
│ Kamu sudah berusaha dan itu     │
│ sudah luar biasa.               │
│                                 │
│ Skills yang kamu dapat:         │
│ ✅ Disiplin                     │
│ ✅ Kerja tim                    │
│ ✅ Leadership                   │
│                                 │
│ Alternatif masa depan:          │
│ 🥅 Pelatih                     │
│ 📊 Analis Olahraga             │
│ 📸 Fotografer Olahraga         │
│ 👔 Manajer Tim                 │
│                                 │
│ [Ganti Mimpi] [Tetap di Jalur]  │
└─────────────────────────────────┘
```

---

## Part 6 — MIGRATION STRATEGY

### Phase A: Ship new schema alongside existing (no data loss)

```
Week 1:
├── Create 10 new Dream Journey tables (empty)
├── Create dream_templates seed data from existing roadmaps
└── New code writes to BOTH old and new systems (dual-write)
```

### Phase B: Seed dream_templates from existing data

```typescript
// packages/utils/src/migrations/seed-dream-templates.ts

function migrateRoadmapV3ToDreamTemplate(slug: string): DreamTemplate {
  const roadmap = ROADMAP_V3_SEED[slug];
  return {
    slug,
    title: roadmap.title,
    emoji: roadmap.emoji,
    category: roadmap.category,
    duration: roadmap.dream.estimatedJourney,
    description: roadmap.dream.description,
    why_matters: roadmap.dream.whyMatters,
    career_options: roadmap.dream.careerPossibilities,
    success_examples: roadmap.dream.successExamples,
    big_wins: roadmap.bigWins.map(mapBigWin),
    small_wins: mapSmallWinsFromSkills(roadmap.smallWins, roadmap.bigWins),
    default_daily: {
      spiritual: null,  // user-configurable
      physical: ["Jalan 10 menit", "Minum air putih"],
      knowledge: ["Baca artikel tentang " + roadmap.title],
      social: ["Sapa teman", "Chat di circle"],
      character: ["Selesaikan satu tugas hari ini"],
      dream_skill: extractDreamSkills(roadmap.dailyWins)
    },
    alternative_futures: roadmap.alternativeFutures
  };
}
```

### Phase C: Migrate existing user data

```typescript
// Migration script: for each user with existing data:
//
// 1. If has roadmap daily wins in localStorage → create dream_journey
//    + daily_activities for each completed habit
//
// 2. If has life profile in localStorage → 
//    - Extract dream → create dream_journey
//    - Ignore capital numbers (they don't map cleanly)
//    - Save spiritual preference → spiritual_preferences
//
// 3. If has journal entries in Supabase →
//    Create daily_reflections from journal entries
//    (map title + content → learned + grateful)
//
// 4. If has milestones in Supabase →
//    Create big_wins + small_wins from milestones
```

### Phase D: Cutover

```
Week 4:
├── Route redirects: /roadmap/[slug] → /journey/[id]
├── /life redirects to /journey/[id]
├── /jurnal redirects to /journey/[id]/reflections
├── Old tables kept but no longer written to
└── localStorage keys no longer read
```

### Phase E: Cleanup

```
Week 8:
├── Drop old tables: journals, journal_entries, journal_milestones,
│   journal_followers, journal_reactions, milestones, user_goals (partially)
├── Remove localStorage read/write code
├── Remove old components (RoadmapV3*, Journal*, MilestoneTimeline)
└── Delete: life-engine.ts, roadmap-v3-seed.ts, roadmap-seed.ts,
    journal-seed.ts, roadmap-life-pillars-seed.ts
```

---

## Part 7 — REMOVALS: What Stops Existing

### Files to delete (post-migration)

| File | Lines | Reason |
|------|-------|--------|
| `packages/utils/src/life-engine.ts` | 939 | Entire engine replaced by daily activity generator |
| `packages/utils/src/roadmap-v3-seed.ts` | ~2000 | Replaced by dream_templates seed |
| `packages/utils/src/roadmap-life-pillars-seed.ts` | ~500 | Absorbed into dream_templates |
| `packages/utils/src/roadmap-seed.ts` | ~300 | V1 milestones no longer needed |
| `packages/utils/src/journal-seed.ts` | ~400 | Journal system replaced |
| `packages/utils/src/ai-coach.ts` (partial) | ~725 | Coach functions simplified (keep: generateDailyCoachFocus, generateMotivation; remove: analyzeZone, getCapitalAdvice, generateWeeklyReport, generateFailureCoach, analyzeReflection) |
| `apps/web/src/features/roadmap/RoadmapV3*.tsx` (12 files) | ~2000 | Replaced by journey components |
| `apps/web/src/features/journal/*.tsx` (4 files) | ~500 | Replaced by reflection modals |
| `apps/web/src/features/roadmap/GrowthTracker.tsx` | ~200 | Absorbed |
| `apps/web/src/features/roadmap/MilestoneTimeline.tsx` | ~150 | Replaced by JourneyTimeline |
| `apps/web/src/features/roadmap/RoadmapRecommendations.tsx` | ~100 | Post-MVP |
| `apps/web/src/app/life/*` (2 pages) | route | Absorbed |
| `apps/web/src/app/jurnal/*` (4 routes) | route | Absorbed |
| `apps/web/src/app/onboarding/page.tsx` | ~383 | Simplified to dream selection |
| `packages/types/src/life-engine.ts` | 216 | 90% removed |
| `packages/types/src/models.ts` (Journal + RoadmapV3 types) | ~300 | Types removed |

**Total code reduction:** ~8,000 lines removed, ~3,000 lines added (net -5,000 lines, ~60% reduction in code volume).

### DB tables to drop (post-migration)

| Table | Reason |
|-------|--------|
| `journals` | Replaced by journey system |
| `journal_entries` | Replaced by daily_reflections |
| `journal_milestones` | Replaced by big_wins + small_wins |
| `journal_followers` | Social layer removed |
| `journal_reactions` | Social layer removed |
| `milestones` | Replaced by big_wins + small_wins |
| `user_goals` | Partially replaced (goal_name → journey, some columns kept) |
| `roadmap_templates` | Replaced by dream_templates |
| `roadmap_template_milestones` | Replaced by dream_templates.big_wins JSON |
| `roadmap_template_recommendations` | Post-MVP |

**DB tables removed:** 10 of 25 (40% reduction).

---

## Part 8 — PRESERVED SYSTEMS

These systems are **not** changed by this refactor:

| System | Reason |
|--------|--------|
| Stories / Inspirasi | Content consumption, independent |
| Circles | Community, independent |
| Mentors | Human guidance, independent (but journey data feeds mentor matching) |
| Familia Rewards | Rewards system, independent (but journey achievements can trigger rewards) |
| Opportunities | External resource discovery, independent |
| Safe Space | Emotional support, independent |
| Auth / Users | Identity, independent |
| Spiritual Preferences | Absorbed (replaces Life Engine version) |

---

## Part 9 — SUCCESS TEST

A 12-year-old user opens the app for the first time.

### Screen 1: Pick a Dream

```
⚽ Sepak Bola    💻 Programmer    🎵 Musisi
🩺 Dokter        📈 Entrepreneur  🎬 Content Creator
🏃 Pelari        💄 Beauty        ⛳ Golf
```

**User taps ⚽ Sepak Bola.**

### Screen 2: My Journey

```
⚽ Pemain Sepak Bola Profesional

🏆 Big Win Pertamamu:
   Masuk SSB (Sekolah Sepak Bola)

🎯 Yang perlu kamu lakukan:
   ☐ Cari info SSB terdekat
   ☐ Latihan passing 15 menit
   ☐ Jalan 10 menit
   ☐ Sholat 5 waktu
   ☐ Baca artikel bola
   ☐ Sapa teman

Sudah selesai? Centang aja!
```

### Within 30 seconds, user can answer:

| Question | Answer |
|----------|--------|
| **What is my dream?** | ⚽ Pemain Sepak Bola Profesional |
| **What is my next big win?** | Masuk SSB |
| **What do I need to do today?** | 6 checkboxes |
| **Why does it matter?** | (tap big win to see why_it_matters) |
| **How far have I come?** | Progress ring: 0% → ticking up with each check |

**No tabs. No dashboards. No life capital. No growth zones. No unlocks. No decay. No journal vs reflections confusion. One screen. Six checkboxes. One dream.**

---

## Part 10 — IMPLEMENTATION ORDER

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **P1: Schema + Seed** | 5 days | 10 DB tables, dream_templates seed data, migration scripts |
| **P2: Daily Activity Engine** | 3 days | `daily-activity-generator.ts`, completion tracking, streak logic |
| **P3: Journey Dashboard** | 5 days | `/journey/[id]` page, JourneyHeader, DailyActivityList, BigWinTimeline, SmallWinChecklist |
| **P4: Reflection System** | 3 days | DailyReflectionModal, SmallWinReflectionModal, BigWinReflectionModal |
| **P5: Home + Profile** | 3 days | Simplified home page, simplified profile with journey timeline |
| **P6: Failure + Pivot** | 3 days | FailureGuidance, AlternativeFuturesCard, PivotFlow |
| **P7: Data Migration** | 5 days | Migrate existing users' data from old schema + localStorage |
| **P8: Route Cutover** | 2 days | Redirect old routes, remove old nav items |
| **P9: Cleanup** | 3 days | Delete old files, old components, old types, old seed files |

**Total: ~32 working days**

---

## Part 11 — RISKS & MITIGATION

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Users lose existing Life Engine capital | Medium | Migration script preserves numbers as "legacy points" displayed once on first login then retired |
| Users attached to Journal social features | Low | Follower/reaction usage was near zero (no critical mass) |
| 11 roadmaps → 1 active journey feels limiting | Low | Pivot flow is first-class; user can change dreams freely with full history preserved |
| Data in localStorage never migrates | Medium | Dual-write phase ensures localStorage data is captured before migration |
| Loss of gamification reduces engagement | Medium | Streak + progress ring + big win completion provide intrinsic motivation. Reality: Life Engine unlocks/decay caused anxiety, not retention. |
| AI Coach loses capital data | Low | Coach simplified to use activity completion data instead of capital scores |

---

## SUMMARY

| Metric | Before (7 systems) | After (1 system) | Change |
|--------|-------------------|-----------------|--------|
| DB tables (journey-related) | 10+ | 9 | -1 (net with social tables removed) |
| Components | ~30 | ~18 | -40% |
| Routes | 34 | ~27 | -21% |
| State locations | Supabase + localStorage (10 keys) | Supabase only | Single source of truth |
| User-facing concepts | Big Win, Small Win, Skill, Daily Win, Life Capital, Growth Zone, Life Level, Life Stage, Unlock, Streak, Reflection, Journal, Milestone, Blueprint, Masterclass, Life Pillar, Alt Future, Vault, Pivot | Dream, Big Win, Small Win, Daily Activity, Reflection | **19 concepts → 5 concepts** |
| Lines of code (journey-adjacent) | ~8,000 | ~3,000 | -62% |
| Time to first user win | ~8 minutes | ~90 seconds | -81% |
| User comprehension (12-year-old) | Cannot (too complex) | Within 30 seconds | ✅ |

> *"I am walking toward my dream."* — One screen. Six checkboxes. One journey.

---

*End of Dream Journey Refactor Plan*
