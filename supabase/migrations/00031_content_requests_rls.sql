-- ============================================================================
-- 00031_content_requests_rls.sql
-- Beautifio — RLS for content_requests (Redaksi only)
-- ============================================================================

ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;

-- Redaksi can see all requests
CREATE POLICY "Redaksi can view content_requests"
  ON content_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Redaksi can insert/update
CREATE POLICY "Redaksi can insert content_requests"
  ON content_requests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Redaksi can update content_requests"
  ON content_requests FOR UPDATE
  USING (auth.role() = 'authenticated');
