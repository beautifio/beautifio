-- Allow circle members to view each other's profiles (RLS was blocking joins)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Circle members can view each other' AND tablename = 'users') THEN
    CREATE POLICY "Circle members can view each other"
      ON users FOR SELECT
      USING (
        auth.uid() = id
        OR id IN (
          SELECT user_id FROM circle_members cm
          WHERE cm.circle_id IN (
            SELECT circle_id FROM circle_members WHERE user_id = auth.uid() AND left_at IS NULL
          )
          AND cm.left_at IS NULL
        )
      );
  END IF;
END;
$$;
