# Beautifio: full migration off Supabase → Prisma + own stack

Decision (user, 2026-10-26): move beautifio **fully off Supabase** to **Prisma ORM +
own Postgres + own auth/realtime/storage**. No Supabase at the end. Staged, over
multiple sessions. The live site stays on Supabase until the Stage-6 cutover.

**Prisma here = classic Prisma ORM v6** (`prisma` + `@prisma/client`), NOT Prisma
Composer. The `prisma@8.0.0-rc` that was in package.json resolves to `@prisma/composer`
(a different product) and was replaced.

## Stage 1 — Postgres + Prisma foundation  ✅ DONE
- `beautifio-pg`: dedicated Postgres (`supabase/postgres:15.8.1.085`) on VPS, network
  `beautifio-db-net`, volume `beautifio-pg-data`, password in `/root/.beautifio-pg-pw`.
  Isolated; live site untouched.
- Loaded the shared DB's `public` schema into it (176 tables, 107 users). Cross-schema
  FKs to `auth.*` were dropped (27) — in the own-auth model `users` becomes standalone.
- `apps/web/prisma/schema.prisma`: introspected (176 models). **TODO: prune to beautifio's
  ~94 tables** (drop stadione_/halobugar/beautycenter/platform/pos models).
- `apps/web/src/lib/prisma.ts`: client singleton. `DATABASE_URL` documented in
  `deploy/.env.production.example`.

## Stage 2 — Query layer: `supabase.from()` → Prisma  (167 files)
Incremental. Start with read-only, low-risk pages (inspirasi, home), keep behavior.
Prisma connects as a privileged role and **bypasses RLS**, so every query that returns
user-scoped data must add explicit `where` filters — RLS no longer protects us.

## Stage 3 — Auth (own)  (login/register + middleware + 42 users)
GoTrue stores **bcrypt** hashes in `auth.users`. Migrate email+hash into our own
`users`/credentials table and verify with bcrypt → **no password reset for the 42 users**.
JWT session cookies signed by us. Replace `middleware.ts` session check accordingly.

## Stage 4 — Realtime (own)  (14 files: bisik chat, tebak game, NotificationBell)
Stand up a small WebSocket service (or Postgres LISTEN/NOTIFY + SSE). Replace
`supabase.channel(...)` / `postgres_changes` usages.

## Stage 5 — Storage (own)  (4 files)
MinIO already runs on the VPS. Use S3 SDK for upload/getPublicUrl paths.

## Stage 6 — Cutover
Point app at own Postgres/auth/realtime/storage, rebuild, verify, then decommission
beautifio's use of Supabase. Brief downtime + session logout.

## Verify each stage
Keep `/`, `/home`, `/inspirasi`, `/bisik`, `/profil`, `/admin`, login, and the 3 crons
working after every stage; test in an incognito window before calling a stage done.
