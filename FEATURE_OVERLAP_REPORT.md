# FEATURE OVERLAP REPORT — Beautifio

> **Auditor:** Product Strategist (AI)
> **Source:** `PRODUCT_INVENTORY.md`
> **Date:** June 2026
> **Status:** Audit Only — No Code Changes

---

## Summary

| # | Overlap | Feature A | Feature B | Overlap % | Recommendation |
|---|---------|-----------|-----------|-----------|----------------|
| 1 | Splash vs Welcome | `/` Splash Screen | `/welcome` | 70% | Merge |
| 2 | Daily Wins Duplication | Home Daily Win Section | Roadmap Daily Wins Tab | 80% | Merge |
| 3 | Blueprint vs Masterclass | Roadmap Blueprint Tab | Roadmap Masterclass Tab | 65% | Merge |
| 4 | Life Pillars vs Life Engine | Roadmap Life Pillars Tab | Life Engine (§7) | 75% | Merge |
| 5 | Journals vs Roadmap Reflections | Journals Feature (§10) | Roadmap Reflections Tab | 60% | Merge |
| 6 | Growth Tracker vs Life Engine | Growth Tracker (§17) | Life Engine (§7) | 55% | Merge |
| 7 | Button Duplication | `packages/ui/button.tsx` | `apps/web/.../ui/button.tsx` | 100% | Remove |
| 8 | V1 vs V3 Roadmap Components | MilestoneTimeline + RoadmapRecommendations | All RoadmapV3* Components | 70% | Remove |
| 9 | Anonymous Posting Paths | Safe Space Anon Posts | `/inspirasi/post` | 40% | Rename |
| 10 | Ecosystem Links vs Opportunities | Home Ecosystem Links (§4.7) | Opportunities Feature (§14) | 50% | Keep (different scope) |
| 11 | AI Coach vs Human Mentors | AI Coach (§16) | Mentors Feature (§12) | 40% | Keep (different delivery) |
| 12 | Discovery vs Roadmap CTA | Discovery Questionnaire (§5) | Roadmap "I Don't Know Yet" | 50% | Keep (funnel stages) |
| 13 | Profile My Growth vs Life Engine Page | Profile My Growth Section | `/life` Life Engine Page | 45% | Keep (summary vs detail) |

---

## Detailed Overlap Analysis

---

### 1. Splash Screen (`/`) vs Welcome (`/welcome`)

| Dimension | Splash Screen (`/`) | Welcome (`/welcome`) |
|-----------|-------------------|---------------------|
| **Purpose** | First impression, brand intro, gate to auth/discovery | Pre-auth onboarding, explain what Beautifio is |
| **User Value** | Sets emotional tone | Understands product before committing |
| **Problem Solved** | Orients new users before auth | Reduces drop-off by explaining benefits early |
| **Auth Required** | No | No |
| **DB Tables** | None (static) | None (static) |

**Overlap %:** 70%

**Why overlap exists:**
Both are pre-auth static pages targeting new users. Both serve as brand introduction and orientation. A user lands on splash and then clicks through to welcome — two sequential orientation pages before reaching any actual product value. This creates unnecessary friction in the sign-up funnel.

**Recommendation: MERGE**
- Combine splash's emotional branding with welcome's value proposition into a single unified landing page.
- Eliminate one of the two routes (keep `/` as the merged page, redirect `/welcome` → `/`).
- This reduces time-to-value for new users by removing one extra screen.

---

### 2. Daily Wins: Home Section (4.1) vs Roadmap Detail Tab (6.2)

| Dimension | Home Daily Win Section | Roadmap Daily Wins Tab |
|-----------|----------------------|----------------------|
| **Purpose** | Track daily habits aligned to growth zone | Daily habits with check-off tracking per zone/time |
| **User Value** | Micro-actions that build momentum | Micro-actions within roadmap context |
| **Problem Solved** | "What should I do today?" — personalized by zone | Contextual habits for a specific dream |
| **Storage** | `beautifio_roadmap_dailywins*` | `beautifio_roadmap_dailywins*` |
| **Related Pages** | `/roadmap/[slug]`, `/life` | `/roadmap/[slug]` |

**Overlap %:** 80%

