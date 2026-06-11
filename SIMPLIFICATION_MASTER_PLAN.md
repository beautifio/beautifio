# SIMPLIFICATION MASTER PLAN — Beautifio

> **Authors:** Product Strategist, UX Lead, Growth Product Manager  
> **Target:** 40%+ complexity reduction  
> **Constraint:** No removal of core value  
> **Source:** `PRODUCT_INVENTORY.md`, `USER_JOURNEY_SIMPLIFICATION.md`  
> **Date:** June 2026

---

## Current Complexity Score

| Dimension | Current | Target | Reduction |
|-----------|---------|--------|-----------|
| Routes | 34 | 20 | 41% |
| Bottom Nav Items | 6 | 4 | 33% |
| Home Page Sections | 7 | 3 | 57% |
| Roadmap Detail Tabs | 11 | 4 | 64% |
| Profile Sections | 8 | 3 | 63% |
| Discovery Steps | 4 | 1 | 75% |
| Story Categories (visible) | 9 | 3 | 67% |
| Capital Dimensions | 6 | 4 | 33% |
| Life Levels | 7 | 5 | 29% |
| Growth Zones | 4 | 3 | 25% |
| Unlock Features | 10 | 0 | 100% |
| Seed Data Files | 9 | 7 | 22% |
| Writing Features | 3 | 1 | 67% |
| Dashboard/Analytics Pages | 3 (Life, Growth Tracker, Profile Growth) | 1 | 67% |

**Estimated overall complexity reduction: ~50%**

---

## 1. FEATURES TO MERGE

| # | Feature A | Feature B | Merge Into | Rationale |
|---|-----------|-----------|------------|-----------|
| 1 | Splash Screen (`/`) | Welcome (`/welcome`) | Unified Landing (`/`) | Two sequential intro pages → one |
| 2 | Discovery Questionnaire (4 steps) | Result Page | Single-screen Discovery (`/discover`) | Question + result on one page |
| 3 | Daily Wins (Home section) | Daily Wins (Roadmap tab) | Roadmap Daily Wins | Home shows summary widget only |
| 4 | Blueprint Tab | Masterclass Tab | "Perjalanan" (Journey) Tab | Overlapping content merged |
| 5 | Life Pillars Tab | Life Engine | Life Engine | Same 6-dimension concept merged |
| 6 | Roadmap Reflections Tab | Journals Feature | Journal Entries | Two daily writing features → one |
| 7 | Growth Tracker (§17) | Life Engine (§7) | Life Engine | Aggregate stats absorbed into Life Engine |
| 8 | Ecosystem Links (Home) | Opportunities (§14) | Opportunities | Static links → dynamic Opportunity query |
| 9 | Familia Deals/Vouchers/Rewards | Profile Opportunities Section | Familia Hub | 4 sub-pages → single tabbed hub |
| 10 | `packages/ui/button.tsx` | `apps/web/.../ui/button.tsx` | `packages/ui/button.tsx` | Remove duplicate |
| 11 | V1 Roadmap Components | V3 Roadmap Components | V3 Only | Remove dead code |
| 12 | Anon Safe Stories | Safe Space Posts | Safe Space | Consolidate anonymous writing |

---

## 2. PAGES TO MERGE

| Current Pages | Merged Page | Rationale |
|---------------|-------------|-----------|
| `/` + `/welcome` | `/` | Two orientation pages → one |
| `/discover` + `/discover/result` | `/discover` | Questionnaire + result on one page |
| `/life` + `/life/start` | `/life` | Onboarding inline, not a separate route |
| `/familia/deals` + `/familia/vouchers` + `/familia/rewards` | `/familia` with 3 inline tabs | No full-page navigation needed |
| `/inspirasi/post` | `/safe-space/post` (new route) | Move to correct feature context |
| `/jurnal/[slug]/tulis` | Remove (not implemented) | Dead route, implement inline instead |

### Recommended Route Map (20 routes vs 34)

