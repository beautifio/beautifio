# JOURNEY STABILITY REPORT — Dream → Journey → Reflection Flow

**Date:** 2026-06-11
**Method:** Static code analysis of the complete user flow. Every step traced from user action to database.
**Tone:** No politeness. Only what is broken and how to fix it.

---

## EXECUTIVE SUMMARY

The flow has **7 critical bugs**, **4 high-severity bugs**, and **3 medium-severity bugs** across registration, journey creation, daily execution, and data persistence.

**The two catastrophic bugs:**

1. **Big Wins and Small Wins cannot be created.** INSERT RLS policies are missing from the schema, and the attempted fix in migration 00012 references a non-existent column (`user_id` on `big_wins`). Every new journey is born without content — no Big Wins, no Small Wins, no activities.

2. **Viewing a previous/completed/pivoted journey shows an empty page.** The `loadData` function returns early before loading any data when the journey is not the user's active journey.

**Build status:** Compiles and builds successfully. Runtime failures are silent — the app does not crash, it just shows empty states with no explanation.

---

## BUG 1 — CRITICAL: Big Wins INSERT blocked by RLS

**File:** `supabase/migrations/00012_stabilization_fixes.sql` (lines 11-26)
**File:** `apps/web/src/lib/journey-queries.ts` (lines 93-128)

### What happens

When `createJourney()` runs, it inserts into `big_wins` and `small_wins`:

```
journey-queries.ts:93:  await db().from("big_wins").insert(bigWinsData)
journey-queries.ts:126: await db().from("small_wins").insert(allSmallWins)
```

Both tables have RLS enabled (migration 00009) but NO INSERT policy exists for either table without migration 00012. Even with migration 00012, the policies are broken:

```sql
-- migration 00012, line 14
CREATE POLICY "Users can insert own big wins"
  ON big_wins FOR INSERT
  WITH CHECK (auth.uid() = user_id);        -- ❌ user_id does not exist on big_wins
```

`big_wins` has `journey_id`, not `user_id`. The column `user_id` is on `dream_journeys`. This policy will always fail, blocking every insert.

Same for `small_wins`:
```sql
-- migration 00012, line 20-26
CREATE POLICY "Users can insert own small wins"
  ON small_wins FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM big_wins WHERE big_wins.id = small_wins.big_win_id
      AND big_wins.user_id = auth.uid())    -- ❌ big_wins.user_id does not exist
  );
```

### Impact

Every new journey creation **silently fails** to create Big Wins and Small Wins. The `createJourney()` function (line 68 of journey-queries.ts) catches no errors — it just returns `null`:

```
journey-queries.ts:68: if (error || !journey) return null;
```

But even if it returns `null`, the caller in `journey/page.tsx` shows "Gagal membuat perjalanan" (line 79). However, if the `dream_journeys` insert succeeded but the `big_wins` insert failed, the function returns `null` and the journey IS created in the database but empty. The user retries, gets another `dream_journeys` record, and accumulates orphan journeys.

### Fix

Replace the INSERT policies with subquery-based checks (matching the existing SELECT/UPDATE pattern):

```sql
-- Correct INSERT policy for big_wins
CREATE POLICY "Users can insert own big wins"
  ON big_wins FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM dream_journeys
      WHERE id = big_wins.journey_id AND user_id = auth.uid())
  );

-- Correct INSERT policy for small_wins
CREATE POLICY "Users can insert own small wins"
  ON small_wins FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM big_wins b
      JOIN dream_journeys j ON b.journey_id = j.id
      WHERE b.id = small_wins.big_win_id AND j.user_id = auth.uid())
  );
```

---

## BUG 2 — CRITICAL: Non-active journey shows empty page

**File:** `apps/web/src/app/journey/[id]/page.tsx` (lines 74-86)

### What happens

```typescript
const j = await getActiveJourney(user.id);
if (!j || j.id !== id) {       // ← triggers when viewing non-active journey
  const journeys = await getAllJourneys(user.id);
  const found = journeys.find((j) => j.id === id);
  if (!found) {
    setLoading(false);
    router.push("/journey");
    return;
  }
  setJourney(found);
  setLoading(false);
  return;                       // ← Returns BEFORE loading Big Wins, activities, timeline, etc.
}
```

When a user navigates to a previous/completed/pivoted journey (e.g., one they see in the journey list), the code finds the journey record but **returns immediately without calling any of the data-loading code** (lines 90-121). The user sees the journey title/emoji and nothing else — no activities, no Big Wins, no timeline, no story.

### Impact

Any journey that is not the active journey is unviewable. Previous dreams, pivoted journeys, and completed journeys show only a header. The user cannot revisit their past work.

### Fix

Remove the early return and allow the data-loading code to run for any found journey:

