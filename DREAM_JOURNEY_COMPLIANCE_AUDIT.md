# DREAM JOURNEY COMPLIANCE AUDIT

> **Project:** Beautifio — Dream Journey Migration
> **Date:** 2026-06-11
> **Audit Scope:** Codebase-wide compliance check of the Dream Journey implementation
> **Rule:** No code was modified during this audit.

---

## PART 1 — VISION ALIGNMENT

**Model:** Dream → Big Win → Small Win → Daily Activities → Reflections → Growth

### Scores

| Step | Score (0–10) | Gap |
|------|-------------|------|
| **Dream** | 9 | `journey/page.tsx` shows visual dream cards with emoji + title + description. One tap selects. Redirects to dashboard. Missing: category filtering or search. |
| **Big Win** | 8 | `journey/[id]/page.tsx` "Pencapaian" tab lists Big Wins via `BigWinCard`. Expandable to see Small Wins. `FailureModal` handles failure. Gap: no "Big Win celebration" screen when completed. |
| **Small Win** | 6 | `BigWinCard` shows Small Wins inline with toggle circles. Completing a Small Win updates progress. Gap: **there is no dedicated Small Win reflection UI** — the `newReflection` state exists in BigWinCard but no textarea is rendered. Code appears buggy (dead state). |
| **Daily Activities** | 9 | `DailyActivityCard` + "Hari Ini" tab shows all 6 dimensions. One-tap completion with visual feedback. Count `2/6` shown. Gap: no option to add custom activities. |
| **Reflections** | 7 | `ReflectionModal` auto-opens after completing all activities. 3 fields + mood selector. Gap: Small Win reflection is broken (no input rendered). No prompt to reflect when completing a single activity. |
| **Growth (Timeline)** | 8 | `JourneyTimeline` in "Riwayat" tab shows all event types with icons and relative dates. Gap: growth is shown as events list, not a visual progression chart. No "you've grown X% since yesterday" metric. |

**Average: 7.8/10**

**Key gaps:**
1. Small Win reflection input is missing from `BigWinCard`
2. No celebration screen when a Big Win is completed
3. No custom daily activities
4. Timeline is a flat event list, not a visual growth visualization

---

## PART 2 — DUPLICATION AUDIT

### Overlaps Found

| # | Old Concept | New Concept | Severity | Files Affected (Active Pages) | Recommended Action |
|---|-------------|-------------|----------|-------------------------------|-------------------|
| 1 | **Roadmap** (11-tab detail) | **Journey** (3-tab dashboard) | HIGH | `apps/web/src/app/roadmap/` (5 files), `apps/web/src/features/roadmap/` (15+ components) | **Remove** — deprecation banners already in place |
| 2 | **Journal / Jurnal** (public/private, followers) | **Reflection** (private daily, 3 questions + mood) | HIGH | `apps/web/src/app/jurnal/` (3 routes), `apps/web/src/features/journal/` (5 components) | **Remove** — banners in place |
| 3 | **Daily Wins** (goal-specific habits in localStorage) | **Daily Activities** (6-dimension in Supabase) | MODERATE | `apps/web/src/app/home/page.tsx:145` calls old `generateDailyWins()` | **Remove** old call |
| 4 | **Growth Tracker** (localStorage stats) | **Journey Progress** (Supabase queries) | MODERATE | `apps/web/src/features/roadmap/components/GrowthTracker.tsx` | **Remove** — part of roadmap feature |
| 5 | **Life Capital** (6-dimension gamification) | **Journey Dimensions** (spiritual, physical, knowledge, social, character, dream_skill) | HIGH | `apps/web/src/app/home/page.tsx:102` shows "Life Capital", `apps/web/src/app/profil/page.tsx:184` shows "Life Capital" | **Merge** — replace "Life Capital" with Journey progress |
| 6 | **Growth Zone** (4-zone model: comfort, fear, learning, growth) | **Journey Focus** (current Big Win + Small Win) | MODERATE | Home page `LifeEngineCard` renders zone labels | **Remove** — old concept |
| 7 | **Life Level** (7 levels: Seed → Legacy) | **Journey Progress** (% ring + activity count) | LOW | `apps/web/src/app/profil/page.tsx:114` uses `getLifeLevel()` | **Remove** |
| 8 | **Daily Reflections** (old localStorage reflection in roadmap) | **ReflectionModal** (Supabase-backed) | MODERATE | `apps/web/src/features/roadmap/components/RoadmapV3DailyReflections.tsx` | **Remove** |
| 9 | **Spiritual Preference** (multi-faith) | **Spiritual** dimension in daily activities | LOW | `packages/utils/src/daily-activity-generator.ts:7` imports `SPIRITUAL_PRACTICES` | **Keep** — still used by activity generator |
| 10 | **Onboarding** (7-step profile) | **Journey** (1-tap dream selection) | HIGH | `apps/web/src/app/onboarding/` | **Remove** — not linked to journey; collects unused data |
| 11 | **Discovery** (4-step questionnaire) | **Journey** (browse all dreams) | HIGH | `apps/web/src/app/discover/` (2 routes) | **Remove** |

