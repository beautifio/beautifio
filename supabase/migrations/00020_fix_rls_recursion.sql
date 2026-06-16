-- Fix infinite recursion in circle_members RLS policy
-- The EXISTS subquery referencing circle_members itself causes recursion.
-- Solution: SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_circle_member(circle_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM circle_members cm
    WHERE cm.circle_id = $1
    AND cm.user_id = $2
    AND cm.left_at IS NULL
  );
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Members can view circle members" ON circle_members;

-- Recreate using the SECURITY DEFINER function
CREATE POLICY "Members can view circle members" ON circle_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    is_circle_member(circle_id, auth.uid())
  );
