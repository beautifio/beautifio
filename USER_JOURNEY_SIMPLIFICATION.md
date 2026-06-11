# USER JOURNEY SIMPLIFICATION — Beautifio

> **Persona:** Adi, 15 years old, Indonesian  
> **Goal:** "I want a better future but I don't know where to start."  
> **Technical level:** Average teenager with a smartphone  
> **Frustration threshold:** Low — will abandon if it feels like homework  
> **Source:** `PRODUCT_INVENTORY.md`  
> **Date:** June 2026

---

## Journey Map

```
Splash → Welcome → Register → Onboarding → Discovery → Roadmap → Life → Journal → Inspirasi → Circle → Profile
  1         2                                         3          4       5       6          7         8       9
```

**Problem:** 11 screens before the user reaches their first "aha" moment. A 15-year-old with zero direction will abandon by step 3.

---

## Step 1 — Splash (`/`)

### What Adi sees
A branded landing page with "Masa Depan Dimulai Hari Ini" (The Future Starts Today), likely with a CTA to login/register or explore.

### What Adi thinks
> "OK, looks nice. What is this? Let me see what's inside."

### What is confusing
- Splash provides no concrete information about what the app actually does.
- "Masa Depan Dimulai Hari Ini" is aspirational but abstract. A 15-year-old thinks: *"Future how? Getting a job? School? Gaming?"*
- No preview of features. No social proof. No "what's inside" peek.

### What feels duplicated
- This is the **first of two introductory pages** (Splash → Welcome). The user must sit through two branding screens before anything happens.

### What is unnecessary
- The entire page. For a user who already wants "a better future," this is a gate, not a gateway. The emotional tone-setting is valuable for cold traffic, but for someone who already downloaded the app, it's friction.

### What should be simplified
- **Cut Splash** or merge it into Welcome. Show a 3-second animated brand logo, then auto-transition to Welcome.
- Or skip it entirely: launch directly into Welcome with the tagline as a header.

---

## Step 2 — Welcome (`/welcome`)

### What Adi sees
A pre-auth onboarding page explaining what Beautifio is, with likely a carousel or info cards.

### What Adi thinks
> "Yeah yeah, just tell me what to do already."

### What is confusing
- Welcome explains "what Beautifio is" — but a 15-year-old doesn't care about the product concept. They care about *"what can I DO here?"*
- Abstract value props ("growth," "future," "discover yourself") are lost on a teenager. They need concrete: *"You can learn to be a programmer. You can find scholarships. You can talk to people like you."*

### What feels duplicated
- Splash was emotional branding. Welcome is explanatory branding. Combined, they say the same thing twice: *"This app is good for you."*

### What is unnecessary
- Any slide that doesn't answer: **"What can I become?"** — the user's explicit question.

### What should be simplified
- Replace Welcome with a **1-screen value hit**:  
  *"Choose a dream. Build habits. Grow your future. Connect with people who get it."* — with specific, relatable examples (programmer, athlete, musician).
- Single CTA: **"Mulai" (Start)** → directly to Discovery or light Registration.

---

## Step 3 — Registration + Onboarding

### What Adi sees
Email/password form, possibly social login, followed by an onboarding flow.

### What Adi thinks
> "Ugh, I have to make an account before I even know if this is useful?"

### What is confusing
- Why does a 15-year-old need to register to **explore** what dreams are available? They can't evaluate the app's value until they see the roadmaps.
- Onboarding before Discovery means the app asks for personal info before delivering any value.

### What feels duplicated
- The app asks for goals/interests in **Onboarding**, then again in **Discovery** (4-step questionnaire). Adi answers the same questions twice.

### What is unnecessary
- Mandatory registration before browsing `/roadmap`. The roadmap page is listed as "Auth Required: No" — let users browse dreams first.

### What should be simplified
- **Zero-registration browsing first.** Let Adi explore `/roadmap` and see 2-3 example roadmaps before asking for sign-up.
- Registration should be 1 field (email) + 1 field (password). No onboarding questions on first pass.
- Defer the `users` table population and profile setup until after Discovery.

---

## Step 4 — Discovery (`/discover`)

### What Adi sees
A 4-step questionnaire: inspiration, aspiration, interests, goals. With dropdowns/cards.

### What Adi thinks
> "I literally said I don't know where to start. How am I supposed to answer these?"

### What is confusing

