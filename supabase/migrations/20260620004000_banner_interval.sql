-- Add interval_seconds per banner for carousel timing
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS interval_seconds INTEGER DEFAULT 4;
