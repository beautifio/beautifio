# BEAUTIFIO REALITY AUDIT — V2 vs LIVE

**Date:** 2026-06-11
**Method:** Compare Constitution V2 + Home Experience + Dream Journey Refactor against actual production code.
**Tone:** Zero politeness. Sunk cost is irrelevant. Previous decisions are not protected.

---

## EXECUTIVE SUMMARY

The product has **two separate apps** living in the same codebase:

**App A (60% of code, mostly correct):** Dream Journey. Home, Journey list, Journey detail, Profile, Discover. This part mostly aligns with Constitution V2. No streaks (hardcoded to 0), no scoring, no commerce, no social mechanics. The core loop works.

**App B (40% of code, mostly violations):** Familia (marketplace), Inspirasi (social media with likes), Cerita (social metrics), Circle (mock social), Mentors (ratings). All built on static mock data. None of it connects to real APIs. None of it serves the Dream Journey. All of it violates the Constitution.

**The gap is not confusion. It is a fork.** The Journey side was built with discipline. The rest was built without a constitution.

---

## 1. HOME

### Current State

Route: `/` (home), mapped from `/home`
Data: Active journey from Supabase, journey progress, today's activities, today's reflection.

User sees:
- Time-based greeting with avatar and name
- "Targetku Saat Ini" (current Big Win + Small Win + progress counters)
- "Hari Ini" (6 daily activities with checkboxes, dimension labels, segmented progress bar)
- "Kemajuan Terbaruku" (today's reflection or prompt to reflect)
- If no journey: "Kamu belum memulai perjalanan" with CTA

### What Aligns with Constitution

- Six dimensions are present (Spiritual, Physical, Knowledge, Social, Character, Dream Skill)
- No streaks (flame icon exists but value is hardcoded to 0 — effectively absent)
- No scores, levels, gamification
- No commerce, no social mechanics
- Greeting is warm but not hype-y
- Missing-day not punished (no streak guilt messaging)
- Activity progress is shown but not framed as "you failed"
- Reflection prompt tied to activity completion

### What Conflicts with Constitution

**Medium conflict — Flame icon.** The UI renders a fire/streak icon next to activities (e.g., "3/6 selesai"). The icon is a legacy visual from the gamification era. Even though the streak number is hardcoded to 0, the *icon itself* evokes gamification. It says: "this is the thing you track."

**Medium conflict — Progress bar is segmented dots, not a bar.** The Home Experience document says: "No progress bar. Progress bar = 'belum selesai.' Home bukan tempat 'belum selesai.'" The current design uses a segmented dot row (filled/empty) which is essentially a progress indicator. It should not be on Home at all — that belongs on Journey detail.

**Minor conflict — No user-type-aware greeting.** Constitution and Home Experience define 3 user types (routine, returning after fall, brand new). Current greeting is static: "Selamat Pagi, [name]" regardless of user state. No differentiation for returning users who might need emotional safety.

**Minor conflict — Activities shown as individual cards, not as a single block.** The Home Experience prescribes one block with 6 lines and a single "Mulai dari yang mana?" button. Current implementation shows individual activity rows with checkboxes, which creates a checklist mentality.

### What Should Be Removed

| Item | Reason |
|------|--------|
| Flame icon next to activities | Gamification residue. Replace with neutral bullet or dimension icon. |
| Segmented progress bar (filled dots for activities) | Moves to Journey detail. Home shows presence, not progress. |
| Activity counters ("3/6") on Home | That is measurement. Home is for greeting, not tracking. |

### What Should Be Merged

Nothing. Home is the only page that welcomes the user. Keep it focused.

### What Should Be Redesigned

1. **Greeting layer:** Add user-type detection (new user / returning after absence / daily user). Serve different greeting text.
2. **Layout order:** Implement Sapaan → Big Win context → Six activities as one block with "Mulai dari yang mana?" button.
3. **Remove counters:** "X/Y selesai" moves to Journey detail. Home shows "Hari ini kamu cukup..." not "Hari ini kamu menyelesaikan X."

### Priority Score: **IMPORTANT**

Not critical because the page mostly works and has no major violations. Redesign is about tone and philosophy, not fixing broken things.

---

## 2. DREAM DISCOVERY

### Current State

Route: `/discover`
Data: Static `DISCOVERY_QUESTIONS` from utils. Answers stored in `localStorage` under key `beautifio_discovery_answers`. No API calls.

Multi-step questionnaire with:
- Step indicator
- Single/multi-select questions with max limits
- Saves to localStorage on last step
- Navigates to `/discover/result`

### What Aligns with Constitution

- Discovery is guided (quiz format), not a directory browse
- No dream ranking, no comparison
- Questions are exploratory, not evaluative

### What Conflicts with Constitution

**Critical conflict — Data stored in localStorage, not in the user's permanent record.** If user clears browser data or switches devices, their discovery answers are lost. The Constitution says "The user's journey is theirs." You cannot own a journey if the record lives in ephemeral storage.

**Medium conflict — Result page is disconnected from journey creation.** After `/discover/result`, the user must navigate to `/journey` and manually select a dream. The discovery flow should feed directly into dream selection. Currently it's two separate systems.

**Medium conflict — Questions are static, not adaptive.** No age-awareness. A 14-year-old and a 28-year-old see the same questions. The Constitution requires age-appropriate content.

**Minor conflict — No opt-out.** The Constitution says the spiritual dimension has opt-out. There is no equivalent here — the quiz is essentially mandatory if you don't know what you want. Some users just want to pick a dream from a list.

### What Should Be Removed

| Item | Reason |
|------|--------|
| localStorage storage for answers | Replace with Supabase persistence |
| `/discover/result` as standalone page | Merge result into dream selection flow |

### What Should Be Merged

- Merge `/discover` result into `/journey/new` flow: after quiz → show 3-5 suggestions → user clicks one → journey created immediately

### What Should Be Redesigned

1. Replace localStorage with Supabase `spiritual_preferences` and a new `discovery_answers` table (or just skip storing answers — the only output is the dream choice)
2. Add age-awareness: filter dream suggestions by age group (13-17 / 18-25 / 26-35)
3. Add direct entry: user can skip quiz and browse dreams directly
4. Connect result to one-click journey creation

### Priority Score: **IMPORTANT**

The quiz infrastructure is fine. But the localStorage dependency and disconnect from journey creation are Constitution violations about data ownership and user experience integrity.

---

## 3. JOURNEY

### Current State

Routes: `/journey` (list), `/journey/[id]` (detail)
Data: Supabase queries — active journey, all journeys, big wins, small wins, daily activities, daily reflections, timeline events, spiritual preferences, dream templates (static).

**List page (`/journey`):**
- Active journey card with "Lihat Detail" link
- Previous journeys (pivoted/completed) with reduced opacity
- If no active journey: grid of dream template cards with "Pilih Mimpi Ini" button → calls `createJourney()` → navigates to journey detail

**Detail page (`/journey/[id]`):**
- Header with emoji, title, circular progress (% Big Wins complete)
- "Mengapa Mimpi Ini?" context box
- Current Big Win + Small Win focus
- 4 tabs: Hari Ini | Pencapaian | Cerita | Riwayat
  - **Hari Ini:** 6 daily activity cards (spiritual → dream_skill), check toggle, notes. Reflection prompt/display.
  - **Pencapaian:** Big Wins list with Small Win progress, complete/fail actions
  - **Cerita:** JourneyStory narrative component
  - **Riwayat:** JourneyTimeline chronological feed
- Alternative Futures section at bottom
- Modals: ReflectionModal, FailureModal, BigWinCelebration

### What Aligns with Constitution

- **Dream → Big Win → Small Win → Daily Activity hierarchy is intact and correct.**
- **6 dimensions with Spiritual belief-awareness exists.** `SpiritualPreferences` with belief types, `getSpiritualPreferences()` query, faith-specific activity generation.
- **Failure processing is correct.** No "what went wrong?" — asks "what did you learn?" Shows alternative futures with transferable skills.
- **Pivoting is supported.** Previous journeys are preserved, not deleted.
- **Reflections are private.** No public exposure.
- **Celebration exists.** BigWinCelebration modal with reflection (most_memorable_moment, who_helped, biggest_lesson, next_steps).
- **One active dream at a time.** Enforced by `getActiveJourney()` query with `where status = 'active'`.

### What Conflicts with Constitution

**Medium conflict — Circular progress indicator on Big Win.** Shows a percentage ring. This is a measurement/evaluation of progress. The Constitution says the app observes but does not evaluate. A percentage implies "X% done" vs "100% is the goal." The alternative futures section is more aligned with the Constitution (options, not percentage).

**Minor conflict — JourneyStory and JourneyTimeline show everything chronologically but lack review framing.** The raw data is there but the North Star promise (show 15-year-old self how far they came) is not fulfilled. No synthesis, no patterns, no questions — just a feed.

**No conflict — Streak is hardcoded to 0.** The flame icon on detail page shows `completed/total` for today but does not accumulate. This is vestigial UI. It should be removed, but it's not actively violating because no streak logic exists.

### What Should Be Removed

| Item | Reason |
|------|--------|
| Flame icon in "Hari Ini" tab | Gamification residue. Show dimension icons instead. |
| Circular progress indicator (% on header) | Observation Boundary violation. Show "X dari Y Big Win selesai" as text, not percentage. |

### What Should Be Merged

- **JourneyStory component should offer the foundation for the Review System.** The raw timeline exists. Add weekly/monthly/annual aggregation views in the same component structure.
- **Alternative Futures should be surfaced in the Pivot flow, not at the bottom of the main page.** Currently they're always visible, which creates anxiety ("I could fail"). They should appear only when the user fails a Big Win.

### What Should Be Redesigned

1. **Remove percentage from header.** Show text: "Big Win 3 dari 5 selesai."
2. **Add weekly review tab.** "This week: X activities completed, Y reflections written. Most-used word: [word]. How do you feel about this week?"
3. **Move Alternative Futures** into FailureModal only. Not always visible.

### Priority Score: **CRITICAL — BUT ONLY FOR REMOVAL OF REMAINING VIOLATIONS**

The core journey is the strongest part of the product. It needs minimal changes. The violations are surface-level (percentage ring, flame icon). Do not touch the architecture. Remove the gamification residue. Add the review layer.

---

## 4. STORY

### Current State

Story is not a standalone page. It is distributed across:

1. **JourneyStory component** in `/journey/[id]` (Cerita tab) — shows a narrative built from timeline events + today's reflection.
2. **JourneyTimeline component** in `/journey/[id]` (Riwayat tab) — chronological feed of all events.
3. **ReflectionModal** in `/journey/[id]` — daily reflection with 3 questions + mood.

No page at `/story` exists. No review cadence beyond daily.

### What Aligns with Constitution

- Timeline of completed actions, reflections, and wins exists
- Reflections are the emotional core (learned, grateful, improve)
- Reflections are private
- The raw material for a life narrative is being collected

### What Conflicts with Constitution

**CRITICAL — The Review Cadence is entirely missing.**

| Constitution requires | Live |
|----------------------|------|
| Daily reflection | ✅ Exists |
| Weekly review: "Your 3 most-written words this week. Your most-completed activity." | ❌ Missing |
| Monthly review: "X activities, Y reflections, progress on [Small Win]." | ❌ Missing |
| Annual review: "Dreams pursued, pivots made, skills built, most-used words, biggest changes." | ❌ Missing |
| Decadal review: "10 years. Here is the dream you chose at 15. Here is who you became." | ❌ Missing |

**This is the single biggest gap between Constitution and product.**

The North Star — "a 25-year-old opens Beautifio to see their 15-year-old self" — cannot be fulfilled. The app stores the raw entries but has no mechanism to synthesize, summarize, or present them meaningfully across time.

**The Story pillar is the second-class citizen of the 5 pillars.** Dream and Journey have dedicated pages. Safe Space has a dedicated modal. Familia has dedicated routes (even if wrong). Story has only a tab within Journey detail.

### What Should Be Removed

Nothing. The existing timeline components are the correct foundation.

### What Should Be Merged

- **Story should become a standalone pillar page**, not a tab within Journey. A tab implies it belongs to a specific journey. Story spans all journeys across the user's lifetime.
- **The daily reflection should feed Story, not just Journey.**

### What Should Be Redesigned

1. **Create `/story` page.** Shows the full life narrative across all journeys, dreams, pivots.
2. **Implement Weekly Review.** After 7 days of activity: "Here's your week." (words, activity counts, reflection highlights).
3. **Implement Monthly Review.** After ~30 days: counts, patterns, progress toward current Big Win.
4. **Implement Annual Review.** Full year summary: dreams, pivots, skills, reflections.
5. **Implement Decadal Review (foundation).** Store dream evolution data so that after 10 years, the user can see the full arc.

### Priority Score: **CRITICAL**

This is not optional. The North Star is the measure of the product's success. Without the Review Cadence, the North Star is a lie. Story is the least-developed pillar despite being referenced in the Constitution's opening promise.

---

## 5. SAFE SPACE

### Current State

Safe Space is fragmented across multiple surfaces:

1. **SafeSpaceModal** (`features/safe-space/`) — Modal component with emergency contacts (6 hotlines), resource center (10 articles), step-by-step guides (6 guides), community support links. Triggered from sensitive content detection in story detail pages.
2. **Inspirasi page** (`/inspirasi`) — Content feed with anonymous posts, stories, journal entries, mentor content, community content. Has like/save/share/report buttons. Connected to Profile as "Safe Space" destination.
3. **FailureModal** in Journey detail — Processes Big Win failure with "What did you learn?" and alternative futures.
4. **Profile "Dukungan Untukku"** card — Links to `/circle`, `/mentors`, `/inspirasi` as support resources.

### What Aligns with Constitution

- Emergency contacts are real, verified, useful (Kemenkes 119, LBH APIK, Yayasan Pulih, KPAI, SAPA 129, Into The Light)
- Resource center has meaningful categories (bullying, violence, harassment, family, career, financial)
- Failure processing in Journey ("what did you learn?") is correct
- Alternative futures on failure is correct

### What Conflicts with Constitution

**CRITICAL — Inspirasi has likes, saves, shares, and reports.** This is a social network mechanic on what the Profile labels as "Safe Space." The Constitution says Never a Social Network. The user who opens Inspirasi for emotional support is greeted with engagement metrics.

**CRITICAL — Safe Space does not have a dedicated page.** It is a modal and a mislabeled content feed. The Constitution says Safe Space is a pillar, not a feature. A modal is not a pillar.

**CRITICAL — Safe Space is conflated with Inspirasi.** The Profile page says "Safe Space" → navigates to `/inspirasi`. But Inspirasi is a general content feed with social features. The user seeking help lands on a feed of other people's content with like buttons. This is dangerous.

**HIGH — All Inspirasi data is mock.** No real anonymous posts. No real community. The "Safe Space" the app claims to offer does not exist.

**MEDIUM — No spiritual crisis support.** The Spiritual dimension handles daily practice. Safe Space handles crisis. But spiritual crisis (loss of faith, doubt, leaving religion) is not addressed in SafeSpaceModal or any other surface.

### What Should Be Removed

| Item | Reason |
|------|--------|
| Like/save/share/report from Inspirasi | Never a Social Network violation |
| Like/save/comment counts from Inspirasi cards | Same violation |
| Inspirasi page as general content feed | It should be Safe Space, not a content platform |
| Mock data for all Inspirasi content | Fake community is worse than no community |

### What Should Be Merged

- **Merge Inspirasi's anonymous posting feature into Safe Space.** The "curhat anonim" mechanic is valid Safe Space behavior — but without likes, shares, or public feeds.
- **Merge SafeSpaceModal content into the new dedicated Safe Space page.** Emergency contacts, resources, guides, crisis support.
- **Merge FailureModal + Alternative Futures into Safe Space** as part of the setback processing flow.

### What Should Be Redesigned

1. **Create dedicated `/safe-space` page.** Emergency contacts, resource center, crisis processing, spiritual crisis support, anonymous writing (no likes, no feed).
2. **Remove social mechanics from all content.** If a user needs support, they should not see engagement metrics.
3. **Replace `/inspirasi`** with the Safe Space page. Rename, re-theme, re-purpose.

### Priority Score: **CRITICAL**

This is a user safety issue. A user seeking emotional support lands on a page with like buttons, share buttons, and mock data. That is not just a Constitution violation — it is potentially harmful.

---

## 6. FAMILIA

### Current State

Routes: `/familia`, `/familia/vouchers`, `/familia/deals`, `/familia/rewards`
Data: All static — `FAMILIA_MERCHANTS`, `FAMILIA_AFFILIATE_DEALS`, `FAMILIA_ACHIEVEMENT_REWARDS`, `FAMILIA_EVENT_BENEFITS`. No API calls.

User sees:
- Gradient header with "Beautifio Familia" title
- 3 stat buttons: Voucher (X Merchant), Deals (X Penawaran), Rewards (X Pencapaian)
- **Featured Benefits** section — top merchants with gift icons
- **Affiliate Deals** — external partner links (Tokopedia, Shopee, TikTok Shop) with `partner_url`, `is_featured` flag
- **Event Benefits** — promo codes, discounts
- **Achievement Rewards** — vouchers awarded for achievements
- **VoucherClaimModal** — multi-step claim flow with 60s timer, activation, redeem code

### What Aligns with Constitution

Nothing. Zero alignment.

### What Conflicts with Constitution

**CRITICAL — Affiliate deals.** `FAMILIA_AFFILIATE_DEALS` with `partner_url` to external commerce platforms (Tokopedia, Shopee, TikTok Shop). This is direct affiliate commerce. Constitution: "No affiliate fees, no commissions, no promoted content."

**CRITICAL — Merchant vouchers.** 13 merchants (Soto Pak Slamet, Kopi Nusantara, Bakso Boedjangan, etc.) with voucher codes, daily PINs, monthly quotas. This is a voucher marketplace. Constitution: "Familia is not a marketplace."

**CRITICAL — Achievement rewards.** Vouchers tied to user achievements. This is commerce rewarding engagement. Constitution: "No gamification" + "No marketplace."

**CRITICAL — Featured benefits.** `is_featured` flag with visual prominence. Constitution: "No resource is marked as 'recommended' or 'featured' over others."

**CRITICAL — Event benefits with discount codes.** Paid programs with promo codes. Constitution: Commerce Boundary allows paid programs "if independently vetted and tagged with cost." But these are not vetted — they are arbitrarily placed.

**MEDIUM — No real resources.** Constitution says Familia should contain scholarships, internships, mentorship programs, workshops, mental health support. Current Familia contains zero of these.

**MEDIUM — VoucherClaimModal has gamification elements.** 60-second timer, activation countdown, "claim success" animation. These are engagement mechanics.

### What Should Be Removed

| Item | Reason |
|------|--------|
| `FAMILIA_MERCHANTS` data | Commerce violation — all merchant vouchers |
| `FAMILIA_AFFILIATE_DEALS` data | Commerce violation — affiliate links |
| `FAMILIA_ACHIEVEMENT_REWARDS` data | Commerce + gamification violation |
| `FAMILIA_EVENT_BENEFITS` data | Commerce violation — discount codes |
| `FAMILIA_CATEGORIES` (commerce-oriented) | No longer relevant |
| `VoucherClaimModal` | Gamified commerce mechanic |
| All Familia routes: `/familia`, `/familia/vouchers`, `/familia/deals`, `/familia/rewards` | Built on wrong premise. Delete all. |
| `admin/familia` route | Infrastructure for deleted feature |

### What Should Be Merged

Nothing. The current Familia is built on a fundamentally wrong premise. It cannot be salvaged. Delete and rebuild.

### What Should Be Redesigned

Complete rebuild from zero:
1. Replace with curated directory of real resources: scholarships, free workshops, open-source tools, nonprofit programs, government services, vetted mentorship programs.
2. Every resource tagged by dream type, with cost indicator ("Free" / "Paid — $X" / "Scholarships available").
3. No featured items. No affiliate relationships. No vouchers. No discount codes.
4. Free or lower-cost resources listed first.

### Priority Score: **CRITICAL**

This is the clearest violation in the product. The entire Familia feature must be deleted. No incremental fix can save it — the data model, the UI, the mechanics, and the premise are all wrong.

---

## 7. PROFILE

### Current State

Route: `/profil`
Data: Active journey from Supabase, journey progress, timeline (3 entries), user identity from auth hook.

User sees:
- Avatar + display name
- Journey info card (emoji, title, Big Win)
- "Perjalanan Hidup Saya" (journey summary with flame icon, activity count, progress bar, activity list)
- "Refleksi Terbaru" (today's reflection)
- "Dukungan Untukku" (links to Circle, Mentor, Safe Space/Inspirasi)
- "Pengaturan" (edit profile, privacy policy, sign out)

### What Aligns with Constitution

- Mostly utility page, which is fine
- No scores, levels, gamification
- No commerce
- No social mechanics
- Journey references are correct

### What Conflicts with Constitution

**Minor conflict — Flame icon next to activity count.** Same issue as Home. Gamification residue.

**Minor conflict — "Streak" concept implied.** The flame icon + activity count invokes streak thinking even though the value doesn't accumulate.

**Minor conflict — "Dukungan Untukku" links to `/inspirasi` as "Safe Space."** Inspirasi is a social content feed, not a safe space. The label on Profile is actively misleading.

**No conflict — Hardcoded privacy policy.** Fine for now but should be a real document.

### What Should Be Removed

| Item | Reason |
|------|--------|
| Flame icon | Gamification residue |
| Activity progress bar on journey summary | Belongs on Journey detail |

### What Should Be Merged

- **"Dukungan Untukku" links should point to the new Safe Space page** once rebuilt, not to Inspirasi.

### What Should Be Redesign

- Minimal. Profile is closest to correct of all pages.
- Add: lifetime summary (total activities completed, total reflections written, total dreams pursued) — presented as facts, not scores.

### Priority Score: **LOW**

Profile is basically fine. Remove the flame icon and fix the Safe Space link. That's it.

---

## CROSS-CUTTING VIOLATIONS

### Streak / Flame Everywhere

The flame icon appears on Home, Journey detail, and Profile. In all cases the streak value is 0 (hardcoded). The icon is a visual vestige that communicates "we track streaks" even though no streak logic exists. Remove all instances.

### Gamification Types Exist But Are Unused

The following types are defined in `packages/types/src/life-engine.ts` but have zero frontend implementation:
- `LifeLevel` enum (7 levels: seed → legacy)
- `LifeCapital` (6 numeric capital scores)
- `CapitalSource` with `points` field
- `UnlockableFeature` (discounts, scholarships)
- `UserLifeProfile.resilienceScore`
- `GrowthWin`, `FailureReflection`

These types are a time bomb. Someone could build UI for them tomorrow. Delete the types.

### All Non-Journey Data Is Mock

| Feature | Data Source | Real? |
|---------|-------------|-------|
| Familia | `FAMILIA_MERCHANTS`, `FAMILIA_AFFILIATE_DEALS`, etc. | Static mock |
| Inspirasi | `CONTENT_TABS`, `ANON_CATEGORIES`, `getAllItems()` | Static mock |
| Cerita | `MOCK_STORIES` | Static mock |
| Circle | `myCircles`, `exploreCircles` | Static mock |
| Mentors | `MOCK_MENTORS` | Static mock |

The app only has one real feature: Dream Journey. Everything else is a facade.

---

## PRIORITY ACTION LIST

| # | Action | Area | Priority | Estimated Effort |
|---|--------|------|----------|-----------------|
| 1 | **Delete Familia completely** — all routes, tables, data, components | Familia | CRITICAL | 1 day |
| 2 | **Delete social mechanics from Inspirasi** — likes, saves, shares, counts | Safe Space | CRITICAL | 0.5 day |
| 3 | **Create dedicated Safe Space page** — replace `/inspirasi` | Safe Space | CRITICAL | 3 days |
| 4 | **Implement Weekly Review** | Story | CRITICAL | 2 days |
| 5 | **Implement Monthly Review** | Story | CRITICAL | 2 days |
| 6 | **Delete gamification types** — `life-engine.ts` types, `streak` field | Codebase | HIGH | 0.5 day |
| 7 | **Remove flame icons** from Home, Journey, Profile | All | HIGH | 0.5 day |
| 8 | **Implement Annual Review (foundation)** | Story | HIGH | 3 days |
| 9 | **Redesign Home greeting** — user-type awareness, no counters | Home | IMPORTANT | 1 day |
| 10 | **Delete Circle, Mentors pages** — mock data, no real users | Codebase | IMPORTANT | 0.5 day |
| 11 | **Move Alternative Futures into FailureModal only** | Journey | IMPORTANT | 0.5 day |
| 12 | **Move progress percentage to text only** | Journey | IMPORTANT | 0.5 day |
| 13 | **Connect Discover to Supabase** — replace localStorage | Dream | IMPORTANT | 1 day |
| 14 | **Implement Decadal Review foundation** | Story | LATER | 2 days |
| 15 | **Rebuild Familia as curated directory** | Familia | LATER | 5 days |

---

## VERDICT

The product has one real feature (Dream Journey) that mostly aligns with the Constitution, and five fake features (Familia, Inspirasi, Cerita, Circle, Mentors) built on mock data that mostly violate the Constitution.

**What works:**
- Journey core (Dream → Big Win → Small Win → Daily Activity → Reflection)
- Spiritual dimension with faith-awareness
- Failure processing
- Pivot preservation
- No real streaks/gamification in UI (despite icon residue)

**What is broken:**
- Familia is a marketplace (delete)
- Safe Space does not exist as a page (build)
- Review Cadence is entirely absent (build)
- Story is a tab, not a pillar (elevate)
- Social mechanics in Inspirasi (remove)
- Mock data for non-journey features (delete or build real)
- Gamification types still in codebase (delete)

**Shortest path to Constitution V2:**

1. Delete Familia, Circle, Mentors pages (mock data, wrong premise)
2. Strip social mechanics from Inspirasi, rename to Safe Space, build real page
3. Add Weekly + Monthly review to Story (Annual + Decadal can follow)
4. Remove flame icons, progress percentages, gamification residue
5. Done. Everything else is already close enough.

**Total work: ~10 days to reach 7/10 alignment. ~20 days to reach 9/10.**

The Journey is already right. The rest just needs to stop being wrong.