| Route | Feature | Change |
|-------|---------|--------|
| `/` | Landing (merged Splash + Welcome) | Merged |
| `/login` | Login | — |
| `/register` | Register | — |
| `/forgot-password` | Password Reset | — |
| `/home` | Dashboard | Simplified (3 sections) |
| `/discover` | Discovery (1-step) | Simplified (4 steps → 1) |
| `/roadmap` | Dream Marketplace | — |
| `/roadmap/[slug]` | Roadmap Detail (4 tabs) | Simplified (11 tabs → 4) |
| `/life` | Life Engine | Merged with `/life/start` |
| `/profil` | Profile | Simplified (8 sections → 3) |
| `/inspirasi` | Stories | Simplified categories |
| `/inspirasi/[slug]` | Story Detail | — |
| `/jurnal` | Journals | — |
| `/jurnal/[slug]` | Journal Detail | — |
| `/jurnal/buat` | Create Journal | — |
| `/circle` | Circles | — |
| `/circle/[id]` | Circle Detail | — |
| `/mentors` | Mentors | — |
| `/mentors/[slug]` | Mentor Detail | — |
| `/opportunity` | Opportunities | Merged Ecosystem Links |
| `/opportunity/[slug]` | Opportunity Detail | — |
| `/familia` | Familia Hub (3 tabs inline) | Merged 4 pages → 1 |
| `/safe-space/post` | Anonymous Post | Renamed from `/inspirasi/post` |
| `/admin/familia` | Admin | Kept |

**Routes removed:** `/welcome`, `/discover/result`, `/life/start`, `/familia/deals`, `/familia/vouchers`, `/familia/rewards`, `/inspirasi/post`, `/jurnal/[slug]/tulis`, `/onboarding` (inline)

---

## 3. NAVIGATION TO SIMPLIFY

### Bottom Navigation: 6 → 4

**Current (6 tabs):**

```
Beranda | Inspirasi | Roadmap | Jurnal | Circle | Profil
```

**Recommended (4 tabs):**

```
Beranda | Roadmap | Circle | Profil
```

**Rationale:**
- **Jurnal** → merged into Roadmap (as Reflections/entries) + accessible from Profil
- **Inspirasi** → accessible from Roadmap (stories contextual to dream) + Profil
- **Roadmap** is the core journey — it gets a permanent tab
- **Circle** stays for community belonging
- **Circle** becomes the social hub (includes mentor discovery)
- **Profil** becomes the "me" dashboard (includes journals, stories, rewards)

### Roadmap Detail Tabs: 11 → 4

**Current (11 tabs):**

```
Dream | Daily | Skills | Milestones | Blueprint | Masterclass | Life Pillars | Alt Futures | Vault | Reflections | Related
```

**Recommended (4 tabs):**

```
Mimpi (Dream)   |   Harian (Daily)   |   Kemampuan (Skills)   |   Perjalanan (Journey)
```

- **Mimpi (Dream):** What this dream is, why it matters, success examples, career paths *(merged: Dream + Blueprint essence)*
- **Harian (Daily):** Daily habits with check-off *(unchanged)*
- **Kemampuan (Skills):** Skill progression with levels *(unchanged)*
- **Perjalanan (Journey):** Milestones, timeline, reality check, age path, alternative paths *(merged: Milestones + Masterclass + Blueprint)*

**Hidden (accessible via "More" menu, not tabs):** Life Pillars (links to Life Engine), Vault, Reflections, Alt Futures, Related

### Home Dashboard Sections: 7 → 3

**Current (7 sections):**

```
Daily Win | Active Goals | Recent Activity | Featured Stories | Mentor Insights | Quick Actions | Ecosystem Links
```

**Recommended (3 sections):**

1. **Lanjutkan (Continue):** Daily wins + streak for active dream(s) *(merged Daily Win + Active Goals)*
2. **Untuk Kamu (For You):** 1-3 recommended stories or opportunities based on dream *(merged Featured Stories + Ecosystem Links, filtered)*
3. **Aktivitas (Activity):** Recent relevant updates *(simplified Recent Activity)*

**Removed:** Mentor Insights (moved to Circle/Mentors page), Quick Actions (bottom nav already handles this), Ecosystem Links (moved to Opportunities)

### Profile Sections: 8 → 3

**Current (8 sections):**

```
Profile Hero | Emotional Summary | My Life Journey | Current Focus | My Growth | My Journals & Stories | Support System | Opportunities & Rewards
```

**Recommended (3 sections):**

1. **Identitas (Identity):** Avatar, name, life level, current dream, streak *(merged Profile Hero + Current Focus)*
2. **Perkembanganku (My Growth):** Life capital summary + weekly progress chart *(absorbed My Growth + Life Journey timeline)*
3. **Aktivitas Terbaru (Recent Activity):** Recent journal entries, circle messages, achievements *(merged My Journals & Stories + Support System highlights)*

**Removed:** Emotional Summary (premature/creepy for new users), Opportunities & Rewards (move to `/familia`), Support System (move to Circle/Mentors pages)

---

## 4. CONCEPTS TO RENAME

