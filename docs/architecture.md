# Beautifio — Architecture Document

**Version:** 1.0
**Status:** Draft
**Last Updated:** June 2026

---

## Authors

- **Product Manager** — Defines scope, prioritization, success metrics
- **Solution Architect** — Overall system design, tech stack, integration
- **Senior Frontend Engineer** — Component architecture, state, routing
- **Senior Backend Engineer** — Database, API, auth, RLS, realtime

---

## 1. Project Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                      │
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │     apps/web         │  │      apps/admin          │  │
│  │  (User App)          │  │   (Admin Dashboard)      │  │
│  │  React + TS + Vite   │  │   React + TS + Vite      │  │
│  └──────────┬───────────┘  └─────────────┬────────────┘  │
│             │                             │               │
│  ┌──────────┴─────────────────────────────┴──────────┐   │
│  │              packages/                             │   │
│  │  ┌──────┐  ┌───────┐  ┌────────┐                  │   │
│  │  │ ui   │  │ types │  │ utils  │                  │   │
│  │  └──────┘  └───────┘  └────────┘                  │   │
│  └────────────────────────────────────────────────────┘   │
│                         │                                  │
│                         │ HTTPS                            │
└─────────────────────────┼──────────────────────────────────┘
                          │
                    ┌─────┴──────┐
                    │  Supabase  │
                    │  (BaaS)    │
                    │            │
                    │ ┌────────┐ │
                    │ │Postgres│ │
                    │ │  + RLS │ │
                    │ └────────┘ │
                    │ ┌────────┐ │
                    │ │  Auth  │ │
                    │ └────────┘ │
                    │ ┌────────┐ │
                    │ │Realtime│ │
                    │ └────────┘ │
                    │ ┌────────┐ │
                    │ │ Storage│ │
                    │ └────────┘ │
                    └────────────┘
