-- Migration: Auto-expire subscriptions and payment confirm verification.
-- Fixes: getUserTier expiry bug, auto-expire mechanism, payment confirm without verification.

-- =============================================================================
-- HELPER: Auto-expire stale subscriptions (called inline by getUserTier)
-- =============================================================================
CREATE OR REPLACE FUNCTION expire_stale_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
END;
$$;

-- =============================================================================
-- RPC: increment_subscription_voucher_count (for callback-safe counting)
-- =============================================================================
CREATE OR REPLACE FUNCTION increment_subscription_voucher_count(p_voucher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subscription_vouchers
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_voucher_id;
END;
$$;

-- =============================================================================
-- RPC: get_user_max_chats — ensure default for no-subscription is 20
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_max_chats(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max int;
BEGIN
  SELECT COALESCE(sp.max_active_chats, 20) INTO v_max
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id AND us.status = 'active' AND us.expires_at > NOW()
  LIMIT 1;
  RETURN COALESCE(v_max, 20);
END;
$$;