**Why overlap exists:**
Both features read/write the **same localStorage keys** (`beautifio_roadmap_dailywins_{slug}`). The home section shows a summary across active roadmaps, while the roadmap detail shows the full list for one roadmap. This is essentially a summary-view vs detail-view of the same data, but implemented as two separate features with separate UIs.

**Recommendation: MERGE**
- Make Daily Wins a single feature with a summary widget (Home) and a detail page (Roadmap).
- Home should show a unified "Today's Wins" cross-roadmap view.
- Eliminate duplicate state management — one source of truth for daily wins.
- The Roadmap Detail tab already serves as the detail view; ensure Home only reads from the same data.

---

### 3. Blueprint Tab vs Masterclass Tab (Roadmap Detail)

| Dimension | Blueprint Tab | Masterclass Tab |
|-----------|--------------|-----------------|
| **Content** | Skills, habits, mindset, tools, mistakes, success factors | Age path, timeline, reality check, alternative paths, lessons |
| **Purpose** | Comprehensive skills/habits/mindset overview | Age-gated path with timelines and alternatives |
| **User Value** | "What do I need to succeed?" | "How long will it take and what if I fail?" |
| **Overlap** | Skills + habits + tools appear in both | Timeline + alternative paths appear in both |

**Overlap %:** 65%

**Why overlap exists:**
Blueprint covers "what you need" (skills, habits, tools). Masterclass covers "the journey" (timeline, age path). But there is significant content bleeding: Blueprint's "mistakes" overlaps with Masterclass's "reality check." Both sections mention success factors and lessons. A user reading both tabs will encounter substantially repeated information.

**Recommendation: MERGE**
- Consolidate into a single "Journey" tab that flows: Skills → Timeline → Milestones → Reality Check → Alternatives.
- Eliminate the artificial separation between "what you need" and "the path" — they are the same story.
- Keep unique Masterclass content (age path, timeline) but absorb it into the merged tab.

---

### 4. Life Pillars Tab (Roadmap Detail) vs Life Engine (§7)

| Dimension | Roadmap Life Pillars Tab | Life Engine |
|-----------|------------------------|-------------|
| **Concept** | 6 life pillars with habits | 6 Life Capital dimensions |
| **Dimensions** | Spiritual, Physical, Mental, Knowledge, Social, Professional | Knowledge, Skill, Health, Relationship, Character, Spiritual |
| **Persistence** | Part of roadmap seed data | localStorage: `beautifio_life_profile` |
| **Purpose** | Contextual habits per pillar for a specific dream | Holistic growth tracking across all dimensions |
| **User Value** | "How do I grow holistically for this dream?" | "Am I growing as a person?" |

**Overlap %:** 75%

**Why overlap exists:**
These are the **same concept** with **different names** for the dimensions. The Roadmap Life Pillars uses "Spiritual, Physical, Mental, Knowledge, Social, Professional" while Life Engine uses "Knowledge, Skill, Health, Relationship, Character, Spiritual." Both track 6 dimensions of holistic growth. The roadmap version has static habits per pillar; the Life Engine has dynamic capital points with decay, zones, and levels.

**Recommendation: MERGE**
- Standardize on one set of 6 dimensions. Life Engine's set is more granular (Skill vs Mental, Health vs Physical) and is the active gamified system.
- Replace the static Roadmap Life Pillars content with contextualized Life Engine integration.
- Habits in Roadmap Life Pillars should contribute to Life Engine capital sources.
- This eliminates the confusion of two competing holistic growth models.

---

### 5. Journals Feature (§10) vs Roadmap Reflections Tab

| Dimension | Journals Feature | Roadmap Reflections Tab |
|-----------|-----------------|------------------------|
| **Purpose** | Goal-oriented journals with entries, milestones, followers | Daily reflection journal per roadmap |
| **Storage** | Supabase: `journals`, `journal_entries`, etc. | localStorage: `beautifio_roadmap_reflections` |
| **Scope** | Cross-cutting: any goal, public or private | Roadmap-specific: per-dream reflections |
| **Entry model** | Title, content, mood, date | DailyReflection object |
| **Social features** | Followers, reactions | None (private) |

**Overlap %:** 60%

