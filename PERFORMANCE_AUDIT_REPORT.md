# PERFORMANCE & STABILITY AUDIT

**Date:** 2026-06-11
**Scope:** /home, /journey, /journey/[id], /profil

---

## EXECUTIVE SUMMARY

The app is slow not because of database query latency, but because each page fires **2–5× more queries than needed** due to:

1. Duplicate function calls (same data fetched 2-3 times)
2. Sequential waterfalls where data could be parallelized
3. Child components re-fetching data already loaded by parent components
4. No client-side caching between page navigations
5. `getJourneyProgress()` called alongside its own constituent queries

---

## PAGE-BY-PAGE AUDIT

### /home

**Total queries:** 4–5
**Slowest:** `getJourneyProgress` (3 sequential sub-queries)
**Duplicates:** None within page, but `getTodayActivities` + `getTodayReflection` results are discarded when computing progress

#### Query trace
```
1. GET dream_journeys WHERE user_id=$1 AND status='active'  [getActiveJourney]
2. └─ GET big_wins WHERE journey_id=$1  [getJourneyProgress → getBigWins]
3.  └─ GET daily_activities WHERE user_id=$1 AND activity_date=today  [getJourneyProgress → getTodayActivities]
4.   └─ GET daily_reflections WHERE user_id=$1 AND date=today  [getJourneyProgress → getTodayReflection]
```

**Problem:** Queries 2→4 are sequential (await chained inside `getJourneyProgress`), not parallel. 3 sequential round-trips when they could be 1 parallel batch.

**Renders:** `useEffect` depends on `[user]` — fires once on mount. Correct.

---

### /journey

**Total queries:** 2–3
**Slowest:** `getAllJourneys` (full table scan without limit)

#### Query trace
```
1. GET dream_journeys WHERE user_id=$1 AND status='active'  [getActiveJourney]
2. GET dream_journeys WHERE user_id=$1 ORDER BY created_at DESC  [getAllJourneys — no limit!]
3. (if birth_date set) GET user_profiles WHERE id=$1  [calc age]
```

**Problems:**
- `getAllJourneys()` has **no limit** — a user with 100+ previous journeys fetches all of them just to filter by status on the client
- Queries 1 and 2 both scan `dream_journeys` for the same user_id — could be merged into one query

---

### /journey/[id] — MAJOR ISSUES

**Total queries on load:** 10–13
**Duplicates:** 3+ (getBigWins, getTodayActivities, getTodayReflection all fire twice)

#### Query trace (initial load)
```
 1. GET dream_journeys WHERE user_id=$1 AND status='active'  [getActiveJourney]
    (if journey is not this id, also:)
 2. GET dream_journeys WHERE user_id=$1 ORDER BY created_at DESC  [getAllJourneys]
    ── Promise.all ──
 3.  GET big_wins WHERE journey_id=$1  [getBigWins — includes small_wins via `*`]
 4.  GET daily_activities WHERE user_id=$1 AND activity_date=today  [getTodayActivities]
 5.  GET daily_reflections WHERE user_id=$1 AND date=today  [getTodayReflection]
 6.  GET big_wins (again!)  [getJourneyProgress → getBigWins]  ← DUPLICATE of #3
 7.  GET daily_activities (again!)  [getJourneyProgress → getTodayActivities]  ← DUPLICATE of #4
 8.  GET daily_reflections (again!)  [getJourneyProgress → getTodayReflection]  ← DUPLICATE of #5
 9.  GET growth_timeline_events WHERE user_id=$1 AND journey_id=$2  [getTimeline]
10.  GET spiritual_preferences WHERE user_id=$1  [getSpiritualPreferences]
    ── ──
11. (if no activities) INSERT + SELECT daily_activities  [generateAndInsertActivities]
```

**Critical issue:** `getJourneyProgress` calls `getBigWins`, `getTodayActivities`, and `getTodayReflection` **internally**, but the page also calls these three functions directly in the `Promise.all`. This means queries 3,4,5 are IDENTICAL to 6,7,8 — same WHERE clauses, same result sets.

**Estimated time waste:** ~300ms × 3 duplicated queries = ~900ms of unnecessary round-trips.

#### Query trace (complete small win)
```
 1. UPDATE small_wins SET is_completed=true  [completeSmallWin]
 2. SELECT big_wins + small_wins  [getBigWins]
 3. (if big win completed) UPDATE big_wins  [completeBigWin]
 4. SELECT big_wins + small_wins  [getBigWins — again!]
```

**Problem:** After completing a big win, `getBigWins` is called twice (line 172 and line 183–184 in [id]/page.tsx). The second call is redundant — the data just returned from the first call could be reused.

#### Query trace (save reflection)
```
 1. SELECT daily_reflections WHERE user_id=$1 AND date=today  [saveDailyReflection → getTodayReflection]
 2. (if exists) UPDATE daily_reflections  [saveDailyReflection]
 3. (if not) INSERT INTO daily_reflections
 4. SELECT daily_reflections WHERE user_id=$1 AND date=today  [handleSaveReflection → getTodayReflection]
```