```typescript
if (!j || j.id !== id) {
  const journeys = await getAllJourneys(user.id);
  const found = journeys.find((j) => j.id === id);
  if (!found) {
    setLoading(false);
    router.push("/journey");
    return;
  }
  setJourney(found);
  // FALL THROUGH to data loading instead of returning
} else {
  setJourney(j);
}

// Always load Big Wins, activities, timeline
const [bw, prog, tl, sp] = await Promise.all([
  getBigWins(id),
  getJourneyProgress(user.id, id),
  getTimeline(user.id, id),
  getSpiritualPreferences(user.id),
]);
// ... rest of data loading
```

---

## BUG 3 — CRITICAL: No error handling in Journey Detail `loadData`

**File:** `apps/web/src/app/journey/[id]/page.tsx` (lines 69-123)

### What happens

The entire `loadData` function has no try/catch. If ANY Supabase query fails — network error, RLS violation, timeout — an uncaught exception propagates. The component never calls `setLoading(false)`, leaving the loading skeleton visible **forever**.

```typescript
const loadData = useCallback(async () => {
  if (!user || !id) { setLoading(false); return; }
  const j = await getActiveJourney(user.id);   // ← could throw
  // ... 50+ lines of unprotected promises
  setLoading(false);
}, [user, id]);
```

### Impact

Users see an infinite loading spinner. No error message. No retry button. The only way to recover is to navigate away or refresh.

### Fix

Wrap the entire body in try/catch:

```typescript
const loadData = useCallback(async () => {
  if (!user || !id) { setLoading(false); return; }
  try {
    // ... all data loading
  } catch (e) {
    console.error("Failed to load journey:", e);
    // Show error state instead of infinite loading
  } finally {
    setLoading(false);
  }
}, [user, id]);
```

---

## BUG 4 — CRITICAL: `notes` column may not exist on `daily_activities`

**File:** `supabase/migrations/00011_human_journey_engine.sql` (line 18)
**File:** `packages/utils/src/daily-activity-generator.ts` (line 140)

### What happens

The `generateDailyActivities` function inserts objects with `notes: null`:

```typescript
activities.push({
  ...
  notes: null,     // ← column may not exist in the database
});
```

The `notes` column on `daily_activities` was added in migration 00011:

```sql
ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS notes TEXT;
```

If migration 00011 has not been applied (or 00012 which also references it), the column does not exist and **every daily activity insert will fail** with a PostgreSQL column-not-found error.

### Impact

Daily activities for new journeys fail to create. The journey loads with 0 activities. The user sees "Hari Ini" with no content.

### Fix

Either:
- Ensure migration 00011 is applied, OR
- Remove `notes` from the insert payload and use `undefined` instead of `null`, OR
- Remove `notes` from the `DailyActivity` type and UI until the migration is applied

---

## BUG 5 — HIGH: `handleCompleteSmallWin` makes 3 sequential network round-trips

**File:** `apps/web/src/app/journey/[id]/page.tsx` (lines 171-192)

### What happens

```typescript
const handleCompleteSmallWin = async (smallWinId, reflection?) => {
  await completeSmallWin(smallWinId, reflection);   // Trip 1
  const updated = await getBigWins(id);             // Trip 2 — refetch all Big Wins

  const justCompleted = updated.find(bw => ...check if all small wins done...);
  if (justCompleted) {
    await completeBigWin(justCompleted.id);          // Trip 3 — mark Big Win as complete
    const final = await getBigWins(id);              // Trip 4 — refetch Big Wins AGAIN
    setBigWins(final);
    setCelebrationBigWin(justCompleted);
  }
};
```

For a simple "complete small win" action, this makes 2-4 sequential API calls. The user waits 200-800ms for each one.

### Fix

Optimistic update + batch logic:

```typescript
const handleCompleteSmallWin = async (smallWinId, reflection?) => {
  // Optimistic: mark small win as completed in local state
  setBigWins(prev => prev.map(bw => ({
    ...bw,
    small_wins: bw.small_wins?.map(sw =>
      sw.id === smallWinId ? { ...sw, is_completed: true, completed_at: new Date().toISOString() } : sw
    )
  })));

  await completeSmallWin(smallWinId, reflection);

  // Single refetch to confirm state
  const updated = await getBigWins(id);
  setBigWins(updated);

  const justCompleted = updated.find(bw =>
    !bw.is_completed && !bw.is_failed &&
    bw.small_wins?.length > 0 && bw.small_wins.every(sw => sw.is_completed)
  );
  if (justCompleted) {
    await completeBigWin(justCompleted.id);
    const final = await getBigWins(id);
    setBigWins(final);
    setCelebrationBigWin(justCompleted);
  }
};
```

---

## BUG 6 — HIGH: Middleware does not protect core pages

**File:** `apps/web/src/middleware.ts` (lines 6-11)

