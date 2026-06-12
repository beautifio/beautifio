# PROFILE PRODUCTION INCIDENT

## Evidence Collection

### Console Errors (Inferred from Code Path)
The profile page renders a skeleton that never resolves. The error state (`dataError`) is never triggered because no error is thrown — the promise chain never settles.

### Failed/Hanging Network Request
The request chain starts at `loadProfileData` → `getActiveJourney` → (if journey exists) `getJourneyProgress` + `getTimeline` via `Promise.all`.

### Exact Request Hanging
The `Promise.all` at `apps/web/src/app/profil/page.tsx:349` hangs because one of its dependent queries never completes:

**Hanging request:** Supabase SELECT on `big_wins` with joined `small_wins(*)` via `getBigWins()`.

### Exact Query Hanging
File: `apps/web/src/lib/journey-queries.ts:144-151`
```typescript
export async function getBigWins(journeyId: string): Promise<BigWin[]> {
  const { data } = await db()
    .from("big_wins")
    .select("*, small_wins(*)")
    .eq("journey_id", journeyId)
    .order("order_index");
  return data || [];
}
```

**Generated SQL:**
```sql
SELECT *, small_wins(*) FROM big_wins
WHERE journey_id = $1
ORDER BY order_index
```

**RLS policy evaluated per row on `big_wins`:**
```sql
EXISTS (SELECT 1 FROM dream_journeys WHERE id = big_wins.journey_id AND user_id = auth.uid())
```

**RLS policy evaluated per row on `small_wins` (join target):**
```sql
EXISTS (
  SELECT 1 FROM big_wins b
  JOIN dream_journeys j ON b.journey_id = j.id
  WHERE b.id = small_wins.big_win_id AND j.user_id = auth.uid()
)
```

### Exact Line Causing Loading State to Never Finish

**File:** `apps/web/src/app/profil/page.tsx:340-363`

```typescript
const loadProfileData = useCallback(async () => {
    if (!user) return;                                  // line 341
    setDataLoading(true);                                // line 342
    setDataError(null);                                  // line 343
    try {
      const { getActiveJourney, getJourneyProgress, getTimeline } =
        await import("@/lib/journey-queries");           // line 345
      const j = await getActiveJourney(user.id);         // line 346
      setJourney(j);                                     // line 347
      if (j) {                                           // line 348
        const [p, t] = await Promise.all([               // line 349 ← HANGS HERE
          getJourneyProgress(user.id, j.id),             // line 350
          getTimeline(user.id, j.id, 3),                 // line 351
        ]);
        setProgress(p);                                  // line 353
        setActivities(p.today_activities);               // line 354
        setTimeline(t);                                  // line 355
      }
    } catch (e) {
      console.error("Failed to load journey", e);         // line 358
      setDataError("Gagal memuat data perjalanan...");    // line 359
    } finally {
      setDataLoading(false);                              // line 361 ← NEVER REACHED
    }
}, [user]);                                              // line 363
```

**Root cause:** `Promise.all` at line 349 never settles because `getJourneyProgress` (line 350) internally calls `Promise.all` at `apps/web/src/lib/journey-queries.ts:382`:

```typescript
const [allBigWins, todayActivities, todayReflection] = await Promise.all([
    getBigWins(journeyId),           // ← SUSPECT: hangs on big_wins join query
    getTodayActivities(userId),
    getTodayReflection(userId),
]);
```

Since `Promise.all` rejects on ANY rejection (but never settles if any promise hangs), one of these three queries is hanging. The `getBigWins` query with the `*, small_wins(*)` join is the most likely candidate due to:
1. Cross-table RLS policy evaluation (two separate policies evaluated)
2. Join transformation by Supabase client into separate queries
3. Potential database lock contention on `big_wins` or `small_wins`

### Why Error State Is Never Reached
- The `try/catch` in `loadProfileData` would catch REJECTIONS but not HANGING promises
- `Promise.all` only rejects if a constituent promise rejects — it does NOT time out
- If `getBigWins` never resolves (or rejects), `Promise.all` never settles
- Therefore `finally { setDataLoading(false) }` never runs
- The UI stays on the data-loading skeleton

### Additional Vulnerability: Early Return Path

At line 341:
```typescript
if (!user) return;
```

When `user` is null (first render before auth resolves), this returns early **without** setting `dataLoading(false)`. Since `dataLoading` initial state is `true` (line 337), if the auth state never resolves, `dataLoading` remains `true` forever. The auth fallback at `apps/web/src/hooks/use-auth.ts:21-23` mitigates this with a `.catch()`, but the profile page's `loadProfileData` has no such safeguard on its early-return path.

### Command

No code changes yet. Production behavior is the source of truth.
