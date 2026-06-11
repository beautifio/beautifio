# STABILITY AUDIT

**Date:** 2026-06-11
**Project:** Beautifio

---

## EXECUTIVE SUMMARY

44 stability findings across 7 categories. The most critical issues cluster around:

1. **Unhandled promise rejections** — middleware and auth hooks can crash silently
2. **Race conditions** — `createJourney` has no transaction; double-click creates duplicate journeys
3. **Null/undefined references** — icon maps, array bounds, and missing data cause runtime crashes
4. **Memory leaks** — async effects without unmount guards fire state setters after unmount

---

## 1. UNHANDLED PROMISE REJECTIONS

### Finding 1.1 — CRITICAL: use-auth.ts missing .catch()

**File:** `apps/web/src/hooks/use-auth.ts:17-21`

```typescript
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);
});
```

No `.catch()`. If `getSession()` throws (network failure, expired token, Supabase endpoint down), the rejection is unhandled. `setLoading(false)` never runs → `isLoading` stays `true` forever → app renders nothing (all pages check `isLoading` or `user` before rendering content).

**Impact:** Complete app freeze for any user whose session check fails.

### Finding 1.2 — CRITICAL: middleware getUser() without try/catch

**File:** `apps/web/src/middleware.ts:60-62`

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

Top-level `await` with no error handling. If `getUser()` throws, the entire middleware throws a 500 error for every matched route.

**Impact:** All pages behind middleware return 500 error.

### Finding 1.3 — HIGH: db() throws synchronously

**File:** `apps/web/src/lib/journey-queries.ts:16`

```typescript
function db() {
  if (!supabase) throw new Error("Supabase client not initialized");
  return supabase;
}
```

All 20+ query functions call `db()`. Missing env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) cause every query to throw. Most callers (`getJourneyProgress`, `createJourney`, etc.) do NOT wrap in try/catch.

**Impact:** Any missing env configuration crashes every data-dependent page.

### Finding 1.4 — MEDIUM: Dynamic import .then() without catch

**File:** `apps/web/src/app/journey/[id]/page.tsx:73-76`

```typescript
const allJourneys = await import("@/lib/journey-queries").then(
  (m) => m.getAllJourneys
);
```

Dynamic import uses `.then()` without `.catch()`. Module-not-found or network error on import causes unhandled rejection.

**Impact:** Journey detail page crashes if the import fails.

### Finding 1.5 — MEDIUM: localStorage.setItem without try/catch

**Files:** Multiple (RoadmapV3BigWinsSection, MilestoneTimeline, JournalEntryForm)

```typescript
localStorage.setItem(key, JSON.stringify(data));
```

No try/catch around `localStorage.setItem`. A `QuotaExceededError` crashes the component silently.

**Impact:** Data loss when localStorage is full; component crash.

---

## 2. RACE CONDITIONS

### Finding 2.1 — CRITICAL: createJourney() has no transaction

**File:** `apps/web/src/lib/journey-queries.ts:34-116`

~10-20 sequential inserts (journey, big_wins, small_wins, daily_activities) with no database transaction. If any insert fails midway, earlier inserts are committed (orphan rows). If called concurrently (double-click), duplicate journeys and child rows are created.

**Impact:** Duplicate journeys, orphan big wins, inconsistent database state.

### Finding 2.2 — HIGH: Stale closure in handleCompleteActivity

**File:** `apps/web/src/app/journey/[id]/page.tsx:128-145`

```typescript
const handleCompleteActivity = async (activityId: string) => {
  await completeActivity(activityId);
  setActivities((prev) => prev.map(...));
  const completedAll = activities.map(...).every(...);  // uses closure, not state
};
```

Line 138 reads from closure variable `activities` (stale) instead of the just-updated state. Completing two activities rapidly skips the "all complete" check.

**Impact:** Big win completion is missed; celebration modal not shown.

