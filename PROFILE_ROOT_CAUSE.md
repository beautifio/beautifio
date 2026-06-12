# Profile Page Root Cause Analysis

## Symptom

Bottom navigation → Profile cannot be opened. User taps "Profil" tab, page either shows infinite skeleton or empty/incorrect state.

---

## Investigation Results

### 1. Route Exists? ✅

File: `apps/web/src/app/profil/page.tsx` (396 lines, "use client")

Route is properly defined at `/profil`. Build output confirms: `○ /profil 4.61 kB 175 kB`.

### 2. Middleware Blocking? ✅ (Not the issue)

`apps/web/src/middleware.ts` line 9: `/profil` is in `protectedPages`. Authenticated users pass through. Unauthenticated users get redirected to `/login`. This is correct behavior.

### 3. Supabase Query Failure? ⚠️ (Contributing factor)

The profile page's data-loading `useEffect` (lines 338-358) calls:

```
getActiveJourney(user.id)       → queries dream_journeys
getJourneyProgress(user.id, id) → queries big_wins, daily_activities, daily_reflections
getTimeline(user.id, id, 3)     → queries growth_timeline_events
```

All relevant RLS policies exist for SELECT on all these tables. However:

- The `useEffect` has `try/catch` that only logs to console — **no user-visible error state**
- If any query fails (network, RLS, timeout), the error is silently swallowed
- The page renders with `null` data → user sees "Belum memiliki perjalanan" even if they have one

### 4. Infinite Loading? 🔴 **PRIMARY ROOT CAUSE**

The page has **two loading states** that can get stuck:

#### State A: `useAuth().isLoading` stays `true` forever

```
flow:
  ProfileScreen mounts
  → useAuth() returns isLoading: true (from Zustand store default)
  → Renders skeleton UI
  → useAuth's useEffect fires:
      → supabase.auth.getSession() called
      → If this Promise never resolves (network hang, Supabase Auth slow):
          → setLoading(false) NEVER called
          → isLoading stays true FOREVER
          → Skeleton renders indefinitely
      → If this Promise rejects (network error):
          → catch calls setLoading(false) ← handled
```

**This is the most likely cause.** The user sees a blank/skeleton page that never transitions to the real content.

There is **no timeout** on `getSession()`. There is **no retry mechanism**. There is **no fallback UI** for auth initialization failure.

#### State B: Data loading silently fails

```
flow:
  useEffect fires (user is set)
  → Dynamic import of journey-queries
  → getActiveJourney(user.id) — could fail silently
  → If journey exists:
      → Promise.all([getJourneyProgress, getTimeline]) — could fail silently
  → Any failure: catch { console.error(...) }
  → NO error state set, NO retry, NO user notification
```

### 5. Client-Side Exception? ⚠️ (Contributing factor)

The profile page uses these imports from `lucide-react`:

```typescript
Flame, CheckCircle2, Circle  ← also used in journey detail page
```

These icons exist in lucide-react. No import error at build time.

However, the page has a **duplicate pattern** with the journey detail page — both import `Flame`, `CheckCircle2`, `Circle`. The journey page had these imports removed in a previous fix, but the profile page still uses all three. No issue here, but inconsistent.

### 6. Missing Profile Row? 🟢 (Not an issue)

The profile page does NOT query a `profiles` table. It reads `user.user_metadata` from the Auth user object and queries `dream_journeys` for journey data. No profile row required.

### 7. RLS Policy Issue? 🟢 (Not an issue)

All relevant tables have SELECT policies:

| Table | Policy | Verified |
|-------|--------|----------|
| `dream_journeys` | `auth.uid() = user_id` | ✅ |
| `big_wins` | Subquery via `dream_journeys` | ✅ |
| `small_wins` | JOIN chain via `big_wins → dream_journeys` | ✅ |
| `daily_activities` | `auth.uid() = user_id` | ✅ |
| `daily_reflections` | `auth.uid() = user_id` | ✅ |
| `growth_timeline_events` | `auth.uid() = user_id` | ✅ |

### 8. Browser Console Error? 🔴 **CONFIRMED — Silent failures**

When data queries fail, the only output is `console.error("Failed to load journey", e)`. In production, these errors are invisible to the user and hard to diagnose without browser DevTools.

---

## Root Cause Summary

| Rank | Issue | Impact |
|------|-------|--------|
| **P0** | `getSession()` in `useAuth` has **no timeout** + **no fallback**. If auth initialization hangs, `isLoading` stays `true` forever. User sees permanent skeleton/blank page. | Page never renders real content |
| **P1** | Data-loading `useEffect` silently swallows all query errors. If `getActiveJourney`, `getJourneyProgress`, or `getTimeline` fail (network timeout, RLS, Supabase error), user sees wrong empty state ("Belum memiliki perjalanan") with no indication of failure. No retry button. | Wrong UI state, no recovery |
| **P2** | Dynamic import `await import("@/lib/journey-queries")` on every mount adds unnecessary async failure point. If module loading fails, the entire data-loading chain breaks silently. | Unnecessary risk on critical path |
| **P3** | No `loading` state distinction between auth-loading and data-loading. `isLoading` from `useAuth` controls the skeleton, but data loading has its own implicit loading phase with no visual feedback. | Confusing UX |

## Recommended Fix (minimal, no new features)

1. **Add timeout to `getSession()`** — if it doesn't resolve in 10 seconds, force `setLoading(false)` so the page renders the login prompt or tries again
2. **Add error state to profile data `useEffect`** — if queries fail, show a simple error banner with retry button (same pattern as journey detail page)
3. **Remove data-loading retry dependency on page re-mount** — add a manual retry mechanism

## Difference from Journey Detail Page

The journey detail page already had these fixes applied (in a previous session):
- `loadData` wrapped in try/catch with `error` state variable
- Error state UI with "Coba Lagi" button
- Loading skeleton with proper fallback

The profile page does NOT have any of these fixes. It's the same pattern of bugs, just on a different page.
