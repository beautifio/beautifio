-- ============================================================================
-- 20260701000000_notifications_mention_pref.sql
-- 1. Expand notification types CHECK
-- 2. Create notification_preferences table
-- 3. RPC notify_mentions — detect @name in text, resolve user, insert notif
-- 4. RPC search_users — for autocomplete dropdown
-- 5. Trigger to create default preferences on user signup
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
  'member_banned'
));

-- ============================================================
-- 2. Notification preferences table
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  enabled           BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3. Auto-create default preferences on user signup
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
    (NEW.id, 'member_banned',     true);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON public.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- ============================================================
-- 4. RPC: search_users — for @mention autocomplete
-- ============================================================
CREATE OR REPLACE FUNCTION search_users(search_query text, limit_count int default 10)
RETURNS TABLE(user_id uuid, full_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.full_name, u.avatar_url
  FROM users u
  WHERE u.full_name ILIKE '%' || search_query || '%'
    AND u.status = 'active'
  LIMIT limit_count;
END;
$$;

-- ============================================================
-- 5. RPC: notify_mentions — parse text for @name, resolve, insert notif
-- ============================================================
CREATE OR REPLACE FUNCTION notify_mentions(
  p_text       text,
  p_source     text,      -- 'circle_mention', 'inspirasi_mention', 'tanya_answer'
  p_source_id  text,      -- relevant entity id (circle_id, article_id, qa_id)
  p_source_url text,      -- deep link URL
  p_actor_id   uuid       -- user who typed the @mention
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  mention_pattern text := '@([^@\\s]+)';
  matched_name text;
  target_user record;
  circle_name text;
  article_title text;
BEGIN
  FOR matched_name IN
    SELECT DISTINCT trim(m[1]) AS name
    FROM regexp_matches(p_text, mention_pattern, 'g') AS m
  LOOP
    IF length(matched_name) < 2 THEN CONTINUE; END IF;

    SELECT id, full_name INTO target_user
    FROM users
    WHERE full_name ILIKE matched_name
    LIMIT 1;

    IF NOT FOUND THEN CONTINUE; END IF;
    IF target_user.id = p_actor_id THEN CONTINUE; END IF;

    -- Check if target user has this notification type enabled
    IF EXISTS (
      SELECT 1 FROM notification_preferences
      WHERE user_id = target_user.id
        AND notification_type = p_source
        AND enabled = true
    ) THEN
      -- Resolve contextual title
      circle_name := '';
      article_title := '';

      IF p_source = 'circle_mention' THEN
        SELECT name INTO circle_name FROM circles WHERE id = p_source_id::uuid;
      ELSIF p_source = 'inspirasi_mention' THEN
        SELECT title INTO article_title FROM articles WHERE id = p_source_id::uuid;
      END IF;

      INSERT INTO notifications (user_id, type, title, body, data)
      VALUES (
        target_user.id,
        p_source,
        'Kamu disebut oleh @' || target_user.full_name,
        CASE
          WHEN circle_name != '' THEN 'Di forum "' || circle_name || '"'
          WHEN article_title != '' THEN 'Di artikel "' || article_title || '"'
          ELSE ''
        END,
        jsonb_build_object(
          'source_url', p_source_url,
          'source_id', p_source_id,
          'actor_id', p_actor_id
        )
      );
    END IF;
  END LOOP;
END;
$$;