**Why overlap exists:**
Both allow users to write daily entries reflecting on their progress. The Journals feature is a full-featured social journaling system (Supabase-backed, with followers/reactions). The Roadmap Reflections tab is a simpler localStorage-based daily journal tied to a specific dream. Users have two separate journaling systems with different storage backends — the same user behavior (daily reflection) is split across two features.

**Recommendation: MERGE**
- Absorb Roadmap Reflections into the Journals system.
- Each roadmap gets an auto-created private journal tagged to that dream.
- Migrate localStorage reflections to the `journal_entries` table.
- Eliminate the separate Reflections tab UI in favor of a filtered journal view.

---

### 6. Growth Tracker (§17) vs Life Engine (§7)

| Dimension | Growth Tracker | Life Engine |
|-----------|---------------|-------------|
| **Purpose** | Aggregate growth stats across all roadmaps | Gamified personal growth with 6 capital dimensions |
| **Stats** | Streak, reflections, vault items, active roadmaps, masterclass progress, depth score | 6 capital dimensions, growth zones, life stages, 7 life levels |
| **Storage** | localStorage (computed from multiple keys) | localStorage: `beautifio_life_profile` |
| **Location** | Profile "My Growth" section | `/life` page + profile integration |

**Overlap %:** 55%

**Why overlap exists:**
Both answer "how am I doing overall?" The Growth Tracker is a flat aggregate (streak across roadmaps). The Life Engine is a rich gamified system (capital, zones, levels, unlocks). They coexist in the same Profile section ("My Growth") but use different data models and different displays. The Life Engine is far more sophisticated; the Growth Tracker provides a simpler alternative view.

**Recommendation: MERGE**
- Absorb Growth Tracker metrics into Life Engine as derived stats.
- Life Engine should compute "total streak" and "active roadmaps" as additional capital sources or display stats.
- Replace the separate Growth Tracker component with a Life Engine summary widget.
- Depth Score can become a Life Engine achievement metric.

---

### 7. Button Component Duplication

| Dimension | `packages/ui/button.tsx` | `apps/web/.../ui/button.tsx` |
|-----------|------------------------|-----------------------------|
| **Location** | `packages/ui/src/button.tsx` | `apps/web/src/components/ui/button.tsx` |
| **Purpose** | Shared UI button | App-specific button |
| **Issue** | Two button components with different implementations | |

**Overlap %:** 100%

**Why overlap exists:**
The UI library (`packages/ui`) already exports a Button component with consistent styling. The app created a second button component locally. This is a code-level duplication that will cause visual inconsistency and maintenance burden.

**Recommendation: REMOVE**
- Delete `apps/web/src/components/ui/button.tsx`.
- All consumers should use the shared `@beautifio/ui/button`.
- If customization is needed, extend the shared button via props or variants.

---

### 8. V1 vs V3 Roadmap Components

| Dimension | V1 Components | V3 Components |
|-----------|--------------|---------------|
| **Components** | `MilestoneTimeline.tsx`, `RoadmapRecommendations.tsx` | 14 `RoadmapV3*` components |
| **Purpose** | Original milestone timeline + recommendations | Full 11-tab roadmap detail |
| **Status** | Still in codebase | Current implementation |
| **Data** | V1 milestone + recommendation tables | V3 11 roadmaps with full seed data |

**Overlap %:** 70%

**Why overlap exists:**
V1 components (`MilestoneTimeline`, `RoadmapRecommendations`) are legacy code from the original roadmap implementation. V3 is the current system with 11 full roadmaps and 14 components. The V1 components are no longer rendered (or are rendered alongside V3 content), creating confusion about which roadmap system is active.

**Recommendation: REMOVE**
- Delete `MilestoneTimeline.tsx` and `RoadmapRecommendations.tsx`.
- Ensure V3 components fully cover their use cases.
- The `GrowthReflectionSection.tsx` and `StageAdaptedContent.tsx` are already V3-era and should be kept.

---

### 9. Anonymous Posting Paths

