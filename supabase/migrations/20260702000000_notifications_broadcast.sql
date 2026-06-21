-- ============================================================================
-- 20260702000000_notifications_broadcast.sql
-- 1. Expand notification types (event, promo, recommendation)
-- 2. Create broadcast_logs table
-- 3. RPC send_broadcast_notification — insert to all users + log
-- 4. Auto-add new preference types for existing users
-- ============================================================================

-- ============================================================
-- 1. Expand notification types
-- ============================================================
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'info',
  'circle_approved',
  'circle_rejected',
  'circle_mention',
  'inspirasi_mention',
  'tanya_answer',
  'member_joined',
  'member_left',
  'attachment_reported',
  'member_banned',
  'event',
  'promo',
  'recommendation'
));

-- ============================================================
-- 2. Broadcast logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS broadcast_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('event', 'promo', 'recommendation')),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  link_url   TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE broadcast_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view broadcast logs"
  ON broadcast_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'redaksi')));

CREATE POLICY "Admins can insert broadcast logs"
  ON broadcast_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'redaksi')));

-- ============================================================
-- 3. RPC: send_broadcast_notification
-- ============================================================
CREATE OR REPLACE FUNCTION send_broadcast_notification(
  p_type      TEXT,
  p_title     TEXT,
  p_body      TEXT,
  p_link_url  TEXT DEFAULT NULL,
  p_admin_id  UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_log_id UUID;
  v_type_check TEXT[];
BEGIN
  v_type_check := ARRAY['event', 'promo', 'recommendation'];
  IF NOT (p_type = ANY(v_type_check)) THEN
    RAISE EXCEPTION 'Invalid type. Must be event, promo, or recommendation.';
  END IF;

  -- Resolve admin_id if not provided
  IF p_admin_id IS NULL THEN
    p_admin_id := auth.uid();
  END IF;

  -- Count recipients who have this notification type enabled
  SELECT COUNT(*) INTO v_count
  FROM users u
  WHERE u.status = 'active'
    AND (
      SELECT COALESCE(np.enabled, true)
      FROM notification_preferences np
      WHERE np.user_id = u.id AND np.notification_type = p_type
    ) = true;

  -- Insert notification for each eligible user
  INSERT INTO notifications (user_id, type, title, body, data)
  SELECT u.id, p_type, p_title, p_body,
    CASE WHEN p_link_url IS NOT NULL THEN jsonb_build_object('link_url', p_link_url) ELSE '{}'::jsonb END
  FROM users u
  WHERE u.status = 'active'
    AND (
      SELECT COALESCE(np.enabled, true)
      FROM notification_preferences np
      WHERE np.user_id = u.id AND np.notification_type = p_type
    ) = true;

  -- Log the broadcast
  INSERT INTO broadcast_logs (admin_id, type, title, body, link_url, recipient_count)
  VALUES (p_admin_id, p_type, p_title, p_body, p_link_url, v_count)
  RETURNING id INTO v_log_id;

  RETURN jsonb_build_object(
    'log_id', v_log_id,
    'recipient_count', v_count
  );
END;
$$;

-- ============================================================
-- 4. Add new preference types for existing users
-- ============================================================
INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT u.id, 'event', true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences np
  WHERE np.user_id = u.id AND np.notification_type = 'event'
);

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT u.id, 'promo', true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences np
  WHERE np.user_id = u.id AND np.notification_type = 'promo'
);

INSERT INTO notification_preferences (user_id, notification_type, enabled)
SELECT u.id, 'recommendation', true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM notification_preferences np
  WHERE np.user_id = u.id AND np.notification_type = 'recommendation'
);

-- ============================================================
-- 5. Update trigger to include new types for new users
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, notification_type, enabled) VALUES
    (NEW.id, 'circle_mention',    true),
    (NEW.id, 'inspirasi_mention', true),
    (NEW.id, 'tanya_answer',      true),
    (NEW.id, 'member_joined',     true),
    (NEW.id, 'member_left',       true),
    (NEW.id, 'attachment_reported', true),
    (NEW.id, 'member_banned',     true),
    (NEW.id, 'event',             true),
    (NEW.id, 'promo',             true),
    (NEW.id, 'recommendation',    true);
  RETURN NEW;
END;
$$;
