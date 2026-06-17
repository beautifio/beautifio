-- ============================================================================
-- 00023_inspirasi_fix_columns.sql
-- Beautifio — Add title & nickname columns to curhat_posts
-- NOTE: RLS tetap strict (auth.uid() = user_id) — tidak dilonggarkan.
-- Frontend guard memastikan user?.id sudah siap sebelum submit.
-- ============================================================================

ALTER TABLE curhat_posts
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';

ALTER TABLE curhat_posts
  ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT '';

-- Pastikan RLS INSERT tetap strict (tidak berubah dari aslinya)
-- Dijalankan ulang untuk idempotensi:
DROP POLICY IF EXISTS "Users can create own curhat" ON curhat_posts;
CREATE POLICY "Users can create own curhat"
  ON curhat_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add response_mode column for story/polling split
ALTER TABLE curhat_posts
  ADD COLUMN IF NOT EXISTS response_mode TEXT DEFAULT 'story'
  CHECK (response_mode IN ('story', 'polling'));
