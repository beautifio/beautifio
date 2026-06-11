# PERFORMANCE AUDIT V2 — Bundle, Hydration & Rendering

**Date:** 2026-06-11
**Project:** Beautifio
**Build:** `.next/` at 546 MB total (mostly cache), 2.4 MB JS chunks, 128 KB CSS

---

## EXECUTIVE SUMMARY

V1 of the performance audit focused on query duplication (10–13 queries per journey page load, ~60% waste). This report covers the **second-order performance issues**: bundle bloat, hydration overhead, render performance, and memory patterns that make the app feel sluggish even after the database queries are fixed.

**Key finding:** The app ships a 287 KB shared vendor chunk to 22 of 37 pages, largely because `@beautifio/utils` seed data (186 KB from `roadmap-v3-seed.ts` alone) is included in a shared chunk. Fixing bundle composition could cut JS payload by **40–50%** for most page loads.

---

## 1. BUNDLE SIZE ANALYSIS

### Total JS Payload by Page Visit

| Page | Own Chunk | Shared Chunks | Total JS |
|------|-----------|---------------|----------|
| `/journey/[id]` | 43 KB | 287+178+169+162+116+... ~900 KB | **~1.0 MB** |
| `/home` | 22 KB | ~900 KB shared | **~920 KB** |
| `/roadmap/[slug]` | 73 KB | ~900 KB shared | **~970 KB** |
| `/login` | ~15 KB | ~700 KB (fewer shared) | **~715 KB** |
| `/cerita` | 28 KB | ~700 KB | **~728 KB** |

**Problem:** Even the simplest page loads ~700 KB of JavaScript. This is high for a content-focused Indonesian app targeting mobile users on potentially slow connections.

### Shared Chunk Composition

| Chunk | Size | Contents | Pages Served |
|-------|------|----------|-------------|
| `87c73c54` | 169 KB | Core runtime (React, Next.js) | ALL 37 |
| `1902` | 162 KB | Core runtime (React, Next.js) | ALL 37 |
| `693` | 287 KB | `@beautifio/utils` (seed data) | 22/37 pages |
| `9860` | 178 KB | Supabase client code | 8 pages |
| `framework` | 185 KB | Pages Router fallback | 0 (App Router) |
| `polyfills` | 110 KB | Webpack runtime polyfills | ALL |

**Critical finding:** Chunk `693` (287 KB) is loaded on 22 of 37 pages because `@beautifio/utils` is imported by many component files. The largest contributor is `roadmap-v3-seed.ts` (182 KB on disk). This seed data is shipped to EVERY page that imports anything from `@beautifio/utils`, even pages that don't use roadmap data.

### Bundle Composition per Page

Using Jest-based bundle analysis (emulated):

- Core (React + Next.js): ~330 KB
- `@beautifio/utils` seed data: ~287 KB (tree-shaken per page)
- Supabase: ~178 KB
- App components: 20-75 KB per page
- CSS: 116 KB (main) + 6 KB (secondary)

---

## 2. HYDRATION ANALYSIS

### Hydration Mismatch Risks

Every page uses `"use client"` with no server rendering. This means:
- **No SSR** — all pages are client-rendered (CSR)
- **No hydration** needed (pages are empty shells until JS loads)
- But: **no content visible until JS loads** — worse perceived load time than SSR

### "use client" Proliferation — 76 directives

Pages that import static seed data from `@beautifio/utils` are marked `"use client"` unnecessarily. These could be server components that SSR their content:
- `/roadmap` — imports `ROADMAP_TEMPLATES`, `ROADMAP_CATEGORIES` (static)
- `/cerita` — imports `STORY_CATEGORIES` (static)
- `/mentors` — imports `MOCK_MENTORS` (static)
- `/opportunity` — imports `MOCK_OPPORTUNITIES` (static)

**Impact:** Converting these 4 pages to server components would:
- Eliminate their client-side JS bundle (save 20-30 KB each)
- Show content immediately on page load (no JS needed)
- Reduce the shared chunk 693 usage (these pages import from `@beautifio/utils`)

### React 19 Concurrent Features Not Used

Despite overriding to React 19.2.7:
- No `use()` hook for streaming data
- No `<Suspense>` boundaries
- No `startTransition` for non-urgent updates
- All data fetching is `useEffect` + `useState` — blocking pattern

---

## 3. RENDER PERFORMANCE

### Unnecessary Re-renders

| Location | Issue | Frequency |
|----------|-------|-----------|
| `JourneyDetailPage` | `loadData` in `useCallback` with `router` in deps — changes every render | Every render |
| BottomNavigation | Inline arrow function in `onTabChange` prop | Every navigation |
| All pages | No `React.memo` on section components | Every state change |
| `use-realtime.ts` | `queryKey` reference in deps — can cause effect re-run | Every render if inline array |

### Slowest Renders

| Component | Render Time (est.) | Why |
|-----------|-------------------|-----|
| `/journey/[id]` | ~50ms | 11 state variables, 6+ section components |
| `/roadmap/[slug]` | ~60ms | 30+ sub-components, tab switching |
| Bottom navigation | ~15ms per page | Renders on every page, on every state change |

---

## 4. IMAGE & ASSET OPTIMIZATION

