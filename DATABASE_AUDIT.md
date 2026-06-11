# DATABASE AUDIT

**Date:** 2026-06-11
**Project:** Beautifio
**Supabase Project:** `sivltqvqkbaykuazwdja`

---

## EXECUTIVE SUMMARY

The database has 34 tables across 11 migrations but is in poor health:

- **1 BLOCKER**: Migration 00011 references `user_profiles` table that DOES NOT EXIST
- **2 BLOCKERS**: `big_wins` and `small_wins` have NO INSERT RLS policies — journey creation silently fails
- **20+ missing FK indexes** — will cause sequential scans as data grows
- **DATABASE_SCHEMA.md is severely outdated** — missing 11 tables from migration 00009
- **Plaintext PIN storage** — Familia voucher PIN in cleartext
- **Redundant data storage** — `users.goals` array duplicates `user_goals` table

---

## 1. SCHEMA OVERVIEW

### All Tables (34 total across 11 migrations)

| Migration | Tables Created |
|-----------|---------------|
| `00001_users.sql` | `users` |
| `00002_cerita.sql` | `story_categories`, `stories`, `story_likes`, `story_saves`, `story_comments`, `story_recommendations` |
| `00003_roadmap_templates.sql` | `roadmap_templates`, `roadmap_template_milestones`, `roadmap_template_recommendations` |
| `00004_journals.sql` | `journals`, `journal_milestones`, `journal_entries`, `journal_followers`, `journal_reactions` |
| `00005_familia.sql` | `familia_merchants`, `familia_affiliate_deals`, `familia_achievement_rewards`, `familia_voucher_sessions`, `familia_redemption_log`, `familia_user_achievements`, `familia_event_benefits` |
| `00006_core_tables.sql` | `user_goals`, `circles`, `circle_members`, `messages`, `milestones`, `opportunities`, `saved_opportunities` |
| `00009_dream_journey.sql` | `dream_templates`, `dream_journeys`, `previous_dreams`, `big_wins`, `small_wins`, `daily_activities`, `daily_reflections`, `small_win_reflections`, `big_win_reflections`, `spiritual_preferences`, `growth_timeline_events` |
| `00010_dream_journey_age.sql` | Adds columns `min_age`, `max_age` to `dream_templates` |
| `00011_human_journey_engine.sql` | Adds columns to `user_profiles` (**TABLE DOES NOT EXIST**) |

---

## 2. CRITICAL ISSUES

### 2A. BLOCKER — Migration 00011 references non-existent table

