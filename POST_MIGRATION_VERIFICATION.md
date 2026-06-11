# POST-MIGRATION VERIFICATION

**Project:** Beautifio
**Date:** 2026-06-11

Run these checks after all migrations are applied to confirm the database matches what the application expects.

---

## 1. Tables Exist

Run in Supabase SQL Editor:

```sql
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected (29 tables):**

| # | Table | Source |
|---|-------|--------|
| 1 | `circle_members` | 00006 |
| 2 | `circles` | 00006 |
| 3 | `familia_achievement_rewards` | 00005 |
| 4 | `familia_affiliate_deals` | 00005 |
| 5 | `familia_event_benefits` | 00005 |
| 6 | `familia_merchants` | 00005 |
| 7 | `familia_redemption_log` | 00005 |
| 8 | `familia_user_achievements` | 00005 |
| 9 | `familia_voucher_sessions` | 00005 |
| 10 | `journal_entries` | 00004 |
| 11 | `journal_followers` | 00004 |
| 12 | `journal_milestones` | 00004 |
| 13 | `journal_reactions` | 00004 |
| 14 | `journals` | 00004 |
| 15 | `messages` | 00006 |
| 16 | `milestones` | 00006 |
| 17 | `opportunities` | 00006 |
| 18 | `roadmap_template_milestones` | 00003 |
| 19 | `roadmap_template_recommendations` | 00003 |
| 20 | `roadmap_templates` | 00003 |
| 21 | `saved_opportunities` | 00006 |
| 22 | `stories` | 00002 |
| 23 | `story_categories` | 00002 |
| 24 | `story_comments` | 00002 |
| 25 | `story_likes` | 00002 |
| 26 | `story_recommendations` | 00002 |
| 27 | `story_saves` | 00002 |
| 28 | `user_goals` | 00006 |
| 29 | `users` | 00001 |

**Fail condition:** Any table missing = migration was not applied.

---

## 2. Functions Exist

```sql
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prokind = 'f';
```

**Expected:**

| Function | Source |
|----------|--------|
| `handle_new_user` | 00001 |
| `update_journal_entry_count` | 00004 |
| `update_journal_follower_count` | 00004 |

---

## 3. Triggers Exist

```sql
SELECT tgname, relname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE NOT tgisinternal;
```

**Expected:**

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |
| `journal_entries_count_trigger` | `journal_entries` | AFTER INSERT OR DELETE | `update_journal_entry_count()` |
| `journal_followers_count_trigger` | `journal_followers` | AFTER INSERT OR DELETE | `update_journal_follower_count()` |

---

## 4. RLS Policies Exist

```sql
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected policy count:** ~45 policies across all 29 tables.

**Key policies to verify:**

| Table | Policy Name | Command |
|-------|-------------|---------|
| `users` | `Users can view own profile` | SELECT |
| `users` | `Users can update own profile` | UPDATE |
| `users` | `System can insert profiles` | INSERT |
| `stories` | `Published stories are public` | SELECT |
| `circle_members` | `Members can view own memberships` | SELECT |
| `circle_members` | `Users can join circles` | INSERT |
| `messages` | `Messages are viewable by circle members` | SELECT |
| `messages` | `Circle members can send messages` | INSERT |
| `familia_merchants` | `Admins can manage merchants` | ALL |
| `familia_voucher_sessions` | `Admins can view all sessions` | ALL |

---

## 5. Auth Profile Creation Works

Test that `handle_new_user()` trigger fires on signup.

### Step 5a: Create a test user via API

```bash
curl -X POST "https://sivltqvqkbaykuazwdja.supabase.co/auth/v1/signup" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"verify-test@example.com","password":"TestPass123!","data":{"full_name":"Verify Test"}}'
```

### Step 5b: Login and check profile

```bash
# Login
curl -X POST "https://sivltqvqkbaykuazwdja.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"verify-test@example.com","password":"TestPass123!"}'

# Use the returned access_token to query users table
curl -s "https://sivltqvqkbaykuazwdja.supabase.co/rest/v1/users?select=id,email,full_name" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer ACCESS_TOKEN_FROM_LOGIN"
```

**Expected:** A row exists with:
- `email` = `verify-test@example.com`
- `full_name` = `Verify Test`

**Fail condition:** Profile not created = trigger not firing or function broken.

### Step 5c: Verify auto-profile via SQL

```sql
SELECT id, email, full_name, created_at
FROM users
WHERE email = 'verify-test@example.com';
```

---

## 6. RLS Works End-to-End

### Anon user (no auth):

```bash
# Story categories should be public
curl -s "https://sivltqvqkbaykuazwdja.supabase.co/rest/v1/story_categories" \
  -H "apikey: YOUR_ANON_KEY"

# Users table should return 401 (unauthorized)
curl -s "https://sivltqvqkbaykuazwdja.supabase.co/rest/v1/users" \
  -H "apikey: YOUR_ANON_KEY"
```

### Authenticated user (with valid token):

```bash
# Should only see own profile
curl -s "https://sivltqvqkbaykuazwdja.supabase.co/rest/v1/users?id=eq.YOUR_USER_ID" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Indexes Exist

Verify key performance indexes exist:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
```

**Key indexes to spot-check:**

| Index | Table | Purpose |
|-------|-------|---------|
| `idx_stories_slug` | stories | Story lookup by slug |
| `idx_stories_published_at` | stories | Published story ordering |
| `idx_user_goals_user` | user_goals | Filter goals by user |
| `idx_circle_members_user` | circle_members | Find user's circles |
| `idx_messages_circle` | messages | Load circle messages |
| `idx_opportunities_active` | opportunities | Active opportunity listing |
| `idx_familia_voucher_user` | familia_voucher_sessions | User's voucher lookup |

---

## 8. Realtime Enabled

```sql
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

**Expected:** `messages` is in the publication list.

---

## Quick Smoke Test (SQL Editor)

Run this single query to verify the core tables:

```sql
SELECT 'users' AS tbl, count(*) AS row_count FROM users
UNION ALL SELECT 'user_goals', count(*) FROM user_goals
UNION ALL SELECT 'circles', count(*) FROM circles
UNION ALL SELECT 'circle_members', count(*) FROM circle_members
UNION ALL SELECT 'messages', count(*) FROM messages
UNION ALL SELECT 'milestones', count(*) FROM milestones
UNION ALL SELECT 'opportunities', count(*) FROM opportunities
UNION ALL SELECT 'saved_opportunities', count(*) FROM saved_opportunities
UNION ALL SELECT 'story_categories', count(*) FROM story_categories
UNION ALL SELECT 'stories', count(*) FROM stories
UNION ALL SELECT 'roadmap_templates', count(*) FROM roadmap_templates
UNION ALL SELECT 'journals', count(*) FROM journals
UNION ALL SELECT 'familia_merchants', count(*) FROM familia_merchants;
```

Expected: All 14 tables return successfully (even if 0 rows).