| Current Name | Problem | Recommended Name | Rationale |
|-------------|---------|-----------------|-----------|
| **Life Engine** | Technical, gamified, impersonal | **Perkembangan** (Growth) | Warm, human, self-explanatory |
| **Life Capital** | Abstract financial metaphor | **Poin Perkembangan** (Growth Points) | Clearer: points = progress |
| **Growth Zone** (Comfort/Fear/Learning/Growth) | "Fear" zone is negative, 4 is too many | **Tahap** (Stage): Pemula → Aktif → Bertumbuh | 3 positive stages, no shame |
| **Familia** | Brand name, no meaning in Indonesian | **Rewards** or **Manfaat** (Benefits) | Self-explanatory: rewards/perks |
| **Safe Space** | English, clinical | **Ruang Aman** (Safe Room) | Indonesian, warmer |
| **Life Journey** | Abstract | **Ceritaku** (My Story) | Personal, narrative |
| **Inspirasi Post** (anon) | Misleading (not inspirational stories) | **Curhat** (Vent/Confide) | Honest about purpose: emotional outlet |
| **Masterclass** | Premium-sounding, intimidating | **Peta Jalan** (Roadmap Path) | Practical, directional |
| **Blueprint** | Technical, jargon | Merged into Perjalanan | Removed entirely |
| **Vault** | Abstract, game-like | **Simpanan** (Saved Items) | Concrete, clear |
| **Alt Futures** | English, complex | Merged into Perjalanan | Removed entirely |
| **Growth Tracker** | Redundant with Life Engine | Removed | Absorbed into Perkembangan |
| **Ecosystem** | Vague, jargon | Removed | Merged into Opportunities |
| **Pivot** | Business jargon | **Ganti Mimpi** (Change Dream) or **Arah Baru** (New Direction) | Human language |

---

## 5. CARDS / UI ELEMENTS TO REMOVE

| Location | Element | Rationale |
|----------|---------|-----------|
| Home | Quick Actions row | Bottom nav already provides navigation |
| Home | Mentor Insights card | Low engagement for new users; belongs on /mentors |
| Home | Ecosystem Links | Merged into Opportunities feature |
| Home | Active Goals section | Merged into "Continue" section |
| Roadmap Detail | Alt Futures tab | Premature for beginners; hides in "More" |
| Roadmap Detail | Vault tab | Premature; hides in "More" |
| Roadmap Detail | Related tab | Premature; hides in "More" |
| Roadmap Detail | Life Pillars tab | Merged into Life Engine |
| Profile | Emotional Summary card | Feels fake when no data exists |
| Profile | Opportunities & Rewards section | Belongs on /familia page |
| Profile | My Life Journey section | Merged into Perkembanganku |
| Journey | I Don't Know Yet CTA | Replaced by visual "pick what looks fun" |
| Discovery | Step counter (1/4) | No longer 4 steps |
| Stories | Category bar with 9 items | Replaced by 3 smart buckets |
| Life Engine | Unlock System badges | Removed entirely (no feature gating) |
| Life Engine | Capital Decay warning | Removed (positive reinforcement only) |
| Journal | Public/follower toggle | No public journals for new users |
| Circle | Mentor section in detail | Moved to dedicated Mentor tab |
| Register | Onboarding questions | Removed (deferred to Discovery) |
| Familia | Admin link for non-admins | Conditional render |

---

## 6. FLOWS TO SHORTEN

### Flow 1: First-time user (11 steps → 3 steps)

**Before:**
```
Download → Splash → Welcome → Register → Onboarding → Discovery (4 steps) →
Result → Browse Roadmaps → Pick one → See 11 tabs → Start habits
```

**After:**
```
Download → Landing (1-screen value) → Browse Roadmaps → Pick one → Do habit
```

**Screens before first win:** 20-30 → **4**

### Flow 2: Discovery (4 steps → 1 tap)

**Before:**
```
Step 1: Pick inspiration → Step 2: Pick aspiration → Step 3: Pick interests (max 2) →
Step 4: Pick goal → View results → Navigate to Roadmap
```

**After:**
```
See 6 visual cards (gaming, music, tech, sports, art, business) → Tap one →
See roadmaps filtered by that interest
```

**Goal:** Reduce decision paralysis. "What's cool?" is easier than "What's your aspiration?"

### Flow 3: Registration

**Before:**
```
Enter email & password → Onboarding questions → Profile created → Redirect to Discovery
```

**After:**
```
Browse roadmaps first (no account needed) → Tap "Start" on any roadmap →
Enter email & password → Start habit
```

**Goal:** Value before commitment.

