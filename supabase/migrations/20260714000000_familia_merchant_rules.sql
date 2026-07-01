-- =============================================================================
-- Migration: Tambah kolom aturan voucher ke familia_merchants (Fase 4)
-- =============================================================================

ALTER TABLE public.familia_merchants
  ADD COLUMN IF NOT EXISTS max_per_user INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS claim_start DATE,
  ADD COLUMN IF NOT EXISTS claim_end DATE,
  ADD COLUMN IF NOT EXISTS redeem_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS code_prefix TEXT;
