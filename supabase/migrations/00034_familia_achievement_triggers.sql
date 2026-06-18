-- === Familia Achievement Engine ===
-- Auto-updates familia_user_achievements when relevant events occur

-- Core function: update progress for all achievements matching a trigger type
CREATE OR REPLACE FUNCTION update_familia_achievement(
  p_user_id UUID,
  p_trigger_type TEXT,
  p_increment INT DEFAULT 1
) RETURNS void AS $$
DECLARE
  r RECORD;
  current_progress INT;
  already_completed BOOLEAN;
BEGIN
  FOR r IN SELECT id, trigger_value FROM familia_achievement_rewards WHERE trigger_type = p_trigger_type AND is_active = true
  LOOP
    SELECT progress, is_completed INTO current_progress, already_completed
    FROM familia_user_achievements
    WHERE user_id = p_user_id AND achievement_id = r.id;

    IF NOT FOUND THEN
      current_progress := 0;
      already_completed := false;
    END IF;

    INSERT INTO familia_user_achievements (user_id, achievement_id, progress, is_completed, completed_at)
    VALUES (
      p_user_id,
      r.id,
      current_progress + p_increment,
      (current_progress + p_increment) >= r.trigger_value,
      CASE WHEN (current_progress + p_increment) >= r.trigger_value AND NOT already_completed THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, achievement_id) DO UPDATE SET
      progress = EXCLUDED.progress,
      is_completed = EXCLUDED.is_completed,
      completed_at = CASE WHEN EXCLUDED.is_completed = true AND familia_user_achievements.completed_at IS NULL THEN EXCLUDED.completed_at ELSE familia_user_achievements.completed_at END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: journal_entries (AFTER INSERT on journal_entries)
CREATE OR REPLACE FUNCTION trigger_journal_entry_achievement()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_familia_achievement(
    (SELECT user_id FROM journals WHERE id = NEW.journal_id),
    'journal_entries'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_journal_entry_insert
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_journal_entry_achievement();

-- Trigger: story_posted (AFTER INSERT on stories)
CREATE OR REPLACE FUNCTION trigger_story_achievement()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_familia_achievement(NEW.author_id, 'story_posted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_story_insert
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_story_achievement();

-- Trigger: roadmap_milestones (AFTER UPDATE on big_wins, when is_completed flips to true)
CREATE OR REPLACE FUNCTION trigger_big_win_achievement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS DISTINCT FROM true) THEN
    PERFORM update_familia_achievement(
      (SELECT user_id FROM dream_journeys WHERE id = NEW.journey_id),
      'roadmap_milestones'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_big_win_update
  AFTER UPDATE ON big_wins
  FOR EACH ROW
  EXECUTE FUNCTION trigger_big_win_achievement();

-- RLS: allow the function to insert/update familia_user_achievements on behalf of users
-- The function is SECURITY DEFINER, so it runs as the table owner
