# UX AUDIT

**Date:** 2026-06-11
**Project:** Beautifio

---

## EXECUTIVE SUMMARY

The user experience across Beautifio's 34 routes ranges from incomplete to broken. Critical flows (login → journey) have blocking issues. Most pages lack error states, loading states, or empty states. The app has dead click targets, unlabeled icon buttons, inconsistent styling, and missing form validation. The overall UX maturity is estimated at **3/10**.

---

## 1. CRITICAL FLOW: LOGIN → JOURNEY (BLOCKED)

### Root Cause Chain

1. **Login succeeds** — Supabase auth returns session
2. **Middleware runs on redirect** — `middleware.ts` checks session, allows `/journey` pass-through (not in `authPages` blocklist)
3. **User lands on `/journey`** — `journey/page.tsx` fires `useEffect`:
   ```typescript
   useEffect(() => {
     if (!user) return;  // <--- EARLY RETURN if user is null
     // fetch data...
   }, [user]);
   ```
4. **If `useAuth()` returns `isLoading=true` forever** (due to unhandled `getSession()` rejection), `user` is never set → early return prevents any data fetching → user sees blank/loading state permanently

### Secondary Issues

- **`welcome/page.tsx`** — not shown to returning users; first-time flow depends on `onboarding_completed` flag that may not exist in `users` table (field exists in schema but upsert in `queries.ts:30` may fail silently)
- **`/home` accessible without auth** — middleware does not block `/home`; user sees blank dashboard
- **No "Continue Journey" call-to-action** — even when journey exists, `/journey` page shows a list, not a prominent "Lanjutkan" button

---

## 2. PAGE-BY-PAGE UX FINDINGS

### `/` (Landing)

| Issue | Details |
|-------|---------|
| **No loading state** | Page shows immediately (static) — OK, but no transition to auth state |
| **No offline state** | Entirely client-side; no graceful degradation |
| **CTA to login** | Present but no "try demo" option |

### `/login`

| Issue | Details |
|-------|---------|
| **No inline validation** | Empty email/password fields submit without feedback |
| **No loading state on submit** | Button shows no spinner; user may click multiple times |
| **Error display** | Errors shown via generic alert/div — no per-field error messages |
| **No "Lupa Password?" flow test** | `/forgot-password` exists but login → forgot-password redirect was not verified |

### `/register`

| Issue | Details |
|-------|---------|
| **No password strength indicator** | Users can set weak passwords |
| **No confirm password field** | Single password field — risk of typos |
| **No email verification flow** | After register, user lands... where? No redirect or success message observed |

### `/welcome`

| Issue | Details |
|-------|---------|
| **Two options: "Sudah Punya Tujuan" vs "Masih Bingung"** | Both routes redirect to `/journey` for authenticated users — the discovery/onboarding flows are **dead ends** |
| **"Sudah Punya Tujuan" → `/discover`** | Quiz exists but results do NOT create a journey — user sees recommendations then must manually navigate to `/journey` |
| **"Masih Bingung" → `/onboarding`** | 7-step form exists but after completion user still lands on `/journey` with no personalized recommendation — the entire onboarding flow is severed from journey creation |

### `/journey`

| Issue | Details |
|-------|---------|
| **Blank state when no user** | Early return `if (!user) return` renders NOTHING — shown when auth is loading |
| **No empty state** | When user has no active journey, shows nothing or stale data |
| **getAllJourneys fetches without limit** | As user creates more journeys, this loads all history — no pagination |
| **Dead card click** | Journey cards may not navigate if `router.push` fails or journey ID is null |
| **Error state** | `setError` exists now (from earlier fix) but UX of error display is a raw red `<div>` |

### `/journey/[id]`

| Issue | Details |
|-------|---------|
| **510-line monolithic page** | 11 state variables, 7+ async queries — impossible to maintain |
| **No Suspense boundary** | Page shows nothing until ALL data loads |
| **Skeleton inconsistency** | Some sections show skeleton, others don't — visual jank |
| **Stale closure in handleCompleteActivity** | See STABILITY_AUDIT — `completedAll` check reads stale `activities` |
| **No optimistic updates** | Clicking "complete activity" shows no immediate feedback until server responds |
| **Big win celebration modal** | May not show if race condition (Finding 7.5) skips the check |
| **No error recovery** | If `loadData` fails after partial state update, page is in inconsistent state |

