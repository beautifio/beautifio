-- 00012 — Subscription CHECK constraints out of sync with application code.
--
-- Found while testing the real purchase flow end-to-end:
--   POST /api/payment/subscribe -> 500
--   "new row for relation \"user_subscriptions\" violates check constraint
--    user_subscriptions_status_check"
--
-- The app creates subscriptions with status='pending' and the whole
-- confirm/callback flow depends on that state, but the DB only allowed
-- ('active','expired','cancelled').
--
-- Also: the admin plan editor offers 'quarterly' and 'lifetime' durations
-- (DURATION_MAP) and payment/subscribe handles 'quarterly', but the DB CHECK
-- only allowed daily/monthly/yearly — creating those plans would fail.

BEGIN;

ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_status_check
  CHECK (status IN ('pending', 'active', 'expired', 'cancelled'));

ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_duration_type_check;
ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_duration_type_check
  CHECK (duration_type IN ('daily', 'monthly', 'quarterly', 'yearly', 'lifetime'));

COMMIT;

NOTIFY pgrst, 'reload schema';
