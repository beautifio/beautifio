-- Add slug column to dream_journeys for human-friendly URLs
ALTER TABLE dream_journeys ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing journeys
UPDATE dream_journeys
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTR(MD5(id::TEXT)::TEXT, 1, 4)
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE dream_journeys ALTER COLUMN slug SET NOT NULL;

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_dream_journeys_slug ON dream_journeys(slug);
CREATE INDEX IF NOT EXISTS idx_dream_journeys_user_slug ON dream_journeys(user_id, slug);