```

### 1.2 Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Komponen modular, ekosistem matang, type-safe |
| **Build Tool** | Vite 5 | Fast HMR, optimal build size |
| **Styling** | Tailwind CSS v4 | Utility-first, design system tokens via `@theme` |
| **Icons** | Lucide React | Ringan, konsisten, 1000+ icons |
| **BaaS** | Supabase | PostgreSQL, Auth, Realtime, Storage, RLS — satu platform |
| **Hosting** | Vercel | Edge network, automatic SSL, preview deployments |
| **Package Manager** | pnpm (workspaces) | Monorepo-native, faster installs |
| **Monorepo** | pnpm workspaces + Turborepo | Task orchestration, caching |

### 1.3 Architecture Decisions (ADRs)

| ID | Decision | Rationale |
|----|----------|-----------
| ADR-001 | Supabase over custom backend | Menghemat 60-70% development time untuk MVP. Auth, DB, Realtime, Storage sudah include. |
| ADR-002 | Monorepo with pnpm workspaces | Kode shared (ui, types, utils) dipakai web + admin. Satu version, satu source of truth. |
| ADR-003 | RLS over custom middleware | Security di level database, tidak bisa bypass. Tiap query otomatis terfilter by user context. |
| ADR-004 | React Router v7 for routing | SPA routing dengan loader/action pattern, cocok untuk app dengan banyak page. |
| ADR-005 | Zustand over Redux/Context | Minimal boilerplate, performant, middleware built-in (persist, devtools). |
| ADR-006 | Realtime via Supabase subscriptions | Chat, notifikasi, live update tanpa WebSocket server terpisah. |

---

## 2. Folder Structure

```
beautifio/
├── apps/
│   ├── web/                          # User-facing app
│   │   ├── src/
│   │   │   ├── app/                  # App root, router
│   │   │   │   ├── index.tsx
│   │   │   │   └── router.tsx
│   │   │   ├── pages/               # Route-based pages
│   │   │   │   ├── landing/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── sections/    # Hero, Fitur, Circle, dll
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login.tsx
│   │   │   │   │   ├── register.tsx
│   │   │   │   │   └── verify.tsx
│   │   │   │   ├── onboarding/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── circle/
│   │   │   │   │   ├── index.tsx          # Circle list
│   │   │   │   │   ├── [id].tsx           # Circle detail + chat
│   │   │   │   │   └── explore.tsx
│   │   │   │   ├── roadmap/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── opportunity/
│   │   │   │   │   ├── index.tsx          # Opportunity Hub
│   │   │   │   │   └── [id].tsx           # Opportunity detail
│   │   │   │   └── profile/
│   │   │   │       └── index.tsx
│   │   │   ├── features/            # Feature modules (per domain)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── hooks.ts
│   │   │   │   │   ├── store.ts
│   │   │   │   │   └── components/
│   │   │   │   ├── circle/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── hooks.ts
│   │   │   │   │   ├── store.ts
│   │   │   │   │   └── components/
│   │   │   │   │       ├── circle-card.tsx
│   │   │   │   │       ├── circle-list.tsx
│   │   │   │   │       └── chat-bubble.tsx
│   │   │   │   ├── goal/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── hooks.ts
│   │   │   │   │   └── components/
│   │   │   │   │       ├── goal-selector.tsx
│   │   │   │   │       └── milestone-item.tsx
│   │   │   │   ├── roadmap/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── hooks.ts
│   │   │   │   │   └── components/
│   │   │   │   │       ├── roadmap-view.tsx
│   │   │   │   │       └── progress-bar.tsx
│   │   │   │   ├── opportunity/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   ├── hooks.ts
│   │   │   │   │   └── components/
│   │   │   │   │       ├── opportunity-card.tsx
│   │   │   │   │       └── opportunity-filter.tsx
│   │   │   │   └── mentor/
│   │   │   │       ├── actions.ts
│   │   │   │       ├── hooks.ts
│   │   │   │       └── components/
│   │   │   │           ├── mentor-card.tsx
│   │   │   │           └── question-form.tsx
│   │   │   ├── components/          # Shared UI components
│   │   │   │   ├── ui/              # Atoms (button, input, card)
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── badge.tsx
│   │   │   │   │   ├── avatar.tsx
│   │   │   │   │   ├── modal.tsx
│   │   │   │   │   ├── bottom-sheet.tsx
│   │   │   │   │   └── progress-bar.tsx
│   │   │   │   ├── layout/          # Layout components
│   │   │   │   │   ├── navbar.tsx
│   │   │   │   │   ├── bottom-nav.tsx
│   │   │   │   │   └── page-shell.tsx
│   │   │   │   └── shared/          # Domain-agnostic
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── error-boundary.tsx
│   │   │   │       └── empty-state.tsx
│   │   │   ├── hooks/               # Global hooks
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-realtime.ts
│   │   │   │   └── use-intersection.ts
│   │   │   ├── lib/                 # Utilities
│   │   │   │   ├── supabase/
│   │   │   │   │   ├── client.ts
│   │   │   │   │   └── queries.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── constants.ts
│   │   │   ├── stores/              # Zustand stores
│   │   │   │   ├── auth-store.ts
│   │   │   │   └── app-store.ts
│   │   │   ├── styles/              # Tailwind + global CSS
│   │   │   │   └── index.css
│   │   │   ├── types/               # App-specific types
│   │   │   │   └── index.ts
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin/                       # Admin dashboard
│       └── src/
│           ├── pages/
│           │   ├── dashboard/
│           │   ├── users/
│           │   ├── circles/
│           │   ├── mentors/
│           │   ├── opportunities/
│           │   └── moderation/
│           └── main.tsx
│
├── packages/
│   ├── ui/                          # Shared component library
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── index.ts
│   │   │   └── globals.css
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                       # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── database.ts          # Supabase generated types
│   │   │   ├── models.ts            # Domain models
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                       # Shared utilities
│       ├── src/
│       │   ├── formatters.ts        # Date, currency, text
│       │   ├── validators.ts        # Form validation rules
│       │   ├── constants.ts         # Enums, configs
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/
│   ├── migrations/                  # SQL migration files
│   │   ├── 00001_create_enums.sql
│   │   ├── 00002_create_users.sql
│   │   ├── 00003_create_goals.sql
│   │   ├── 00004_create_circles.sql
│   │   ├── 00005_create_messages.sql
│   │   ├── 00006_create_mentors.sql
│   │   ├── 00007_create_opportunities.sql
│   │   ├── 00008_create_milestones.sql
│   │   ├── 00009_create_reports.sql
│   │   ├── 00010_create_notifications.sql
│   │   └── 00011_setup_rls.sql
│   ├── seed.sql                     # Seed data
│   ├── config.toml                  # Supabase CLI config
│   └── types.ts                     # Generated types (supabase gen types)
│
├── docs/
│   ├── prd.md
│   ├── design-system.md
│   ├── user-flows.md
│   ├── database.md
│   └── architecture.md              # ← This file
│
├── turbo.json                       # Turborepo config
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users     │1──N │   user_goals     │1──N │  milestones  │
│──────────────│     │──────────────────│     │──────────────│
│ id (PK)      │     │ id               │     │ id           │
│ email        │     │ user_id (FK)     │     │ user_id (FK) │
│ full_name    │     │ goal_name        │     │ goal_id (FK) │
│ role         │     │ goal_category    │     │ title        │
│ avatar_url   │     │ target_date      │     │ order_index  │
│ city         │     │ status           │     │ status       │
│ status       │     │ progress         │     │ completed_at │
│ is_verified  │     └──────────────────┘     └──────────────┘
│ last_active  │
└──────┬───────┘
       │1
       │
       │1
