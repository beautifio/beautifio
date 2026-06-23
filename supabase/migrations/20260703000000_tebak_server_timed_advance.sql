-- Migration: Server-Timed Game Advancement
-- Adds a timestamp to tebak_sessions to dictate when the game should advance.
-- This makes the server the source of truth for game flow timing.

-- 1. Add the advance_at column to tebak_sessions
ALTER TABLE public.tebak_sessions
ADD COLUMN advance_at TIMESTAMPTZ;

-- 2. Create an RPC to set this timestamp atomically
CREATE OR REPLACE FUNCTION set_session_advance_at(p_session_id UUID, p_delay_seconds INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tebak_sessions
  SET advance_at = NOW() + (p_delay_seconds * INTERVAL '1 second')
  WHERE id = p_session_id;
END;
$$;

-- 3. Update RLS policies to allow players to read/update this new column
DROP POLICY IF EXISTS "players can update their session" ON public.tebak_sessions;
CREATE POLICY "players can update their session" ON public.tebak_sessions
  FOR UPDATE USING (player_a_id = auth.uid() OR player_b_id = auth.uid());

-- 4. Re-add table to realtime publication to ensure changes are broadcast
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.tebak_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tebak_sessions;
