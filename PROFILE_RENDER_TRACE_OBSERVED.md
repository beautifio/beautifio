# PROFILE_RENDER_TRACE_OBSERVED

## Method

- Browser: Chromium 149.0.7827.115 (headless)
- Tool: playwright-core
- URL: http://localhost:3456/profil
- Auth: Supabase session cookie (`sb-sivltqvqkbaykuazwdja-auth-token`) set to `base64-<session-JSON>` before navigation
- Middleware: active (no modifications)
- Instrumentation: `[AUTH-STORE]`, `[USE-AUTH]`, `[PROFILE]` console.log tags
- Wait: 60 seconds after page `load` event
- Output: all console lines matching instrumented tags

## Definitions

- `render #N` — each call to the component function body (identified by `useRef` counter)
- `BRANCH` — which JSX path was entered:
  - `auth-skeleton` — `if (isLoading) return <Skeleton />`
  - `login-prompt` — `if (!user) return <LoginPrompt />`
  - `data-skeleton` — `if (dataLoading) return <Skeleton />`
  - `content` — `return <ProfileHero /><MyJourneySection />...`

---

## Observed Render Sequence (Complete, Sampled)

### Render 1
```
[PROFILE] render #1 (no state change)
[PROFILE] render #1 BRANCH: auth-skeleton
[USE-AUTH] render #1 | user=null | isLoading=true | session=false

State at Render 1:
  user=null
  session=false
  isLoading=true
  dataLoading=true
  dataError=null
  BRANCH: auth-skeleton
```

### Render 2
```
[PROFILE] render #2 (no state change)
[PROFILE] render #2 BRANCH: auth-skeleton
[USE-AUTH] render #2 | user=b89dcfc2 | isLoading=true | session=true

State at Render 2:
  user=b89dcfc2
  session=true
  isLoading=true
  dataLoading=true
  dataError=null
  BRANCH: auth-skeleton
```
Event between Render 1 and Render 2:
- onAuthStateChange(INITIAL_SESSION) fires → setSession: false→true → setUser: null→b89dcfc2

### Render 3
```
[PROFILE] render #3 | isLoading: true→false | user: b89dcfc2→b89dcfc2 | dataLoading: true→true | dataError: null→null
[PROFILE] render #3 BRANCH: data-skeleton
[USE-AUTH] render #3 | user=b89dcfc2 | isLoading=false | session=true

State at Render 3:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=true
  dataError=null
  BRANCH: data-skeleton
```
Events between Render 2 and Render 3:
- getSession resolves → setSession: true→true → setUser: b89dcfc2→b89dcfc2 → setLoading: true→false
- loadProfileData START with user b89dcfc2

### Render 4
```
[PROFILE] render #4 (no state change)
[PROFILE] render #4 BRANCH: data-skeleton
[USE-AUTH] render #4 | user=b89dcfc2 | isLoading=false | session=true

State at Render 4:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=true
  dataError=null
  BRANCH: data-skeleton
```
Event between Render 3 and Render 4:
- Timer `loadProfileData` already exists (second `loadProfileData` fired before first completed)
- setDataLoading: true→true
- setDataError: null→null

### Render 5
```
[PROFILE] render #5 | isLoading: false→false | user: b89dcfc2→b89dcfc2 | dataLoading: true→false | dataError: null→null
[PROFILE] render #5 BRANCH: content
[USE-AUTH] render #5 | user=b89dcfc2 | isLoading=false | session=true

State at Render 5:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=false
  dataError=null
  BRANCH: content
```
Events between Render 4 and Render 5:
- getActiveJourney returned: undefined undefined
- setJourney: null
- loadProfileData END (timing)
- setDataLoading: true→false

### Render 6
```
[PROFILE] render #6 | isLoading: false→false | user: b89dcfc2→b89dcfc2 | dataLoading: false→false | dataError: null→null
[PROFILE] render #6 BRANCH: content
[USE-AUTH] render #6 | user=b89dcfc2 | isLoading=false | session=true

State at Render 6:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=false
  dataError=null
  BRANCH: content
```
Events between Render 5 and Render 6:
- ProfileHero mounts → `[USE-AUTH] render #1` (separate component instance)
- useAuth useEffect creates subscription
- onAuthStateChange(INITIAL_SESSION) fires
- setSession: true→true
- setUser: b89dcfc2→b89dcfc2

### Render 7
```
[PROFILE] render #7 | isLoading: false→false | user: b89dcfc2→b89dcfc2 | dataLoading: false→true | dataError: null→null
[PROFILE] render #7 BRANCH: data-skeleton
[USE-AUTH] render #7 | user=b89dcfc2 | isLoading=false | session=true

State at Render 7:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=true
  dataError=null
  BRANCH: data-skeleton
```
Events between Render 6 and Render 7:
- `[PROFILE] useEffect triggered, calling loadProfileData`
- setDataLoading: false→true

