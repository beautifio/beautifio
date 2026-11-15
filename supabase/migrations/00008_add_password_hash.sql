-- 00008 — Custom JWT auth: password_hash + reset tokens
-- (gabungan: kolom password_hash untuk users + tabel token reset satu kali pakai)

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- We no longer create rows in auth.users, so the FK on users.id must go and the
-- column needs its own default UUID. Otherwise every custom-auth signup fails.
DO $$
DECLARE fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
    AND contype = 'f'
    AND confrelid = 'auth.users'::regclass
  LIMIT 1;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- NOTE: we intentionally KEEP the `on_auth_user_created` trigger. This Supabase
-- instance is shared with other apps that still use Supabase Auth; dropping the
-- trigger would stop their new signups from getting a public.users profile.
-- Beautifio simply no longer inserts into auth.users, so the trigger never fires
-- for us. Dropping the FK (above) is safe: it only relaxes a constraint.

-- One-time password reset tokens (custom auth, no Supabase Auth).
-- Only a SHA-256 hash is stored; the raw token goes into the email link.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
