-- Migration 00038: Care tickets admin management
-- Adds assignment/resolution columns + admin RLS policies

ALTER TABLE beautifio_care_tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE beautifio_care_tickets ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE beautifio_care_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE beautifio_care_tickets ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_care_ticket_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_care_tickets_updated_at ON beautifio_care_tickets;
CREATE TRIGGER trg_care_tickets_updated_at
  BEFORE UPDATE ON beautifio_care_tickets
  FOR EACH ROW EXECUTE FUNCTION update_care_ticket_updated_at();

-- Admin RLS policies
DROP POLICY IF EXISTS "Admin can view all care tickets" ON beautifio_care_tickets;
CREATE POLICY "Admin can view all care tickets" ON beautifio_care_tickets
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );

DROP POLICY IF EXISTS "Admin can update care tickets" ON beautifio_care_tickets;
CREATE POLICY "Admin can update care tickets" ON beautifio_care_tickets
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'superadmin'))
  );
