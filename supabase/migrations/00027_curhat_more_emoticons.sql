-- ============================================================================
-- 00027_curhat_more_emoticons.sql
-- Beautifio — Tambah pilihan emoticon support
-- ============================================================================

ALTER TABLE curhat_support DROP CONSTRAINT curhat_support_support_type_check;

ALTER TABLE curhat_support ADD CONSTRAINT curhat_support_support_type_check
  CHECK (support_type = ANY (ARRAY['hug','relate','strength','love','warm','solid','sad','pray','inspire']));