### Render 8
```
[PROFILE] render #8 (no state change)
[PROFILE] render #8 BRANCH: data-skeleton
[USE-AUTH] render #8 | user=b89dcfc2 | isLoading=false | session=true

State at Render 8:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=true
  dataError=null
  BRANCH: data-skeleton
```

### Render 9
```
[PROFILE] render #9 | isLoading: false→false | user: b89dcfc2→b89dcfc2 | dataLoading: true→false | dataError: null→null
[PROFILE] render #9 BRANCH: content
[USE-AUTH] render #9 | user=b89dcfc2 | isLoading=false | session=true

State at Render 9:
  user=b89dcfc2
  session=true
  isLoading=false
  dataLoading=false
  dataError=null
  BRANCH: content
```
Events between Render 8 and Render 9:
- getActiveJourney returned: undefined undefined
- setJourney: null
- loadProfileData END
- setDataLoading: true→false

---

## Observed Repetition (Renders 9+)

Renders 5-9 repeat identically for the duration of the capture (60 seconds).

```
Render N     BRANCH: content
             → ProfileHero mounts
             → onAuthStateChange(INITIAL_SESSION)
             → setUser(user) → zustand state change

Render N+1   BRANCH: content
             → loadProfileData useEffect fires

Render N+2   BRANCH: data-skeleton  (setDataLoading(true))
             → queries execute

Render N+3   BRANCH: data-skeleton  (queries still running)

Render N+4   BRANCH: content  (setDataLoading(false))
             → ProfileHero mounts again
             → GOTO Render N
```

Each cycle completes in approximately 20-200ms (query-dependent).

No deviation from this pattern was observed in 2500+ renders.

---

## Final Observed State (after 60 seconds)

### State Values

| Variable | Value |
|---|---|
| `user` | `b89dcfc2` (never changes) |
| `session` | `true` (never changes) |
| `isLoading` | `false` (never changes after Render 2) |
| `dataLoading` | **cycling** `false` → `true` → `false` ... |
| `dataError` | `null` (never changes) |

### Branch

**Never settles.** Alternates between `content` and `data-skeleton` indefinitely.

### Queries

| Query | Result |
|---|---|
| `getActiveJourney` | Returns `undefined` (no active journey for test user) |
| `getJourneyProgress` | Not called (no journey) |
| `getTimeline` | Not called (no journey) |
| All query durations (sampled) | 7ms, 9ms, 11ms, 13ms, 15ms, 21ms, 35ms, 53ms, 54ms, 89ms, 106ms |

All queries resolve successfully. No hanging.

---

## Answers

### 1. What is the last log line emitted?

The last log line observed before output truncation at 180s timeout:

```
[PROFILE] render #2512 BRANCH: data-skeleton
```

(At this point the test harness was killed by timeout. The render loop was still active with no sign of stopping.)

### 2. What is the last render number reached?

**PROFILE render #2512** (truncated by 180s timeout). The render loop was still active.

The `[USE-AUTH]` effect counter reached **#1267** (individual effect runs across all `useAuth` instances).

Child components (ProfileHero) consistently show `[USE-AUTH] render #1` and `render #2` — they mount, render twice, then unmount as the branch switches.

### 3. Which state value never changes afterward?

Three state values stabilize and never change after Render 3:

- `user` = `b89dcfc2` (same object reference shown throughout)
- `isLoading` = `false` (set once, never changes again)
- `dataError` = `null` (set once, never changes again)

### 4. Which function never returns?

No function is permanently stuck. Every function call returns:

- `getActiveJourney()` returns in 7–106ms (returns `undefined`)
- `loadProfileData` runs to completion (including `finally` block) in 7–437ms
- All `setState` calls execute
- `useEffect` cleanup functions run (subscription unsubscribe)

**But `dataLoading` never stabilizes.** It is perpetually toggled by the render loop.

### 5. Which line of code is waiting forever?

No single line is blocking. The component is in a **perpetual re-render cycle**:

```
[PROFILE] useEffect triggered, calling loadProfileData   ← line 432-434
  → setDataLoading(true)                                  ← line 397
  → await getActiveJourney() ...                          ← line 404 (resolves quickly)
  → setDataLoading(false)                                 ← line 428
  → (child mount triggers zustand state change)
  → ProfileScreen re-renders
  → loadProfileData identity changes
  → GOTO first line
```

The cycle is driven by: child component `ProfileHero` calling `useAuth()`, which subscribes to `onAuthStateChange`, which fires `INITIAL_SESSION`, which calls `setUser(user)` on zustand store, which creates a new state object, which causes `loadProfileData` to be re-created with a new identity (because the `user` reference passed to `useCallback([user])` changed), which triggers the `useEffect([loadProfileData])` cleanup+re-run.

There is no external waiting point. The 60-second capture shows continuous re-rendering with no progression to a terminal state.
