# ARCHITECTURE AUDIT

**Date:** 2026-06-11
**Project:** Beautifio

---

## EXECUTIVE SUMMARY

The project follows a clean monorepo structure (npm workspaces + Turborepo) with 3 internal packages (`ui`, `utils`, `types`) and a Next.js 15 App Router frontend. However, it exhibits significant architectural debt:

- **13 empty/stubbed feature directories** — scaffolding without implementation
- **1 unused shared UI component** (`Tabs`) being exported
- **Duplicate Button component** (local copy in `apps/web` shadows the shared `@beautifio/ui` version)
- **Duplicate auth query logic** — Server Actions in `app/actions/auth.ts` duplicate lib/supabase/queries.ts
- **76 `"use client"` directives** when many could be server components
- **Inconsistent naming conventions** — PascalCase, kebab-case, and camelCase files within the same feature
- **No error boundary at root level** — single `error.tsx` covers pages only, not layout/providers

---

## 1. MONOREPO STRUCTURE

### Package Dependency Graph (Clean DAG — No Cycles)

```
types ──► (no deps)
utils ──► types
ui    ──► (no deps; peer: react)
web   ──► ui + utils + types
```

### Package File Counts

| Package | Source Files | Purpose |
|---------|-------------|---------|
| `apps/web` | ~86 | Next.js 15 frontend + server actions |
| `packages/ui` | 10 | Shared React components (Button, Badge, Input, Card, etc.) |
| `packages/utils` | 15 | Seed data, localStorage helpers, constants |
| `packages/types` | 5 | TypeScript interfaces |

**Observation:** The dependency graph is clean — no circular dependencies. The package boundaries are well-defined. However, `packages/utils` has grown into a catch-all with 15 files spanning seed data, localStorage CRUD, voucher logic, and slug generation — it lacks internal organization.

---

## 2. FULL DIRECTORY TREE (apps/web/src)

```
apps/web/src/
├── app/                          # Next.js 15 App Router (34 routes)
│   ├── actions/auth.ts           # Only server action file (4 functions)
│   ├── admin/familia/page.tsx    # Admin dashboard
│   ├── cerita/[slug]/            # Story detail (server page + client page)
│   ├── cerita/page.tsx           # Stories listing
│   ├── circle/[id]/page-client.tsx
│   ├── circle/page.tsx           # Circles listing
│   ├── discover/result/page.tsx  # Discovery quiz results
│   ├── discover/page.tsx         # Discovery quiz
│   ├── error.tsx                 # Next.js error boundary (page-level only)
│   ├── familia/deals/page.tsx
│   ├── familia/rewards/page.tsx
│   ├── familia/vouchers/page.tsx
│   ├── familia/page.tsx
│   ├── forgot-password/page.tsx
│   ├── home/page.tsx
│   ├── inspirasi/[slug]/page.tsx
│   ├── inspirasi/post/page.tsx
│   ├── inspirasi/page.tsx
│   ├── journey/[id]/page.tsx      # 510 lines — largest single file
│   ├── journey/page.tsx
│   ├── jurnal/[slug]/             # Journal detail (server page + client page)
│   ├── jurnal/buat/page.tsx
│   ├── jurnal/page.tsx
│   ├── login/page.tsx
│   ├── mentors/[slug]/            # Mentor detail (server page + client page)
│   ├── mentors/page.tsx
│   ├── onboarding/page.tsx
│   ├── opportunity/[slug]/        # Opportunity detail (server page + client page)
│   ├── opportunity/page.tsx
│   ├── profil/page.tsx
│   ├── register/page.tsx
│   ├── roadmap/[slug]/            # Roadmap detail (server page + client page)
│   ├── roadmap/page.tsx
│   ├── welcome/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
├── components/                    # 2 local components found here
│   ├── ui/button.tsx              # DUPLICATE of @beautifio/ui Button
│   ├── AuthModal.tsx
│   ├── EmptyState.tsx
│   └── ProtectedAction.tsx
│   └── layout/                    # EMPTY
│   └── shared/                    # EMPTY
├── features/                      # Feature-sliced modules
│   ├── auth/                      # ALL EMPTY (components/, hooks/, store/)
│   ├── cerita/                    # 4 components
│   ├── circle/                    # ALL EMPTY (components/, hooks/, store/)
│   ├── coach/                     # EMPTY
│   ├── ecosystem/                 # 1 component
│   ├── familia/                   # 1 component (VoucherClaimModal)
│   ├── goal/                      # EMPTY (components/)
│   ├── journal/                   # 4 components
│   ├── journey/                   # 7 components
│   ├── mentor/                    # 3 components
│   ├── opportunity/               # EMPTY (components/)
│   ├── roadmap/                   # 16 components (largest feature)
│   └── safe-space/                # 1 component
├── hooks/
│   ├── use-auth.ts
│   └── use-realtime.ts
├── lib/
│   ├── inspirasi-data.ts
│   ├── journey-queries.ts         # 400+ lines — 20+ query functions
│   ├── navigation.ts
│   ├── safe-space-data.ts
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/queries.ts        # Duplicates auth server actions
│   └── utils.ts
├── providers/index.tsx
├── middleware.ts                   # No config.matcher — runs on ALL routes
└── stores/auth-store.ts           # Zustand store
```

