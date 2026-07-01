-- Migration: Smart bots with DISC personality + Bisik invite system.
-- Applied: ALTER TABLE + CREATE TABLE + triggers + bot_config UPDATEs.

ALTER TABLE users ADD COLUMN IF NOT EXISTS bot_config JSONB;

CREATE TABLE IF NOT EXISTS bisik_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'tebak' CHECK (source IN ('tebak', 'bisik')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user, to_user, source, status)
);

CREATE OR REPLACE FUNCTION expire_bisik_invites()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN UPDATE bisik_invites SET status = 'expired' WHERE status = 'pending' AND created_at < NOW() - INTERVAL '48 hours'; END; $$;

CREATE OR REPLACE FUNCTION expire_pro_tebak_chats()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN DELETE FROM bisik_chats WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW() AND NOT EXISTS (SELECT 1 FROM bisik_messages WHERE chat_id = bisik_chats.id); END; $$;

-- Update existing bots with DISC personalities (5 per type, 20 total)
-- D bots 001-005, I bots 01f-023, S bots 05b-05f, C bots 07b-07f
-- See supabase/migrations/20260622142800_tebak_bots.sql for original bot IDs
