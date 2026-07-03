-- Migration: Master Guide structure — 10 categories + 5 tag dimensions + sensitivity
-- Fase 1: Data structure before AI integration

-- New tag dimensions
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tag_format TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tag_audiens TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tag_penulis TEXT DEFAULT 'dari-redaksi';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tag_sensitivitas TEXT DEFAULT 'aman';

-- Sensitivity + disclaimer + internal links + CTA
ALTER TABLE articles ADD COLUMN IF NOT EXISTS sensitivity_level TEXT DEFAULT 'aman';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS disclaimer TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS internal_links TEXT[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cta TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS byline TEXT;

-- Note: tags[] column remains for flat tag_topik (backward compat)
-- Tag dimensions use the new columns above
