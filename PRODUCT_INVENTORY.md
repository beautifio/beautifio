# PRODUCT INVENTORY — Beautifio

> Generated: June 2026
> Framework: Next.js 15 (App Router) + React 19 + TypeScript
> Database: Supabase (PostgreSQL) + localStorage
> Auth: Supabase Auth
> Styling: Tailwind CSS v4
> Package Manager: Turborepo (apps/web, packages/ui, packages/utils, packages/types)

---

## 1. SPLASH / LANDING

### 1.1 Splash Screen (`/`)

| Field | Value |
|-------|-------|
| **Purpose** | First impression, brand introduction, gate to auth or discovery |
| **User Value** | Sets emotional tone — "Masa Depan Dimulai Hari Ini" |
| **Main Problem Solved** | Orients new users before auth |
| **Related Pages** | `/welcome`, `/login`, `/home` |
| **DB Tables** | None (static) |

### 1.2 Welcome (`/welcome`)

| Field | Value |
|-------|-------|
| **Purpose** | Pre-auth onboarding, explain what Beautifio is |
| **User Value** | Understands product value before committing |
| **Main Problem Solved** | Reduces drop-off by explaining benefits early |
| **Related Pages** | `/discover`, `/login`, `/register` |
| **DB Tables** | None (static) |

### 1.3 Login (`/login`)

| Field | Value |
|-------|-------|
| **Purpose** | Email/password authentication via Supabase |
| **User Value** | Access to personal data across sessions |
| **Main Problem Solved** | Identity and session management |
| **Related Pages** | `/register`, `/forgot-password` |
| **DB Tables** | `auth.users` (Supabase managed) |

### 1.4 Register (`/register`)

| Field | Value |
|-------|-------|
| **Purpose** | New user account creation |
| **User Value** | Creates persistent profile |
| **Main Problem Solved** | Onboarding funnel entry point |
| **Related Pages** | `/login`, `/welcome`, `/onboarding` |
| **DB Tables** | `auth.users`, `users` (trigger-created) |

### 1.5 Forgot Password (`/forgot-password`)

| Field | Value |
|-------|-------|
| **Purpose** | Password reset flow |
| **User Value** | Account recovery |
| **Main Problem Solved** | Authentication recovery |
| **Related Pages** | `/login` |
| **DB Tables** | `auth.users` (Supabase managed) |

---

## 2. AUTHENTICATION & USER INFRASTRUCTURE

### 2.1 Auth Store (Zustand)

| Field | Value |
|-------|-------|
| **Purpose** | Client-side auth state (user, session) |
| **User Value** | Seamless auth state across pages |
| **Main Problem Solved** | Avoids prop-drilling auth data |
| **Related Pages** | All protected pages |
| **DB Tables** | None (Zustand in-memory) |

### 2.2 App Store (Zustand)

| Field | Value |
|-------|-------|
| **Purpose** | Active tab tracking, onboarding state, selected goal |
| **User Value** | UI state persistence in session |
| **Main Problem Solved** | Bottom nav tab sync |
| **Related Pages** | All pages with bottom nav |
| **DB Tables** | None (Zustand in-memory) |

### 2.3 Middleware (Route Protection)

| Field | Value |
|-------|-------|
| **Purpose** | Protect `/profil`, `/life`, `/familia`, `/jurnal/buat`, `/inspirasi/post` |
| **User Value** | Prevents unauthenticated access to personal features |
| **Main Problem Solved** | Auth gating |
| **Related Pages** | All protected pages |
| **DB Tables** | `auth.users` (Supabase) |

### 2.4 Users Table