| Dimension | Safe Space Anon Posts | `/inspirasi/post` |
|-----------|---------------------|-------------------|
| **Purpose** | Anonymous emotional expression | Write anonymous story |
| **Storage** | localStorage: `beautifio_anon_posts` | localStorage: `beautifio_anon_posts` |
| **Location** | Safe Space modal + Profile Support System | Inspirasi section (stories) |
| **Access** | Via SafeSpaceModal or Profile | Via dedicated route |

**Overlap %:** 40%

**Why overlap exists:**
Both features allow users to write anonymous posts that go to the same localStorage key. However, they are accessed from completely different contexts: Safe Space presents it as emotional support, while Inspirasi presents it as writing a story. The **naming and positioning** is confusing — `/inspirasi/post` (in the Inspirasi/stories section) creates anonymous Safe Space posts, not inspirational stories.

**Recommendation: RENAME**
- Rename `/inspirasi/post` to `/safe-space/post` or merge it into the Safe Space feature.
- Move the route from Inspirasi to a dedicated Safe Space or profile section.
- The Inspirasi section should only deal with curated/published stories, not anonymous submissions.

---

### 10. Ecosystem Links (4.7) vs Opportunities (§14)

| Dimension | Ecosystem Links | Opportunities |
|-----------|----------------|---------------|
| **Purpose** | Curated external resources per life stage | Scholarships, jobs, internships, competitions |
| **User Value** | Context-relevant opportunities | Real-world opportunities aligned to goals |
| **Problem Solved** | Connecting users to real-world resources | "What can I apply for?" |
| **Location** | Home page section | Dedicated: `/opportunity`, `/opportunity/[slug]` |
| **DB Tables** | Static (no DB) | `opportunities`, `saved_opportunities` |

**Overlap %:** 50%

**Why overlap exists:**
Both connect users to external resources/opportunities. Ecosystem is a curated static list on the home page. Opportunities is a full dynamic feature with DB-backed listings, saving, and categorization. They solve the same user need ("what else can I do?") at different scales.

**Recommendation: KEEP (with integration)**
- Ecosystem Links serve as a **discovery surface** on the Home page; Opportunities is the **full feature**.
- Keep both, but have Ecosystem Links pull from the Opportunities database (filtered by life stage).
- Replace static Ecosystem data with a dynamic query of the `opportunities` table.

---

### 11. AI Coach (§16) vs Human Mentors (§12)

| Dimension | AI Coach | Mentors |
|-----------|----------|---------|
| **Purpose** | Automated coaching and motivation | Human expert guidance |
| **Delivery** | In-app AI-generated text | Mentor profiles, static seed data |
| **Scope** | Daily focus, insights, zone analysis, capital advice, dream navigation | Career-specific advice, accountability |
| **Accessibility** | Always available | Limited to listed mentors |

**Overlap %:** 40%

**Why overlap exists:**
Both provide guidance, motivation, and wisdom to the user. AI Coach is automated, always-on, and personalized to the user's data. Mentors are human, limited in number (15), and provide domain-specific expertise. There is overlap in the "who helps me grow?" problem space.

**Recommendation: KEEP**
- They serve different needs: AI Coach for daily micro-coaching and scalability; Mentors for deep expertise and human connection.
- The overlap is complementary, not redundant.
- Document the distinction in the product so users understand when to use which.

---

### 12. Discovery Questionnaire (§5) vs Roadmap "I Don't Know Yet" CTA

| Dimension | Discovery Questionnaire | Roadmap "I Don't Know Yet" |
|-----------|----------------------|---------------------------|
| **Purpose** | 4-step guided self-reflection | CTA to Discovery flow |
| **User Value** | Personalized recommendations | Entry point for unsure users |
| **Problem Solved** | "I don't know what I want" | "I don't know yet" |
| **Storage** | localStorage: `beautifio_discovery_answers` | (CTA links to Discovery) |

**Overlap %:** 50%

**Why overlap exists:**
Both serve the same user need ("I don't know what I want"). The Discovery Questionnaire is the full feature; the Roadmap page has a prominent CTA pointing to it. They are part of the same funnel, but the CTA is embedded in the Roadmap page while the questionnaire lives at `/discover`.

**Recommendation: KEEP**
- This is intentional funnel design: the Roadmap page surfaces "I Don't Know Yet" as a CTA when no discovery answers exist.
- The overlap is architectural, not redundant.
- Ensure the CTA leads directly to the questionnaire and the result page bridges back to `/roadmap`.

