# DATABASE RECOVERY PLAN

**Date:** 2026-06-11
**Project:** Beautifio
**Supabase Project:** `sivltqvqkbaykuazwdja`

---

## Part 1: Migration Inventory

### `00001_users.sql`
| Category | Items |
|----------|-------|
| **Tables created** | `users` |
| **Functions created** | `handle_new_user()` — inserts profile row after `auth.users` INSERT |
| **Triggers created** | `on_auth_user_created` → `handle_new_user()` on `auth.users` AFTER INSERT |
| **Policies created** | `"Users can view own profile"` (SELECT), `"Users can update own profile"` (UPDATE), `"System can insert profiles"` (INSERT) |

### `00002_cerita.sql`
| Category | Items |
|----------|-------|
| **Tables created** | `story_categories`, `stories`, `story_likes`, `story_saves`, `story_comments`, `story_recommendations` |
| **Functions created** | — |
| **Triggers created** | — |
| **Policies created** | 8 policies: categories public, published stories public, authenticated can like/save/comment, recommendations public |

### `00003_roadmap_templates.sql`
| Category | Items |
|----------|-------|
| **Tables created** | `roadmap_templates`, `roadmap_template_milestones`, `roadmap_template_recommendations` |
| **Functions created** | — |
| **Triggers created** | — |
| **Policies created** | 3 policies: all public SELECT |

### `00004_journals.sql`
| Category | Items |
|----------|-------|
| **Tables created** | `journals`, `journal_entries`, `journal_milestones`, `journal_followers`, `journal_reactions` |
| **Functions created** | `update_journal_entry_count()`, `update_journal_follower_count()` |
| **Triggers created** | `journal_entries_count_trigger`, `journal_followers_count_trigger` |
| **Policies created** | 12 policies: public/owner access control, followers CRUD |

### `00005_familia.sql`
| Category | Items |
|----------|-------|
| **Tables created** | `familia_merchants`, `familia_affiliate_deals`, `familia_achievement_rewards`, `familia_voucher_sessions`, `familia_redemption_log`, `familia_user_achievements`, `familia_event_benefits` |
| **Functions created** | — |
| **Triggers created** | — |
| **Policies created** | 10 policies: merchants public, admin management, user-owned sessions/redemptions |

---

## Part 2: Intended Schema (All Migrations Applied)

After running all 5 migrations, these 22 tables should exist:

```
users
story_categories
stories
story_likes
story_saves
story_comments
story_recommendations
roadmap_templates
roadmap_template_milestones
roadmap_template_recommendations
journals
journal_entries
journal_milestones
journal_followers
journal_reactions
familia_merchants
familia_affiliate_deals
familia_achievement_rewards
familia_voucher_sessions
familia_redemption_log
familia_user_achievements
familia_event_benefits
```

Plus 3 functions and 3 triggers.

---

## Part 3: Code References vs Migration Definitions

### Tables referenced by code AND defined in migrations (✅ match)

| Table | Code refs (queries.ts) | Migration |
|-------|----------------------|-----------|
| `stories` | `select` (lines 95, 111) | `00002_cerita.sql` |
| `story_categories` | `select` (line 89) | `00002_cerita.sql` |
| `story_likes` | `select`, `insert`, `delete` (lines 140, 145, 160) | `00002_cerita.sql` |
| `story_saves` | `select`, `insert`, `delete` (lines 150, 155, 165) | `00002_cerita.sql` |
| `story_comments` | `select`, `insert` (lines 126, 135, 170) | `00002_cerita.sql` |
| `story_recommendations` | `select` (line 120) | `00002_cerita.sql` |
| `roadmap_templates` | `select` (lines 176, 181) | `00003_roadmap_templates.sql` |
| `roadmap_template_milestones` | `select` (line 186) | `00003_roadmap_templates.sql` |
| `roadmap_template_recommendations` | `select` (line 191) | `00003_roadmap_templates.sql` |

### Tables referenced by code but NOT defined in any migration (❌ missing)

| Table | Code refs | Used columns | Severity |
|-------|-----------|-------------|----------|
| `users` | `upsert` (q:30), `update` (onboarding:244) | `id`, `status`, `interests`, `goals`, `onboarding_completed`, `city`, `last_active_at` | **CRITICAL** — table name mismatch: migrations create `users`, DB has `user_profiles` |
| `user_goals` | `select` (q:35), `insert` (q:40, onboarding:249) | `user_id`, `goal_name`, `goal_category`, `target_date`, `status`, `progress`, `created_at` | **HIGH** — missing table entirely |
| `circles` | `select` (q:50) | `id`, `name`, `description`, `goal_category`, `mentor_id`, `cover_url`, `capacity`, `member_count`, `status` | **HIGH** — missing table entirely |
| `circle_members` | `select` (q:45), `insert` (q:55) | `circle_id`, `user_id`, `role`, `joined_at`, `left_at` | **HIGH** — missing table entirely |
| `messages` | `insert` (q:60), realtime subscription (circle/[id]:579) | `circle_id`, `sender_id`, `message`, `message_type`, `is_pinned`, `parent_id` | **HIGH** — missing table entirely |
| `milestones` | `select` (q:65), `update` (q:70) | `goal_id`, `title`, `description`, `order_index`, `status`, `completed_at` | **HIGH** — missing table entirely |
| `opportunities` | `select` (q:75) | `title`, `category`, `organization`, `description`, `deadline`, `url`, `is_featured`, `is_active` | **HIGH** — missing table entirely |
| `saved_opportunities` | `insert` (q:82) | `user_id`, `opportunity_id` | **HIGH** — missing table entirely |

