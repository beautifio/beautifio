-- Fix RLS infinite recursion caused by admin policies subquerying users table
-- which triggers users table policies that subquery users again.
--
-- Root cause: policies use auth.uid() IN (SELECT id FROM users WHERE role = ANY(...))
-- This subquery hits public.users with RLS enabled → triggers its own policies
-- → superadmin policy subqueries users again → infinite recursion.
--
-- Fix: SECURITY DEFINER function bypasses RLS for the role check.

CREATE OR REPLACE FUNCTION public.user_has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = ANY(allowed_roles)
  );
$$;

-- 1. familia_merchants
DROP POLICY IF EXISTS "Admins can manage merchants" ON public.familia_merchants;
CREATE POLICY "Admins can manage merchants" ON public.familia_merchants
  FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 2. familia_voucher_sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.familia_voucher_sessions;
CREATE POLICY "Admins can view all sessions" ON public.familia_voucher_sessions
  FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 3. users
DROP POLICY IF EXISTS "Superadmins can manage all users" ON public.users;
CREATE POLICY "Superadmins can manage all users" ON public.users
  FOR ALL
  USING (public.user_has_role(ARRAY['superadmin']));

-- 4. quotes
DROP POLICY IF EXISTS "Redaksi can manage quotes" ON public.quotes;
CREATE POLICY "Redaksi can manage quotes" ON public.quotes
  FOR ALL
  USING (public.user_has_role(ARRAY['redaksi', 'superadmin']));

-- 5. inspirasi_posts
DROP POLICY IF EXISTS "Redaksi can manage inspirasi" ON public.inspirasi_posts;
CREATE POLICY "Redaksi can manage inspirasi" ON public.inspirasi_posts
  FOR ALL
  USING (public.user_has_role(ARRAY['redaksi', 'superadmin']));

-- 6. curhat_posts (SELECT + UPDATE)
DROP POLICY IF EXISTS "Admin can view all curhat posts" ON public.curhat_posts;
CREATE POLICY "Admin can view all curhat posts" ON public.curhat_posts
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

DROP POLICY IF EXISTS "Admin can update curhat posts" ON public.curhat_posts;
CREATE POLICY "Admin can update curhat posts" ON public.curhat_posts
  FOR UPDATE
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

-- 7. curhat_comments (SELECT + UPDATE)
DROP POLICY IF EXISTS "Admin can view all curhat comments" ON public.curhat_comments;
CREATE POLICY "Admin can view all curhat comments" ON public.curhat_comments
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

DROP POLICY IF EXISTS "Admin can update curhat comments" ON public.curhat_comments;
CREATE POLICY "Admin can update curhat comments" ON public.curhat_comments
  FOR UPDATE
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

-- 8. beautifio_care_tickets (SELECT + UPDATE)
DROP POLICY IF EXISTS "Admin can view all care tickets" ON public.beautifio_care_tickets;
CREATE POLICY "Admin can view all care tickets" ON public.beautifio_care_tickets
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

DROP POLICY IF EXISTS "Admin can update care tickets" ON public.beautifio_care_tickets;
CREATE POLICY "Admin can update care tickets" ON public.beautifio_care_tickets
  FOR UPDATE
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 9. stories (SELECT + INSERT + UPDATE + DELETE)
DROP POLICY IF EXISTS "Admin can view all stories" ON public.stories;
CREATE POLICY "Admin can view all stories" ON public.stories
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

DROP POLICY IF EXISTS "Admin can insert stories" ON public.stories;
CREATE POLICY "Admin can insert stories" ON public.stories
  FOR INSERT
  WITH CHECK (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

DROP POLICY IF EXISTS "Admin can update stories" ON public.stories;
CREATE POLICY "Admin can update stories" ON public.stories
  FOR UPDATE
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

DROP POLICY IF EXISTS "Admin can delete stories" ON public.stories;
CREATE POLICY "Admin can delete stories" ON public.stories
  FOR DELETE
  USING (public.user_has_role(ARRAY['admin', 'superadmin', 'redaksi']));

-- 10. opportunities (SELECT + INSERT + UPDATE + DELETE)
DROP POLICY IF EXISTS "Admin can view all opportunities" ON public.opportunities;
CREATE POLICY "Admin can view all opportunities" ON public.opportunities
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

DROP POLICY IF EXISTS "Admin can insert opportunities" ON public.opportunities;
CREATE POLICY "Admin can insert opportunities" ON public.opportunities
  FOR INSERT
  WITH CHECK (public.user_has_role(ARRAY['admin', 'superadmin']));

DROP POLICY IF EXISTS "Admin can update opportunities" ON public.opportunities;
CREATE POLICY "Admin can update opportunities" ON public.opportunities
  FOR UPDATE
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

DROP POLICY IF EXISTS "Admin can delete opportunities" ON public.opportunities;
CREATE POLICY "Admin can delete opportunities" ON public.opportunities
  FOR DELETE
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 11. saved_opportunities
DROP POLICY IF EXISTS "Admin can view all saved opportunities" ON public.saved_opportunities;
CREATE POLICY "Admin can view all saved opportunities" ON public.saved_opportunities
  FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));
