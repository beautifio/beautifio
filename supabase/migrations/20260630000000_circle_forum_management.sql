-- ============================================================
-- 1. Add 'host' to circle_members role check
-- ============================================================
ALTER TABLE circle_members
DROP CONSTRAINT IF EXISTS circle_members_role_check;

ALTER TABLE circle_members
ADD CONSTRAINT circle_members_role_check
CHECK (role IN ('member', 'co-host', 'host'));

-- Assign existing created_by as host
UPDATE circle_members cm
SET role = 'host'
FROM circles c
WHERE cm.circle_id = c.id AND cm.user_id = c.created_by AND cm.left_at IS NULL;

-- ============================================================
-- 2. Circle submissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  goal_category TEXT NOT NULL,
  capacity      INT NOT NULL DEFAULT 20 CHECK (capacity >= 5 AND capacity <= 50),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE circle_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON circle_submissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create submissions"
  ON circle_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all submissions"
  ON circle_submissions FOR ALL
  USING (user_has_role(ARRAY['admin'::text, 'superadmin'::text]))
  WITH CHECK (user_has_role(ARRAY['admin'::text, 'superadmin'::text]));

-- ============================================================
-- 3. Notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'circle_approved', 'circle_rejected', 'circle_mention')),
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 4. RPC to approve submission and create circle
-- ============================================================
CREATE OR REPLACE FUNCTION approve_circle_submission(submission_id uuid, admin_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  sub record;
  new_circle_id uuid;
BEGIN
  SELECT * INTO sub FROM circle_submissions WHERE id = submission_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found'; END IF;
  IF sub.status != 'pending' THEN RAISE EXCEPTION 'Submission already processed'; END IF;

  -- Create the circle
  INSERT INTO circles (name, description, goal_category, capacity, created_by, member_count)
  VALUES (sub.name, sub.description, sub.goal_category, sub.capacity, sub.user_id, 1)
  RETURNING id INTO new_circle_id;

  -- Add submitter as host
  INSERT INTO circle_members (circle_id, user_id, role)
  VALUES (new_circle_id, sub.user_id, 'host');

  -- Update submission status
  UPDATE circle_submissions
  SET status = 'approved', reviewed_by = admin_id, reviewed_at = now()
  WHERE id = submission_id;

  -- Notify the user
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    sub.user_id, 'circle_approved',
    'Forum disetujui!',
    'Forum "' || sub.name || '" telah disetujui. Kamu sekarang menjadi Host.',
    jsonb_build_object('circle_id', new_circle_id, 'circle_name', sub.name)
  );

  RETURN new_circle_id;
END;
$$;

CREATE OR REPLACE FUNCTION reject_circle_submission(submission_id uuid, admin_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  sub record;
BEGIN
  SELECT * INTO sub FROM circle_submissions WHERE id = submission_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found'; END IF;

  UPDATE circle_submissions
  SET status = 'rejected', reviewed_by = admin_id, reviewed_at = now()
  WHERE id = submission_id;

  INSERT INTO notifications (user_id, type, title, body)
  VALUES (
    sub.user_id, 'circle_rejected',
    'Forum tidak disetujui',
    'Maaf, forum "' || sub.name || '" belum bisa disetujui saat ini.'
  );
END;
$$;

-- ============================================================
-- 5. RPC to set co-host
-- ============================================================
CREATE OR REPLACE FUNCTION set_circle_cohost(p_circle_id uuid, p_host_id uuid, p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  current_cohost_count INT;
  target_role TEXT;
BEGIN
  -- Verify caller is host
  IF NOT EXISTS (SELECT 1 FROM circle_members WHERE circle_id = p_circle_id AND user_id = p_host_id AND role = 'host' AND left_at IS NULL) THEN
    RAISE EXCEPTION 'Only host can manage co-hosts';
  END IF;

  -- Get target's current role
  SELECT role INTO target_role FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_target_user_id AND left_at IS NULL;

  IF target_role = 'co-host' THEN
    -- Demote back to member
    UPDATE circle_members SET role = 'member' WHERE circle_id = p_circle_id AND user_id = p_target_user_id;
  ELSIF target_role = 'member' THEN
    -- Count existing co-hosts
    SELECT COUNT(*) INTO current_cohost_count FROM circle_members
    WHERE circle_id = p_circle_id AND role = 'co-host' AND left_at IS NULL;
    IF current_cohost_count >= 2 THEN
      RAISE EXCEPTION 'Maksimal 2 co-host';
    END IF;
    UPDATE circle_members SET role = 'co-host' WHERE circle_id = p_circle_id AND user_id = p_target_user_id;
  END IF;
END;
$$;

-- ============================================================
-- 6. RPC to remove member (host or co-host)
-- ============================================================
CREATE OR REPLACE FUNCTION remove_circle_member(p_circle_id uuid, p_actor_id uuid, p_target_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  actor_role TEXT;
  target_role TEXT;
BEGIN
  SELECT role INTO actor_role FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_actor_id AND left_at IS NULL;

  SELECT role INTO target_role FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = p_target_id AND left_at IS NULL;

  IF actor_role IS NULL THEN RAISE EXCEPTION 'Not a member'; END IF;
  IF target_role IS NULL THEN RAISE EXCEPTION 'Target not a member'; END IF;
  IF target_role = 'host' THEN RAISE EXCEPTION 'Cannot remove host'; END IF;
  IF actor_role = 'co-host' AND target_role = 'co-host' THEN RAISE EXCEPTION 'Co-host cannot remove another co-host'; END IF;
  IF actor_role = 'member' THEN RAISE EXCEPTION 'Members cannot remove others'; END IF;

  -- Soft delete
  UPDATE circle_members SET left_at = now() WHERE circle_id = p_circle_id AND user_id = p_target_id;
END;
$$;
