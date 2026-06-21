-- Add nickname column to curhat_comments for unified anonymous name
ALTER TABLE curhat_comments
ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT '';