### Tables in migrations but NOT referenced by code yet (🟡 unused)

| Table | Migration | Notes |
|-------|-----------|-------|
| `journals` | `00004` | Feature exists (Journal components) but no DB queries |
| `journal_entries` | `00004` | Not queried — uses mock data |
| `journal_milestones` | `00004` | Not queried — uses mock data |
| `journal_followers` | `00004` | Not queried — uses mock data |
| `journal_reactions` | `00004` | Not queried — uses mock data |
| `familia_*` (7 tables) | `00005` | Feature exists but no DB queries yet |

### Types with no table backing (🟡 type-only)

| Type | File | Notes |
|------|------|-------|
| `Notification` | `types/index.ts:92-101` | No `notifications` table in migrations or queries |

---

## Part 4: Actual Database State (Current)

Verified via Supabase REST API on 2026-06-11:

| Object | Status | Detail |
|--------|--------|--------|
| `public.users` | ❌ **DOES NOT EXIST** | PostgREST returns 404 |
| `public.user_profiles` | ✅ **EXISTS** (default Supabase template) | Empty table, unknown schema |
| All other tables | ❌ **DO NOT EXIST** | All 21 remaining tables absent |
| `handle_new_user()` | ❌ **DOES NOT EXIST** | Cannot verify directly, but table it writes to doesn't exist |
| `on_auth_user_created` | ❌ **DOES NOT EXIST** | Trigger not deployed |

The database is essentially empty — only the default Supabase template `user_profiles` table exists.

---

## Part 5: Mismatch Summary

```
CODE EXPECTS          MIGRATIONS CREATE       ACTUAL DATABASE
──────────────────    ────────────────────    ───────────────
users                 users                   user_profiles (default)
user_goals            ❌ MISSING              ❌ MISSING
circles               ❌ MISSING              ❌ MISSING
circle_members        ❌ MISSING              ❌ MISSING
messages              ❌ MISSING              ❌ MISSING
milestones            ❌ MISSING              ❌ MISSING
opportunities         ❌ MISSING              ❌ MISSING
saved_opportunities   ❌ MISSING              ❌ MISSING
stories               stories                 ❌ MISSING
story_categories      story_categories        ❌ MISSING
story_likes           story_likes             ❌ MISSING
story_saves           story_saves             ❌ MISSING
story_comments        story_comments          ❌ MISSING
story_recommendations story_recommendations   ❌ MISSING
roadmap_templates     roadmap_templates       ❌ MISSING
r_template_milestones r_template_milestones   ❌ MISSING
r_template_recs       r_template_recs         ❌ MISSING
journals              journals                ❌ MISSING
journal_entries       journal_entries         ❌ MISSING
journal_milestones    journal_milestones      ❌ MISSING
journal_followers     journal_followers       ❌ MISSING
journal_reactions     journal_reactions       ❌ MISSING
familia_* (7)         familia_* (7)           ❌ MISSING
```

### Key finding: 8 tables used by code are missing from migrations entirely

The 5 migrations define 22 tables, but the code queries 17 tables total. Of those 17:
- **9 tables are in both** (stories, story_categories, story_likes, story_saves, story_comments, story_recommendations, roadmap_templates, roadmap_template_milestones, roadmap_template_recommendations)
- **1 table has name conflict** (users — code uses it, migration creates it, but it doesn't match `user_profiles` default)
- **7 tables are missing from ALL migrations** (user_goals, circles, circle_members, messages, milestones, opportunities, saved_opportunities)

---

## Part 6: Recommended Fix

### Phase 1 — Create missing migration `00006_core_tables.sql`

Add these 7 tables that the code uses but no migration defines:

```sql
-- Missing tables that code already queries
CREATE TABLE user_goals (...);
CREATE TABLE circles (...);
CREATE TABLE circle_members (...);
CREATE TABLE messages (...);
CREATE TABLE milestones (...);
CREATE TABLE opportunities (...);
CREATE TABLE saved_opportunities (...);
```

### Phase 2 — Apply all migrations

Apply in order:
1. `00001_users.sql` — creates `users` table (will coexist with `user_profiles`)
2. `00002_cerita.sql` — stories ecosystem
3. `00003_roadmap_templates.sql` — roadmap templates
4. `00004_journals.sql` — journals
5. `00005_familia.sql` — familia
6. `00006_core_tables.sql` — **new**: circles, messages, goals, milestones, opportunities

### Phase 3 — After migration, decide on `user_profiles` vs `users`

Two options:

**Option A (Recommended):** Keep both. Drop the default `user_profiles` since `users` is what the code uses.

**Option B (Minimal change):** If `user_profiles` already has RLS/triggers configured, rename `users` → keep `user_profiles` and update the application code (`queries.ts:30`) to use `user_profiles` instead of `users`. This is more work but avoids breaking any existing default template behavior.

### Phase 4 — Regenerate TypeScript types

After migrations are applied, run:
```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

This ensures TypeScript types match the actual database schema.

---

## Migration Order

```
00001_users.sql           ─── users (core auth)
00002_cerita.sql          ─── stories + story_categories + likes/saves/comments/recommendations
00003_roadmap_templates.sql ─── roadmap_templates + milestones + recommendations
00004_journals.sql        ─── journals + entries + milestones + followers + reactions
00005_familia.sql         ─── merchants + deals + rewards + vouchers + events
00006_core_tables.sql     ─── [NEW] user_goals, circles, circle_members, messages, milestones, opportunities, saved_opportunities
```
