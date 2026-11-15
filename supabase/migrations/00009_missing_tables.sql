-- 00009 — Tables referenced by the app but missing from the production DB.
--
-- These 10 tables are used by .from("...") calls across the codebase but had
-- no CREATE TABLE in any migration and did not exist in any schema/DB on the
-- VPS. PostgREST returned PGRST205 ("Could not find the table ... in the
-- schema cache") for each of them. Columns are derived from the actual
-- insert/select/update usage in apps/web/src.
--
-- All statements are additive (IF NOT EXISTS / CREATE POLICY guarded by DO)
-- and run in one transaction. Safe on the shared Supabase instance: it only
-- creates NEW tables; no existing object is altered.
--
-- NOTE: `avatars` is a STORAGE BUCKET (supabase.storage.from), not a table —
-- handled separately, not here.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tes Arah Hidup results
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_test_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module        TEXT NOT NULL,
  answers       JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_pro        BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_test_results_user ON public.user_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_test_results_module ON public.user_test_results(user_id, module);

-- ---------------------------------------------------------------------------
-- 2. Article series (admin konten)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.series (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  cover_image  TEXT NOT NULL DEFAULT '',
  category_id  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Consultation pricing / vouchers / sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_pricing (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT,
  description      TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  net_price        NUMERIC NOT NULL DEFAULT 0,
  gross_price      NUMERIC NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultation_vouchers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL DEFAULT 'nominal' CHECK (discount_type IN ('percentage','nominal')),
  discount_value  NUMERIC NOT NULL DEFAULT 0,
  max_uses        INT,
  used_count      INT NOT NULL DEFAULT 0,
  valid_until     DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultation_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  psychologist_id   UUID REFERENCES public.psychologists(id) ON DELETE SET NULL,
  duration_minutes  INT NOT NULL DEFAULT 60,
  net_price         NUMERIC NOT NULL DEFAULT 0,
  gross_price       NUMERIC NOT NULL DEFAULT 0,
  voucher_code      TEXT,
  payment_reference TEXT,
  status            TEXT NOT NULL DEFAULT 'pending_payment',
  scheduled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user ON public.consultation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_psy ON public.consultation_sessions(psychologist_id);

-- ---------------------------------------------------------------------------
-- 4. Subscription vouchers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_vouchers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL DEFAULT 'nominal' CHECK (discount_type IN ('percentage','nominal')),
  discount_value  NUMERIC NOT NULL DEFAULT 0,
  min_tier        TEXT,
  max_uses        INT,
  used_count      INT NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ,
  valid_until     DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 5. Event registrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES public.familia_event_benefits(id) ON DELETE SET NULL,
  user_id           UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name              TEXT,
  email             TEXT,
  whatsapp          TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  invoice_id        TEXT,
  promo_code        TEXT,
  payment_proof_url TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_invoice ON public.event_registrations(invoice_id);

-- ---------------------------------------------------------------------------
-- 6. Mitra applications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mitra_applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL DEFAULT 'care_volunteer',
  status            TEXT NOT NULL DEFAULT 'pending_review',
  full_name         TEXT,
  email             TEXT,
  phone             TEXT,
  motivation        TEXT,
  category          TEXT,
  specialization    TEXT[] NOT NULL DEFAULT '{}',
  credentials       TEXT,
  experience_years  INT NOT NULL DEFAULT 0,
  bank_name         TEXT,
  account_number    TEXT,
  account_holder    TEXT,
  admin_notes       TEXT,
  reviewed_by       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mitra_applications_user ON public.mitra_applications(user_id);

-- ---------------------------------------------------------------------------
-- 7. Merchant tracking events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.familia_merchant_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id  UUID REFERENCES public.familia_merchants(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_familia_merchant_events_merchant ON public.familia_merchant_events(merchant_id, event);

-- ---------------------------------------------------------------------------
-- 8. Article reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL DEFAULT 'user_report',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_article_reports_article ON public.article_reports(article_id);

-- ---------------------------------------------------------------------------
-- Grants (Supabase PostgREST roles). Explicit so new tables are reachable.
-- ---------------------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_test_results','series','consultation_pricing','consultation_vouchers',
    'consultation_sessions','subscription_vouchers','event_registrations',
    'mitra_applications','familia_merchant_events','article_reports'
  ] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- RLS. Our bf_session -> PostgREST JWT populates auth.uid(), so user-scoped
-- policies work. Server routes use the service_role key and bypass RLS.
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitra_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reports ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  -- User-owned tables: owner-only access.
  FOREACH t IN ARRAY ARRAY['user_test_results','consultation_sessions','event_registrations','mitra_applications'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = ('public.'||t)::regclass AND polname = 'own_rows') THEN
      EXECUTE format('CREATE POLICY own_rows ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
    END IF;
  END LOOP;

  -- article_reports: any authenticated user may report; only owner may read.
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.article_reports'::regclass AND polname='report_insert') THEN
    CREATE POLICY report_insert ON public.article_reports FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='public.article_reports'::regclass AND polname='report_select') THEN
    CREATE POLICY report_select ON public.article_reports FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- Public/config tables: readable by everyone; writes come from server routes
  -- using the service_role key (which bypasses RLS).
  FOREACH t IN ARRAY ARRAY['series','consultation_pricing','consultation_vouchers','subscription_vouchers','familia_merchant_events'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = ('public.'||t)::regclass AND polname = 'public_read') THEN
      EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    END IF;
  END LOOP;
END $$;

COMMIT;

-- Refresh PostgREST's schema cache so the new tables become visible immediately.
NOTIFY pgrst, 'reload schema';
