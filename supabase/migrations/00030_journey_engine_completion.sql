-- ============================================================================
-- 00030_journey_engine_completion.sql
-- Beautifio — Auto-completion triggers for Journey Engine
-- ============================================================================

-- 1. Auto-complete read_article activity when article_reads.is_completed = true
CREATE OR REPLACE FUNCTION complete_read_article_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true THEN
    UPDATE daily_activities
    SET is_completed = true,
        completed_at = NEW.completed_at
    WHERE id = NEW.activity_id
      AND is_completed = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_article_read_complete ON article_reads;
CREATE TRIGGER on_article_read_complete
  AFTER INSERT OR UPDATE OF is_completed ON article_reads
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION complete_read_article_activity();

-- 2. Auto-complete write_curhat activity when user posts a curhat
CREATE OR REPLACE FUNCTION complete_write_curhat_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_activities
  SET is_completed = true,
      completed_at = NOW()
  WHERE id = (
    SELECT id FROM daily_activities
    WHERE user_id = NEW.user_id
      AND action_type = 'write_curhat'
      AND activity_date = CURRENT_DATE
      AND is_completed = false
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_curhat_post ON curhat_posts;
CREATE TRIGGER on_curhat_post
  AFTER INSERT ON curhat_posts
  FOR EACH ROW
  EXECUTE FUNCTION complete_write_curhat_activity();

-- 3. Auto-complete comment_curhat activity when user comments
CREATE OR REPLACE FUNCTION complete_comment_curhat_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_activities
  SET is_completed = true,
      completed_at = NOW()
  WHERE id = (
    SELECT id FROM daily_activities
    WHERE user_id = NEW.user_id
      AND action_type = 'comment_curhat'
      AND activity_date = CURRENT_DATE
      AND is_completed = false
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_curhat_comment ON curhat_comments;
CREATE TRIGGER on_curhat_comment
  AFTER INSERT ON curhat_comments
  FOR EACH ROW
  EXECUTE FUNCTION complete_comment_curhat_activity();

-- 4. Auto-complete support_curhat activity when user sends support
CREATE OR REPLACE FUNCTION complete_support_curhat_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE daily_activities
  SET is_completed = true,
      completed_at = NOW()
  WHERE id = (
    SELECT id FROM daily_activities
    WHERE user_id = NEW.user_id
      AND action_type = 'support_curhat'
      AND activity_date = CURRENT_DATE
      AND is_completed = false
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_curhat_support ON curhat_support;
CREATE TRIGGER on_curhat_support
  AFTER INSERT ON curhat_support
  FOR EACH ROW
  EXECUTE FUNCTION complete_support_curhat_activity();
