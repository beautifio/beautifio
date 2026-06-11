# MASTER FIX PLAN — Beautifio Pre-Launch

**Date:** 2026-06-11
**Scope:** All findings from ARCHITECTURE_AUDIT.md, DATABASE_AUDIT.md, PERFORMANCE_AUDIT_REPORT.md, PERFORMANCE_AUDIT_V2.md, UX_AUDIT.md, STABILITY_AUDIT.md, EXECUTIVE_SUMMARY.md, BEAUTIFIO_FOUNDER_VISION_AUDIT.md

---

## BETA-READINESS VERDICT

**DO NOT LAUNCH BETA.** Score: 3.8/10.

The app has **6 critical blockers** that make the core user flow fail. Even if those were fixed, the app would still be slow, confusing, and missing core value proposition (dream discovery).

**Estimated time to Beta-ready:** 4-6 weeks with 1 engineer.
**Minimal viable Beta (MVP fix):** 2-3 weeks to clear P0 + P1 issues.

---

## SCORING METHODOLOGY

Each fix scored on:
- **User Impact** (1-10): How many users feel this bug, how badly
- **Business Impact** (1-10): Revenue, retention, brand damage
- **Fix Difficulty** (1-10): 1 = 15-min config change, 10 = 2-week rewrite
- **Effort** (hours): Engineering time estimate
- **Priority**: P0 (blocker), P1 (high), P2 (medium), P3 (low)

**Priority Matrix:**
```
               HIGH User Impact ───►
          ┌─────────────────────────┐
          │                         │
  HIGH    │      P0                 │  P1
  Business│  (fix now)              │  (fix this sprint)
  Impact  │                         │
          │─────────────────────────│
          │                         │
  LOW     │      P1                 │  P2/P3
  Business│  (fix this sprint)      │  (backlog)
          │                         │
          └─────────────────────────┘
               LOW User Impact ────►
```

---

## P0 — CRITICAL BLOCKERS (Must Fix Before Any Launch)

6 items. Total est. effort: **2-3 days**. These cause the app to be broken, crash, or lose data for every user.

| # | Issue | Source | User Impact | Business Impact | Fix Difficulty | Est. Effort | File(s) |
|---|-------|--------|------------|----------------|---------------|-------------|---------|
| P0.1 | **big_wins has no INSERT RLS policy** — journey creation silently fails | DATABASE_AUDIT | 10 | 10 | 2 | 30 min | `supabase/migrations/00009_dream_journey.sql` |
| P0.2 | **small_wins has no INSERT RLS policy** — journey creation silently fails | DATABASE_AUDIT | 10 | 10 | 2 | 30 min | `supabase/migrations/00009_dream_journey.sql` |
| P0.3 | **Migration 00011 references non-existent `user_profiles` table** — migration fails; `journey/page.tsx` crashes | DATABASE_AUDIT | 9 | 9 | 1 | 15 min | `00011_human_journey_engine.sql`, `journey/page.tsx` |
| P0.4 | **`use-auth.ts` missing `.catch()` on `getSession()`** — network failure causes infinite loading | STABILITY_AUDIT | 10 | 9 | 1 | 15 min | `hooks/use-auth.ts:17` |
| P0.5 | **Middleware `getUser()` without try/catch** — network failure returns 500 on all routes | STABILITY_AUDIT | 9 | 9 | 1 | 15 min | `middleware.ts:60` |
| P0.6 | **`createJourney()` has no transaction** — 26 round-trips, duplicates on double-click, orphan data on partial failure | STABILITY_AUDIT + PERFORMANCE | 8 | 8 | 6 | 4 hours | `lib/journey-queries.ts:34-116` |

---

## P1 — HIGH PRIORITY (Must Fix This Sprint)

15 items. Total est. effort: **5-7 days**. These cause data integrity issues, crashes, slow loads, and broken flows.

### Database & RLS (3 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P1.1 | Add FK indexes: `dream_journeys(template_slug)`, `big_wins(journey_id)`, `small_wins(big_win_id)`, `daily_activities(journey_id)`, `dream_journeys(user_id)`, `dream_journeys(status)` | DATABASE_AUDIT | 2 hours | New migration |
| P1.2 | Add INSERT RLS policies for `milestones`, `problems`, `learning_vault_items` (if they exist) | DATABASE_AUDIT | 1 hour | New migration |
| P1.3 | Plaintext PINs in Familia — hash `daily_pin`, `pin_required`, stop logging `pin_entered` | DATABASE_AUDIT | 3 hours | `00005_familia.sql` + app code |