### `/home`

| Issue | Details |
|-------|---------|
| **Redirect loop risk** | Middleware redirects to `/login?redirect=/home` when no session — but if session check is slow, flash of empty page |
| **No personalized greeting** | Shows generic header, no "Selamat datang, [Nama]" |
| **getJourneyProgress is slow** | 3 sequential queries block dashboard render |
| **No quick-action cards** | No shortcuts like "Tulis Jurnal", "Lihat Progress", "Komunitas" |

### `/profil`

| Issue | Details |
|-------|---------|
| **Dead edit buttons** | Tap "Ubah Profil" or edit icon — may do nothing if no handler wired |
| **No profile completion indicator** | No progress bar showing how much profile data is filled |
| **Avatar upload missing** | User cannot change profile picture |
| **User data may be null** | `useAuth()` returns `user` but profile fields may be empty |

### `/cerita`

| Issue | Details |
|-------|---------|
| **Only seed data** | No actual user-generated stories shown |
| **No empty state** | If no stories match filter, shows blank area |
| **Filter bar (CategoryBar) may crash** | `iconMap[cat.icon]` can return `undefined` → crash (see STABILITY_AUDIT) |

### `/cerita/[slug]`

| Issue | Details |
|-------|---------|
| **StoryCard content may crash** | `.replace()` on `undefined` content throws (STABILITY_AUDIT Finding 3.8) |
| **Missing image fallback** | If `cover_image` is null, shows broken image or nothing |
| **No related stories section** | After reading, no "recommended for you" |

### `/inspirasi`

| Issue | Details |
|-------|---------|
| **Standalone feature with no connection to journey** | Inspiration is disconnected from the core flow — user reads but can't save/apply to their goals |
| **No share/bookmark functionality** | No way to save an inspiration post |
| **Loading via seed data** | No server-rendered content; all client-side |

### `/jurnal`

| Issue | Details |
|-------|---------|
| **Dual storage (localStorage + Supabase)** | Entries saved to both — risk of inconsistency |
| **No auto-save** | User types content but must manually submit; browser refresh loses draft |
| **Empty state** | Shows nothing when no entries exist |
| **No mood/emotion tracking on entries** | `MoodSelector` may not persist to entry |

### `/familia`

| Issue | Details |
|-------|---------|
| **Dead click targets** | Voucher/deal/reward cards may have no tap handler |
| **Merchant PIN stored in plaintext** | UX allows PIN-based redemption but security is broken |
| **No loyalty explanation** | User sees vouchers but no explanation of how to earn them |
| **VoucherClaimModal timer** | Countdown timer works but modal may not close gracefully on expiration |

### `/circle`

| Issue | Details |
|-------|---------|
| **No create-circle flow** | User can browse circles but not create one |
| **No join button** | Circle cards may lack "Gabung" CTA |
| **Empty circle list** | Seed data only; no real communities exist |

### `/discover` + `/discover/result`

| Issue | Details |
|-------|---------|
| **Quiz results don't create a journey** | See welcome flow — discovery is a dead end |
| **No retake quiz option** | Once completed, user can't revisit or change answers |
| **Results page may not render** | `page-client.tsx` not used; inline `"use client"` may have hydration issues |

### `/onboarding`

| Issue | Details |
|-------|---------|
| **7-step form is entirely client-side** | Data saved to Supabase but app still redirects to `/journey` with no personalized journey created |
| **No progress indicator** | No step-X-of-7 visual |
| **No back navigation on step 1** | User can't go back from first step (no history) |
| **Step data may not persist** | If user refreshes mid-onboarding, all progress is lost |

### `/roadmap` + `/roadmap/[slug]`

| Issue | Details |
|-------|---------|
| **Static data only** | All roadmaps come from seed data — no personalization |
| **No "start this roadmap" CTA** | User views roadmap details but can't attach it to their journey |
| **RoadmapCard may render undefined content** | `ROADMAP_V3_SEED[template.slug]` can be undefined (STABILITY_AUDIT Finding 3.3) |

### `/error.tsx`

| Issue | Details |
|-------|---------|
| **Generic error message** | Shows "Something went wrong" with no context, no retry button |
| **Covers page segment only** | Does NOT catch errors in layout.tsx, providers, or middleware |

---

## 3. FORM VALIDATION AUDIT