### Summary

| Action | Count |
|--------|-------|
| **Keep** | 1 (spiritual preference → activity generator) |
| **Merge** | 1 (Life Capital → Journey progress) |
| **Remove** | 9 (Roadmap, Journal, Daily Wins, Growth Tracker, Growth Zone, Life Level, Old Reflections, Onboarding, Discovery) |

---

## PART 3 — JOURNEY FLOW AUDIT

**Persona:** 13-year-old, wants to be a Football Player, brand new user

### Screen-by-screen trace

| # | Screen | What they see | Action | Clicks |
|---|--------|--------------|--------|--------|
| 1 | `/` (Splash) | "Masa Depan Dimulai Hari Ini" + illustration + 3 buttons | Tap "Lewati Dulu" | 1 |
| 2 | `/home` | WelcomeHero (mock stats), LifeEngineCard ("Mulai Journey"), Stories, "Pilih Mimpimu" CTA | Tap bottom nav "Journey" tab OR "Mulai Journey" card | 2 |
| 3 | `/journey` | "Mulai Perjalananmu" headline + grid of dream cards (football player, doctor, programmer, etc.) | Scroll to "Pemain Sepak Bola" → Tap "Pilih Mimpi Ini" | 3 |
| 4 | `/journey/[id]` | Journey dashboard: progress ring, daily activities list ("Hari Ini" tab), "2/6" complete, big wins & timeline | Tap first activity card (e.g. "Ball Mastery 30 menit") → completes it | 4 |

**Clicks to first win: 4**

### Confusion points

1. **Onboarding bypass:** User bypassed `/onboarding` entirely. The 7-step form never asked about football. All profile data (age, city, goals) is empty. The journey works, but profile says "no data."
2. **Two paths to journey:** User could also go `/` → "Mulai Perjalananmu" → `/welcome` → "Saya Sudah Punya Tujuan" → `/discover` (4+ steps) → `/discover/result` → `/journey`. That's **8+ clicks** vs **3 clicks** via "Lewati Dulu".
3. **Mock data on home:** The `/home` page shows hardcoded mock stats like "62% Progress Goal", "5 Milestone", "3 Circle Aktif" even for a brand new user who has zero data. Confusing.
4. **Life Engine card still visible:** Even with Journey active, the home page still shows `LifeEngineCard` with Zone/Stage/Capital info. The user sees both "Life Capital 52%" and "2/6 activities done" simultaneously.
5. **No "first visit" celebration:** After picking football player, the user lands on a functional dashboard. No confetti, no "Selamat! Kamu memulai perjalanan menjadi Pemain Sepak Bola!" celebration.

### Click count summary

| Action | Clicks (min path) | Clicks (max path) |
|--------|-------------------|-------------------|
| Splash → Start journey | 3 | 8+ |
| Journey dashboard → See daily activities | 0 (landed on it) | 0 |
| Complete a daily activity | 1 | 1 |
| Write a reflection | 0 (auto-opens) | 2 |
| See a Big Win | 1 (switch tab) | 1 |
| See Small Wins | 2 (switch tab + expand) | 2 |
| Mark Big Win as failed | 3 | 3 |

---