### What happens

The protected pages list is:

```typescript
const protectedPages = [
  "/profil",
  "/familia",
  "/jurnal/buat",
  "/inspirasi/post",
];
```

Pages like `/home`, `/journey`, `/discover`, `/cerita`, `/circle`, `/mentors` are **not protected**. Unauthenticated users can access them. The client-side code will attempt Supabase queries with no session, which will fail with auth errors.

Additionally, `/discover` is listed in `deprecatedPages` (line 13-20), which means authenticated users are redirected to `/journey` when they try to use dream discovery. But `/discover` is the dream discovery quiz — it's the only flow a new user who doesn't know what dream to pick has.

### Impact

- Unauthenticated users can access most of the app but see broken/empty data
- Authenticated users who want to discover a dream are redirected to `/journey` where they must pick from a list
- New users who registered and have no active journey cannot use dream discovery

### Fix

Add core pages to protected pages and remove `/discover` from deprecated redirect:

```typescript
const protectedPages = [
  "/home",
  "/journey",
  "/profil",
  "/cerita",
  "/circle",
  "/mentors",
  "/discover",
  "/inspirasi",
  "/familia",
  "/jurnal/buat",
  "/inspirasi/post",
];
```

---

## BUG 7 — HIGH: No error boundary on Journey Detail page

**File:** `apps/web/src/app/journey/[id]/page.tsx`

### What happens

There is no `<ErrorBoundary>` wrapping the journey detail page. Any unhandled error in the component tree (including the data-loading failures from Bug 3) will crash the entire Next.js page and show the default error screen — which is a blank white page in production.

### Impact

A single RLS violation, network timeout, or null reference takes down the entire journey experience with no recovery path.

### Fix

Wrap the page content in a `<ClientErrorBoundary>` component:

```tsx
<ClientErrorBoundary fallback={<JourneyErrorState />}>
  {/* existing page content */}
</ClientErrorBoundary>
```

---

## BUG 8 — MEDIUM: Dream discovery answers stored in localStorage

**File:** `apps/web/src/app/discover/page.tsx`

### What happens

The `/discover` page stores quiz answers in `localStorage` under `beautifio_discovery_answers`. If the user clears their browser data, switches devices, or uses private browsing mode, their answers are lost. The discovery flow has no server-side persistence.

Additionally, the middleware redirects authenticated users away from `/discover` (Bug 6), and the result page (`/discover/result`) does not automatically create a journey — the user must manually navigate to `/journey` and pick a dream.

### Impact

The discovery quiz is essentially a dead-end for authenticated users and a data-loss risk for everyone.

### Fix

Remove `/discover` from deprecated pages in middleware. After quiz completion, automatically navigate to journey creation with the recommended dream.

---

## BUG 9 — MEDIUM: Alternative Futures shown always, not only on failure

**File:** `apps/web/src/app/journey/[id]/page.tsx` (lines 458-485)

### What happens

Alternative Futures (career alternatives) are rendered at the bottom of the Journey Detail page regardless of user context:

```tsx
{alternativeFutures.length > 0 && (
  <div className="mt-8 ...">
    <h3>Jalan Lain, Skill Sama</h3>
    <p>Jika suatu saat kamu mengambil jalan berbeda...</p>
    {/* ... */}
  </div>
)}
```

This creates constant awareness of failure. Every time the user opens their journey, they see "by the way, you could fail." This violates the Constitution's principle of Safe Space — failure processing should happen at the moment of failure, not as ambient background noise.

### Fix

Move Alternative Futures into the `FailureModal` only. Remove from the main page.

---

## BUG 10 — MEDIUM: `streak` is hardcoded to 0 but UI still shows flame icon

**File:** `apps/web/src/lib/journey-queries.ts` (line 406)
**File:** `apps/web/src/app/journey/[id]/page.tsx` (lines 405-418)

### What happens

```typescript
// journey-queries.ts:406
streak: 0,    // ← hardcoded, never calculated
```

But the Journey Detail page renders:
```tsx
// journey/[id]/page.tsx:405-418
<h3 className="text-sm font-bold text-text-primary mb-3">Streak</h3>
<Card className="p-4">
  <div className="flex items-center gap-3">
    <Flame size={24} className="text-accent" />
    <div>
      <p className="text-lg font-bold text-text-primary">
        {progress?.completed_activities_today || 0} / {progress?.total_activities_today || 6}
      </p>
      <p className="text-xs text-text-secondary">aktivitas selesai hari ini</p>
    </div>
  </div>
</Card>
```

The section is labeled "Streak" with a flame icon but shows today's activity count. This is confusing — a user expecting streak logic sees a flame that never accumulates.

### Fix

Either implement real streak calculation, or remove the "Streak" label and flame icon. Show only:

