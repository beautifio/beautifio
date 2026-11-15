-- 00013 — Add province/regency/kelurahan to users table
-- Found while improving daftar-mitra registration form with location data

BEGIN;

-- Add new columns for location data
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS province TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS regency TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS kelurahan TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN public.users.province IS 'Provinsi/State user (e.g. DKI Jakarta, Jawa Tengah)';
COMMENT ON COLUMN public.users.regency IS 'Kabupaten/Kota user (e.g. Jakarta Selatan, Bandung)';
COMMENT ON COLUMN public.users.kelurahan IS 'Desa/Kelurahan user';

-- Create index for faster lookups by province
CREATE INDEX IF NOT EXISTS idx_users_province ON public.users(province);
CREATE INDEX IF NOT EXISTS idx_users_regency ON public.users(regency);

NOTIFY pgrst, 'reload schema';

COMMIT;