### Flow 4: Life Engine activation

**Before:**
```
First login → Navigate to /life → Set up stage, dream, zone, spiritual pref →
See 6 empty capital bars → See 10 locked features → Feel overwhelmed → Leave
```

**After:**
```
Day 3 of habit streak → Notification: "Kamu sudah konsisten 3 hari! Lihat
perkembanganmu." → Show simplified Growth page with 1-2 dimensions → Unlock more gradually
```

**Goal:** Progressive disclosure. Don't show RPG complexity on day one.

### Flow 5: Writing an entry (3 choices → 1)

**Before:**
```
User wants to write → 3 choices:
  a) Journal (public/private, goal-oriented)
  b) Roadmap Reflections (daily, per-dream)
  c) Safe Space / Inspirasi Post (anonymous, emotional)

→ User confuses them → Picks wrong one → Frustrated
```

**After:**
```
User taps "Tulis" from Roadmap daily → Simple inline modal:
  "How was your practice today?" [text area] → "Bagaimana perasaanmu?" [mood picker] → Save
```

**Goal:** One writing feature. Journals become the power-user version unlocked later.

---

## 7. DETAILED STRUCTURE COMPARISON

### Current Structure (24 sections in inventory)

```
1. Splash (/)
2. Welcome (/welcome)
3. Login (/login)
4. Register (/register)
5. Forgot Password (/forgot-password)
6. Navigation (6 tabs)
7. Home (7 sections, mostly static)
8. Discovery (4 steps + result page)
9. Roadmap List + Roadmap Detail (11 tabs)
10. Life Engine (with unlocks, decay, pivot)
11. Profile (8 sections)
12. Stories (9 categories + anon post)
13. Journals (with followers, reactions)
14. Circles (with mentors, chat)
15. Mentors (15 mentors, static)
16. Familia (4 sub-pages)
17. Opportunities (2 pages)
18. Safe Space (6 categories, resources, guides)
19. AI Coach (13 functions)
20. Growth Tracker (6 stats)
21. Ecosystem (static links)
22. UI Library
23. Shared Components
24. Feature Components (31)
```

### Recommended Structure (15 sections)

```
1. Landing (/) — merged Splash + Welcome
2. Auth (/login, /register, /forgot-password) — no onboarding questions
3. Navigation (4 tabs: Beranda, Roadmap, Circle, Profil)
4. Home / Beranda (3 sections: Continue, For You, Activity)
5. Discovery (1-step visual "what looks cool?")
6. Roadmap List + Detail (4 core tabs, others hidden)
7. Perkembangan / Growth (simplified Life Engine, no unlocks/decay)
8. Profil (3 sections: Identity, Growth, Recent Activity)
9. Stories / Inspirasi (3 smart buckets, read-only for new users)
10. Journal (single system, private-first, inline entry modal)
11. Circles (recommended + browse, lurk-by-default)
12. Mentors (integrated into Circles, separate page for browsing)
13. Opportunities (merged Ecosystem Links)
14. Familia Rewards (3 inline tabs: Deals, Vouchers, Rewards)
15. Safe Space / Ruang Aman (moved /post here, anon emotional outlet)
```

---

## 8. SIMPLIFICATION BY THEME

### Fewer Menus

| Where | Before | After |
|-------|--------|-------|
| Bottom nav | 6 items | 4 items |
| Roadmap tabs | 11 tabs | 4 tabs + "More" |
| Profile sections | 8 sections | 3 sections |
| Home sections | 7 sections | 3 sections |
| Story categories | 9 categories | 3 buckets |
| Familia sub-pages | 4 routes | 1 route |

### Fewer Concepts

| Concept | Before | After |
|---------|--------|-------|
| Growth measurement systems | Life Engine + Growth Tracker + Life Pillars | Perkembangan (unified) |
| Writing/reflection features | Journals + Reflections + Anon Posts | 1 entry modal + 1 anon post |
| Intro page count | Splash + Welcome | 1 unified landing |
| Discovery length | 4 steps | 1 tap |
| Roadmap content sections | 11 | 4 |
| Unlock/progression barriers | 10 unlockable features | 0 (everything accessible) |
| Negative mechanics | Capital decay, Fear zone | None (positive only) |
| Duplicate buttons | 2 button components | 1 |

### Fewer Dashboards

| Dashboard | Before | After |
|-----------|--------|-------|
| Home | 7 sections, scattered data | 3 sections, focused |
| Profile | 8 sections, mostly empty | 3 sections, relevant |
| Life Engine | Full RPG system | Simplified growth page |
| Growth Tracker | Separate stats page | Absorbed into Perkembangan |
| Familia | 4 sub-pages | 1 hub page |

