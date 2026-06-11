-- 00008 — Admin role policies for Familia
-- These were moved from 00005_familia.sql because they depend on
-- the `role` column on `users`, which is added in 00007.

CREATE POLICY "Admins can manage merchants" ON familia_merchants
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can view all sessions" ON familia_voucher_sessions
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