┌──────┴───────┐     ┌──────────────────┐
│mentor_profiles│1──1 │     users        │
│──────────────│     │ (as mentor)       │
│ id            │     └──────────────────┘
│ user_id (FK)  │
│ expertise[]   │
│ company       │
│ position      │
│ verification  │
└───────────────┘

┌──────────────┐     ┌──────────────────┐
│   circles    │1──N │  circle_members  │
│──────────────│     │──────────────────│
│ id (PK)      │     │ id               │
│ name         │     │ circle_id (FK)   │
│ description  │     │ user_id (FK)     │
│ mentor_id(FK)│     │ role             │
│ capacity     │     │ joined_at        │
│ member_count │     │ left_at          │
│ status       │     └──────────────────┘
└──────┬───────┘
       │1
       │
       │N
┌──────┴───────┐     ┌──────────────────┐
│  messages    │     │mentor_questions  │
│──────────────│     │──────────────────│
│ id           │     │ id               │
│ circle_id(FK)│     │ circle_id (FK)   │
│ sender_id(FK)│     │ user_id (FK)     │
│ message      │     │ title            │
│ message_type │     │ content          │
│ is_pinned    │     │ is_answered      │
│ parent_id    │     └────────┬─────────┘
│ created_at   │              │1
└──────────────┘              │
                              │N
                    ┌─────────┴─────────┐
                    │  mentor_answers   │
                    │───────────────────│
                    │ id                │
                    │ question_id (FK)  │
                    │ mentor_id (FK)    │
                    │ content           │
                    └───────────────────┘

┌──────────────────┐     ┌──────────────────────┐
│  opportunities   │1──N │ saved_opportunities   │
│──────────────────│     │──────────────────────│
│ id (PK)          │     │ id                   │
│ title            │     │ user_id (FK)         │
│ category         │     │ opportunity_id (FK)  │
│ organization     │     │ has_applied          │
│ deadline         │     └──────────────────────┘
│ url              │
│ is_featured      │
└──────────────────┘

┌──────────────────┐
│   notifications  │
│──────────────────│
│ id               │
│ user_id (FK)     │
│ type             │
│ title            │
│ body             │
│ data (JSONB)     │
│ is_read          │
└──────────────────┘

┌──────────────────┐
│     reports      │
│──────────────────│
│ id               │
│ reporter_id (FK) │
│ target_type      │
│ target_id        │
│ reason           │
│ status           │
│ handled_by (FK)  │
└──────────────────┘
```

### 3.2 Key Design Decisions

| Table | Decision | Reason |
|-------|----------|--------|
| `users` | Single table with `role` enum | Supabase Auth handles auth; `users` is public profile data |
| `mentor_profiles` | Separate from `users` | Mentor-specific fields (expertise[], company, verification) tidak relevan untuk semua user |
| `circle_members` | Unique constraint on (circle_id, user_id) | Prevent duplicate join |
| `messages` | `parent_id` self-reference | Threaded replies tanpa tabel terpisah |
| `milestones` | `order_index` explicit sequence | Roadmap step ordering — tidak perlu dihitung dari created_at |
| `notifications` | `data` as JSONB | Flexible payload untuk tiap tipe notifikasi |
| `reports` | Polymorphic target | Satu tabel untuk report apapun (message, user, circle, opportunity) |

---

## 4. Supabase Schema

### 4.1 Migration Strategy

```
supabase/
├── migrations/
│   ├── 00001_create_enums.sql       # All ENUM types
│   ├── 00002_create_users.sql       # users table + indexes + RLS
│   ├── 00003_create_goals.sql       # user_goals + milestones
│   ├── 00004_create_circles.sql     # circles + circle_members
│   ├── 00005_create_messages.sql    # messages + mentor_questions + mentor_answers
│   ├── 00006_create_mentors.sql     # mentor_profiles + mentor_sessions
│   ├── 00007_create_opportunities.sql # opportunities + saved_opportunities
│   ├── 00008_create_notifications.sql # notifications
│   ├── 00009_create_reports.sql     # reports
│   └── 00010_setup_rls.sql         # Final RLS policies
```

### 4.2 Auth Integration

Supabase Auth handles:
- **Email/Password** registration & login
- **Google OAuth** (and future providers)
- **Email verification** (Magic Link or OTP)
- **Session management** (auto-refresh)
- **Password reset** flow

The `users` table is synced via `on_auth_user_created` trigger:

```sql
-- Auto-create public profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.3 RLS Policy Examples