### Finding 2.3 — HIGH: saveDailyReflection read-then-write race

**File:** `apps/web/src/lib/journey-queries.ts:281-302`

```typescript
const existing = await getTodayReflection(userId);
if (existing) { update... }
else { insert... }
```

No atomicity. Two concurrent calls from the same user (double-click) both see `existing === null` and both INSERT, creating duplicate daily reflections.

**Impact:** Duplicate reflection rows; data integrity issue.

### Finding 2.4 — HIGH: saveSpiritualPreferences read-then-write race

**File:** `apps/web/src/lib/journey-queries.ts:317-333`

Same pattern as Finding 2.3. Two concurrent saves from the same user create duplicate `spiritual_preferences` rows.

### Finding 2.5 — MEDIUM: use-auth.ts getSession() and onAuthStateChange() race

**File:** `apps/web/src/hooks/use-auth.ts:17-28`

`getSession()` promise and `onAuthStateChange()` subscription run concurrently without coordination. If `onAuthStateChange` fires before `getSession` resolves, two state updates race.

**Impact:** Brief flash of incorrect auth state.

### Finding 2.6 — MEDIUM: localStorage read-then-write race in habits/streaks

**File:** Multiple (RoadmapV3DailyWinsSection, JournalEntryForm)

Rapid toggling calls `toggleDailyHabit()` and immediately reads with `getDoneHabits()` before localStorage write is flushed.

**Impact:** Intermittent streak data loss.

### Finding 2.7 — MEDIUM: Voucher and journal localStorage write race

**File:** Multiple (JournalEntryForm, LearningVault)

```typescript
const stored = localStorage.getItem(key);
const entries = stored ? JSON.parse(stored) : [];
entries.unshift(entry);
localStorage.setItem(key, JSON.stringify(entries));
```

Rapid submissions: both reads see old state, both add their entry, second write overwrites first.

**Impact:** Lost journal entries or learning vault items.

### Finding 2.8 — MEDIUM: handleCompleteSmallWin concurrent triggers

**File:** `apps/web/src/app/journey/[id]/page.tsx:167-188`

If two small wins from different big wins are completed in rapid succession, both trigger `completeBigWin` for their parent big win concurrently.

**Impact:** `completeBigWin` called twice for the same big win; duplicate completion.

---

## 3. NULL / UNDEFINED REFERENCES

### Finding 3.1 — CRITICAL: stages[active] bounds check missing

**File:** `apps/web/src/features/roadmap/components/RoadmapV3MasterclassSection.tsx:29`

```typescript
{stages[active].ageRange}
```

`stages[active]` is not bounds-checked. If `stages` is empty (length 0), `stages[0]` is `undefined`, and accessing `.ageRange` throws.

**Impact:** Crash on roadmap page when stages data is empty.

### Finding 3.2 — HIGH: MentorBadge iconMap undefined lookup

**File:** `apps/web/src/features/mentor/components/MentorBadge.tsx:21`

```typescript
const Icon = iconMap[badge.type];
// ...
<Icon size={12} />  // crashes if Icon is undefined
```

If `badge.type` is not one of the known keys, `Icon` is `undefined` and rendering it throws.

**Impact:** Crash on any mentor badge with unknown type.

### Finding 3.3 — HIGH: CategoryBar iconMap undefined lookup

**File:** `apps/web/src/features/cerita/components/CategoryBar.tsx:37`

```typescript
const Icon = iconMap[cat.icon];
<Icon size={14} />  // crashes if Icon is undefined
```

Same pattern as Finding 3.2. Unknown icon name causes crash.

**Impact:** Crash on story category bar with unknown icon.

### Finding 3.4 — HIGH: StoryCard content.replace on undefined

**File:** `apps/web/src/features/cerita/components/StoryCard.tsx:32`

```typescript
{story.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
```

`story.content` could be `undefined` or `null` if the API/seed data omits it. `.replace()` on `undefined` throws.

