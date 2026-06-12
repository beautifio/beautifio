# Production Database Verification Report

**Date:** 2026-06-12  
**Project:** Beautifio (Supabase ref: `sivltqvqkbaykuazwdja`)  
**Method:** `supabase db query --linked` against production Supabase (Singapore region)

---

## Summary

| Migration | Status | Notes |
|-----------|--------|-------|
| 00011 — Human Journey Engine | **PARTIALLY APPLIED** | Schema changes present; `birth_date` on wrong table |
| 00012 — Stabilization Fixes | **PARTIALLY APPLIED** | RLS INSERT policies applied; `users.birth_date` missing; secondary policies missing |

**Verdict:** Neither migration has been fully applied. Production is in an inconsistent state.

---

## Check 1: `daily_activities` — does `notes` column exist?

**Result: ✅ EXISTS**

```
 column_name | data_type | is_nullable
-------------+-----------+-------------
 notes       | text      | YES
```

This was added by migration 00011 line 17-18. **Applied correctly.**

---

## Check 2: `users` — does `birth_date` column exist?

**Result: ❌ MISSING**

The `users` table does **not** have a `birth_date` column (empty result set from `information_schema.columns`).

**Root cause:** Migration 00011 added `birth_date` to `user_profiles` (line 11-12), not `users`. Migration 00012 intended to fix this by adding it to `users` (line 7-8) — **but this fix was never executed**.

### Secondary finding: `user_profiles` has `birth_date`

```
 column_name | data_type | is_nullable
-------------+-----------+-------------
 birth_date  | date      | YES
```

The original (incorrect) column from 00011 exists on `user_profiles`. The fix for `users` in 00012 is missing.

---

## Check 3: `big_wins` — are INSERT RLS policies present?

**Result: ✅ PRESENT**

Three policies exist on `big_wins`:

| Policy Name | Command | Definition |
|-------------|---------|------------|
| Users can create own big wins | **INSERT** | `EXISTS (SELECT 1 FROM dream_journeys WHERE dream_journeys.id = big_wins.journey_id AND dream_journeys.user_id = auth.uid())` |
| Users can update own big wins | UPDATE | Same subquery |
| Users can view own big wins | SELECT | Same subquery |

**The INSERT policy uses the correct subquery through `dream_journeys.user_id`** — no reference to non-existent `big_wins.user_id`.

---

## Check 4: `small_wins` — are INSERT RLS policies present?

**Result: ✅ PRESENT**

Three policies exist on `small_wins`:

| Policy Name | Command | Definition |
|-------------|---------|------------|
| Users can create own small wins | **INSERT** | `EXISTS (SELECT 1 FROM big_wins b JOIN dream_journeys j ON b.journey_id = j.id WHERE b.id = small_wins.big_win_id AND j.user_id = auth.uid())` |
| Users can update own small wins | UPDATE | Same JOIN chain |
| Users can view own small wins | SELECT | Same JOIN chain |

**The INSERT policy uses the correct JOIN chain** (`big_wins → dream_journeys → user_id`).

---

## Check 5: Do policies use `dream_journeys.user_id` instead of non-existent `big_wins.user_id`?

**Result: ✅ YES — both INSERT policies are correct**

Both `big_wins` and `small_wins` INSERT policies reference `dream_journeys.user_id` through subqueries. There is **no reference** to the non-existent `big_wins.user_id` column. These match migration 00012 lines 12-35 exactly.

---

## Check 6: INSERT capability for authenticated users

### `dream_journeys` — INSERT
**Cannot verify directly** (no `dream_journeys` INSERT policy queried — INSERT was already allowed by earlier migrations). Not a reported issue.

### `big_wins` — INSERT
**✅ Policy present and syntactically correct.** An authenticated user whose `auth.uid()` matches `dream_journeys.user_id` for the journey can insert.

### `small_wins` — INSERT
**✅ Policy present and syntactically correct.** An authenticated user can insert small wins if their `auth.uid()` matches through the `big_wins → dream_journeys` chain.

### `daily_activities` — INSERT
Not reported as broken. Not verified.

---

## Additional Findings: Missing 00012 Items

These parts of migration 00012 were **NOT** applied:

| Item | Expected | Actual |
|------|----------|--------|
| `users.birth_date` column | Column exists | **Missing** |
| `circle_members` DELETE policy | "Users can leave circles" | **Missing** (only SELECT + INSERT exist) |
| `milestones` INSERT policy | "Users can insert own milestones" | **Missing** (only SELECT + UPDATE exist) |
| Indexes (`idx_big_wins_journey_id`, etc.) | Created with `IF NOT EXISTS` | Already exist under different names, so no-ops |

### Existing indexes (pre-00012 naming):
```
idx_big_wins_journey              — covers (journey_id, order_index)
idx_small_wins_big_win            — covers (big_win_id, order_index)
idx_dream_journeys_user           — covers (user_id)
idx_daily_activities_user_date    — covers (user_id, activity_date)
idx_daily_activities_journey_date — covers (journey_id, activity_date)
idx_daily_reflections_journey     — covers (journey_id, date)
idx_timeline_user_date            — covers (user_id, event_date DESC)
idx_timeline_journey              — covers (journey_id, event_date DESC)
idx_dream_journeys_user_active    — covers (user_id) WHERE status = 'active'
```

These pre-existing indexes provide equivalent coverage to the ones in 00012, just under different names.

---

## Conclusion

**Production database state is inconsistent with what the application code expects.**

### What works:
- `daily_activities.notes` column ✅ (from 00011)
- `dream_journeys.user_age` column ✅ (from 00011)
- `small_wins.reflection` column ✅ (from 00011)
- `big_wins` + `small_wins` INSERT RLS policies ✅ (from 00012 — the critical fix)
- FK indexes have equivalent coverage ✅

### What's broken:
- **`users.birth_date`** is missing — migration 00012's `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE` was never run. The app code references `users.birth_date` but it doesn't exist.
- `circle_members` DELETE policy missing (non-critical, users can't leave circles)
- `milestones` INSERT policy missing (non-critical, milestones can't be created)

### Recommendation:
Run the outstanding portions of migration 00012:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

CREATE POLICY "Users can leave circles"
  ON circle_members
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
