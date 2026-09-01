-- Adds soft-delete + scheduled-publishing support to articles.
-- Required by the "publish-scheduled" cron and admin content flows in the WIP
-- code (queries articles.deleted_at / articles.scheduled_at). The self-hosted
-- VPS DB was missing these columns; this backfills the schema. Additive/nullable.
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