### Stability Crashes (5 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P1.4 | Fix `stages[active]` bounds check in MasterclassSection | STABILITY_AUDIT | 15 min | `RoadmapV3MasterclassSection.tsx:29` |
| P1.5 | Fix `iconMap[badge.type]` undefined crash in MentorBadge | STABILITY_AUDIT | 15 min | `MentorBadge.tsx:21` |
| P1.6 | Fix `iconMap[cat.icon]` undefined crash in CategoryBar | STABILITY_AUDIT | 15 min | `CategoryBar.tsx:37` |
| P1.7 | Fix `story.content.replace` on undefined in StoryCard | STABILITY_AUDIT | 15 min | `StoryCard.tsx:32` |
| P1.8 | Add error boundary at root layout level + page-level Suspense | STABILITY_AUDIT | 2 hours | `layout.tsx`, `error.tsx` |

### Performance — Query Optimization (4 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P1.9 | Remove `getJourneyProgress` from `Promise.all` + delete its duplicated sub-queries | PERFORMANCE | 1 hour | `journey/[id]/page.tsx:87-94` |
| P1.10 | Pass timeline + reflection as props to JourneyStory (remove child re-fetch) | PERFORMANCE | 1 hour | `journey-story.tsx`, `journey/[id]/page.tsx` |
| P1.11 | Fix infinite skeleton — add `setLoading(false)` in early-return paths | PERFORMANCE | 15 min | `journey/[id]/page.tsx:70-84` |
| P1.12 | Add `.limit(20)` to `getAllJourneys()` | PERFORMANCE | 15 min | `journey-queries.ts:107` |

### UX — Broken Flows (3 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P1.13 | Wire `/discover` quiz results to auto-create a journey for matched dream template | UX_AUDIT | 3 hours | `discover/result/page.tsx` |
| P1.14 | Wire `/onboarding` completion to auto-create personalized journey | UX_AUDIT | 3 hours | `onboarding/page.tsx` |
| P1.15 | Add loading states + empty states to all list pages (journey, cerita, mentors, opportunities, jurnal, circle, familia) | UX_AUDIT | 4 hours | 7+ page files |

---

## P2 — MEDIUM PRIORITY (This or Next Sprint)

13 items. Total est. effort: **4-6 days**. Improves user experience, code health, and prevents future bugs.

### Architecture Cleanup (4 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P2.1 | Delete 13 empty/stubbed feature directories | ARCHITECTURE | 30 min | Multiple |
| P2.2 | Remove duplicate Button (`apps/web/src/components/ui/button.tsx`) — keep `@beautifio/ui` version | ARCHITECTURE | 1 hour | `components/ui/button.tsx` |
| P2.3 | Deduplicate auth logic — pick Server Actions or `lib/supabase/queries.ts`, delete the other | ARCHITECTURE | 2 hours | `app/actions/auth.ts` + `lib/supabase/queries.ts` |
| P2.4 | Remove unused `Tabs` component from `@beautifio/ui` | ARCHITECTURE | 15 min | `packages/ui/src/tabs.tsx` |

### UX — Forms & Accessibility (3 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P2.5 | Add form validation (required fields, email format, password length, per-field errors) to login, register, onboarding | UX_AUDIT | 4 hours | `login/page.tsx`, `register/page.tsx`, `onboarding/page.tsx` |
| P2.6 | Add aria-labels to all icon-only buttons (~15+ locations) | UX_AUDIT | 2 hours | Multiple components |
| P2.7 | Add "Continue Journey" CTA to home page when active journey exists | UX_AUDIT | 1 hour | `home/page.tsx` |

### Performance — Bundle (3 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P2.8 | Extract seed data from shared chunk — move `@beautifio/utils` to per-file imports for better tree-shaking | PERFORMANCE_V2 | 1 day | `packages/utils/src/` |
| P2.9 | Convert 4 static pages (`/roadmap`, `/cerita`, `/mentors`, `/opportunity`) to server components | PERFORMANCE_V2 | 4 hours | Route files |
| P2.10 | Add `React.memo` to BottomNavigation and other heavy display components | PERFORMANCE_V2 | 1 hour | `BottomNavigation`, section components |

### Database Cleanup (3 items)

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P2.11 | Remove `users.goals` column (use `user_goals` table) | DATABASE_AUDIT | 1 hour | Migration + code |
| P2.12 | Remove unused tables: `previous_dreams`, `small_win_reflections`, `big_win_reflections` | DATABASE_AUDIT | 1 hour | New migration |
| P2.13 | Add `ON CONFLICT` to seed INSERTs in migrations | DATABASE_AUDIT | 1 hour | Migrations |

---

## P3 — LOW PRIORITY (Backlog / Post-Beta)

10 items. Total est. effort: **3-5 days**. Nice-to-have improvements.

