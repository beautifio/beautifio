-- 00007 — Add missing columns to users table
-- These were added to 00001_users.sql after initial push but need
-- to be applied to the already-deployed table.

ALTER TABLE users ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'mentor', 'admin'));
