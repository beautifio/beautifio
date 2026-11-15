-- 00017 — Refresh kodepos_source documentation after switching the primary
-- postal-code source to the official POS Indonesia harvest.
--
-- 00016 introduced the column when all values came from cahyadsn/sooluh and
-- 35 rows were estimates. Since 2026-11-15 the seed uses
-- scripts/build_posindonesia.py (official POS Indonesia data, harvested from
-- kodepos.posindonesia.co.id). Result: 82.852/82.852 filled, 0 estimates.
-- See docs/wilayah-data.md.

BEGIN;

COMMENT ON COLUMN public.indonesia_villages.kodepos_source IS
  'posindonesia_exact | posindonesia_name | posindonesia_kecamatan (resmi POS Indonesia) | code | name_kec_desa | name_kecamatan (dataset turunan lama) | fallback_kecamatan (ESTIMASI)';

COMMIT;

NOTIFY pgrst, 'reload schema';