| Step | Question | Options | Adi's confusion |
|------|----------|---------|-----------------|
| 1 | "Apa yang menginspirasimu?" | tech, creative, sports, business, education, entertainment | "I like games and YouTube. Is that entertainment? Creative? Tech?" |
| 2 | "Apa yang ingin kamu capai?" | expert, entrepreneur, professional, creator, athlete | "I'm 15, I have no idea what I want to 'achieve' as a category." |
| 3 | "Apa yang paling kamu minati?" (max 2) | programming, design, writing, marketing, fitness, music, gaming, beauty | "I can pick gaming and music, but what does that mean for my future?" |
| 4 | "Apa tujuan terbesarmu?" | dreamCareer, socialImpact, financialFreedom, skillMastery, bestSelf | "These are adult concepts. I want to 'be happy' or 'be famous'." |

### What feels duplicated
- Onboarding already asked some of these questions. Adi is repeating themselves.
- The Discovery Result page basically says "here are some roadmaps" — but `/roadmap` also shows roadmaps. Two screens, same output.

### What is unnecessary
- 4 steps is too long for a 15-year-old with decision paralysis. Each step forces self-reflection that the user explicitly said they *can't do yet*.

### What should be simplified
- **Replace 4-step questionnaire with 1 question:** *"Apa yang keren menurutmu?" (What do you think is cool?)* — with big visual cards (gaming, sports, music, tech, business, art). No "max 2" restriction.
- Or skip Discovery entirely for these users and show them the full roadmap gallery with a **"Pilih aja yang kelihatan seru"** (Just pick whatever looks fun) prompt.
- Move heavy self-reflection to later, after the user has invested time in the app.

---

## Step 5 — Roadmap (`/roadmap` + `/roadmap/[slug]`)

### What Adi sees
A marketplace of 11 dream roadmaps with cards, search, categories, trending, personalized recs, and "I Don't Know Yet" button.

### What Adi thinks
> "Whoa, that's a lot. But... I could be a programmer? Or a musician? Let me click."

### What is confusing
- **11 roadmaps + 11 tabs each = overwhelming.** Each roadmap has 11 tabs (Dream, Daily, Skills, Milestones, Blueprint, Masterclass, Life Pillars, Alt Futures, Vault, Reflections, Related). That's 121 screens to explore.
- "Trending Dreams" and "Personalized Recommendations" compete for attention.
- The "I Don't Know Yet" button just sends Adi back to Discovery (the same place they got stuck before).
- Search assumes Adi knows what they're looking for — they don't.

### What feels duplicated
- Roadmap detail tabs: **Blueprint vs Masterclass** (both cover skills, mindset, timeline) and **Life Pillars** (duplicates Life Engine).
- The roadmap detail is a mini-app inside the app. Adi will get lost in the tabs.

### What is unnecessary
- 11 tabs per roadmap is excessive. A 15-year-old will click one or two tabs at most.
- "Alt Futures" — asking a beginner to think about backup careers before they've even started is demotivating.
- "Vault" — saving resources before building any habits is premature.

