-- 00011 — Column/schema drift + missing RPC found by the full feature audit.
--
-- The app references 40 columns that do not exist on their (existing) tables.
-- Those queries only run on user interaction (insert/update/select), which is
-- why GET page probes returned 200 but clicking buttons failed with PGRST204
-- ("Could not find the 'x' column of 'y' in the schema cache").
--
-- Also fixes:
--  * beautifio_care_tickets.user_id FK pointed at auth.users (schema not
--    exposed by PostgREST) -> embedding `users:user_id(...)` failed with 500.
--  * RPC care_assign_ai was referenced by lib/care/ai-actions.ts but missing.
--
-- All changes are additive / idempotent. Backup taken before applying.

BEGIN;

-- 1. Missing columns -------------------------------------------------------
ALTER TABLE public.bisik_chats
  ADD COLUMN IF NOT EXISTS report_reason TEXT,
  ADD COLUMN IF NOT EXISTS report_detail TEXT;

ALTER TABLE public.care_chat_sessions
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by TEXT;

ALTER TABLE public.care_officers
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.curhat_posts
  ADD COLUMN IF NOT EXISTS user_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.dream_journeys
  ADD COLUMN IF NOT EXISTS current_phase_number INT NOT NULL DEFAULT 1;

ALTER TABLE public.familia_affiliate_deals
  ADD COLUMN IF NOT EXISTS hot_deal_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partners JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hot_deal_order INT;

ALTER TABLE public.familia_event_benefits
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quota INT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS partner_name TEXT,
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS registration_url TEXT;

ALTER TABLE public.familia_merchants
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS report_token TEXT,
  ADD COLUMN IF NOT EXISTS promo_get TEXT,
  ADD COLUMN IF NOT EXISTS free_product_name TEXT,
  ADD COLUMN IF NOT EXISTS promo_buy TEXT,
  ADD COLUMN IF NOT EXISTS redeem_minutes INT NOT NULL DEFAULT 0;

-- Widely used: nearly every notification insert sends `data: {...}`.
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS type TEXT;

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS original_price_idr NUMERIC;

ALTER TABLE public.tebak_sessions
  ADD COLUMN IF NOT EXISTS player_a_ready BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS player_b_ready BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

-- 2. FK for PostgREST embedding -------------------------------------------
-- Verified 0 orphan rows before applying. Other apps' auth.users FKs are
-- deliberately left untouched.
ALTER TABLE public.beautifio_care_tickets
  DROP CONSTRAINT IF EXISTS beautifio_care_tickets_user_id_fkey;
ALTER TABLE public.beautifio_care_tickets
  ADD CONSTRAINT beautifio_care_tickets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Missing RPC -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.care_assign_ai(
  p_session_id    UUID,
  p_officer_id    UUID,
  p_category      TEXT,
  p_intro_message TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.care_chat_sessions
     SET officer_id = p_officer_id,
         is_ai_officer = true,
         ai_category_override = p_category,
         status = 'active',
         updated_at = now()
   WHERE id = p_session_id
     AND status = 'waiting';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.care_chat_messages
    (session_id, sender_id, sender_role, content, is_read)
  VALUES
    (p_session_id, p_officer_id, 'officer', p_intro_message, false);

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.care_assign_ai(UUID, UUID, TEXT, TEXT)
  TO anon, authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
