-- 00036 — Affiliate click tracking: RPC function & update policy

-- RPC function to atomically increment click_count
CREATE OR REPLACE FUNCTION increment_deal_click(p_deal_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE familia_affiliate_deals
  SET click_count = click_count + 1
  WHERE id = p_deal_id;
END;
$$;

-- Allow public to read deals (existing policy should exist, add if not)
-- Allow authenticated read of all active deals (for redirect tracking)
CREATE POLICY "Anyone can view active deals" ON familia_affiliate_deals
  FOR SELECT USING (is_active = true);