```sql
-- users: read own profile
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- circles: anyone can read active
CREATE POLICY "circles_read_active"
  ON public.circles FOR SELECT
  USING (status = 'active');

-- messages: member of circle can read
CREATE POLICY "messages_read_circle_member"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );

-- messages: member of circle can insert
CREATE POLICY "messages_insert_circle_member"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );
```

### 4.4 Realtime Subscriptions

Enable Realtime on these tables:
- `messages` — for live chat
- `notifications` — for real-time alerts
- `mentor_answers` — for mentor reply updates

---

## 5. API Structure

### 5.1 Supabase as API Layer

Tidak ada backend server terpisah. Semua API via Supabase:

| Feature | Supabase API |
|---------|-------------|
| Auth | `supabase.auth.signUp()`, `signIn()`, `signOut()` |
| Database | `supabase.from('table').select().eq()` |
| Realtime | `supabase.channel('table').on('INSERT', cb)` |
| Storage | `supabase.storage.from('bucket').upload()` |
| Functions | Supabase Edge Functions (for complex logic) |

### 5.2 Edge Functions (Limited Use)

Supabase Edge Functions untuk:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-verification-email` | On signup | Send OTP via email |
| `process-mentor-verification` | On mentor_profile INSERT | Background verification check |
| `send-notification-push` | On notification INSERT | Email/push fallback |
| `circle-matching` | On onboarding complete | Recommend circles based on goals |

### 5.3 Client-Side Data Access Pattern

```typescript
// lib/supabase/queries.ts

// === AUTH ===
export async function signUp(email: string, password: string, name: string) { ... }
export async function signIn(email: string, password: string) { ... }
export async function signInWithGoogle() { ... }
export async function signOut() { ... }

// === ONBOARDING ===
export async function saveOnboardingData(userId: string, data: OnboardingData) { ... }

// === GOALS ===
export async function getGoals(userId: string) { ... }
export async function createGoal(goal: NewGoal) { ... }
export async function updateGoalProgress(goalId: string, progress: number) { ... }

// === CIRCLES ===
export async function getMyCircles(userId: string) { ... }
export async function getRecommendedCircles(userId: string) { ... }
export async function joinCircle(circleId: string, userId: string) { ... }
export async function leaveCircle(circleId: string, userId: string) { ... }
export async function getCircleMessages(circleId: string) { ... }
export async function sendMessage(message: NewMessage) { ... }

// === ROADMAP ===
export async function getMilestones(goalId: string) { ... }
export async function completeMilestone(milestoneId: string) { ... }

// === OPPORTUNITIES ===
export async function getOpportunities(filters: OppFilters) { ... }
export async function saveOpportunity(userId: string, oppId: string) { ... }
export async function markApplied(userId: string, oppId: string) { ... }

// === MENTOR ===
export async function getMentorProfile(mentorId: string) { ... }
export async function askQuestion(question: NewQuestion) { ... }
export async function getQuestions(circleId: string) { ... }
export async function answerQuestion(answer: NewAnswer) { ... }

// === NOTIFICATIONS ===
export async function getNotifications(userId: string) { ... }
export async function markNotificationRead(notifId: string) { ... }
```

### 5.4 File Storage Structure

```
Supabase Storage Bucket: 'beautifio'
├── avatars/
│   └── {user_id}.jpg
├── circle-covers/
│   └── {circle_id}.jpg
└── chat-images/
    └── {message_id}.jpg
