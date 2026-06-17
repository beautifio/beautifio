-- ============================================================================
-- 00033_beautifio_care_tickets.sql
-- Beautifio — Ruang Aman ticketing system
-- ============================================================================

CREATE TABLE beautifio_care_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  story TEXT,
  form_data JSONB,
  partner_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE beautifio_care_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own tickets"
  ON beautifio_care_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own tickets"
  ON beautifio_care_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_care_tickets_status ON beautifio_care_tickets(status);
CREATE INDEX idx_care_tickets_partner ON beautifio_care_tickets(partner_type);