### What should be simplified
- **Show only 3 core tabs by default:**
  1. **Dream** (vision, why it matters, what you'll learn)
  2. **Daily** (habits — the only actionable thing)
  3. **Skills** (what you'll be able to do)
- Move Blueprint → merge into Dream. Move Masterclass → merge into Skills.
- Hide Life Pillars, Alt Futures, Vault, Reflections, Related behind a "more" menu for later exploration.
- Replace "I Don't Know Yet" with a **visual quiz** (not text questionnaire): show 6 emoji/cards and say "tap what looks fun."

---

## Step 6 — Life (`/life`)

### What Adi sees
Gamified personal growth dashboard: 6 capital bars, growth zone, life stage, level, capital sources, unlocks.

### What Adi thinks
> "Wait, what? I just picked a dream and now I'm tracking... life points? Is this a game?"

### What is confusing
- **6 capital dimensions** (Knowledge, Skill, Health, Relationship, Character, Spiritual) with **25 capital sources** — this is a complex RPG system dropped on a beginner.
- "Growth Zones" (Comfort, Fear, Learning, Growth) require self-assessment that a 15-year-old lacks the maturity to make.
- "Life Stages" with age ranges (SD/SMP/SMA/etc.) — Adi is 15, in SMP/SMA, but the app asks them to self-identify.
- The **Unlock System** (10 features with capital requirements) feels like a paywall even though it's free — "you're not advanced enough for this yet."

### What feels duplicated
- **Life Pillars tab on Roadmap** is the same concept (6 dimensions of holistic growth). Adi will wonder: *"Am I doing Life Engine or Life Pillars? Are these the same thing?"*
- Life Engine capital overlaps with **Growth Tracker** (streaks, reflections, depth score) — two ways to measure growth.

### What is unnecessary
- The Unlock System for 10 features — this penalizes new users who already feel lost.
- "Apply Capital Decay" — punishing a 15-year-old for not logging in daily creates anxiety, not motivation.
- "Execute Pivot" — the user hasn't even started, they don't need a pivot modal yet.

### What should be simplified
- **Hide Life Engine from new users** for the first 3-7 days. Let them build habits first.
- When revealed, show only **1 dimension** (not 6) based on their chosen roadmap (e.g., programmer → Skill).
- Remove the Unlock System entirely, or defer it until the user has been active for 30+ days.
- Remove Capital Decay — positive reinforcement only.
- Merge Life Pillars tab into Life Engine as a single unified model.

---

## Step 7 — Journal (`/jurnal`)

### What Adi sees
Journal list page to browse personal and public journals, create new journals, write entries.

### What Adi thinks
> "I'm supposed to... write about my feelings? In a journal? For other people to see?"

### What is confusing
- Journals are **goal-oriented** ("track goal journeys with daily entries"), but Adi's goal is "I don't know my goal."
- The social aspect (followers, reactions) adds pressure to perform for an audience.
- The empty `/jurnal/[slug]/tulis` route (not implemented) means Adi can create a journal but can't write in it — dead end.

### What feels duplicated
- **Roadmap Reflections tab** is also a daily journal tied to a specific dream. Adi has two journaling systems: one in Journeys, one in Roadmaps.
- **Anonymous Safe Space posts** are a third "writing" feature. Adi has three ways to write things down.

### What is unnecessary
- Public journals with followers for a beginner. The social layer adds complexity and anxiety.
- Journal categories, milestones, reactions — all overwhelm for a first-time user.

### What should be simplified
- **Defer the Journals feature** completely for new users. It's a power-user feature.
- Instead, surface the **Roadmap Reflections** tab as a simple habit: "Write one sentence about your practice today."
- Only unlock the full Journals feature after the user has completed 7+ daily wins on a roadmap.

---

## Step 8 — Inspirasi (`/inspirasi`)

### What Adi sees
Story list with 9 categories (Education, Career, Business, Sports, Music, Gaming, Creator, Beauty, Technology), search/filter.

### What Adi thinks
> "OK, stories. Like articles. Maybe I'll find something cool."

### What is confusing
- 9 categories is a lot. Adi has to decide their interest before finding content — but they don't know their interest yet.
- The **Write Anon Story** (`/inspirasi/post`) is positioned next to reading stories, but it's actually a Safe Space feature. Adi clicks "post" thinking they'll write an inspirational story, but it goes to an anonymous emotional support system.

### What feels duplicated
- **Featured Stories on Home** (4.4) already shows curated stories. The Inspirasi page is a more detailed version of the same thing — same data, different layout.
- **Safe Space anon posts** vs Inspirasi posts — two ways to post content, confusingly cross-wired.

### What is unnecessary
- The Write Anon Story route under Inspirasi. Anon stories belong in Safe Space.
- 9 categories with sub-navigation. For a beginner, "Most Popular" + "Recommended for Your Dream" is enough.

### What should be simplified
- **Replace 9 categories with 3 buckets:** *"For Your Dream"* (personalized), *"Popular"*, *"New"*.
- Move anon story posting to Safe Space only. Inspirasi should be read-only for new users.
- Connect stories to the user's chosen roadmap: if Adi picked "programmer," show tech stories by default.

---

## Step 9 — Circle (`/circle`)

### What Adi sees
Community group list by category, with detail pages showing chat, members, mentors.

### What Adi thinks
> "People like me? OK, that's interesting. But do I have to talk?"

### What is confusing
- Circle categories map to interests, but Adi may not know what category they fit in.
- The chat is real-time — a 15-year-old may be anxious about jumping into a live conversation with strangers.
- It's unclear whether circles are for asking questions, sharing progress, or just lurking.

### What feels duplicated
- **Mentors** are listed in Circle pages and also have their own feature (`/mentors`). Two places to find help.
- **Safe Space circles** duplicates the regular circle feature — a subset of circles is labeled as "safe."

### What is unnecessary
- Exposing all circles to a brand new user. Adi needs orientation first.
- Mentor integration in Circle detail — this is a premium feature that should be introduced later.

### What should be simplified
- **Show only 1-3 "recommended for your dream" circles** on the Home page. Don't send Adi to `/circle` until they've engaged with the app for a few days.
- Auto-join Adi to a "New Members" or "Getting Started" circle with a mentor who welcomes them.
- Default circle role = "lurker" (read-only) until the user explicitly chooses to post.

---

## Step 10 — Profile (`/profil`)

### What Adi sees
8-section dashboard: Hero, Emotional Summary, Life Journey, Current Focus, My Growth, My Journals/Stories, Support System, Opportunities/Rewards.

### What Adi thinks
> "That's... everything. All in one place. I don't know where to look."

### What is confusing
- **8 sections** on a single page is information overload. Adi has used the app for maybe 20 minutes; they have no "life journey," no "growth," no "journals/stories," no "opportunities." Almost every section is empty or default.
- "Emotional Summary" with AI-generated supportive message — Adi hasn't done anything yet, so the message will be generic and feel fake.
- "My Growth" shows Life Engine data that Adi hasn't set up yet.
- "Support System" shows Safe Space, Circles, Mentors — features Adi may not have touched.

### What feels duplicated
- **My Growth** = Life Engine summary (duplicate of `/life`).
- **My Journals & Stories** = Journals + Inspirasi (duplicate of both features).
- **Current Focus** = active dream/roadmap (already visible on Home).
- **Support System** = Circle + Mentors + Safe Space (three features, one section).

### What is unnecessary
- The Profile page should not be a "dump everything here" page. For a 15-year-old, profile is for **identity**, not analytics.
- Emotional Summary is premature and potentially off-putting (an AI telling you "you're doing great" when you just started feels manipulative).

### What should be simplified
- **Reduce Profile to 3 sections for new users:**
  1. **Who I Am** (avatar, name, dream, level)
  2. **My Streak** (daily wins count — the only metric that matters to a beginner)
  3. **What I Can Do Next** (1-3 suggested next actions based on state)
- Hide Life Journey, My Growth, Support System, and Opportunities until the user has accumulated actual data.
- Move detailed analytics to `/life` (where they belong).

---

## The Full Problem — Visualized

```
CURRENT JOURNEY (11+ steps before value):

  Splash → Welcome → Register → Onboarding → Discovery → Roadmap
    1         2          3           4            5           6
                                                           (11 tabs! 121 screens!)
                                                              ↓
  Profile ← Circle ← Inspirasi ← Journal ← Life
    9         8         7          6         5
  (8 sections,                             (complex RPG system,
   mostly empty)                            hidden from new user)
```

**Before Adi experiences a single moment of value, they must:**
- View 2 branding pages
- Create an account
- Answer 4+ onboarding questions
- Complete a 4-step self-discovery questionnaire
- Browse 11 roadmaps across 121 potential screens
- Learn a 6-dimension RPG growth system
- Figure out which of 3 writing tools to use
- Navigate 9 story categories
- Find their way through 8 empty profile sections

**Estimated screens touched before first "aha": 20-30**

---

## Proposed Simplified Journey

```
SIMPLIFIED JOURNEY (4 steps to value):

  Welcome (1 screen) → Browse Dreams (gallery) → Pick One → Do Today's Habit
        1                    2                     3              4
     (value prop +       (big visual cards,      (3 tabs max:    (check off 1-2
      "Mulai" CTA)        try before sign-up)     Dream, Daily,    habits = WIN)
                                                   Skills)
                                                      ↓
                                          (Later: Life Engine unlocks)
                                          (Later: Journals unlock)
                                          (Later: Circles join)
                                          (Later: Full Profile)
```

**Adi experiences their first win in under 2 minutes:** tap a dream, see a habit, check it off.

---

## Summary of Recommendations

| Step | Problem | Fix |
|------|---------|-----|
| Splash | Friction gate before any value | Cut or merge into Welcome |
| Welcome | Abstract value props, no concrete examples | 1-screen concrete value + "Mulai" |
| Registration | Required before value evaluation | Allow browsing roadmaps without account |
| Discovery | 4-step self-reflection for user who *can't* self-reflect | 1 visual "what looks cool" question |
| Roadmap | 11 tabs per roadmap = 121 screens of overwhelm | 3 core tabs, rest hidden |
| Life | Complex RPG system with punishments (decay) + paywall (unlocks) | Hide for first week; remove decay |
| Journal | Three competing writing features; social pressure | Defer entirely; use Reflections as gateway |
| Inspirasi | 9 categories; confusing anon post route | 3 buckets; move anon posting to Safe Space |
| Circle | Exposure before orientation; real-time chat anxiety | Auto-join intro circle; default lurker role |
| Profile | 8 empty sections of analytics a 15-year-old doesn't need | 3 sections: identity, streak, next action |

---

## Guiding Principle

> **Every screen a 15-year-old sees before their first "I did it" moment is a risk of abandonment.**

The app has sophisticated gamification, AI coaching, social features, and content systems — but they are all gated behind a multi-stage funnel that requires self-knowledge the user explicitly says they lack. The shortest path to value (pick a dream, do a habit) should be the *default* path, with all complexity progressively disclosed.

---

*End of User Journey Simplification Report*
