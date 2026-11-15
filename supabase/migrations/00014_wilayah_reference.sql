-- 00014 — Complete Indonesian administrative-region reference data.
--
-- Why: the region pickers in /(app)/profil/edit and /daftar-mitra read
-- public.indonesia_provinces / indonesia_regencies, but those tables were
-- EMPTY, so users had to type city / postal code by hand.
--
-- Data (loaded separately by supabase/seed/wilayah_indonesia.sql):
--   34 provinsi | 514 kabupaten/kota | 7.219 kecamatan | 82.852 desa/kelurahan
--   + kode pos 100% terisi (join kode + join nama untuk Papua pemekaran
--     + fallback modus per kecamatan); field tetap bisa diedit user.
--
-- Additive + idempotent. Safe on the shared Supabase instance.

BEGIN;

-- ── 1. New reference tables ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.indonesia_districts (
  id          TEXT PRIMARY KEY,                    -- kode_bps kecamatan, mis. '1112010'
  regency_id  INT NOT NULL REFERENCES public.indonesia_regencies(id),
  name        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.indonesia_villages (
  id          TEXT PRIMARY KEY,                    -- kode_bps desa, mis. '1112010015'
  district_id TEXT NOT NULL REFERENCES public.indonesia_districts(id),
  name        TEXT NOT NULL,
  kode_dagri  TEXT,                               -- kode Dagri desa, mis. '11.12.03.2003'
  kodepos     TEXT                                -- 5 digit, NULL bila tak tersedia
);

CREATE INDEX IF NOT EXISTS idx_districts_regency  ON public.indonesia_districts(regency_id);
CREATE INDEX IF NOT EXISTS idx_districts_name     ON public.indonesia_districts(name);
CREATE INDEX IF NOT EXISTS idx_villages_district  ON public.indonesia_villages(district_id);
CREATE INDEX IF NOT EXISTS idx_villages_name      ON public.indonesia_villages(name);
CREATE INDEX IF NOT EXISTS idx_villages_kodepos   ON public.indonesia_villages(kodepos);

-- ── 2. Columns on application tables ───────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS kecamatan TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS kodepos   TEXT DEFAULT '';

ALTER TABLE public.mitra_applications
  ADD COLUMN IF NOT EXISTS province  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS regency   TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS kecamatan TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS kelurahan TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS kodepos   TEXT DEFAULT '';

COMMENT ON COLUMN public.indonesia_villages.kodepos IS
  'Kode pos dari cahyadsn/wilayah_kodepos; fallback modus per kecamatan';

-- ── 3. RLS: reference data is public read-only ─────────────────────────────
-- The 20261026020000 lock-down revoked writes from anon/authenticated on the
-- two existing tables; keep that. We only enable RLS + a permissive SELECT
-- policy so PostgREST (anon key) can still read the pickers.
ALTER TABLE public.indonesia_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indonesia_regencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indonesia_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indonesia_villages  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wilayah_public_read" ON public.indonesia_provinces;
CREATE POLICY "wilayah_public_read" ON public.indonesia_provinces FOR SELECT USING (true);

DROP POLICY IF EXISTS "wilayah_public_read" ON public.indonesia_regencies;
CREATE POLICY "wilayah_public_read" ON public.indonesia_regencies FOR SELECT USING (true);

DROP POLICY IF EXISTS "wilayah_public_read" ON public.indonesia_districts;
CREATE POLICY "wilayah_public_read" ON public.indonesia_districts FOR SELECT USING (true);

DROP POLICY IF EXISTS "wilayah_public_read" ON public.indonesia_villages;
CREATE POLICY "wilayah_public_read" ON public.indonesia_villages FOR SELECT USING (true);

GRANT SELECT ON public.indonesia_provinces, public.indonesia_regencies,
              public.indonesia_districts, public.indonesia_villages
  TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