| Form | Client Validation | Server Validation | Error Display | Loading State |
|------|-------------------|-------------------|---------------|---------------|
| Login | None | Partial | Generic div | No spinner |
| Register | None | Partial | Generic div | No spinner |
| Forgot Password | None | Unknown | Unknown | Unknown |
| Onboarding (step1-7) | None visible | Via server action | Unknown | Unknown |
| Journal Entry Form | None | None | None | None |
| Create Journey | None | Via server action | Red div (recently added) | `creating` boolean |
| Voucher Claim | None | None | None | Timer countdown |

**Finding:** No form uses proper validation with per-field error messages. This is a critical UX gap — users submit forms and receive no feedback about what's wrong.

---

## 4. ACCESSIBILITY ISSUES

| Issue | Prevalence | Example |
|-------|-----------|---------|
| **Icon-only buttons without aria-label** | ~15+ locations | Edit, delete, close, back buttons using `lucide-react` icons without text labels |
| **Bottom navigation lacks active-state labeling** | All pages | Icons change color but no text indicator for current page |
| **No keyboard navigation support** | Throughout | Modals, dropdowns, carousels not keyboard-accessible |
| **Focus management missing** | Modals, forms | Focus not trapped in modals; form errors not announced |
| **Color contrast** | Unknown | Tailwind classes used but no WCAG audit of color palette |
| **No skip-to-content link** | Root layout | Tab navigation starts at browser chrome |
| **Image alt text** | May be missing on some decorative images | `next/image` may lack alt props |

---

## 5. MOBILE RESPONSIVENESS

| Area | Status |
|------|--------|
| Bottom navigation | Fixed at bottom, responsive |
| Card grids (cerita, mentors, etc.) | Use Tailwind responsive grid — adequate |
| Journey timeline | Overflows horizontally on small screens |
| Modal dialogs (VoucherClaim, BigWinCelebration) | May not scale properly on <360px width |
| Onboarding form | Step content fits mobile width — OK |
| Discovery quiz | Radio buttons stack on mobile — OK |

---

## 6. UI CONSISTENCY

| Aspect | Status |
|--------|--------|
| Color scheme | Uses Tailwind primary colors — consistent |
| Typography | Uses system font stack — consistent |
| Button styles | **INCONSISTENT** — two different Button components (shared + local) may render differently |
| Card styles | Consistent across cerita, mentors, opportunities |
| Loading skeletons | Used inconsistently — some pages use `Skeleton`, others show nothing |
| Spacing/padding | Tailwind spacing classes used — consistent within pages |
| Empty states | **MISSING** on 80%+ of pages — no illustration, no CTA, no helpful message |

---

## 7. KEY METRICS

| Metric | Value |
|--------|-------|
| Total pages with loading state | ~6/34 |
| Total pages with empty state | ~2/34 |
| Total pages with error state | ~3/34 |
| Pages with dead click targets | ~8/34 |
| Icon buttons without aria-label | ~15+ |
| Distinct Button implementations | 2 |
| Authentication flows that end in dead end | 2 (discover, onboarding) |
| Forms with proper validation | 0 |

---

## 8. RECOMMENDATIONS

### P0 — Fix Before Beta

1. **Fix login → journey flow** — ensure `handleStartJourney` completes and navigates
2. **Wire `/discover` results to create journey** — quiz output should auto-create a journey for the matched dream
3. **Wire `/onboarding` completion to create journey** — onboarding data should auto-generate a personalized journey
4. **Add empty states to all list pages** — journey, cerita, mentors, opportunities, jurnal, circle, familia
5. **Add loading states to all data-fetching pages** — spinner or skeleton on every page

### P1 — Should Fix

6. **Add form validation** — required fields, email format, password length, per-field errors
7. **Add aria-labels to all icon-only buttons** — search for `<Button>` containing only `<Icon>` and no text
8. **Fix `/journey` blank state** — remove early return, show loading indicator instead
9. **Add "continue journey" shortcut** — if active journey exists, show prominent CTA on home page
10. **Add error recovery on journey detail page** — if `loadData` fails, show error with retry button

### P2 — Nice to Fix

11. **Add profile completion indicator**
12. **Add keyboard navigation to modals**
13. **Add skip-to-content link in root layout**
14. **Standardize Button usage to single shared component**
15. **Add auto-save to journal entries**
16. **Add tour/onboarding for new users explaining the app**
