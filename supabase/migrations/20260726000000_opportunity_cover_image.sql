-- Migration: Add cover_image to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS cover_image TEXT;