```

---

## 6. State Management Strategy

### 6.1 State Categories

| Category | Tool | Scope | Persistence |
|----------|------|-------|-------------|
| **Server State** | Supabase + TanStack Query | Data dari DB | Cache (memory + localStorage) |
| **Auth State** | Zustand + Supabase session | User session, role | localStorage (Supabase auto) |
| **UI State** | Zustand (local stores) | Modal open, tab active | None |
| **Form State** | React Hook Form | Form inputs | None |
| **Realtime** | Supabase subscriptions | Chat, notifications | Memory only |

### 6.2 Zustand Store Structure

```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

// stores/app-store.ts
interface AppState {
  activeTab: 'home' | 'circle' | 'roadmap' | 'opportunity' | 'profile';
  isOnboardingComplete: boolean;
  selectedGoalId: string | null;
  setActiveTab: (tab: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setSelectedGoal: (goalId: string | null) => void;
}
```

### 6.3 Data Flow Pattern

```
User Action
    │
    ▼
Component (e.g. CircleList)
    │
    ├── Call query hook (useCircles)
    │     │
    │     ├── TanStack Query fetches via Supabase
    │     │     │
    │     │     ├── Returns cached data (if fresh)
    │     │     └── Fetches new data (if stale)
    │     │
    │     └── Returns { data, isLoading, error }
    │
    ├── Mutation hook (useJoinCircle)
    │     │
    │     ├── Optimistic update → UI updates instantly
    │     ├── Supabase mutation
    │     ├── On success → invalidate cache
    │     └── On error → rollback optimistic update
    │
    └── Subscribe to Realtime (circle changes)
          │
          └── Invalidate query cache on new data
```

### 6.4 Realtime Connection Strategy

```typescript
// hooks/use-realtime.ts
export function useCircleMessages(circleId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`circle:${circleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `circle_id=eq.${circleId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', circleId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [circleId]);
}
```

### 6.5 Query Key Convention

```typescript
// Consistent key factory
export const queryKeys = {
  user: {
    profile: (id: string) => ['user', 'profile', id],
    goals: (id: string) => ['user', 'goals', id],
    notifications: (id: string) => ['user', 'notifications', id],
  },
  circle: {
    list: (userId: string) => ['circle', 'list', userId],
    detail: (id: string) => ['circle', 'detail', id],
    messages: (id: string) => ['circle', 'messages', id],
    members: (id: string) => ['circle', 'members', id],
  },
  goal: {
    milestones: (goalId: string) => ['goal', 'milestones', goalId],
  },
  opportunity: {
    list: (filters: OppFilters) => ['opportunity', 'list', filters],
    saved: (userId: string) => ['opportunity', 'saved', userId],
  },
  mentor: {
    questions: (circleId: string) => ['mentor', 'questions', circleId],
    profile: (mentorId: string) => ['mentor', 'profile', mentorId],
  },
};
```

---

## 7. Performance & Security

### 7.1 Frontend Performance

| Strategy | Implementation |
|----------|---------------|
| **Code Splitting** | React.lazy + Suspense per route |
| **Image Optimization** | Vite built-in + Supabase image transforms |
| **Bundle Analysis** | `vite-bundle-visualizer` |
| **Preload Critical** | Fonts, hero image |
| **TanStack Query** | Automatic caching, stale-while-revalidate |
| **Optimistic Updates** | Mutations with instant UI feedback |

### 7.2 Security

| Layer | Measure |
|-------|---------|
| **Auth** | Supabase Auth with email/Google, MFA (post-MVP) |
| **Database** | RLS policies on every table, never trust client |
| **API** | No custom API — all via Supabase RLS |
| **Storage** | RLS on storage bucket, signed URLs for uploads |
| **XSS** | React JSX auto-escapes, CSP headers |
| **Rate Limiting** | Supabase built-in, edge function for custom limits |
| **Data Privacy** | Encrypted at rest (PostgreSQL), TLS 1.3 in transit |

### 7.3 Monitoring

- **Vercel Analytics** — Page views, web vitals
- **Supabase Logs** — Database performance, edge function logs
- **Sentry** (post-MVP) — Error tracking
