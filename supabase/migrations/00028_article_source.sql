-- ============================================================================
-- 00028_article_source.sql
-- Beautifio — Restruktur Inspirasi: sumber (cerita/mentor/redaksi)
-- ============================================================================

-- 1. Hapus artikel anonymous (curhat lama) — FK cascade otomatis
DELETE FROM articles WHERE type = 'anonymous';

-- 2. Tambah kolom source
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source TEXT
  NOT NULL DEFAULT 'cerita'
  CHECK (source IN ('cerita', 'mentor', 'redaksi'));

-- 3. Migrasi data existing berdasarkan type
UPDATE articles SET source = 'cerita'  WHERE type IN ('story', 'journal', 'community');
UPDATE articles SET source = 'mentor'  WHERE type = 'mentor';
-- redaksi: 0 artikel saat ini, konten baru nanti