| # | Issue | Source | Est. Effort | File(s) |
|---|-------|--------|-------------|---------|
| P3.1 | Standardize route slug language (pick Indonesian or English, not both) | ARCHITECTURE | 30 min | Folder renames |
| P3.2 | Standardize component file naming (PascalCase or kebab-case, pick one) | ARCHITECTURE | 2 hours | File renames |
| P3.3 | Add skip-to-content link in root layout | UX_AUDIT | 15 min | `layout.tsx` |
| P3.4 | Add keyboard navigation to modals | UX_AUDIT | 2 hours | Modal components |
| P3.5 | Add profile completion indicator on `/profil` | UX_AUDIT | 1 hour | `profil/page.tsx` |
| P3.6 | Add auto-save to journal entries (debounced localStorage) | UX_AUDIT | 2 hours | `JournalEntryForm.tsx` |
| P3.7 | Sync localStorage ↔ Supabase (pick one storage layer) | DATABASE_AUDIT | 1 day | Multiple files |
| P3.8 | Add preconnect for Supabase URL in root layout | PERFORMANCE_V2 | 15 min | `layout.tsx` |
| P3.9 | Optimize icon imports (deep imports from lucide-react) | PERFORMANCE_V2 | 1 hour | Component files |
| P3.10 | Add `config.matcher` to `middleware.ts` to limit route scope | ARCHITECTURE | 15 min | `middleware.ts` |

---

## PHASED ROADMAP

### Phase 1 — "Stop the Bleeding" (Days 1-3)
```
Fix P0.1 + P0.2   [30 min] RLS INSERT policies
Fix P0.3          [15 min] user_profiles → users
Fix P0.4 + P0.5   [30 min] Error handling in auth + middleware
Fix P1.4-P1.7     [1 hour] Null reference crashes (icon maps, stages, story content)
Fix P1.11         [15 min] Infinite skeleton fix
──────────────────────────────────────
Result: App no longer crashes or silently fails for users.
```

### Phase 2 — "Make Core Flow Work" (Days 4-7)
```
Fix P0.6          [4 hours] Transactional createJourney
Fix P1.1          [2 hours] Critical FK indexes
Fix P1.13 + P1.14 [6 hours] Wire discover + onboarding to journey creation
Fix P1.15         [4 hours] Loading + empty states on list pages
──────────────────────────────────────
Result: Users can complete login → discover → journey flow.
```

### Phase 3 — "Make It Fast" (Days 8-11)
```
Fix P1.9          [1 hour] Remove getJourneyProgress duplication
Fix P1.10         [1 hour] Pass data to JourneyStory as props
Fix P1.12         [15 min] Limit getAllJourneys
Fix P2.8          [1 day] Extract seed data for tree-shaking
Fix P2.9          [4 hours] Server components for static pages
Fix P2.10         [1 hour] React.memo on heavy components
──────────────────────────────────────
Result: Page loads drop from 10-13 queries to 4-5; JS payload drops ~40%.
```

### Phase 4 — "Clean House" (Days 12-16)
```
Fix P2.1-P2.4     [4 hours] Remove dead code, deduplicate
Fix P2.5          [4 hours] Form validation
Fix P2.6          [2 hours] Aria-labels
Fix P2.7          [1 hour] Continue Journey CTA
Fix P1.8          [2 hours] Error boundaries
Fix P1.3          [3 hours] PIN hashing
Fix P2.11-P2.13   [3 hours] Database cleanup
──────────────────────────────────────
Result: Codebase is clean, accessible, and secure.
```

### Phase 5 — "Beta Polish" (Days 17-20, optional)
```
Fix P3.1-P3.10    [3-5 days] Backlog items
──────────────────────────────────────
Result: Production-ready Beta candidate.
```

---

## FIX SCORECARD SUMMARY

| Phase | Items | Est. Hours | Cumulative Hours | Score After |
|-------|-------|-----------|-----------------|-------------|
| Current | — | — | 0 | 3.8/10 |
| Phase 1 | 7 | 3.5 | 3.5 | 5.0/10 |
| Phase 2 | 5 | 16 | 19.5 | 6.5/10 |
| Phase 3 | 5 | 22 | 41.5 | 7.5/10 |
| Phase 4 | 11 | 21 | 62.5 | 8.5/10 |
| Phase 5 | 10 | 24-40 | 86.5-102.5 | 9.0/10 |

**Beta-ready threshold: 7.5/10** (end of Phase 3, ~42 engineering hours / 1 week)

---

## KEY SUCCESS METRICS FOR BETA

| Metric | Before Fixes | Target for Beta |
|--------|-------------|----------------|
| Login → Journey success rate | ~40% (breaks silently) | >95% |
| /journey/[id] page load queries | 10-13 | 4-5 |
| /journey/[id] page load time | ~1.5s | <500ms |
| JS payload per page | ~800 KB | <400 KB |
| Pages with loading states | 6/34 | 34/34 |
| Pages with empty states | 2/34 | 34/34 |
| Pages with error states | 3/34 | 34/34 |
| Unhandled promise rejections | 5+ | 0 |
| Null reference crash sites | 8 | 0 |
| Icon buttons without aria-labels | 15+ | 0 |
| Form validation coverage | 0/5 | 5/5 |
