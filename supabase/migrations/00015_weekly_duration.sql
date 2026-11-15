-- 00015 — Allow 'weekly' subscription plans.
--
-- The upgrade UI now offers Mingguan / Bulanan / Tahunan and the student
-- pricing plan (docs/pricing-2026.md) prices a weekly plan at Rp 12.000 so
-- 4 weeks (Rp 48.000) is marginally cheaper than a monthly plan (Rp 49.000),
-- removing the commitment barrier for trial users.
--
-- 00012 already widened this constraint; keep it additive + idempotent.

BEGIN;

ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_duration_type_check;
ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_duration_type_check
  CHECK (duration_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'));

COMMIT;

NOTIFY pgrst, 'reload schema';
