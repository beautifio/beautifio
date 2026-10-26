-- Removes the abandoned Lucia auth tables. The app converged back on Supabase Auth
-- (auth.users -> public.users.role); see commit "fix(auth): converge on Supabase Auth".
-- Verified before dropping: both tables held 0 rows, no foreign keys pointed at them,
-- and no function or view referenced them.
DROP TABLE IF EXISTS public.auth_sessions;
DROP TABLE IF EXISTS public.auth_users;