---

### 13. Profile "My Growth" Section vs `/life` Life Engine Page

| Dimension | Profile My Growth | Life Engine (`/life`) |
|-----------|------------------|---------------------|
| **Purpose** | Life Capital + Growth Tracker + Gamification (expandable) | Full gamified growth system |
| **Content** | Summary of life capital, growth stats, level | Full Life Engine: capital, zones, stages, levels, capital sources |
| **Location** | Profile page (expandable section) | Dedicated page at `/life` |
| **Auth Required** | Yes | Yes |

**Overlap %:** 45%

**Why overlap exists:**
The Profile page "My Growth" section was created by merging LifeCapitalSection + GrowthTrackerSection + GamificationSection into one expandable area. However, the dedicated `/life` page still exists with the full Life Engine experience. The profile gives a summary view; `/life` gives the detailed view. This is a summary/detail split, but users may be confused about which to use.

**Recommendation: KEEP (clarify relationship)**
- Profile "My Growth" is the **dashboard summary**; `/life` is the **full management page**.
- Keep both but add clear visual/UX cues that "My Growth" is a summary and tapping expands or navigates to `/life`.
- Consider removing the expandable detail in Profile if `/life` is always accessible.

---

## Cross-Cutting Concerns

### 1. Dual Storage Backends (Supabase + localStorage)

Several features (Journals, Daily Wins, Reflections, Life Engine) store data in both Supabase and localStorage inconsistently. This creates fragmentation:
- Journal entries → Supabase
- Roadmap reflections → localStorage
- Daily wins → localStorage
- Life Engine profile → localStorage

**Risk:** Data loss if localStorage is cleared. Inconsistent backup/restore behavior.

**Recommendation:** Establish a clear storage strategy. Life Engine and reflections should migrate to Supabase for persistence.

### 2. Feature Discovery Surface Overload

The Home page (§4) contains **7 sections**: Daily Win, Active Goals, Recent Activity, Featured Stories, Mentor Insights, Quick Actions, Ecosystem Links. This is an unusually high number of distinct sections on a single dashboard page. Users may experience decision paralysis.

**Recommendation:** Consider collapsing Related sections (Ecosystem + Opportunities) and using a tabbed or prioritized layout.

### 3. Navigation Gap for Life Engine

The Bottom Navigation (§3.1) has 6 tabs but **no direct link to `/life`** (Life Engine). Users must navigate to Profile → My Growth → expand to see Life Engine data, or know to visit `/life` directly. This buries one of the most sophisticated features.

**Recommendation:** Either add Life Engine to the bottom nav (replace least-used tab) or surface it more prominently within Profile.

---

## Priority Action Items

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| **P0** | Merge Button components (100% duplicate) | Consistency, maintenance | Low |
| **P0** | Remove V1 Roadmap components (dead code) | Code health | Low |
| **P1** | Merge Daily Wins (Home + Roadmap) into single feature | User confusion, data sync | Medium |
| **P1** | Merge Life Pillars Tab into Life Engine | Eliminate competing models | Medium |
| **P1** | Merge Blueprint + Masterclass tabs | Content redundancy | Medium |
| **P2** | Merge Splash + Welcome pages | Funnel optimization | Low |
| **P2** | Merge Journals + Reflections | Dual journaling systems | High |
| **P2** | Rename `/inspirasi/post` → `/safe-space/post` | Navigation clarity | Low |
| **P2** | Absorb Growth Tracker into Life Engine | Unify growth metrics | Medium |
| **P3** | Integrate Ecosystem Links with Opportunities DB | Data consistency | Low |
| **P3** | Document AI Coach vs Mentors distinction | User guidance | Low |

---

## Scorecard

| Category | Count |
|----------|-------|
| **Total overlaps identified** | 13 |
| **Merge recommended** | 7 (1, 2, 3, 4, 5, 6, 7) |
| **Remove recommended** | 2 (7, 8) — 7 is both merge and remove |
| **Rename recommended** | 1 (9) |
| **Keep recommended** | 5 (10, 11, 12, 13) |

---

*End of Feature Overlap Report*