## PART 4 — DAILY ACTIVITY AUDIT

### Dimension coverage

| Dimension | Generated? | Displayed? | Label Shown | Emoji |
|-----------|-----------|-----------|-------------|-------|
| Spiritual | ✅ | ✅ | "Spiritual" | 🕊️ |
| Physical | ✅ | ✅ | "Fisik" | 💪 |
| Knowledge | ✅ | ✅ | "Pengetahuan" | 📚 |
| Social | ✅ | ✅ | "Sosial" | 👥 |
| Character | ✅ | ✅ | "Karakter" | ⭐ |
| Dream Skill | ✅ | ✅ | "Skill Mimpi" | 🎯 |

**All 6 dimensions present. Score: 10/10**

The `daily-activity-generator.ts` produces one activity per dimension per day. `DIMENSION_LABELS` mapping in the dashboard page has all 6 entries. `DailyActivityCard` receives dimension-specific emoji and label props.

**No missing dimensions.**

---

## PART 5 — REFLECTION AUDIT

### Reflection types

| Type | Component | Status | Details |
|------|-----------|--------|---------|
| **Daily Reflection** | `ReflectionModal` | ✅ **Exists** | 3 fields (learned, grateful, improve) + mood selector. Auto-opens after completing all activities. Saves to `daily_reflections` table. |
| **Small Win Reflection** | `BigWinCard` | ⚠️ **Buggy** | `onCompleteSmallWin` accepts `(id, reflection?)` but the `<textarea>` for input is **not rendered** in the JSX. State `newReflection` is declared but no UI element binds to it. The reflection is always `undefined`. |
| **Big Win Reflection** | `FailureModal` | ✅ **Exists** | Shows encouragement + transferable skills + alternative future. No "lessons learned" text field from user. |
| **Big Win Completion** | ❌ **Missing** | No component | When all Small Wins in a Big Win are completed, there is no celebration or reflection prompt. The Big Win just becomes "completed" silently. |

### Connection to progress

- Daily Reflection → ✅ Connected to `daily_activities` completion (auto-triggered)
- Daily Reflection → ✅ Connected to `growth_timeline_events` (via `journey-queries.ts`)
- Small Win Reflection → ❌ Not connected (broken UI)
- Big Win Failure → ✅ Connected to `big_wins.is_failed` update
- Big Win Completion → ❌ No component exists

### Connection to timeline

- `journey-queries.ts:getJourneyTimeline()` queries `daily_reflections`, `daily_activities`, `small_wins`, `big_wins` events
- `JourneyTimeline` component renders them all with correct icons and relative dates
- ✅ Timeline integration is complete

### Reflection audit score: 6/10

Deducted points for:
- Small Win reflection UI is broken (renders nothing)
- No Big Win completion reflection
- No "lessons learned" user input in failure modal

---

## PART 6 — PROFILE AUDIT

File: `apps/web/src/app/profil/page.tsx`

| Item | Present? | Detail |
|------|----------|--------|
| Current Dream | ✅ **YES** (x3) | `ProfileHero` ("Mimpi Saat Ini"), `MyJourneySection` (journey card), `CurrentFocus` ("Mimpi Aktif") |
| Current Big Win | ⚠️ **Partial** | Only shown as subtitle inside `MyJourneySection` journey card |
| Current Small Win | ❌ **NO** | Nowhere on profile |
| Today's Progress | ✅ **YES** | `MyJourneySection`: `completed/total` + progress bars |
| Recent Reflections | ❌ **NO** | Shows journals (long-form), not daily reflections |
| Journey Timeline | ✅ **YES** | `LifeJourney` section: growth wins, dream changes, journal entries |
| Life Capital | ❌ **Still shown** | `MyGrowth` section shows 6-dimension Life Capital bars — old concept |

### Profile completeness score: 5/10

Gaps:
1. No Small Win display
2. No recent reflections display
3. Old Life Capital bars still shown alongside Journey data
4. `generateEmotionalSummary()` still uses old Life Engine functions (`getLifeProfile`, `getAllGrowthWins`)

---

## PART 7 — HOME AUDIT

File: `apps/web/src/app/home/page.tsx`