### Fewer Cards

**Total cards/elements removed:** ~25

**Impact:** Cleaner screens, higher signal-to-noise ratio, faster cognitive processing for a 15-year-old.

### Fewer Clicks

| Flow | Before (clicks) | After (clicks) | Reduction |
|------|----------------|----------------|-----------|
| First-time to first win | 15-25 clicks | 4 clicks | 80% |
| Discovery to Roadmap | 8 clicks | 2 clicks | 75% |
| Check daily habit | 4 clicks | 2 clicks | 50% |
| Write a reflection | 6+ clicks | 3 clicks | 50% |
| Find a story to read | 4 clicks | 2 clicks | 50% |
| View growth stats | 5 clicks | 2 clicks | 60% |

---

## 9. GROWTH IMPACT ANALYSIS

### Expected Benefits

| Metric | Expected Impact | Driver |
|--------|----------------|--------|
| **Time to first win** | ↓ 80% (from ~8 min to ~90 sec) | Shorter funnel, fewer clicks |
| **Registration conversion** | ↑ 30-50% | Value before commitment |
| **Day-1 retention** | ↑ 40-60% | Immediate "I did it" feeling |
| **Day-7 retention** | ↑ 25-40% | Progressive disclosure keeps users curious |
| **Feature discovery** | ↑ (fewer features found more) | Simplification focuses attention |
| **User confusion (support tickets)** | ↓ 50-70% | Fewer duplicative features |
| **Session duration** | ↑ (quality time) or ↓ (friction time) | Less confusion, more action |

### Risks of NOT Simplifying

- A 15-year-old who doesn't know where to start will **never reach the habit** — they'll abandon during Discovery.
- 11 roadmap tabs create **analysis paralysis** — the user reads instead of does.
- 3 writing features **cannibalize each other** — none reaches critical mass.
- Empty Profile sections **signal "this app is empty"** — users think the app has no content.
- Capital decay and unlocks **feel punitive** — the user hasn't earned anything yet, so being blocked feels bad.

---

## 10. IMPLEMENTATION ROADMAP

| Phase | Changes | Effort | Impact |
|-------|---------|--------|--------|
| **Quick wins** (Week 1) | Remove V1 components; merge buttons; remove dead routes; hide empty profile sections | Low | Medium |
| **Navigation** (Week 2) | Bottom nav 6→4; Roadmap tabs 11→4 (hide rest); Profile 8→3 | Medium | High |
| **Home** (Week 3) | Home 7→3 sections; remove Quick Actions, Mentor Insights, Ecosystem, Active Goals cards | Medium | High |
| **Discovery** (Week 4) | 4-step → 1-tap visual; merge result page inline | Medium | High |
| **Writing** (Week 5) | Merge Reflections → Journal; move anon post to Safe Space; simple inline entry modal | High | Medium |
| **Life Engine** (Week 6-7) | Remove unlocks; remove decay; remove fear zone; simplify to 4 dimensions (or progressive reveal); absorb Growth Tracker | High | High |
| **Familia** (Week 8) | Merge 4 sub-pages into 1 hub with inline tabs | Low | Low |
| **Polish** (Week 9) | Rename concepts (Familia→Manfaat, Life Engine→Perkembangan, etc.); update copy | Medium | Medium |

---

## 11. FINAL COMPLEXITY SCORE

| Metric | Current | Target | After Plan |
|--------|---------|--------|------------|
| Routes | 34 | ~20 | 20 |
| Bottom Nav Items | 6 | 4 | 4 |
| Home Sections | 7 | 3 | 3 |
| Roadmap Tabs | 11 | 4 | 4 |
| Profile Sections | 8 | 3 | 3 |
| Discovery Steps | 4 | 1 | 1 |
| Visible Categories | 9 | 3 | 3 |
| Writing Features | 3 | 1 | 1 |
| Dashboard/Analytics Pages | 3 | 1 | 1 |
| Gamified Systems | 3 (Life Engine, Growth Tracker, Life Pillars) | 1 (Perkembangan) | 1 |
| Unlock Barriers | 10 | 0 | 0 |
| Negative Mechanics | 2 (decay, fear zone) | 0 | 0 |
| Duplicate Components | 2 (buttons, V1+V3) | 0 | 0 |
| Feature Components | 31 | ~20 | ~20 |

**Target: 40%+ complexity reduction**
**Achieved: ~50%**

---

*End of Simplification Master Plan*
