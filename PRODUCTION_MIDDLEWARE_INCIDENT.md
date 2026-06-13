# Production Middleware Incident Report

## Summary

**Date:** 2026-06-12  
**Duration:** ~30 minutes (14:38–15:11 UTC+7)  
**Impact:** 100% of production requests returned HTTP 500  
**Error:** `MIDDLEWARE_INVOCATION_FAILED`  
**Root Cause:** Local `.env` file with empty Supabase credentials overrode Production project env vars during `vercel --prod` deployment.

---

## 1. Root Cause

### Chain of Events

1. **`vercel env pull` was run** to download environment variables for local development.
   - The command downloaded **Development** environment (not Production).
   - Development environment does NOT contain `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Result: `.vercel/.env.production.local` was created with **empty string values** for both Supabase vars:
     ```
     NEXT_PUBLIC_SUPABASE_URL=""
     NEXT_PUBLIC_SUPABASE_ANON_KEY=""
     ```

2. **`vercel --prod` was run** from the repo root.
   - Vercel CLI detected `.vercel/.env.production.local` and **included it in the deployment build**.
   - Local env files take precedence over project dashboard env vars in Vercel CLI deployments.
   - The empty strings overrode the actual Production Supabase credentials.

3. **Middleware failed on every request.**
   - `src/middleware.ts` calls `createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...)`.
   - `@supabase/ssr`'s `createServerClient` throws when URL or key is empty:
     ```
     Error: Your project's URL and Key are required to create a Supabase client
     ```
   - This error is thrown OUTSIDE the middleware's try/catch (which only wraps `getUser()`).
   - Vercel Edge Runtime reports `MIDDLEWARE_INVOCATION_FAILED`.

### Proof

```
# The poisoned file:
$ cat .vercel/.env.production.local
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# The vercel env pull output confirmed Development env:

> Downloading `development` Environment Variables for beautifio-s-projects/beautifio-web
> - NEXT_PUBLIC_APP_URL          (removed)
> - NEXT_PUBLIC_SUPABASE_ANON_KEY (removed)
> - NEXT_PUBLIC_SUPABASE_URL     (removed)

# Production logs showing the error:
14:42:18.80  beautifio-web.vercel.app  error  ε GET /  500
  [Error: Your project's URL and Key are required to create a Supabase client]

# Production response:
HTTP 500
A server error has occurred
MIDDLEWARE_INVOCATION_FAILED
```

---

## 2. Reproduction Steps

```bash
# Step 1: Download Development env (WRONG environment)
vercel env pull                    # defaults to 'development'

# Step 2: This creates .vercel/.env.production.local with empty Supabase vars

# Step 3: Deploy to production (picks up local file)
vercel --prod

# Result: MIDDLEWARE_INVOCATION_FAILED on every route
```

---

## 3. Evidence

| Evidence | Source |
|----------|--------|
| `.vercel/.env.production.local` with empty vars | Local filesystem |
| `vercel env pull` output showing `- NEXT_PUBLIC_SUPABASE_URL` (deleted) | CLI output |
| Vercel project dashboard has correct Production env vars | `vercel env ls` |
| All routes return `MIDDLEWARE_INVOCATION_FAILED` | curl smoke test |
| `createServerClient` throws on empty URL/key | `@supabase/ssr` source |
| `middleware.ts` try/catch only wraps `getUser()`, not `createServerClient()` | Code review |

---

## 4. Recommended Fix (Applied)

### Immediate fix (deployed):
```bash
rm -f .vercel/.env.production.local apps/web/.env.production
vercel --prod
```

### Preventative measures:
1. **Never run `vercel env pull` without `--environment production`** unless explicitly needed.
2. **Add try/catch around `createServerClient` in middleware** so empty env vars don't crash the entire site:
   ```typescript
   let supabase;
   try {
     supabase = createServerClient(url, key, options);
   } catch {
     // Return early without auth
     return NextResponse.next({ request });
   }
   ```
3. **Add a startup guard** that validates env vars before deploying:
   ```bash
   # pre-deploy check
   if grep -q 'NEXT_PUBLIC_SUPABASE_URL=""' .vercel/.env.production.local 2>/dev/null; then
     echo "ERROR: Supabase env vars are empty!"
     exit 1
   fi
   ```

---

## 5. Risk Assessment

| Factor | Rating | Notes |
|--------|--------|-------|
| Likelihood of recurrence | **Medium** | Any `vercel env pull` without `--environment production` recreates the poisoned file |
| Detection time | **Slow** | No pre-deploy validation exists; error only surfaces after aliasing |
| Blast radius | **Total** | 100% of routes affected (middleware matches all routes) |
| Recovery time | **~2 minutes** | Rollback alias + clean local env |
