-- Migration: Rematch Feature for Tebak Aku
-- Creates a table to handle rematch offers between players.

CREATE TYPE rematch_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE public.tebak_rematch_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_session_id UUID NOT NULL REFERENCES public.tebak_sessions(id) ON DELETE CASCADE,
    offered_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    offered_to_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status rematch_status NOT NULL DEFAULT 'pending',
    new_session_id UUID REFERENCES public.tebak_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 seconds',

    CONSTRAINT unique_pending_offer UNIQUE (original_session_id, offered_by_id, offered_to_id)
);

-- Enable RLS
ALTER TABLE public.tebak_rematch_offers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Players can read their own offers"
ON public.tebak_rematch_offers
FOR SELECT
USING (offered_by_id = auth.uid() OR offered_to_id = auth.uid());

CREATE POLICY "Player can insert an offer"
ON public.tebak_rematch_offers
FOR INSERT
WITH CHECK (offered_by_id = auth.uid());

CREATE POLICY "Player can update (respond to) an offer"
ON public.tebak_rematch_offers
FOR UPDATE
USING (offered_to_id = auth.uid());

-- Add table to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tebak_rematch_offers;
