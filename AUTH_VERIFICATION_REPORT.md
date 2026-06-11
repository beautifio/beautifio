# AUTH VERIFICATION REPORT

**Date:** 2026-06-11
**Project:** Beautifio
**Supabase URL:** `https://sivltqvqkbaykuazwdja.supabase.co`
**Auth Method:** Supabase GoTrue + PostgREST (anon key)

---

## 1. Can connect to Supabase

| Result | Detail |
|--------|--------|
| **PASS** | Supabase REST API is reachable (HTTP 401 on root — expected without `service_role` key) |

---

## 2. `users` table exists

| Result | Detail |
|--------|--------|
| **FAIL** | Table `public.users` does **not** exist (HTTP 404: "Could not find the table 'public.users' in the schema cache") |

**Root cause:** The migration `supabase/migrations/00001_users.sql` has **never been applied** to this Supabase project.

**Evidence:**
- The database has a default `public.user_profiles` table (created by Supabase template — returns `[]` empty), which is **not** the one used by the code.
- All 5 migrations (`00001_users.sql` through `00005_familia.sql`) define tables (`users`, `story_categories`, `stories`, `roadmap_templates`, etc.) — **none of them exist in the database**.

**Impact:** Every table, function, trigger, and RLS policy defined in `/supabase/migrations/` is absent from the production database.

---

## 3. `handle_new_user` function exists

| Result | Detail |
|--------|--------|
| **FAIL** | Cannot verify — no `service_role` key available. Function is not exposed as an RPC endpoint. |

Even if it existed, the function references `public.users` — a table that doesn't exist — so it would fail at runtime.

---

## 4. `on_auth_user_created` trigger exists

| Result | Detail |
|--------|--------|
| **FAIL** | Same as function. Cannot verify. Defined in `00001_users.sql:40-43` but migration was never applied. |

---

## 5. Register flow works

| Result | Detail |
|--------|--------|
| **PASS** (logic) | The GoTrue `/auth/v1/signup` endpoint is alive and responds. Hit rate limit (429: `over_email_send_rate_limit`) after first attempt. |

The registration system **is functional** at the Supabase Auth level. GoTrue accepts the payload and attempts to send a confirmation email. However, since the trigger function does not exist in the database, **no user profile row would be created** upon registration.

---

## 6. Login flow works

| Result | Detail |
|--------|--------|
| **PASS** (logic) | The GoTrue `/auth/v1/token?grant_type=password` endpoint is alive and responds correctly (400: "Invalid login credentials" for non-existent user). |

---

## 7. Session persistence works

| Result | Detail |
|--------|--------|
| **SKIPPED** | Cannot test without a successful register/login session. |

---

## 8. Logout works

| Result | Detail |
|--------|--------|
| **SKIPPED** | Cannot test without a successful register/login session. |

---

## 9. User profile row automatically created

| Result | Detail |
|--------|--------|
| **FAIL** | **Cannot work.** Two blocking issues: |

**Root cause chain:**
1. `users` table does not exist in the database
2. `handle_new_user()` function is not deployed
3. `on_auth_user_created` trigger is not deployed
4. Even if deployed, the trigger function inserts into `public.users` — but the database has `public.user_profiles` instead
5. The application code in `src/lib/supabase/queries.ts:30` queries `"users"` — which will also fail

---

## Critical Issues Summary

| # | Issue | Severity | Fix Required |
|---|-------|----------|-------------|
| 1 | **Migrations never applied** — all 5 SQL migration files exist in codebase but were never run against Supabase | **CRITICAL** | Run `supabase db push` or apply migrations via Supabase Dashboard SQL Editor |
| 2 | **Table name mismatch** — migration creates `users`, database has default `user_profiles` | **HIGH** | Verify which table name to use. Either drop `user_profiles` and create `users` via migration, or rename all migrations to use `user_profiles` |
| 3 | **Code references `"users"`** — `src/lib/supabase/queries.ts:30` uses `client.from("users")` | **HIGH** | Must match actual table name in database after migrations are applied |
| 4 | **No service_role key available** — can't verify DB functions/triggers or manage users via admin API | **MEDIUM** | Store in `.env.local` (gitignored) for local development |

---

## Recommendation

1. **Run all migrations** against the Supabase project:
   - Use `supabase db push` (if using Supabase CLI)
   - Or run each `.sql` file in order via Supabase Dashboard > SQL Editor

2. **After migrations**, re-run this verification to confirm:
   - `users` table exists with correct schema
   - `handle_new_user()` function is registered
   - `on_auth_user_created` trigger fires on new signup
   - Auto-profile-creation works end-to-end
