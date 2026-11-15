-- 00016 — Provenance for postal codes in the region reference data.
--
-- 82.852 desa/kelurahan now all have a kodepos, but they come from several
-- resolution strategies (see supabase/seed/generate_wilayah.py). Recording the
-- source makes the ~35 estimated rows auditable instead of silently looking
-- as authoritative as the 77.121 exact code joins.

BEGIN;

ALTER TABLE public.indonesia_villages
  ADD COLUMN IF NOT EXISTS kodepos_source TEXT;

COMMENT ON COLUMN public.indonesia_villages.kodepos_source IS
  'code | name_kec_desa | name_desa_unik | name_kecamatan | fallback_kecamatan (ESTIMASI)';

CREATE INDEX IF NOT EXISTS idx_villages_kodepos_source
  ON public.indonesia_villages(kodepos_source);

COMMIT;

NOTIFY pgrst, 'reload schema';