**Problem:** Query 4 is a full re-fetch of data that was just modified in query 1/2/3. The handler could optimistically update local state.

#### Query trace (fail big win)
```
 1. UPDATE big_wins SET is_failed=true  [failBigWin]
 2. SELECT big_wins + small_wins  [getBigWins]
```
Fine — 2 queries for an infrequent action.

#### JourneyStory component (separate useEffect)
```
1. GET growth_timeline_events  [getTimeline — same as query #9 in parent!]
2. GET daily_reflections  [getTodayReflection — same as query #5 in parent!]
```

**Problem:** Even though the parent already loaded timeline and reflection data, `JourneyStory` **re-fetches both** in a separate `useEffect`. This fires after the parent's data is already in state, adding 2 extra round-trips.

---

### /profil

**Total queries:** 4–6
**Duplicates:** 1+ (`getTodayActivities` called inside AND outside `getJourneyProgress`)

#### Query trace
```
 1. GET dream_journeys WHERE user_id=$1 AND status='active'  [getActiveJourney]
    ── Promise.all ──
 2.  GET big_wins WHERE journey_id=$1  [getJourneyProgress → getBigWins]
 3.  GET daily_activities WHERE user_id=$1 AND activity_date=today  [getJourneyProgress → getTodayActivities]
 4.  GET daily_reflections WHERE user_id=$1 AND date=today  [getJourneyProgress → getTodayReflection]
 5.  GET daily_activities (again!)  [getTodayActivities — DUP of #3]
 6.  GET growth_timeline_events WHERE user_id=$1 AND journey_id=$2 LIMIT 3  [getTimeline]
```

**Problem:** Same pattern as /journey/[id] — `getJourneyProgress` is called alongside its own sub-queries. Query #5 `getTodayActivities` is a literal duplicate of query #3.

---

## TOP 10 SLOWEST OPERATIONS

| # | Operation | Est. Time | Page | Root Cause |
|---|-----------|-----------|------|------------|
| 1 | Initial load of /journey/[id] | ~1.5s (10–13 queries) | detail | 3 duplicate queries + sequential chaining |
| 2 | Small win complete flow | ~600ms (3–4 round-trips) | detail | `getBigWins` called twice |
| 3 | Save reflection handler | ~500ms (3–4 queries) | detail | Re-fetches data after upsert |
| 4 | /home page load | ~500ms (4 sequential) | home | getJourneyProgress chains 3 queries serially |
| 5 | /profil page load | ~500ms (6 queries) | profil | getJourneyProgress + duplicate getTodayActivities |
| 6 | JourneyStory mount | ~400ms (2 queries) | detail | Child re-fetches parent data |
| 7 | /journey page load | ~300ms (2–3 queries) | journey | getAllJourneys has no limit |
| 8 | Fail big win flow | ~300ms (2 queries) | detail | Acceptable, but getBigWins reloads everything |
| 9 | Navigation between pages | ~200ms+ cache miss | all | No client-side caching between routes |
| 10 | Dynamic import overhead | ~50ms each | detail/home | `await import(...)` in hot paths |

---

## TOP 10 DUPLICATE OPERATIONS

| # | Duplicate | Times/Page | Pages | Impact |
|---|-----------|-----------|-------|--------|
| 1 | `getBigWins` called directly + inside `getJourneyProgress` | 2× | /journey/[id] | ~200ms wasted on every load |
| 2 | `getTodayActivities` called directly + inside `getJourneyProgress` | 2× | /journey/[id], /profil | ~200ms wasted |
| 3 | `getTodayReflection` called directly + inside `getJourneyProgress` | 2× | /journey/[id], /profil | ~200ms wasted |
| 4 | `getBigWins` after completing a big win | 2× in one handler | /journey/[id] | ~200ms |
| 5 | `getTodayReflection` after saving reflection | 2× in one handler | /journey/[id] | ~200ms |
| 6 | `getTimeline` in parent + JourneyStory child | 2× | /journey/[id] | ~200ms |
| 7 | `getTodayReflection` in parent + JourneyStory child | 2× | /journey/[id] | ~200ms |
| 8 | `getActiveJourney` on every page navigation | per page nav | all | ~100ms × page visits |
| 9 | `getAllJourneys` fetches all rows just to filter by status | 1× wasteful | /journey, /journey/[id] | Scales O(n) with journey count |
| 10 | `dream_templates` queries on every page (105 idx scans for 11 rows) | excessive | journey pages | Low impact but unnecessary |

---

## QUERIES THAT SHOULD BE MERGED

| Current | Merge Into | Benefit |
|---------|-----------|---------|
| `getActiveJourney` + `getAllJourneys` | Single query with `.in('status', ['active','completed','pivoted'])` | 1 round-trip instead of 2 |
| `getBigWins` + `getTodayActivities` + `getTodayReflection` | Single composite function returning all 3 | 1 round-trip instead of 3 |
| `getTimeline` called by parent + child | Pass timeline as prop to JourneyStory | Eliminates 2 extra queries |
| ========== | ========== | ========== |
| **Aggressive merge candidate:** | | |
| `getJourneyProgress` currently calls 3 queries internally. Page calls same 3 queries externally. | Remove the 3 external calls; use getJourneyProgress result directly | **Eliminates 3 queries per page load** |