**File:** `supabase/migrations/00011_human_journey_engine.sql:11`

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;
```

**The table `user_profiles` does not exist.** The table is named `users` (migration 00001). This migration will FAIL when applied.

**Application code also references `user_profiles`:**
`apps/web/src/app/journey/page.tsx:38` queries `supabase.from("user_profiles")` — this also fails at runtime.

**Fix:** Rename `user_profiles` to `users` in both migration 00011 and `journey/page.tsx`.

### 2B. BLOCKER — big_wins has NO INSERT RLS policy

**File:** `supabase/migrations/00009_dream_journey.sql:126-136`

`big_wins` RLS is enabled with SELECT (`auth.uid() = user_id`) and UPDATE policies, but **NO INSERT policy**. Code at `journey-queries.ts:80-91` inserts into `big_wins` — this will fail with 403 Forbidden.

**Fix:** Add INSERT policy: `CREATE POLICY "Users can insert own big wins" ON big_wins FOR INSERT WITH CHECK (auth.uid() = user_id);`

### 2C. BLOCKER — small_wins has NO INSERT RLS policy

**File:** `supabase/migrations/00009_dream_journey.sql:160-170`

Same pattern as 2B. Code at `journey-queries.ts:97-103` inserts into `small_wins`.

**Fix:** Add INSERT policy for `small_wins`.

### 2D. HIGH — Plaintext PIN storage (security risk)

**Tables/Columns:**
- `familia_merchants.daily_pin` (TEXT NOT NULL DEFAULT '0000')
- `familia_voucher_sessions.pin_required` (TEXT NOT NULL DEFAULT '0000')
- `familia_redemption_log.pin_entered` (TEXT NOT NULL — stores attempted PIN)

All three store PINs in plaintext. The audit log (`pin_entered`) records raw PIN attempts, creating a security risk if the database is compromised.

**Fix:** Hash PINs server-side; never log raw PIN entries.

### 2E. HIGH — outdated DATABASE_SCHEMA.md

The schema document at `/home/taradfs/beautifio/DATABASE_SCHEMA.md` lists 29 tables and omits all 11 tables from migration 00009 (`dream_templates`, `dream_journeys`, `previous_dreams`, `big_wins`, `small_wins`, `daily_activities`, `daily_reflections`, `small_win_reflections`, `big_win_reflections`, `spiritual_preferences`, `growth_timeline_events`).

---

## 3. MISSING INDEXES

### Foreign Key Indexes (20+ missing)

Every FK should have an index on the source column to prevent sequential scans:

| Table | FK Column | Referenced Table | Severity |
|-------|-----------|-----------------|----------|
| `stories` | `author_id` | `users` | Medium |
| `story_likes` | `story_id` | `stories` | Medium |
| `story_likes` | `user_id` | `users` | Medium |
| `story_saves` | `user_id` | `users` | Medium |
| `story_comments` | `user_id` | `users` | Medium |
| `story_comments` | `parent_id` | `story_comments` | Medium |
| `journal_entries` | `milestone_id` | `journal_milestones` | Medium |
| `journal_followers` | `user_id` | `users` | Medium |
| `journal_reactions` | `user_id` | `users` | Medium |
| `familia_user_achievements` | `achievement_id` | `familia_achievement_rewards` | Medium |
| `messages` | `parent_id` | `messages` | Low |
| `saved_opportunities` | `opportunity_id` | `opportunities` | Medium |
| `dream_journeys` | `template_slug` | `dream_templates` | **High** — queried by slug |
| `previous_dreams` | `dream_journey_id` | `dream_journeys` | Low |
| `big_wins` | `journey_id` | `dream_journeys` | **High** — queried by journey_id |
| `small_wins` | `big_win_id` | `big_wins` | **High** — queried by big_win_id |
| `daily_activities` | `journey_id` | `dream_journeys` | **High** — queried by journey_id |
| `daily_reflections` | `journey_id` | `dream_journeys` | Medium |
| `small_win_reflections` | `small_win_id` | `small_wins` | Low |
| `big_win_reflections` | `big_win_id` | `big_wins` | Low |
| `growth_timeline_events` | `journey_id` | `dream_journeys` | Medium |

### Query Pattern Indexes (missing)

| Table | Column(s) | Query Pattern | File:Line | Severity |
|-------|-----------|---------------|-----------|----------|
| `dream_journeys` | `status` | `.eq("status", "active")` | `journey-queries.ts:29` | **High** |
| `dream_journeys` | `user_id` | `.eq("user_id", userId)` | `journey-queries.ts:29,121` | **High** |
| `daily_activities` | `user_id` + `activity_date` | `.eq("user_id")` + `.eq("activity_date")` | `journey-queries.ts:202` | **High** |
| `stories` | `is_published` | RLS filter `.eq("is_published", true)` | RLS policy | Medium |
| `opportunities` | `is_active` | RLS filter | RLS policy | Medium |

---

## 4. UNUSED TABLES

The following tables are defined in migrations but NEVER queried in application code:

| Table | Migration | Evidence |
|-------|-----------|----------|
| `previous_dreams` | 00009 | No `.from("previous_dreams")` anywhere |
| `small_win_reflections` | 00009 | No `.from("small_win_reflections")` anywhere |
| `big_win_reflections` | 00009 | No `.from("big_win_reflections")` anywhere |
| `story_recommendations` | 00002 | `getStoryRecommendations` defined in queries.ts but NEVER imported/called in pages |
| `roadmap_template_recommendations` | 00003 | `getRoadmapTemplateRecommendations` defined but NEVER imported/called in pages |

---

## 5. UNUSED COLUMNS

| Table | Column | Evidence |
|-------|--------|----------|
| `stories` | `deleted_at` | Soft delete not implemented |
| `users` | `interests` | Written in `queries.ts:30`, never read |
| `users` | `goals` | Written, never read (replaced by `user_goals` table) |
| `users` | `is_verified` | Never read in code |
| `journals` | `reaction_count` | No trigger auto-updates it |
| `journals` | `roadmap_slug` | Written, never read |
| `familia_merchants` | `cover_url` | Never read |
| `familia_merchants` | `total_expired` | Written by seed, never updated |
| `messages` | `parent_id` | Threading not implemented |
| `messages` | `is_pinned` | Never used |
| `daily_activities` | `is_custom` | Written (false default), never read |
| `growth_timeline_events` | `reference_id` | Never written or read |
| `growth_timeline_events` | `reference_type` | Never written or read |
| `growth_timeline_events` | `metadata` | Never written or read |

---

## 6. DATA REDUNDANCY

### `users.goals` vs `user_goals` table

The `users` table has `goals TEXT[]` (migration 00001). There is also a dedicated `user_goals` table (migration 00006). Code at `queries.ts:30` writes to `users.goals`, while `onboarding/page.tsx:249` writes to `user_goals`. These can become inconsistent.

**Fix:** Remove `users.goals` column; use only the `user_goals` table.

### Dual storage (Supabase + localStorage)

Several features store data in BOTH Supabase and localStorage:
- Journals: `journals` table + `getStoredJournals` localStorage
- Reflections: `daily_reflections` + localStorage
- Habits/streaks: localStorage ONLY

No sync mechanism exists when the two disagree.

---

## 7. RLS POLICY GAPS

### Tables with Missing INSERT/UPDATE/DELETE Policies

| Table | Missing INSERT | Missing UPDATE | Missing DELETE | Impact |
|-------|---------------|---------------|---------------|--------|
| `big_wins` | **YES** | Has | Has | **BLOCKER** — journey creation fails |
| `small_wins` | **YES** | Has | Has | **BLOCKER** — journey creation fails |
| `story_categories` | **YES** | **YES** | **YES** | Admin-only — needs admin role check |
| `stories` | **YES** | **YES** | **YES** | Users cannot publish stories |
| `story_recommendations` | **YES** | **YES** | **YES** | Admin-only — acceptable |
| `roadmap_templates` | **YES** | **YES** | **YES** | Admin-only — acceptable |
| `circles` | **YES** | **YES** | **YES** | Users cannot create circles |
| `circle_members` | Has | **YES** | **YES** | Users cannot leave circles (no DELETE) |
| `messages` | Has | **YES** | **YES** | Users cannot edit/delete messages |
| `milestones` | **YES** | Has | **YES** | Users cannot create milestones |
| `opportunities` | **YES** | **YES** | **YES** | Admin-only — acceptable |

---

## 8. MIGRATION HEALTH

### Migration Replay Issues

| Migration | Issue | Severity |
|-----------|-------|----------|
| `00005` | Seed data INSERTs have no `ON CONFLICT` clause — will fail on replay with duplicate key violations | Medium |
| `00008` | Depends on `role` column from `00007` — ordering is correct | OK |
| `00009` | `dream_templates` seed may conflict with existing data | Medium |
| `00011` | References `user_profiles` — **TABLE DOES NOT EXIST** | **BLOCKER** |

### DATABASE_SCHEMA.md Out-of-Date

- Claims 29 tables; actual count is 34
- Missing all 11 dream journey tables from migration 00009
- Missing migrations 00007 through 00011 entirely

---

## 9. N+1 QUERY PATTERNS

### Pattern 1 — CRITICAL: createJourney() loop inserts

**File:** `journey-queries.ts:78-105`

For each big win (N), inserts into `big_wins`, then for each small win (M), inserts into `small_wins`. For a template with 5 big wins × 4 small wins = 1 + 5 + 20 = **26 round-trips**.

**Fix:** Use batch inserts: `supabase.from("big_wins").insert([...bigWinsData]).select()` + `supabase.from("small_wins").insert([...smallWinsData])`.

### Pattern 2 — HIGH: getJourneyProgress() sequential sub-queries

**File:** `journey-queries.ts:365-397`

Calls `getBigWins` → `getTodayActivities` → `getTodayReflection` sequentially inside the function, but callers (`journey/[id]/page.tsx:87-94`) also parallelize these same queries with `Promise.all`.

**Fix:** Parallelize inside `getJourneyProgress` or remove it and let callers compose the queries.

### Pattern 3 — MEDIUM: handleCompleteSmallWin refetch chain

**File:** `journey/[id]/page.tsx:167-188`

After completing a small win, refetches ALL big wins, then conditionally refetches again after big win completion. Up to 4 sequential queries.

---

## 10. DATA TYPE ISSUES

| Table | Column | Current Type | Problem |
|-------|--------|-------------|---------|
| `story_recommendations` | `resource_id` | `TEXT` | Stores UUIDs as text — no referential integrity |
| `roadmap_template_recommendations` | `resource_id` | `TEXT` | Same issue |
| `dream_templates` | `career_options` | `TEXT[]` | Array type hard to query; other complex data uses JSONB |
| `familia_merchants` | `daily_pin` | `TEXT` | **Security**: plaintext PIN |
| `familia_voucher_sessions` | `pin_required` | `TEXT` | **Security**: plaintext PIN |
| `familia_redemption_log` | `pin_entered` | `TEXT` | **Security**: plaintext PIN audit log |

---

## 11. RECOMMENDATIONS

### P0 — Fix Before Beta

1. Fix migration 00011 — change `user_profiles` to `users`
2. Fix `journey/page.tsx` — change `supabase.from("user_profiles")` to `supabase.from("users")`
3. Add INSERT RLS policy for `big_wins`
4. Add INSERT RLS policy for `small_wins`
5. Add FK indexes on: `dream_journeys(template_slug)`, `big_wins(journey_id)`, `small_wins(big_win_id)`, `daily_activities(journey_id)`, `dream_journeys(user_id)`, `dream_journeys(status)`
6. Rewrite `createJourney()` N+1 loop to batch inserts

### P1 — Before Beta

7. Add remaining FK indexes (20+ total)
8. Hash Familia PINs; remove PIN audit log
9. Update DATABASE_SCHEMA.md to reflect actual 34-table schema
10. Add INSERT policies for `milestones`
11. Add DELETE policy for `circle_members`

### P2 — Post-Beta

12. Remove unused tables: `previous_dreams`, `small_win_reflections`, `big_win_reflections` (or implement them)
13. Remove `users.goals` column (use `user_goals` table exclusively)
14. Add `ON CONFLICT` to seed INSERTs in migrations
15. Implement proper sync or choose single storage layer for journals/reflections
