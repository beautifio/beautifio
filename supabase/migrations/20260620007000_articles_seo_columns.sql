-- Add SEO columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image TEXT DEFAULT '';