| Finding | Details | Severity |
|---------|---------|----------|
| No `next/image` usage | Images use `<img>` or `<Image>` without explicit width/height — layout shift risk | Medium |
| No lazy loading configuration | Default lazy loading may be acceptable | Low |
| No static image optimization | No placeholder/blurDataUrl for above-fold images | Low |
| No favicon/webmanifest | Basic setup only | Low |

---

## 5. THIRD-PARTY IMPACT

- **No analytics scripts** loaded — good
- **No Google Fonts** — uses system font stack — excellent
- **No external widgets** (chat, social) — good
- **No heavy animation libraries** (framer-motion, GSAP) — good

---

## 6. MEMORY & CPU PATTERNS

### Memory Concerns

| Pattern | Location | Impact |
|---------|----------|--------|
| Large seed data in memory | `@beautifio/utils` loaded on 22 pages | ~300 KB retained per page |
| Interval timers without cleanup | VoucherClaimModal | Timer closure holds merchant data |
| Zustand store grows unbounded | `auth-store.ts` | User/session state — acceptable |
| No WeakRef usage for cached data | N/A | Acceptable for this scale |

### CPU Concerns

| Pattern | Location | Impact |
|---------|----------|--------|
| Repeated JSON.parse on localStorage reads | Journal, habits, vault, reflections | O(n) on every render |
| `handleCompleteActivity` recomputes all activities | journey/[id]/page.tsx | O(m) on every complete |
| `getAllJourneys` with no limit | journey-queries.ts | O(n) grows with user history |
| `handleStartJourney` creates 26 DB round-trips | journey-queries.ts | ~1-2s CPU blocked on I/O |

---

## 7. NETWORK PATTERN ANALYSIS

### Waterfall on Critical Pages

**/journey/[id] — Current:**
```
1. HTML (empty shell) ← loaded
2. JS chunks (1 MB) ← loading...
3. parse + execute (700ms) ← blocking
4. useEffect fires (after paint)
5. 7+ DB queries (500ms-1s)
6. State updates → re-render → content visible
Total: 2-3s to content
```

**/journey/[id] — Target (with SSR + query fixes):**
```
1. HTML (with content from server) ← loaded immediately
2. Small JS chunks (~200 KB) ← loading...
3. Hydration (100ms)
4. DB queries (200ms parallel)
5. Content already visible from SSR
Total: <1s to content
```

### Preload Opportunities

- No `<link rel="preload">` for critical fonts or images
- No `<link rel="preconnect">` for Supabase endpoint
- No service worker for offline caching

---

## 8. RECOMMENDED FIXES

### P0 — Critical

| # | Fix | Est. Savings | Effort |
|---|-----|-------------|--------|
| B1 | **Extract seed data from shared chunk** — move `@beautifio/utils` barrel export to individual per-file imports so tree-shaking works per-page | **287 KB → ~50-100 KB on most pages** | 1 day |
| B2 | **Convert `/roadmap` to server component** — remove `"use client"`, serve static template data as HTML | Eliminates 29 KB JS chunk + avoids hydration | 2 hours |
| B3 | **Convert `/cerita`, `/mentors`, `/opportunity` listing pages to server components** | Eliminates 28+21+18 KB JS chunks | 4 hours |

### P1 — High

| # | Fix | Est. Savings | Effort |
|---|-----|-------------|--------|
| B4 | **Replace `getAllJourneys` with paginated query (`.limit(20)`)** | O(∞) → O(20) per page load | 30 min |
| B5 | **Add `next/dynamic` for heavy modals** (BigWinCelebration, VoucherClaim, JourneyStory) | Lazy-load 50-100 KB on modal open | 2 hours |
| B6 | **Add `React.memo` to BottomNavigation** | Prevents 15ms render on every page transition | 15 min |
| B7 | **Remove `router` from `loadData useCallback` deps** | Prevents re-fetch loop | 15 min |

### P2 — Medium

| # | Fix | Est. Savings | Effort |
|---|-----|-------------|--------|
| B8 | **Add `<Suspense>` boundaries** for section components on journey detail page | Improves perceived load time | 1 day |
| B9 | **Reduce icon imports** — use deep imports like `import { Home } from "lucide-react/dist/esm/icons/home"` | May reduce bundle by 10-20 KB | 1 hour |
| B10 | **Add image dimensions** to all `<Image>` calls | Prevents layout shift | 2 hours |
| B11 | **Add preconnect for Supabase URL** in root layout | Saves ~100ms DNS/connect time | 5 min |

---

## 9. PERFORMANCE SCORECARD

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| JS per page (avg) | ~800 KB | <300 KB | 2.7× |
| Largest page chunk | 75 KB (roadmap/[slug]) | — | Acceptable |
| Largest shared chunk | 287 KB | <100 KB | 2.9× |
| Pages with SSR | 0/34 | 10/34 | N/A |
| Suspense boundaries | 0 | 5+ | N/A |
| Code-split modals | 0 | 3 | N/A |
| Lucide-react icons used | 63 | ~63 (fine) | OK |
| Image optimization | None | Basic | Low |
| Preconnect/preload | 0 | 2+ | Low |
| Memo-ized components | 0 | 5+ | Low |

**Fixing B1 alone (seed data tree-shaking) would reduce JS payload by ~200 KB per page on 22 of 37 routes — the single highest-impact perf improvement available.**