| Question | Answer | Detail |
|----------|--------|--------|
| "What should I do today?" | ✅ **YES** | `ContinueYourJourney` shows today's activities + "Lanjutkan" button. `LifeEngineCard` shows recommended actions. |
| "What is my dream?" | ✅ **YES** | `ContinueYourJourney` shows journey emoji + title. `WelcomeHero` shows "Dream" stat. |
| "What is my next win?" | ⚠️ **Partial** | `ContinueYourJourney` shows current Big Win as subtitle. No explicit "next up" callout. |
| "What progress have I made?" | ✅ **YES** | `completedToday/totalToday` + progress dots in `ContinueYourJourney`. |
| Dashboard metrics shown? | ❌ **YES (bad)** | Life Capital %, Growth Zone labels, Stage labels, Streak count, hardcoded mock stats for new users. |
| Internal concepts shown? | ❌ **YES (bad)** | "Life Capital", "Growth Zone" (Zona Nyaman/Takut/Belajar/Tumbuh), "Life Level" (Seed/Explorer etc.) |

### Home audit score: 5/10

Problems:
1. `LifeEngineCard` dominates the top of home with old Life Engine concepts (Zone, Stage, Capital bars)
2. Mock hardcoded stats shown for new users (62% Progress, 12 hari streak, etc.)
3. "Life Capital" is a jargon term not explained anywhere
4. Too many sections (7) — stories, circle, mentor, familia, events all compete for attention
5. The core question "What should I do today?" is visually buried under zone/stage/capital noise

---

## PART 8 — LANGUAGE AUDIT

### Jargon still visible to users

| Term | Location | User-Facing Text | Recommendation |
|------|----------|-----------------|---------------|
| **Life Capital** | `home/page.tsx:102` | "Life Capital" | → "Progress" or "Perkembangan" |
| **Life Capital** | `home/page.tsx:190` | "Life Capital {avg}%" | → "Progress {avg}%" |
| **Life Capital** | `profil/page.tsx:184` | "Life Capital" | → "Progress Hidup" |
| **Growth Zone** | `home/page.tsx:73,187` | "Zona Nyaman" / "Zona Takut" / "Zona Belajar" / "Zona Tumbuh" | Remove entirely (no replacement needed — show journey focus instead) |
| **Growth Win** | `profil/page.tsx:83` | "{n} growth win" | → "{n} pencapaian" |
| **Life Level** | `profil/page.tsx:114` | "Seed" / "Explorer" / "Builder" / "Achiever" / etc. | Remove entirely |
| **Daily Wins** | `roadmap/[slug]/page-client.tsx:37` | Tab label "Daily Wins" | → "Aktivitas Harian" (already done in journey) |
| **Streak** | `home/page.tsx` | "12 hari streak" (placeholder) | → "12 hari berturut-turut" or just remove |
| **Milestone** | `profil/page.tsx` | "5 Milestone" | → "5 pencapaian" |
| **Discovery** | `discover/page.tsx` | "Temukan Mimpimu" journey | → Merge into `/journey` directly |

### Jargon found in code but not visible to users

| Term | Location | Visible? | Action |
|------|----------|----------|--------|
| `getLifeProfile()` | Multiple files | No (internal function) | Remove when deprecated |
| `LIFE_LEVELS` | `life-engine.ts`, `profil/page.tsx:114` | Indirectly (level labels) | Remove |
| `ZONE_INFO` / `STAGE_INFO` | `home/page.tsx` | Yes (zone/stage labels) | Remove from home |
| `capitalTrends` | `life-engine.ts` | No (internal data) | Keep until all callers removed |
| `executePivot()` | `life-engine.ts` | No (used by roadmap) | Remove when roadmap gone |

### 12-year-old readability assessment

**New Journey flow:** ✅ Passes. "Pilih mimpimu" → "Lakukan 6 aktivitas" → "Ceklis" → "Tulis refleksi" = clear.

**Old systems still visible:** ❌ Fails. "Life Capital", "Growth Zone", "Stage", "Daily Wins", "Milestone" are English/technical terms an Indonesian 12-year-old won't understand.

---

## PART 9 — SIMPLIFICATION SCORE

