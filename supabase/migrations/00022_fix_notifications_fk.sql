-- 00022 — Fix notifications.user_id FK to reference public.users (not auth.users).
--
-- Root cause: the app uses custom JWT auth (public.users), NOT Supabase Auth
-- (auth.users). notifications.user_id FK referenced auth.users, so every
-- create_notification call for a public.users user failed → 11 triggers
-- (trg_bisik_new_match, trg_tebak_result, etc.) failed → bisik_chats inserts
-- rolled back → Bisik bot matches never created a chat ("bot not active").
--
-- Fix: re-point the FK to public.users. Safe: notifications has 0 rows.

BEGIN;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;

NOTIFY pgrst, 'reload schema';