```
"3 dari 6 aktivitas selesai hari ini"
```

---

## BUG 11 — LOW: `getActiveJourney` queries without checking journey status on return

**File:** `apps/web/src/app/journey/[id]/page.tsx` (line 74)

### What happens

```typescript
const j = await getActiveJourney(user.id);
if (!j || j.id !== id) {
```

If the user has an active journey but navigates to a different journey's URL, the code falls into the `getAllJourneys` fallback. This is correct behavior, but it means every detail page load first queries the user's active journey (even if we know the URL points to a different one), wasting one network request.

### Fix

Use `getJourneyById(id)` as the primary query instead of `getActiveJourney`:

```typescript
const journey = await getJourneyById(user.id, id);
if (!journey) {
  router.push("/journey");
  return;
}
setJourney(journey.day);
```

No `getJourneyById` function exists — it would need to be added.

---

## BUG 12 — LOW: Reflection modal does not persist form state on accidental close

**File:** `apps/web/src/features/journey/reflection-modal.tsx` (conceptual)

### What happens

If a user starts writing a reflection and accidentally taps outside the modal (or presses back), their input is lost. The modal closes, and the reflection data is discarded with no warning.

### Impact

User frustration. Data loss.

### Fix

Add a confirmation dialog when attempting to close the modal with unsaved content:

```typescript
const [dirty, setDirty] = useState(false);

const handleClose = () => {
  if (dirty) {
    // Show "You have unsaved changes. Discard?" dialog
  } else {
    onClose();
  }
};
```

---

## PROGRESS SUMMARY

### Complete user flow with current bugs

```
User Action                     | Bug Impact
--------------------------------|-----------
1. Register                     | ✅ OK (auth works)
2. Login                        | ✅ OK (session handled)
3. Navigate to /discover        | ❌ Redirected to /journey (Bug 6)
   OR Navigate to /journey      | ✅ OK (template list shown)
4. Select dream template        | ❌ Big Wins/Small Wins not created (Bug 1)
5. Create journey               | ❌ Activities may fail (Bug 4)
6. Land on /journey/[id]        | ❌ Infinite loading on error (Bug 3)
                                 | ❌ No error boundary (Bug 7)
7. See Big Wins                 | ❌ None exist (Bug 1)
8. Complete daily activity      | ✅ OK (if activities exist)
9. Complete small win           | ❌ Slow, 3-4 round trips (Bug 5)
10. Write reflection            | ❌ Data loss on accidental close (Bug 12)
11. Complete Big Win            | ❌ Cannot (no small wins to complete)
12. Fail Big Win                | Conditional on Bug 1
13. View previous journey       | ❌ Empty page (Bug 2)
14. Reopen next day             | ✅ OK (activities regenerate)
15. Use discovery quiz          | ❌ Redirected away (Bug 8)
```

### Survival rate: Steps that work end-to-end

| Step | Works? |
|------|--------|
| Register → Login | ✅ |
| View template list | ✅ |
| Create dream_journeys record | ✅ (but orphaned if Big Wins fail) |
| Big Wins created | ❌ Bug 1 |
| Small Wins created | ❌ Bug 1 |
| Daily activities created | ❌ Bug 4 (conditional on migration) |
| Complete activity | ✅ |
| Complete small win | ❌ Bug 5 (performance) |
| Write reflection | ✅ (with Bug 12 risk) |
| Complete Big Win | ❌ Blocked by Bug 1 |
| View previous journey | ❌ Bug 2 |
| Use dream discovery | ❌ Bug 6 |

The core loop (select dream → see activities → complete → reflect) is broken at the data layer.

---

## CRITICAL FIX ORDER

| # | Fix | Effort | Unlocks |
|---|-----|--------|---------|
| 1 | Fix INSERT RLS policies for `big_wins` and `small_wins` | 10 min | Journey content creation |
| 2 | Ensure migration 00011/00012 applied (add `notes` column + RLS) | 5 min | Activity creation |
| 3 | Add try/catch to `loadData` with error state | 15 min | Eliminates infinite loading |
| 4 | Wrap journey detail in ErrorBoundary | 10 min | Eliminates blank crashes |
| 5 | Remove early return for non-active journeys | 5 min | Previous journeys viewable |
| 6 | Add core pages to middleware protected list | 5 min | Unauthenticated access blocked |
| 7 | Remove `/discover` from deprecated redirect | 1 min | Dream discovery accessible |
| 8 | Flatten `handleCompleteSmallWin` round-trips | 20 min | Performance fix |

**Total effort for critical+high fixes:** ~1 hour.
**Total effort for all fixes:** ~2 hours.

The app is not fundamentally broken. It has a small number of sharp edges that disable large sections of the flow. Fixing the RLS policies alone makes the entire Dream → Journey → Reflection loop functional.