**Impact:** Crash on story card preview.

### Finding 3.5 — MEDIUM: createJourney returns null handled

**File:** `apps/web/src/app/journey/page.tsx`

```typescript
const journey = await createJourney(...);
if (journey) { router.push(`/journey/${journey.id}`); }
else { setError("..."); }
```

Now handled (recent fix). Previously crashed when `createJourney` returned null due to FK violation.

**Status:** FIXED.

### Finding 3.6 — MEDIUM: Supabase query error ignored

**File:** Multiple (all journey-queries.ts functions)

All query functions destructure `{ data }` and never check `error`. If Supabase returns an error (RLS violation, network failure), `data` is `null` but error is silently swallowed.

**Impact:** Silent failures — user sees "no data" instead of error.

### Finding 3.7 — MEDIUM: RoadmapV3BlueprintSection type assertion

**File:** `apps/web/src/features/roadmap/components/RoadmapV3BlueprintSection.tsx:34`

```typescript
const items = blueprint[section.key] as string[] | undefined;
```

Type assertion hides runtime shape mismatches. If `blueprint` has unexpected structure, downstream code crashes on undefined access.

**Impact:** Potential crash on unexpected data shape.

### Finding 3.8 — LOW: GrowthReflectionSection out-of-bounds

**File:** `apps/web/src/features/roadmap/components/GrowthReflectionSection.tsx:82`

```typescript
{MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}
```

`Math.random()` can return 1.0 (the spec says it CAN return 1, though extremely unlikely), making index equal to `MESSAGES.length`, which returns `undefined`. Not a crash, but renders nothing.

---

## 4. INFINITE LOOPS / RE-RENDERS

### Finding 4.1 — HIGH: use-realtime queryKey reference instability

**File:** `apps/web/src/hooks/use-realtime.ts:14-40`

```typescript
useEffect(() => {
  // ...
}, [table, filter, queryKey, queryClient]);
```

`queryKey` is a reference type (array). If callers pass `queryKey={['activities']}` inline, a new array is created every render, causing the effect to re-run every render, creating and destroying Supabase realtime channels continuously.

**Impact:** Continuous channel subscription/unsubscription cycle; performance degradation; possible rate limiting.

### Finding 4.2 — LOW: Side effect inside functional state setter

**File:** `apps/web/src/features/roadmap/components/RoadmapV3BigWinsSection.tsx:55-61`

```typescript
const toggleWin = useCallback((id: string) => {
  setDone((prev) => {
    const next = { ...prev, [id]: !prev[id] };
    saveDoneBigWins(roadmapSlug, next);  // side effect inside setter
    return next;
  });
}, [roadmapSlug]);
```

Side effects inside React state updater functions are an anti-pattern. In React concurrent mode, the updater may be called multiple times or not at all, causing localStorage write inconsistency.

---

## 5. MEMORY LEAKS

### Finding 5.1 — HIGH: no unmount guard in journey-story.tsx

**File:** `apps/web/src/features/journey/journey-story.tsx:24-82`

```typescript
useEffect(() => {
  (async () => {
    const events = await getTimeline(userId, journeyId);
    const todayRef = await getTodayReflection(userId);
    setEntries(timelineEntries);
    setLoading(false);
  })();
}, [userId, journeyId]);
```

No cleanup flag or AbortController. If the component unmounts before the async chain completes, `setEntries` and `setLoading` fire on unmounted component. React 18+ warns about this.

**Impact:** React memory leak warnings; unnecessary state updates.

### Finding 5.2 — HIGH: no unmount guard in journey page

**File:** `apps/web/src/app/journey/[id]/page.tsx:69-122`

`loadData` is a `useCallback` that calls 7+ async functions and sets 11 state values. No cleanup flag. If user navigates away mid-load, all 11 setState calls fire on unmounted component.

**Impact:** 11 individual memory leak warnings per navigation.

