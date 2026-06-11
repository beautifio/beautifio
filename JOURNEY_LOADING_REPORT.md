# Journey Loading Failure — Audit Report

## Error

```
406 Not Acceptable
GET dream_journeys?user_id=<current_user>&status=active
```

## Root Cause

**Supabase `.single()`** throws a `406 Not Acceptable` when a query returns **zero rows**. The `getActiveJourney()` function used `.single()` on `dream_journeys` filtered by `user_id` + `status=active`. When the user has no active journey, no rows match, and `.single()` rejects instead of returning `null`.

## All `.single()` Calls in journey-queries.ts

| Line | Function | Table | Risk | Fixed |
|------|----------|-------|------|-------|
| 30 | `getActiveJourney` | `dream_journeys` | 🔴 406 if no active journey | `maybeSingle` |
| 45 | `createJourney` (template lookup) | `dream_templates` | 🟡 406 if slug invalid | `maybeSingle` |
| 57 | `createJourney` (insert return) | `dream_journeys` | 🟢 Insert always returns 1 row | kept `.single()` |
| 75 | `createJourney` (big_wins insert) | `big_wins` | 🟢 Insert always returns 1 row | kept `.single()` |
| 243 | `getTodayReflection` | `daily_reflections` | 🔴 406 if no reflection today | `maybeSingle` |
| 279 | `getSpiritualPreferences` | `spiritual_preferences` | 🔴 406 if no preferences set | `maybeSingle` |

## Changes Made

### 1. journey-queries.ts — `.single()` → `.maybeSingle()`

- `getActiveJourney` — **primary fix for 406**
- `createJourney` template lookup — defensive fix
- `getTodayReflection` — defensive fix (affects home, profile, journey detail)
- `getSpiritualPreferences` — defensive fix (affects journey detail)

### 2. /journey/page.tsx — try/catch + empty state

- Added `try/catch` around `getActiveJourney` and `getAllJourneys`
- Empty state: "Kamu belum memulai perjalanan." (was "Mulai Perjalananmu")

### 3. /home/page.tsx — NoJourney copy

- Text: "Kamu belum memulai perjalanan."
- Button: "Pilih Mimpi Pertamamu" → navigates to `/journey`

## RLS Policy Verification

```sql
dream_journeys:
  - "Users can view own journeys"  →  FOR SELECT USING (auth.uid() = user_id)  ✅
  - "Users can create own journeys" →  FOR INSERT WITH CHECK (auth.uid() = user_id) ✅
  - "Users can update own journeys" →  FOR UPDATE USING (auth.uid() = user_id) ✅
```

RLS is correct. The 406 was **not an RLS issue** — authenticated users can SELECT their own rows. The problem was `.single()` expecting exactly 1 row when 0 existed.

## Database Verification

- `dream_journeys` table exists ✅ (from migration `00009_dream_journey.sql`)
- `min_age`, `max_age` columns exist ✅ (from migration `00010_dream_journey_age.sql`)
- All 3 RLS policies exist and are correct ✅

## Summary

| Step | Status |
|------|--------|
| 1. Find all dream_journeys queries | ✅ 6 found in journey-queries.ts |
| 2. Check `.single()` usage | ✅ 4 risky calls identified |
| 3. Replace with `.maybeSingle()` | ✅ All fixed |
| 4. Add graceful empty state | ✅ Home + journey page |
| 5. Verify table exists | ✅ Confirmed |
| 6. Verify RLS policies | ✅ 3 policies, all correct |
| 7. Build | ✅ Clean |