---

## 3. ROUTE STRUCTURE (34 routes, 9 feature domains)

| Route | Feature | Pattern | Use Client? |
|-------|---------|---------|-------------|
| `/` | Landing | page.tsx | Yes |
| `/home` | Dashboard | page.tsx | Yes |
| `/login` | Auth | page.tsx | Yes |
| `/register` | Auth | page.tsx | Yes |
| `/forgot-password` | Auth | page.tsx | Yes |
| `/welcome` | Onboarding | page.tsx | Yes |
| `/onboarding` | Onboarding | page.tsx | Yes |
| `/profil` | Profile | page.tsx | Yes |
| `/journey` | Journey | page.tsx | Yes |
| `/journey/[id]` | Journey | page.tsx | Yes |
| `/roadmap` | Roadmap | page.tsx | Yes |
| `/roadmap/[slug]` | Roadmap | **server + client split** | Client page |
| `/cerita` | Stories | page.tsx | Yes |
| `/cerita/[slug]` | Stories | **server + client split** | Client page |
| `/inspirasi` | Inspiration | page.tsx | Yes |
| `/inspirasi/[slug]` | Inspiration | page.tsx | Yes |
| `/inspirasi/post` | Inspiration | page.tsx | Yes |
| `/jurnal` | Journal | page.tsx | Yes |
| `/jurnal/buat` | Journal | page.tsx | Yes |
| `/jurnal/[slug]` | Journal | **server + client split** | Client page |
| `/mentors` | Mentors | page.tsx | Yes |
| `/mentors/[slug]` | Mentors | **server + client split** | Client page |
| `/opportunity` | Opportunity | page.tsx | Yes |
| `/opportunity/[slug]` | Opportunity | **server + client split** | Client page |
| `/circle` | Circles | page.tsx | Yes |
| `/circle/[id]` | Circles | page-client.tsx | Yes |
| `/discover` | Discovery | page.tsx | Yes |
| `/discover/result` | Discovery | page.tsx | Yes |
| `/familia` | Familia | page.tsx | Yes |
| `/familia/vouchers` | Familia | page.tsx | Yes |
| `/familia/deals` | Familia | page.tsx | Yes |
| `/familia/rewards` | Familia | page.tsx | Yes |
| `/admin/familia` | Admin | page.tsx | Yes |

**Key Finding:** Only 5 of 34 routes use the recommended server/client split pattern. The remaining 29 routes mark the entire page as `"use client"`, including pages that could be server-rendered (e.g., static pages like `/cerita` content, `/mentors` listing with seed data).

