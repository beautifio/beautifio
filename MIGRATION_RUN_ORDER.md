# MIGRATION RUN ORDER

**Project:** Beautifio
**Date:** 2026-06-11

Apply migrations in this exact order to a fresh Supabase project:

---

## Option A: Supabase CLI

```bash
# Link project (if not already linked)
supabase link --project-ref sivltqvqkbaykuazwdja

# Push all local migrations to remote
supabase db push
```

This will automatically apply migrations in filename order.

---

## Option B: Manual SQL Editor (Supabase Dashboard)

Open **Supabase Dashboard → SQL Editor** and run each file in order.

### Step 1: `00001_users.sql`
```
File: supabase/migrations/00001_users.sql
```

**Creates:** `users` table, `handle_new_user()` function, `on_auth_user_created` trigger, RLS policies

**Naming fix:** Drops the default `user_profiles` table (Supabase template) to avoid conflict. Standardizes on `users`.

**Added columns** (beyond original migration):
- `goals TEXT[]` — used by `saveOnboardingData()` in `queries.ts:30`
- `role TEXT` — referenced by Familia RLS policies (`00005_familia.sql`)

### Step 2: `00002_cerita.sql`
```
File: supabase/migrations/00002_cerita.sql
```

**Creates:** `story_categories`, `stories`, `story_likes`, `story_saves`, `story_comments`, `story_recommendations`

**Seeds:** 9 story categories

### Step 3: `00003_roadmap_templates.sql`
```
File: supabase/migrations/00003_roadmap_templates.sql
```

**Creates:** `roadmap_templates`, `roadmap_template_milestones`, `roadmap_template_recommendations`

### Step 4: `00004_journals.sql`
```
File: supabase/migrations/00004_journals.sql
```

**Creates:** `journals`, `journal_entries`, `journal_milestones`, `journal_followers`, `journal_reactions`

**Creates:** `update_journal_entry_count()`, `update_journal_follower_count()` + 2 triggers

### Step 5: `00005_familia.sql`
```
File: supabase/migrations/00005_familia.sql
```

**Creates:** 7 Familia tables (merchants, affiliate deals, achievement rewards, voucher sessions, redemption log, user achievements, event benefits)

**Seeds:** 5 merchants, 10 affiliate deals, 5 achievement rewards, 3 event benefits

### Step 6: `00006_core_tables.sql` (NEW)
```
File: supabase/migrations/00006_core_tables.sql
```

**Creates:** `user_goals`, `circles`, `circle_members`, `messages`, `milestones`, `opportunities`, `saved_opportunities`

**Realtime:** Adds `messages` to `supabase_realtime` publication

---

## Dependency Graph

```
00001 (users)
  │
  ├── 00002 (stories) ──── depends on: users
  ├── 00003 (roadmap_templates) ──── standalone
  ├── 00004 (journals) ──── depends on: users
  ├── 00005 (familia) ──── depends on: users
  └── 00006 (core tables)
        ├── user_goals ──── depends on: users
        ├── circles ──── depends on: users
        ├── circle_members ──── depends on: circles, users
        ├── messages ──── depends on: circles, users
        ├── milestones ──── depends on: user_goals, users
        ├── opportunities ──── standalone
        └── saved_opportunities ──── depends on: opportunities, users
```

## Rollback Order (reverse)

```
00006 → 00005 → 00004 → 00003 → 00002 → 00001
```