### Route count

| Metric | Before | After (Current) | Target | Reduction |
|--------|--------|----------------|--------|----------|
| Routes | 34 | 33 | ~19 | **3%** (target 44%) |
| Navigation tabs | 6 | 5 | 4 | **17%** (target 33%) |
| Home sections | 7 | 7 | 3 | **0%** (target 57%) |
| Profile sections | 8 | 10 | 3 | **0%** (target 63%) |
| Roadmap detail tabs | 11 | 11 | 0 (deleted) | **0%** (target 100%) |
| Concepts | ~20 | ~20 | ~12 | **0%** (target 40%) |

### Navigation depth

- **Before:** 4 levels (App → Feature → Tab → Sub-section)
- **After:** Still 4 levels (the old deep routes still exist)
- **Target:** 3 levels max

### What drove the complexity reduction so far

- `/life` and `/life/start` deleted (middleware redirects)
- 20+ Life Engine functions removed from `life-engine.ts` (939 → 434 lines)
- LifeCoachPanel deleted (358 lines, never imported)
- Nav reduced from 6 to 5 (dropped Jurnal, added Journey)

### What remains

- 33 routes still active (only 2 actually deleted)
- 7 home sections competing for attention  
- Old roadmap components (15+ files) still shipped
- Old journal components (5+ files) still shipped
- Life Engine concepts still polluting home, profil, and old roadmap pages

### Overall simplification score: **~10% achieved** (target 50%)

---

## PART 10 — GO / NO GO

### 1. Can Beautifio be described in one sentence?

**Yes:**

> *"Beautifio helps Indonesian teens pick a dream career, then guides them step by step with daily activities, progress tracking, and a supportive community."*

### 2. Can a 12-year-old understand in under 30 seconds?

**Partially.** The new Journey system yes: "Pick a dream → do tasks → check progress." But 27 other legacy routes, 11-tab roadmaps, Life Capital RPG mechanics, and jargon-filled pages create too much noise. A 12-year-old would be confused by seeing "Life Capital 52%" and "Growth Zone: Zona Belajar" on the same page as their football dream.

### 3. Recommendation: **B+ (Refactor with urgency)**

**Not A (Continue migration):** The architecture is correct but the transition is only ~10% complete. Building more features on top of the existing bloat would compound the confusion.

**Not C (Stop and redesign):** The Journey system (DB schema, types, queries, components, routes) is well-architected. Abandoning it would waste significant investment.

**Recommend B (Refactor first):**

### Immediate actions (this sprint)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | **Redirect `/roadmap` → `/journey`** via middleware | Eliminates 15+ old components from user's path | Small |
| 2 | **Remove `LifeEngineCard` from home** — replace with Journey-focused CTA | Removes all Zone/Stage/Capital jargon from the most-visited page | Small |
| 3 | **Redirect `/discover` → `/journey`** via middleware | Removes 4-step friction | Small |
| 4 | **Redirect `/onboarding` → `/journey`** via middleware | Removes 7-step friction | Small |
| 5 | **Fix Small Win reflection** — add missing `<textarea>` to `BigWinCard` | Fixes broken feature | Tiny |

### Next sprint

| # | Action |
|---|--------|
| 6 | Delete `/roadmap/` directory and all feature components |
| 7 | Delete `/jurnal/` directory and all feature components |
| 8 | Delete `/discover/`, `/onboarding/`, `/welcome/` directories |
| 9 | Consolidate home to 3 sections: "Today's Focus", "My Dream", "Community" |
| 10 | Remove all Life Engine jargon from home and profil |

### Expected outcome after refactor

- **Routes:** 33 → ~20 (**41% reduction**)
- **Nav tabs:** 5 → 4 (**20% reduction**)
- **Concepts visible to user:** ~20 → ~10 (**50% reduction**)
- **Clicks to first win:** 4 → 3 (**25% reduction**)
- **12-year-old understanding:** Achievable in under 30 seconds

### Verdict

> **The Dream Journey foundation is solid. But the migration must accelerate into shutdown mode for legacy systems. Every day both systems run in parallel, user confusion compounds. Prioritize deletion over addition until the product speaks one language.**