---

## COMPONENTS CAUSING RE-RENDERS

| Component | Problem | Fix |
|-----------|---------|-----|
| `JourneyDetailPage` | `loadData` wrapped in `useCallback` with `[user, id, router]` dependencies — router changes on every render! | Remove `router` from deps |
| `JourneyDetailPage` | `handleCompleteActivity` uses stale `activities` from closure to check `completedAll` | Use functional update or ref |
| `JourneyStory` | `useEffect` with `[userId, journeyId]` — re-fetches on every prop change AND fires extra queries | Pass data as props instead |
| `DailyActivityCard` | New `useState` for showNoteInput/noteText — component re-renders on every keystroke (acceptable for input) | Fine |
| BottomNavigation | `onTabChange` creates new arrow function on every render → child re-renders | Use `useCallback` or memo |
| All pages | No React.memo on section components | Wrap pure display components in `React.memo` |

---

## LOADING BOTTLENECKS

| Bottleneck | Location | Why It's Slow |
|-----------|----------|--------------|
| **Infinite skeletons if user has no journey** | /journey/[id] | `loadData` returns early if `!user || !id`, but **never calls `setLoading(false)`** in that path. Loading stays `true` forever. |
| **Sequential data dependencies** | /home line 293-301 | `getActiveJourney` → `getJourneyProgress` → `getTodayActivities` → `getTodayReflection` — each awaits the previous |
| **Dynamic import in hot path** | /home line 292, /journey/[id] line 73 | `await import("@/lib/journey-queries")` adds 50ms+ on every `loadData` call |
| **No optimistic updates** | activity completion, reflection save | Every handler waits for DB round-trip before updating UI |
| **Router dependency in useCallback** | /journey/[id] line 122 | `router` changes identity on every render → `loadData` reference changes → `useEffect` re-fires |

---

## RECOMMENDED FIXES

### Critical (blocking page load)

| # | Fix | File | Impact |
|---|-----|------|--------|
| F1 | **Remove `getJourneyProgress` from Promise.all + delete its 3 constituent queries** — call `getJourneyProgress` alone and use its returned data | [id]/page.tsx:87-94 | -3 queries, -300ms |
| F2 | **Same fix for /profil** — remove duplicate `getTodayActivities` from Promise.all, use the one inside getJourneyProgress | profil/page.tsx | -1 query, -150ms |
| F3 | **Fix infinite skeleton** — add `setLoading(false)` in early-return paths of loadData | [id]/page.tsx:70-84 | Fixes stuck loader |
| F4 | **Pass timeline + reflection as props to JourneyStory** instead of child doing its own fetch | [id]/page.tsx + story.tsx | -2 queries, -300ms |

### High (slows every interaction)

| # | Fix | File | Impact |
|---|-----|------|--------|
| F5 | **Parallelize getJourneyProgress internal queries** with `Promise.all` | journey-queries.ts:369-371 | -200ms on /home, /profil |
| F6 | **Optimistic updates for activity/small win completion** — update state immediately, fire DB in background | [id]/page.tsx:128-188 | UI feels instant |
| F7 | **Remove router from useCallback deps** (use ref for router.push) | [id]/page.tsx:122 | Prevents re-fetch loops |
| F8 | **Add `.limit(20)` to `getAllJourneys`** | journey-queries.ts:107 | Prevents O(n) growth |

### Medium

| # | Fix | File | Impact |
|---|-----|------|--------|
| F9 | **Replace client-side dynamic imports with static top-level imports** | page.tsx files | -50ms per handler call |
| F10 | **Add `React.memo` to Greeting, TargetSection, TodaySection, RecentSection** | home/page.tsx | Reduces re-render churn |
| F11 | **Remove duplicate `getBigWins` call in `handleCompleteSmallWin`** — reuse data from first call | [id]/page.tsx:183-185 | -1 query per big win completion |
| F12 | **Use single query with `.in()` for active + all journeys** | journey-queries.ts | -1 query on /journey |

---

## SUMMARY

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| /home page queries | 4–5 | 1–2 | 3× |
| /journey page queries | 2–3 | 1 | 2× |
| /journey/[id] page queries | 10–13 | 4–5 | 2.5× |
| /profil page queries | 4–6 | 2–3 | 2× |
| Small win complete queries | 3–4 | 1 | 3× |
| Save reflection queries | 2–3 | 1 | 2× |
| JourneyStory mount queries | 2 | 0 | Infinite |
| Page load target | ~1.5s worst case | <1s | 500ms over |

**Fixing just F1+F3+F4+F6 would eliminate ~60% of all queries and reduce journey detail load from ~1.5s to ~500ms.**