**DB Table:** `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | References `auth.users` |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `avatar_url` | TEXT? | Profile picture |
| `bio` | TEXT | Short bio |
| `city` | TEXT | Location |
| `interests` | TEXT[] | Interest tags |
| `goals` | TEXT[] | Goal categories |
| `role` | ENUM | `user`, `mentor`, `admin` |
| `status` | ENUM | `active`, `suspended`, `banned` |
| `is_verified` | BOOLEAN | Email verified |
| `onboarding_completed` | BOOLEAN | Discovery done |

**Related Pages:** All pages with user data
**Trigger:** `handle_new_user()` creates row on `auth.users` insert

---

## 3. NAVIGATION

### 3.1 Bottom Navigation (6 tabs)

| Tab | Route | Icon | Purpose |
|-----|-------|------|---------|
| Beranda | `/home` | Home | Daily feed, quick actions, ecosystem |
| Inspirasi | `/inspirasi` | BookHeart | Story browsing & reading |
| Roadmap | `/roadmap` | MapPin | Dream discovery & career roadmaps |
| Jurnal | `/jurnal` | BookOpen | Journal management |
| Circle | `/circle` | Users | Community groups |
| Profil | `/profil` | User | Life journey dashboard |

---

## 4. HOME / BERANDA (`/home`)

### 4.1 Daily Win Section

| Field | Value |
|-------|-------|
| **Purpose** | Track daily habits aligned to growth zone |
| **User Value** | Micro-actions that build momentum |
| **Main Problem Solved** | "What should I do today?" — personalized by zone |
| **Related Pages** | `/roadmap/[slug]`, `/life` |
| **DB Tables** | localStorage: `beautifio_roadmap_dailywins*` |

### 4.2 Active Goals

| Field | Value |
|-------|-------|
| **Purpose** | Show current goals with progress |
| **User Value** | Quick status of what's being pursued |
| **Main Problem Solved** | Goal visibility and progress tracking |
| **Related Pages** | `/roadmap/[slug]` |
| **DB Tables** | `user_goals` |

### 4.3 Recent Activity Feed

| Field | Value |
|-------|-------|
| **Purpose** | Social feed of circle messages, mentor replies |
| **User Value** | Stay connected with community |
| **Main Problem Solved** | Community engagement and awareness |
| **Related Pages** | `/circle/[id]`, `/mentors` |
| **DB Tables** | `messages` |

### 4.4 Featured Stories

| Field | Value |
|-------|-------|
| **Purpose** | Curated story recommendations |
| **User Value** | Discover inspiring content |
| **Main Problem Solved** | Content discovery |
| **Related Pages** | `/inspirasi`, `/inspirasi/[slug]` |
| **DB Tables** | `stories` |

### 4.5 Mentor Insights

| Field | Value |
|-------|-------|
| **Purpose** | Quick tips from available mentors |
| **User Value** | Micro-mentoring without full sessions |
| **Main Problem Solved** | Low-friction access to wisdom |
| **Related Pages** | `/mentors`, `/mentors/[slug]` |
| **DB Tables** | N/A (static seed data) |

### 4.6 Quick Actions

| Field | Value |
|-------|-------|
| **Purpose** | Shortcuts to main features |
| **User Value** | Efficient navigation |
| **Main Problem Solved** | Reduces taps to reach core features |
| **Related Pages** | All main pages |
| **DB Tables** | None |

### 4.7 Ecosystem Links

| Field | Value |
|-------|-------|
| **Purpose** | Curated external resources per life stage |
| **User Value** | Context-relevant opportunities |
| **Main Problem Solved** | Connecting users to real-world resources |
| **Related Pages** | `/opportunity` |
| **DB Tables** | N/A (static) |

---

## 5. DISCOVERY (`/discover`, `/discover/result`)

### 5.1 Discovery Questionnaire (4 steps)

| Field | Value |
|-------|-------|
| **Purpose** | Understand user's inspiration, aspiration, interests, goals |
| **User Value** | Personalized roadmap recommendations |
| **Main Problem Solved** | "I don't know what I want" — guides self-reflection |
| **Related Pages** | `/roadmap`, `/profil` |
| **DB Tables** | localStorage: `beautifio_discovery_answers` |

#### Steps

| Step | ID | Question | Options |
|------|----|----------|---------|
| 1 | `inspiration` | Apa yang menginspirasimu? | tech, creative, sports, business, education, entertainment |
| 2 | `aspiration` | Apa yang ingin kamu capai? | expert, entrepreneur, professional, creator, athlete |
| 3 | `interests` | Apa yang paling kamu minati? (max 2) | programming, design, writing, marketing, fitness, music, gaming, beauty |
| 4 | `goals` | Apa tujuan terbesarmu? | dreamCareer, socialImpact, financialFreedom, skillMastery, bestSelf |

### 5.2 Discovery Result

| Field | Value |
|-------|-------|
| **Purpose** | Show recommended roadmaps and circles based on answers |
| **User Value** | Clear next steps after self-reflection |
| **Main Problem Solved** | Bridges self-discovery to actionable paths |
| **Related Pages** | `/roadmap`, `/circle` |
| **DB Tables** | localStorage: `beautifio_discovery_answers` |

### 5.3 Discovery Seed Data Mappings

| Mapping | Source | Target |
|---------|--------|--------|
| `INTEREST_TO_ROADMAP` | interest value | roadmap slug(s) |
| `INSPIRATION_TO_ROADMAP` | inspiration value | roadmap slug(s) |
| `INTEREST_TO_CIRCLES` | interest value | circle ID(s) |
| `INSPIRATION_TO_CIRCLES` | inspiration value | circle ID(s) |

---

## 6. ROADMAP / DREAM DISCOVERY (`/roadmap`, `/roadmap/[slug]`)

### 6.1 Roadmap List Page (`/roadmap`)

| Field | Value |
|-------|-------|
| **Purpose** | Dream discovery marketplace — browse all 11 roadmaps |
| **User Value** | Explore career/life paths with emotional connection |
| **Main Problem Solved** | "What can I become?" — aspiration discovery |
| **Related Pages** | `/roadmap/[slug]`, `/discover` |
| **DB Tables** | `roadmap_templates` (DB), `ROADMAP_V3_SEED` (local) |

#### Sections
- **Hero**: "Mau Menjadi Siapa di Masa Depan?" with search
- **Personalized Recommendations**: Based on discovery answers
- **Trending Dreams**: Top 5 by popularity with user counts
- **I Don't Know Yet**: CTA to Discovery flow
- **Category Filter**: 5 categories (health, sports, creative, business, tech)
- **Roadmap Cards**: Dream statement, why matters, key skills, alternative futures, stats

### 6.2 Roadmap Detail Page (`/roadmap/[slug]`) — 11 tabs

| Tab | Label | Icon | Purpose |
|-----|-------|------|---------|
| Dream | Dream | Star | Dream vision, why it matters, career possibilities, success examples |
| Daily | Daily Wins | Sun | Daily habits with check-off tracking per zone/time |
| Skills | Skills | Zap | Skill progression with 4 levels (Pemula→Menengah→Mahir→Pro) |
| Milestones | Milestones | Trophy | Big wins with stages and essential markers |
| Blueprint | Blueprint | BookOpen | Skills, habits, mindset, tools, mistakes, success factors |
| Masterclass | Masterclass | GraduationCap | Age path, timeline, reality check, alternative paths, lessons |
| Life Pillars | Life Pillars | Heart | 6 life pillars with habits (spiritual, physical, mental, knowledge, social, professional) |
| Alt Futures | Alt Futures | Compass | Alternative careers if primary path doesn't work |
| Vault | Vault | Library | Saved learning resources (localStorage) |
| Reflections | Reflections | Target | Daily reflection journal (localStorage) |
| Related | Related | Sparkles | Recommended circles, mentors, opportunities |

### 6.3 Life Engine Integration (Roadmap Detail)

| Field | Value |
|-------|-------|
| **Purpose** | Zone/stage banner, capital progress, pivot dream modal |
| **User Value** | Context-aware adaptation of roadmap content |
| **Main Problem Solved** | Personalization based on growth zone |
| **Related Pages** | `/life`, `/profil` |
| **DB Tables** | localStorage: `beautifio_life_profile` |

### 6.4 The 11 Roadmaps (V3 Seed Data)

| Slug | Title | Emoji | Category | Duration | Daily Habits | Skills | Milestones |
|------|-------|-------|----------|----------|-------------|-------|------------|
| football-player | Pemain Sepak Bola Profesional | ⚽ | sports | 8-15 tahun | 10 | 7 | 10 |
| doctor | Dokter | 🩺 | health | 8-12 tahun | 10 | 7 | 10 |
| programmer | Programmer | 💻 | tech | 6-12 bulan | 9 | 7 | 10 |
| entrepreneur | Entrepreneur | 💼 | business | 3-5 tahun | 10 | 7 | 10 |
| musician | Musisi | 🎵 | creative | 2-5 tahun | 10 | 7 | 10 |
| content-creator | Content Creator | 🎬 | creative | 6-18 bulan | 10 | 7 | 10 |
| digital-marketer | Digital Marketer | 📱 | business | 1-2 tahun | 10 | 7 | 10 |
| runner | Pelari | 🏃 | sports | 6-12 bulan | 10 | 7 | 10 |
| athlete | Atlet | 🏅 | sports | varies | 10 | 7 | 10 |
| beauty-creator | Beauty Creator | 💄 | creative | 6-18 bulan | - | - | - |
| golfer | Pegolf | ⛳ | sports | 1-3 tahun | 10 | 7 | 10 |

Each roadmap includes: `dream`, `dailyWins`, `smallWins`, `bigWins`, `blueprint`, `lifePillars`, `alternativeFutures`, `agePath`, `timeline`, `realityCheck`, `alternativePaths`, `masterclassLessons`

### 6.5 Roadmap Storage (localStorage)

| Key | Data |
|-----|------|
| `beautifio_roadmap_dailywins_{slug}` | Done habit IDs (string[]) |
| `beautifio_roadmap_dailywins_{slug}_streak` | Current streak (number) |
| `beautifio_roadmap_dailywins_{slug}_lastdate` | Last activity date |
| `beautifio_roadmap_reflections` | DailyReflection[] (all slugs) |
| `beautifio_roadmap_vault` | LearningVaultItem[] (all slugs) |
| `beautifio_masterclass_read` | Read lesson IDs (string[]) |

---

## 7. LIFE ENGINE (`/life`, `/life/start`, `/profil`)

### 7.1 Life Engine Core

| Field | Value |
|-------|-------|
| **Purpose** | Gamified personal growth system — 6 Life Capital dimensions |
| **User Value** | Holistic self-development tracking beyond career |
| **Main Problem Solved** | "Am I growing as a person?" — quantifies personal growth |
| **Related Pages** | `/profil`, `/roadmap/[slug]`, `/home` |
| **DB Tables** | localStorage: `beautifio_life_profile` |

### 7.2 Life Capital Dimensions

| Dimension | Emoji | Default Value |
|-----------|-------|---------------|
| Knowledge | 📚 | 20 |
| Skill | ⚡ | 20 |
| Health | 💪 | 30 |
| Relationship | 👥 | 25 |
| Character | ⭐ | 25 |
| Spiritual | 🕊️ | 30 |

### 7.3 Growth Zones

| Zone | Label | Emoji | Description |
|------|-------|-------|-------------|
| comfort | Zona Nyaman | 🛋️ | Safe but not growing |
| fear | Zona Takut | 😟 | Wants to change but afraid |
| learning | Zona Belajar | 📚 | Actively learning new things |
| growth | Zona Bertumbuh | 🚀 | Found rhythm, challenging self |

### 7.4 Life Stages

| Stage | Label | Emoji | Age Range |
|-------|-------|-------|-----------|
| sd | SD | 🧒 | 7-12 |
| smp | SMP | 🧑 | 13-15 |
| sma | SMA | 🧑‍🎓 | 16-18 |
| university | Kuliah | 🎓 | 19-23 |
| early-career | Awal Karir | 💼 | 24-29 |
| professional | Profesional | 🏆 | 30-45 |
| mastery | Mastery | 👑 | 45+ |

### 7.5 Life Levels (based on total capital)

| Level | Min Capital | Emoji |
|-------|-------------|-------|
| Seed | 0 | 🌱 |
| Explorer | 100 | 🔍 |
| Builder | 250 | 🏗️ |
| Achiever | 400 | 🏆 |
| Leader | 550 | 👑 |
| Mentor | 700 | 🌟 |
| Legacy | 850 | 💎 |

### 7.6 Capital Sources (25 types)

| Source | Dimension | Points |
|--------|-----------|--------|
| read_story | knowledge | 2 |
| complete_lesson | knowledge | 3 |
| vault_add | knowledge | 1 |
| masterclass_read | knowledge | 4 |
| write_reflection | knowledge | 2 |
| daily_win_complete | skill | 2 |
| small_win_complete | skill | 4 |
| milestone_achieve | skill | 6 |
| practice_log | skill | 2 |
| physical_activity | health | 3 |
| recovery_habit | health | 2 |
| sleep_track | health | 2 |
| healthy_routine | health | 2 |
| circle_participate | relationship | 3 |
| circle_help | relationship | 4 |
| mentor_interact | relationship | 3 |
| event_attend | relationship | 3 |
| streak_milestone | character | 3 |
| difficult_goal | character | 5 |
| return_after_failure | character | 6 |
| help_others | character | 3 |
| gratitude_journal | spiritual | 3 |
| purpose_exercise | spiritual | 3 |
| faith_practice | spiritual | 2 |
| consistency | character | 2 |

### 7.7 Life Engine Functions

| Function | Purpose |
|----------|---------|
| `getLifeProfile()` | Read profile from localStorage |
| `saveLifeProfile()` | Write profile to localStorage |
| `updateLifeProfile()` | Merge partial updates |
| `completeOnboarding()` | Set stage, dream, zone, spiritual pref |
| `calculateCapitalChange()` | Calculate daily capital deltas |
| `applyCapitalDecay()` | Decay capital for inactivity |
| `detectGrowthZone()` | Determine zone from streak, completion, etc. |
| `unlockGrowthWin()` | Record achievement with capital bump |
| `executePivot()` | Switch dreams, preserve capital |
| `earnCapital()` | Single capital source gain |
| `earnMultipleCapital()` | Multiple sources simultaneously |

### 7.8 Unlock System (10 features)

| Feature | Requirements | Emoji |
|---------|-------------|-------|
| Advanced Roadmaps | knowledge 50+ | 🗺️ |
| Community Leader | relationship 50+ | 👑 |
| Ambassador Program | character 70+ | 🌟 |
| Mentor Access | knowledge 40, character 40 | 🎯 |
| Buat Circle | relationship 30, character 25 | 🔄 |
| Host Event | relationship 45, character 35 | 📅 |
| Gym Partner Discount | health 60+ | 💪 |
| Scholarship Opportunities | knowledge 80+ | 🎓 |
| Premium Deals | skill 50, health 40 | 💎 |
| VIP Rewards | character 60, spiritual 50 | 🏆 |

---

## 8. PROFILE / LIFE JOURNEY (`/profil`)

### 8.1 Profile Page Sections (8 major sections)

| Section | Content | Merged From |
|---------|---------|-------------|
| Profile Hero | Avatar, name, life level, dream, progress %, streak, life capital | IdentityHeader |
| Emotional Summary | AI-generated supportive message | New |
| My Life Journey | Timeline of growth wins, journals, milestones | JourneySection |
| Current Focus | Active dream, roadmap, circle, mentor | New (merged) |
| My Growth | Life Capital + Growth Tracker + Gamification (expandable) | LifeCapitalSection + GrowthTrackerSection + GamificationSection |
| My Journals & Stories | Recent journals, anon stories count | StoriesSection + JournalsSection |
| Support System | Safe Space, Circles, Mentors | SafeSpaceSection + CirclesSection + MentorsSection |
| Opportunities & Rewards | Saved opps, vouchers, achievement rewards | OpportunitiesSection + FamiliaProfileSection |

### 8.2 Legacy Profile Sections (replaced)

| Legacy Section | Status |
|----------------|--------|
| IdentityHeader | Absorbed into Profile Hero |
| JourneySection | Absorbed into My Life Journey |
| StoriesSection | Absorbed into My Journals & Stories |
| JournalsSection | Absorbed into My Journals & Stories |
| CirclesSection | Absorbed into Support System |
| MentorsSection | Absorbed into Support System |
| OpportunitiesSection | Absorbed into Opportunities & Rewards |
| LifeCapitalSection | Absorbed into My Growth |
| FamiliaProfileSection | Absorbed into Opportunities & Rewards |
| SafeSpaceSection | Absorbed into Support System |
| GrowthTrackerSection | Absorbed into My Growth |
| GamificationSection | Absorbed into My Growth |

---

## 9. STORIES / INSPIRASI (`/inspirasi`, `/inspirasi/[slug]`, `/inspirasi/post`)

### 9.1 Story List (`/inspirasi`)

| Field | Value |
|-------|-------|
| **Purpose** | Browse educational/inspirational articles |
| **User Value** | Learn from others' experiences |
| **Main Problem Solved** | Content-based inspiration and education |
| **Related Pages** | `/inspirasi/[slug]`, `/inspirasi/post` |
| **DB Tables** | `stories`, `story_categories` |

### 9.2 Story Detail (`/inspirasi/[slug]`)

| Field | Value |
|-------|-------|
| **Purpose** | Read full story with likes, saves, comments |
| **User Value** | Deep content consumption |
| **Main Problem Solved** | Actionable insights from real stories |
| **Related Pages** | `/inspirasi`, `/home` |
| **DB Tables** | `stories`, `story_likes`, `story_saves`, `story_comments`, `story_recommendations` |

### 9.3 Write Anon Story (`/inspirasi/post`)

| Field | Value |
|-------|-------|
| **Purpose** | Submit anonymous story to Safe Space |
| **User Value** | Safe expression without identity exposure |
| **Main Problem Solved** | Low-barrier emotional outlet |
| **Related Pages** | `/profil` (safe space section) |
| **DB Tables** | localStorage: `beautifio_anon_posts` |

### 9.4 Story Categories (9)

| Slug | Label | Icon |
|------|-------|------|
| education | Education | BookOpen |
| career | Career | Briefcase |
| business | Business | TrendingUp |
| sports | Sports | Dumbbell |
| music | Music | Music |
| gaming | Gaming | Gamepad2 |
| creator | Creator | Camera |
| beauty | Beauty | Sparkles |
| technology | Technology | Monitor |

**DB Tables:** `story_categories`, `stories`, `story_likes`, `story_saves`, `story_comments`, `story_recommendations`

---

## 10. JOURNALS (`/jurnal`, `/jurnal/[slug]`, `/jurnal/buat`, `/jurnal/[slug]/tulis`)

### 10.1 Journal List (`/jurnal`)

| Field | Value |
|-------|-------|
| **Purpose** | Browse personal and public journals |
| **User Value** | Track goal-oriented journeys with daily entries |
| **Main Problem Solved** | Structured progress documentation |
| **Related Pages** | `/jurnal/[slug]`, `/jurnal/buat` |
| **DB Tables** | `journals`, `journal_followers`, `journal_reactions` |

### 10.2 Journal Detail (`/jurnal/[slug]`)

| Field | Value |
|-------|-------|
| **Purpose** | Read entries, milestones — own or public |
| **User Value** | Narrative view of a goal pursuit |
| **Main Problem Solved** | Seeing progress as a story, not just stats |
| **Related Pages** | `/jurnal/[slug]/tulis` |
| **DB Tables** | `journals`, `journal_entries`, `journal_milestones` |

### 10.3 Create Journal (`/jurnal/buat`)

| Field | Value |
|-------|-------|
| **Purpose** | Create new journal with title, description, goal category |
| **User Value** | Start documenting a personal goal journey |
| **Main Problem Solved** | Structured goal tracking |
| **Related Pages** | `/jurnal`, `/jurnal/[slug]` |
| **DB Tables** | `journals` |

### 10.4 Journal Write Entry (empty route `/jurnal/[slug]/tulis`)

| Field | Value |
|-------|-------|
| **Purpose** | Write daily entry (placeholder — page not implemented) |
| **User Value** | Daily habit logging with mood tracking |
| **Main Problem Solved** | Day-by-day progress documentation |
| **Related Pages** | `/jurnal/[slug]` |
| **DB Tables** | `journal_entries` |

### 10.5 Mood Options (5)

| Value | Label | Emoji |
|-------|-------|-------|
| sangat_bahagia | Sangat Bahagia | 🌟 |
| bahagia | Bahagia | 😊 |
| biasa | Biasa | 😐 |
| sedih | Sedih | 😢 |
| sangat_sedih | Sangat Sedih | 😭 |

**DB Tables:** `journals`, `journal_entries`, `journal_milestones`, `journal_followers`, `journal_reactions`

---

## 11. CIRCLES (`/circle`, `/circle/[id]`)

### 11.1 Circle List (`/circle`)

| Field | Value |
|-------|-------|
| **Purpose** | Browse available community groups by category |
| **User Value** | Find like-minded people pursuing similar goals |
| **Main Problem Solved** | Community belonging and peer support |
| **Related Pages** | `/circle/[id]` |
| **DB Tables** | `circles`, `circle_members` |

### 11.2 Circle Detail (`/circle/[id]`)

| Field | Value |
|-------|-------|
| **Purpose** | Real-time chat, member list, mentor info |
| **User Value** | Engage with community in topic-specific channels |
| **Main Problem Solved** | Real-time peer interaction and support |
| **Related Pages** | `/circle`, `/mentors` |
| **DB Tables** | `circles`, `circle_members`, `messages` (realtime enabled) |

**DB Tables:** `circles`, `circle_members`, `messages`

---

## 12. MENTORS (`/mentors`, `/mentors/[slug]`)

### 12.1 Mentor List (`/mentors`)

| Field | Value |
|-------|-------|
| **Purpose** | Browse available mentors with expertise, badges, ratings |
| **User Value** | Find guidance from experienced professionals |
| **Main Problem Solved** | Access to expert guidance and accountability |
| **Related Pages** | `/mentors/[slug]` |
| **DB Tables** | N/A (static seed data — 15 mentors) |

### 12.2 Mentor Detail (`/mentors/[slug]`)

| Field | Value |
|-------|-------|
| **Purpose** | Mentor profile with bookings, stories, related roadmaps |
| **User Value** | Informed mentor selection |
| **Main Problem Solved** | Trust-building before engagement |
| **Related Pages** | `/mentors`, `/circle` |
| **DB Tables** | N/A (static seed data) |

### 12.3 Mentor Seed Data (15 mentors)

| Name | Expertise | Roadmaps |
|------|-----------|----------|
| Pak Rudi | Tech Entrepreneur | entrepreneur |
| Bu Sari | Leadership Coach | digital-marketer |
| Pak Anton | Data Scientist | programmer |
| Fajar Hidayat | Personal Trainer | runner, football-player |
| Kevin Alexander | Produser Musik | musician |
| Pak Budi | HR Director | digital-marketer, programmer |
| Dr. Rudi Hartono | Dokter Spesialis | doctor |
| Bambang Pamungkas | Eks Pemain Timnas | football-player |
| Agus Prayogo | Pelari Maraton | runner |
| Rory Mulyadi | Instruktur Golf | golfer |
| Tohpati | Gitaris & Produser | musician |
| Ria SW | Content Creator | content-creator |
| William Tanuwijaya | Founder Tokopedia | entrepreneur |
| Dina Maulana | Digital Marketing Lead | digital-marketer |
| Tasya Farasya | Beauty Influencer | beauty-creator |

---

## 13. FAMILIA (`/familia`, `/familia/deals`, `/familia/vouchers`, `/familia/rewards`, `/admin/familia`)

### 13.1 Familia Home (`/familia`)

| Field | Value |
|-------|-------|
| **Purpose** | Membership benefits hub — vouchers, deals, rewards, events |
| **User Value** | Tangible rewards for growth activities |
| **Main Problem Solved** | Motivation through real-world perks |
| **Related Pages** | `/familia/deals`, `/familia/vouchers`, `/familia/rewards` |
| **DB Tables** | See below |

### 13.2 Deals Page (`/familia/deals`)

| Field | Value |
|-------|-------|
| **Purpose** | Affiliate deals from partner brands |
| **User Value** | Discounted products/services |
| **Main Problem Solved** | Access to curated, goal-aligned shopping |
| **DB Tables** | `familia_affiliate_deals` |

### 13.3 Vouchers Page (`/familia/vouchers`)

| Field | Value |
|-------|-------|
| **Purpose** | View and redeem merchant vouchers with PIN |
| **User Value** | Free/discounted items at partner merchants |
| **Main Problem Solved** | Gamified reward redemption |
| **DB Tables** | `familia_merchants`, `familia_voucher_sessions`, `familia_redemption_log` |

### 13.4 Rewards Page (`/familia/rewards`)

| Field | Value |
|-------|-------|
| **Purpose** | Achievement-based rewards progress tracking |
| **User Value** | Clear goals for unlocking rewards |
| **Main Problem Solved** | Motivation through milestone-based perks |
| **DB Tables** | `familia_achievement_rewards`, `familia_user_achievements` |

### 13.5 Admin Familia (`/admin/familia`)

| Field | Value |
|-------|-------|
| **Purpose** | Admin management of Familia system |
| **User Value** | (Admin) Maintain merchant/deal data |
| **Main Problem Solved** | Back-office management |
| **DB Tables** | All Familia tables |

### 13.6 Familia DB Tables

| Table | Purpose |
|-------|---------|
| `familia_merchants` | Partner merchants (5 seeded) |
| `familia_affiliate_deals` | Affiliate product deals (10 seeded) |
| `familia_achievement_rewards` | Achievement-triggered rewards (5 seeded) |
| `familia_voucher_sessions` | User voucher activations (localStorage + DB) |
| `familia_redemption_log` | Anti-fraud redemption history |
| `familia_user_achievements` | Per-user achievement progress |
| `familia_event_benefits` | Event discounts/perks (3 seeded) |

---

## 14. OPPORTUNITIES (`/opportunity`, `/opportunity/[slug]`)

### 14.1 Opportunity List (`/opportunity`)

| Field | Value |
|-------|-------|
| **Purpose** | Browse scholarships, internships, jobs, competitions, etc. |
| **User Value** | Discover real-world opportunities aligned to goals |
| **Main Problem Solved** | "What can I apply for?" — opportunity discovery |
| **Related Pages** | `/opportunity/[slug]` |
| **DB Tables** | `opportunities`, `saved_opportunities` |

### 14.2 Opportunity Detail (`/opportunity/[slug]`)

| Field | Value |
|-------|-------|
| **Purpose** | View full opportunity details with save action |
| **User Value** | Informed application decisions |
| **Main Problem Solved** | Detail-oriented opportunity evaluation |
| **Related Pages** | `/opportunity` |
| **DB Tables** | `opportunities`, `saved_opportunities` |

### 14.3 Opportunity Categories (8)

| Category | Examples |
|----------|----------|
| beasiswa | LPDP, Erasmus, Affirmasi |
| magang | Frontend, UI/UX, Data Analyst |
| pekerjaan | Frontend Senior, PM, Backend |
| turnamen | Futsal, Hackathon, Badminton |
| kompetisi | Business Plan, Debat, Fotografi |
| relawan | Mengajar 3T, Bencana, Konservasi |
| pendanaan | Startup Hibah, Riset, Social Enterprise |
| program-kreator | YouTube, TikTok, Podcast, Writing, Gaming |

**DB Tables:** `opportunities`, `saved_opportunities`

---

## 15. SAFE SPACE

### 15.1 Safe Space Modal (`SafeSpaceModal.tsx`)

| Field | Value |
|-------|-------|
| **Purpose** | Anonymous emotional support — resources, guides, emergency contacts |
| **User Value** | Safe, stigma-free mental health support |
| **Main Problem Solved** | "I need help but I'm scared to ask" |
| **Related Pages** | `/profil` (support system section), `/inspirasi/post` |
| **DB Tables** | N/A (static data), localStorage: `beautifio_anon_posts` |

### 15.2 Safe Space Categories (6)

| Category | Label | Emoji |
|----------|-------|-------|
| bullying | Bullying | 🛡️ |
| violence | Kekerasan | 🚨 |
| harassment | Pelecehan | ⚠️ |
| family-issues | Masalah Keluarga | 🏠 |
| career-crisis | Krisis Karir | 💼 |
| financial-crisis | Krisis Keuangan | 💰 |

### 15.3 Resources (10 items)
### 15.4 Emergency Contacts (6 contacts)
### 15.5 Support Guides (6 guides)
### 15.6 Safe Stories (2 seed stories)
### 15.7 Safe Mentors (3)
### 15.8 Safe Circles (3)

---

## 16. AI COACH (`packages/utils/src/ai-coach.ts`)

### 16.1 Coach Functions

| Function | Purpose |
|----------|---------|
| `generateDailyCoachFocus()` | Today's focus based on zone, stage, dream |
| `generateInsights()` | Personalized insights from life capital patterns |
| `analyzeZone()` | Zone analysis with encouragement |
| `getCapitalAdvice()` | Advice for weakest capital dimension |
| `navigateDream()` | Dream-specific navigation guidance |
| `matchOpportunities()` | Match available opportunities to user |
| `generateMotivation()` | Motivational message based on streak/progress |
| `generateWeeklyReport()` | Weekly growth summary |
| `generateFailureCoach()` | Coaching after failure/pivot |
| `generatePivotCoach()` | Pivot-specific guidance |
| `analyzeReflection()` | Reflection content analysis |
| `getCoachPanelData()` | Aggregated coach panel data |
| `getDreamCompanionVoice()` | Companion voice style per dream (12 styles) |

### 16.2 Companion Voices (12 dream-specific styles)

| Dream | Voice Persona | Tone |
|-------|---------------|------|
| football-player | Coach Tim | Tough love |
| doctor | Dokter Senior | Wise, calm |
| entrepreneur | Mentor Startup | Bold, direct |
| programmer | Senior Engineer | Precise, logical |
| musician | Guru Musik | Creative, passionate |
| content-creator | Kreator Berpengalaman | Practical, encouraging |
| digital-marketer | Marketing Veteran | Strategic, data-driven |
| runner | Pelatih Lari | Motivational, disciplined |
| athlete | Pelatih Mental | Disciplined, resilient |
| beauty-creator | Beauty Expert | Nurturing, detailed |
| golfer | Caddy Profesional | Patient, focused |
| default | Teman Perjalanan | Warm, supportive |

---

## 17. GROWTH TRACKER

### 17.1 GrowthTracker Component

| Field | Value |
|-------|-------|
| **Purpose** | Aggregate growth stats across all roadmaps |
| **User Value** | "How am I doing overall?" — macro progress view |
| **Main Problem Solved** | Cross-roadmap progress awareness |
| **Related Pages** | `/profil` (My Growth section) |
| **DB Tables** | localStorage across multiple keys |

### 17.2 Stats Tracked

| Stat | Source |
|------|--------|
| Total Streak | Sum of all roadmap streaks |
| Total Reflections | Sum of all roadmap reflections |
| Total Vault Items | Sum of all roadmap vault items |
| Active Roadmaps | Roadmaps with streak > 0 |
| Masterclass Progress | Read lessons / total lessons |
| Depth Score | streak + reflections + vault + read |

---

## 18. ECOSYSTEM

### 18.1 EcosystemSection Component

| Field | Value |
|-------|-------|
| **Purpose** | Contextual external resources by life stage |
| **User Value** | "What else can I do?" — stage-aligned recommendations |
| **Main Problem Solved** | Connecting app growth to real-world actions |
| **Related Pages** | `/home` |
| **DB Tables** | N/A (static data) |

---

## 19. UI COMPONENT LIBRARY (`packages/ui/src/`)

| Component | File | Variants |
|-----------|------|----------|
| Avatar | `avatar.tsx` | `sm`, `md`, `lg`, `xl` |
| Badge | `badge.tsx` | `default`, `accent`, `secondary`, `outline`, `success`, `warning`, `danger` |
| BottomNavigation | `bottom-nav.tsx` | Animated indicator |
| Button | `button.tsx` | `primary`, `secondary`, `ghost`, `danger`; sizes `sm`, `md`, `lg` |
| Card | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardContent`; padding `sm`, `md`, `lg` |
| Input | `input.tsx` | Default, `Textarea` |
| ProgressBar | `progress-bar.tsx` | Sizes `sm`, `md`, `lg`; variants `default`, `accent` |
| Skeleton | `skeleton.tsx` | Loading placeholders |
| Tabs | `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |

---

## 20. SHARED COMPONENTS (`apps/web/src/components/`)

| Component | Purpose |
|-----------|---------|
| `AuthModal.tsx` | Authentication modal for protected actions |
| `EmptyState.tsx` | Reusable empty state with icon, title, description, action |
| `ProtectedAction.tsx` | Wrapper for auth-gated UI elements |
| `ui/button.tsx` | App-specific button (distinct from package) |

---

## 21. FEATURE COMPONENTS (31 total)

### 21.1 Roadmap Feature (16 components)

| Component | Purpose |
|-----------|---------|
| `RoadmapCard.tsx` | Dream discovery card with preview modal |
| `RoadmapV3DreamSection.tsx` | Dream tab: title, why matters, career possibilities, examples |
| `RoadmapV3DailyWinsSection.tsx` | Daily habits with check-off |
| `RoadmapV3SmallWinsSection.tsx` | Skills with 4-level progression |
| `RoadmapV3BigWinsSection.tsx` | Milestones with stages |
| `RoadmapV3BlueprintSection.tsx` | Skills, habits, mindset, tools, mistakes, success factors |
| `RoadmapV3LifePillarsSection.tsx` | 6 life pillars with habits |
| `RoadmapV3AlternativeFuturesSection.tsx` | Alternative careers |
| `RoadmapV3MasterclassSection.tsx` | Age path, timeline, reality check, alt paths, lessons |
| `RoadmapV3LearningVault.tsx` | Saved learning vault |
| `RoadmapV3DailyReflections.tsx` | Daily reflection journal |
| `MilestoneTimeline.tsx` | V1 milestone timeline |
| `RoadmapRecommendations.tsx` | V1 recs (circles, mentors, opps, products) |
| `GrowthReflectionSection.tsx` | Milestone progress tracking |
| `StageAdaptedContent.tsx` | Life engine stage adaptation |
| `GrowthTracker.tsx` | Aggregate growth stats |

### 21.2 Journal Feature (4 components)

| Component | Purpose |
|-----------|---------|
| `JournalCard.tsx` | Journal preview card |
| `JournalEntryForm.tsx` | Write entry with mood |
| `JournalMilestoneList.tsx` | Milestone timeline |
| `JournalTimeline.tsx` | Chronological entry view |

### 21.3 Cerita Feature (4 components)

| Component | Purpose |
|-----------|---------|
| `CategoryBar.tsx` | Story category filter |
| `CommentSection.tsx` | Story comments with replies |
| `RecommendedSection.tsx` | Related content |
| `StoryCard.tsx` | Story preview card |

### 21.4 Mentor Feature (3 components)

| Component | Purpose |
|-----------|---------|
| `MentorBadge.tsx` | Badge display |
| `MentorSessionCard.tsx` | Session info card |
| `MentorStoryCard.tsx` | Mentor-linked story |

### 21.5 Other Features

| Component | Feature | Purpose |
|-----------|---------|---------|
| `LifeCoachPanel.tsx` | Coach | AI coaching panel |
| `EcosystemSection.tsx` | Ecosystem | External resource links |
| `VoucherClaimModal.tsx` | Familia | Voucher claim flow |
| `SafeSpaceModal.tsx` | Safe Space | Emotional support modal |

---

## 22. SEED DATA FILES

| File | Content |
|------|---------|
| `constants.ts` | Goal categories, opp categories, circle categories, story categories, discovery questions, templates, mentors (15), opportunities (30), products (20), interest/roadmap/circle mappings |
| `familia-seed.ts` | Merchants (5), affiliate deals (10), achievement rewards (5), event benefits (3), voucher functions |
| `journal-seed.ts` | Mood options, journal categories, mock journals (5), mock entries (26 across 5 journals), milestones (20) |
| `roadmap-v3-seed.ts` | 11 full roadmaps with dream, habits, skills, milestones, blueprint, age path, timeline, reality check, alt paths, masterclass lessons |
| `roadmap-life-pillars-seed.ts` | 6 life pillars + alternative futures for all roadmaps |
| `life-engine-seed.ts` | Stage info (7), zone info (4), spiritual practices (8), default capital |
| `roadmap-seed.ts` | V1 milestones + recommendations |
| `safe-space-data.ts` | Categories (6), emergency contacts (6), resources (10), support guides (6), safe stories (2), safe mentors (3), safe circles (3) |
| `ai-coach.ts` | All coaching functions and 12 companion voice personas |

---

## 23. SUMMARY: ALL DATABASE TABLES

### Supabase (PostgreSQL) — 25 tables

| Migration | Table | Purpose |
|-----------|-------|---------|
| 00001 | `users` | User profiles |
| 00002 | `story_categories` | Story categories (9) |
| 00002 | `stories` | Published articles |
| 00002 | `story_likes` | Story likes |
| 00002 | `story_saves` | Story saves |
| 00002 | `story_comments` | Story comments |
| 00002 | `story_recommendations` | Story-linked resources |
| 00003 | `roadmap_templates` | V1 roadmap templates |
| 00003 | `roadmap_template_milestones` | V1 milestones |
| 00003 | `roadmap_template_recommendations` | V1 recs |
| 00004 | `journals` | User journals |
| 00004 | `journal_milestones` | Journal milestones |
| 00004 | `journal_entries` | Daily entries |
| 00004 | `journal_followers` | Journal follows |
| 00004 | `journal_reactions` | Journal emoji reactions |
| 00005 | `familia_merchants` | Partner merchants |
| 00005 | `familia_affiliate_deals` | Affiliate deals |
| 00005 | `familia_achievement_rewards` | Achievement rewards |
| 00005 | `familia_voucher_sessions` | User vouchers |
| 00005 | `familia_redemption_log` | Redemption audit |
| 00005 | `familia_user_achievements` | User achievement progress |
| 00005 | `familia_event_benefits` | Event benefits |
| 00006 | `user_goals` | User goals |
| 00006 | `circles` | Community groups |
| 00006 | `circle_members` | Circle memberships |
| 00006 | `messages` | Circle chat messages (realtime) |
| 00006 | `milestones` | Task milestones |
| 00006 | `opportunities` | Scholarship/job/event listings |
| 00006 | `saved_opportunities` | User saved opps |

### localStorage — 8+ keys

| Key | Data |
|-----|------|
| `beautifio_life_profile` | UserLifeProfile (life capital, zone, stage, wins, etc.) |
| `beautifio_discovery_answers` | DiscoveryAnswer[] |
| `beautifio_anon_posts` | Anonymous safe space posts |
| `beautifio_journals` | User-created journals |
| `beautifio_roadmap_dailywins_{slug}` | Done habit IDs |
| `beautifio_roadmap_dailywins_{slug}_streak` | Streak count |
| `beautifio_roadmap_dailywins_{slug}_lastdate` | Last activity |
| `beautifio_roadmap_reflections` | Daily reflections |
| `beautifio_roadmap_vault` | Learning vault items |
| `beautifio_masterclass_read` | Read lesson IDs |
| `beautifio_voucher_sessions` | Voucher sessions (also in DB) |

---

## 24. ROUTE MAP (34 routes)

| Route | Type | Auth Required | Feature |
|-------|------|---------------|---------|
| `/` | Static | No | Splash screen |
| `/welcome` | Static | No | Welcome/onboarding |
| `/login` | Static | No (redirect if authed) | Login |
| `/register` | Static | No (redirect if authed) | Register |
| `/forgot-password` | Static | No (redirect if authed) | Password reset |
| `/home` | Client | No | Main dashboard |
| `/discover` | Client | No | 4-step questionnaire |
| `/discover/result` | Client | No | Discovery results |
| `/roadmap` | Client | No | Dream discovery marketplace |
| `/roadmap/[slug]` | Static + Client | No | Roadmap detail (11 tabs) |
| `/profil` | Client | Yes | Life journey dashboard |
| `/life` | Client | Yes | Life Engine |
| `/life/start` | Client | No | Life Engine setup |
| `/onboarding` | Client | No | Post-registration flow |
| `/inspirasi` | Client | No | Story list |
| `/inspirasi/[slug]` | Static | No | Story detail |
| `/inspirasi/post` | Client | Yes | Write anon story |
| `/jurnal` | Client | No | Journal list |
| `/jurnal/[slug]` | Static + Client | No | Journal detail |
| `/jurnal/[slug]/tulis` | (empty) | - | Write entry (not built) |
| `/jurnal/buat` | Client | Yes | Create journal |
| `/circle` | Client | No | Circle list |
| `/circle/[id]` | Static + Client | No | Circle chat/detail |
| `/mentors` | Client | No | Mentor list |
| `/mentors/[slug]` | Static + Client | No | Mentor detail |
| `/opportunity` | Client | No | Opportunity list |
| `/opportunity/[slug]` | Static + Client | No | Opportunity detail |
| `/familia` | Client | Yes | Familia hub |
| `/familia/deals` | Client | No | Affiliate deals |
| `/familia/vouchers` | Client | No | Voucher management |
| `/familia/rewards` | Client | No | Achievement rewards |
| `/admin/familia` | Client | Yes (admin) | Familia admin |

---

*End of Product Inventory*