---

## 4. SERVER/CLIENT BOUNDARY ANALYSIS

### "use client" Proliferation

- **76 `"use client"` directives** across the codebase
- Routes like `/roadmap`, `/cerita`, `/jurnal` use seed data from `@beautifio/utils` (static JSON) — no client-side interactivity needed, yet they're marked `"use client"`
- Only 1 `"use server"` file: `app/actions/auth.ts` (4 functions: signUp, signIn, signOut, resetPassword)

### Incorrect Boundary Usage

Pages that import from `@beautifio/utils` (static seed data) should NOT be `"use client"`:
- `/roadmap/page.tsx` — imports `ROADMAP_TEMPLATES`, `ROADMAP_CATEGORIES` — could be server component
- `/cerita/page.tsx` — imports `STORY_CATEGORIES` — could be server component
- `/mentors/page.tsx` — imports `MOCK_MENTORS` — could be server component
- `/opportunity/page.tsx` — imports `MOCK_OPPORTUNITIES` — could be server component

---

## 5. STATE MANAGEMENT AUDIT

### Zustand Store — auth-store.ts

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}
```

**Issues:**
1. `logout()` dynamically imports supabase client inside the action — unnecessary coupling
2. No `reset()` action to clear all state at once
3. `isLoading` is never reset to `false` if `getSession()` promise rejects (see STABILITY_AUDIT)

### React Context — providers/index.tsx

```typescript
export default function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider>{children}</QueryClientProvider>;
}
```

**Issues:**
1. Only wraps QueryClientProvider — no ErrorBoundary, no ThemeProvider, no AuthProvider
2. Auth state is managed entirely via the Zustand store, accessed through `use-auth.ts` hook — no React context involved

### Local State Patterns

Most feature components use `useState` + `useEffect` for data fetching — no React Query, no SWR, no custom data-fetching abstraction beyond raw Supabase calls. This means:
- No request deduplication
- No automatic cache invalidation
- No retry logic
- No stale-while-revalidate

---

## 6. DEAD CODE & UNUSED EXPORTS

### Unused Shared Components

| Component | Exported By | Used In | Status |
|-----------|-------------|---------|--------|
| `Tabs` | `@beautifio/ui` | **0 files** | **DEAD CODE** |

### Duplicate Components

| Component | File 1 | File 2 | Risk |
|-----------|--------|--------|------|
| `Button` | `packages/ui/src/button.tsx` | `apps/web/src/components/ui/button.tsx` | Inconsistent behavior, maintenance burden |

### Duplicate Business Logic

`apps/web/src/lib/supabase/queries.ts` contains `signUp`, `signIn`, `signOut` functions that duplicate the Server Actions in `apps/web/src/app/actions/auth.ts`. Two implementations of the same auth operations, with no documented reason for the duplication.

### Empty/Stubbed Directories (13 total)

| Path | Status | Notes |
|------|--------|-------|
| `features/auth/components/` | Empty | Auth components live in `components/AuthModal.tsx` instead |
| `features/auth/hooks/` | Empty | Auth hook lives in `hooks/use-auth.ts` |
| `features/auth/store/` | Empty | Auth store lives in `stores/auth-store.ts` |
| `features/circle/components/` | Empty | Circle components inline in pages |
| `features/circle/hooks/` | Empty | |
| `features/circle/store/` | Empty | |
| `features/coach/` | Empty | Entire feature not started |
| `features/goal/components/` | Empty | Goal UI not implemented |
| `features/opportunity/components/` | Empty | Opportunity UI inline in page |
| `features/roadmap/hooks/` | Empty | Roadmap hooks inline in components |
| `components/layout/` | Empty | Layout built in app/layout.tsx |
| `components/shared/` | Empty | Shared components in @beautifio/ui |

---

## 7. NAMING CONVENTION INCONSISTENCIES

### File Naming (within features/journey)

| File | Convention |
|------|-----------|
| `big-win-card.tsx` | kebab-case |
| `big-win-celebration.tsx` | kebab-case |
| `daily-activity-card.tsx` | kebab-case |
| `failure-modal.tsx` | kebab-case |
| `journey-story.tsx` | kebab-case |
| `journey-timeline.tsx` | kebab-case |
| `reflection-modal.tsx` | kebab-case |

### File Naming (within features/mentor)

| File | Convention |
|------|-----------|
| `MentorBadge.tsx` | PascalCase |
| `MentorSessionCard.tsx` | PascalCase |
| `MentorStoryCard.tsx` | PascalCase |

### Route Slug Language Mix

| Route | Language |
|-------|----------|
| `/cerita` | Indonesian |
| `/jurnal` | Indonesian |
| `/inspirasi` | Indonesian |
| `/profil` | Indonesian |
| `/journey` | English |
| `/discover` | English |
| `/mentors` | English |
| `/opportunity` | English |
| `/circle` | English |
| `/familia` | Indonesian |
| `/roadmap` | English |

No consistent strategy for language choice in URLs. Some use English, some use Indonesian.

### Server/Client Split Pattern

- 5 routes use `page.tsx` (server) + `page-client.tsx` (client) split pattern
- `/circle/[id]` uses `page-client.tsx` as the page file (no server `page.tsx`)
- All other routes use `page.tsx` with inline `"use client"`

---

## 8. DATA LAYER ARCHITECTURE

### Three Data Sources

1. **Supabase Database** — 34 tables, accessed via `lib/journey-queries.ts` and `lib/supabase/queries.ts`
2. **Client-side seed data** — 19+ `MOCK_*` / `ROADMAP_*` constants in `@beautifio/utils/src/` (static JSON arrays)
3. **localStorage persistence** — 15+ functions in `@beautifio/utils/src/` for journals, reflections, habits, streaks, vouchers

### Data Flow Problem

The app has three different persistence mechanisms, creating inconsistency:
- Journals: stored in both Supabase (`journals` table) AND localStorage (`getStoredJournals`)
- Habits/streaks: stored ONLY in localStorage (no Supabase fallback)
- Reflections: stored in Supabase (`daily_reflections`) AND localStorage (`getStoredReflections`)
- Vouchers: stored in Supabase (`familia_voucher_sessions`) AND localStorage (`getActiveVoucherForMerchant`)

When localStorage and Supabase disagree, there is no sync mechanism.

### Query Architecture

`lib/journey-queries.ts` is a monolithic 400+ line file with 20+ exported functions — no separation by domain (journey, big_wins, small_wins, activities, reflections). This should be split into domain-specific modules.

---

## 9. RECOMMENDATIONS

### P0 — Must Fix Before Beta

1. **Remove 13 empty directories** — reduces noise and clarifies what is vs. isn't implemented
2. **Delete duplicate Button** — keep only `@beautifio/ui/src/button.tsx`; remove `apps/web/src/components/ui/button.tsx`
3. **Deduplicate auth logic** — pick either Server Actions or `lib/supabase/queries.ts`; delete the other
4. **Remove or implement `Tabs`** from `@beautifio/ui` — dead exports signal incomplete migration

### P1 — Should Fix

5. **Add `config.matcher` to `middleware.ts`** — currently runs on every route (36 requests per page navigation)
6. **Split `journey-queries.ts`** into domain modules: `journey-queries.ts`, `big-wins.ts`, `activities.ts`, `reflections.ts`
7. **Standardize naming convention** — choose PascalCase (React convention) for all component files

### P2 — Nice to Fix

8. **Reduce `"use client"` usage** — convert statically-fed pages to server components
9. **Standardize route slug language** — pick Indonesian (matching app language) or English; don't mix
10. **Add shared ErrorBoundary component** to protect providers/layout
11. **Sync localStorage ↔ Supabase** — add a sync mechanism or pick one storage layer