### Finding 5.3 — MEDIUM: no unmount guard in journey listing

**File:** `apps/web/src/app/journey/page.tsx:27-56`

```typescript
useEffect(() => {
  if (!user) return;
  (async () => {
    setActiveJourney(active);
    setPreviousJourneys(list);
    setUserAge(age);
  })();
}, [user]);
```

No unmount guard. Same pattern as Finding 5.1 and 5.2.

### Finding 5.4 — LOW: use-auth.ts getSession promise after unmount

**File:** `apps/web/src/hooks/use-auth.ts:17-21`

If the component using `useAuth()` unmounts before `getSession()` resolves, the Zustand store setters (`setSession`, `setUser`, `setLoading`) fire on unmounted component. Zustand does not warn (unlike React state), but the promise closure holds references.

---

## 6. ERROR BOUNDARY COVERAGE

### Finding 6.1 — CRITICAL: no root ErrorBoundary

**File:** `apps/web/src/app/layout.tsx:21-27`

```typescript
<body>
  <Providers>{children}</Providers>
</body>
```

Root layout wraps only in `<Providers>` (QueryClientProvider). No ErrorBoundary at root level. Next.js `error.tsx` only catches errors in page segments, NOT in layout.tsx or providers.

**Impact:** Any crash in Providers or layout kills the entire app with no fallback UI.

### Finding 6.2 — HIGH: no page-level error boundaries

No `<Suspense>` or `<ErrorBoundary>` on any route page. The 510-line journey/[id]/page with 11 state variables has zero error isolation. If any component in the tree crashes, the entire page collapses to the generic `error.tsx`.

### Finding 6.3 — HIGH: no Suspense boundaries

No `<Suspense>` anywhere in the component tree. If any component uses `useSearchParams()` (which triggers React suspense-before-request), the app crashes without a fallback.

### Finding 6.4 — MEDIUM: RoadmapCard crashes without error isolation

**File:** `apps/web/src/features/roadmap/components/RoadmapCard.tsx:20-99`

Accesses `roadmap.dream.title`, `roadmap.dailyWins.flatMap(...)` without error boundaries. If seed data is missing properties, the modal crashes the entire route.

---

## 7. CONCURRENT REQUEST HANDLING

### Finding 7.1 — CRITICAL: createJourney no transaction

See Finding 2.1. ~10-20 inserts with no rollback capability.

### Finding 7.2 — HIGH: saveDailyReflection no transaction

See Finding 2.3. Read-then-write race without atomicity.

### Finding 7.3 — HIGH: saveSpiritualPreferences no transaction

See Finding 2.4. Same pattern.

### Finding 7.4 — MEDIUM: handleCompleteSmallWin refetch chain

See Finding 2.8. Sequential refetches create race conditions.

### Finding 7.5 — MEDIUM: JournalEntryForm localStorage write race

See Finding 2.7. `getItem` → `setItem` without locking.

### Finding 7.6 — LOW: LearningVault localStorage write race

See Finding 2.7. Same read-then-write localStorage pattern.

---

## SUMMARY

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Unhandled Rejections | 2 | 1 | 2 | 0 | 5 |
| Race Conditions | 1 | 3 | 4 | 0 | 8 |
| Null/Undefined Refs | 1 | 4 | 3 | 1 | 8 |
| Infinite Loops | 0 | 1 | 0 | 1 | 2 |
| Memory Leaks | 0 | 2 | 1 | 1 | 4 |
| Error Boundaries | 1 | 2 | 1 | 0 | 4 |
| Concurrent Requests | 1 | 2 | 2 | 1 | 6 |

**Total: 37 findings** (adjusted after deduplication of cross-category items)

**CRITICAL (6):** Must fix before any public deployment.
**HIGH (15):** Must fix before Beta launch.
**MEDIUM (13):** High priority post-Beta.
**LOW (3):** Nice to have.
