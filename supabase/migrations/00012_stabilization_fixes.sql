-- STABILIZATION FIXES
-- Fixes migration 00011: add birth_date to users instead of non-existent user_profiles
-- Adds missing RLS INSERT policies for big_wins and small_wins
-- Adds missing FK indexes for query performance

-- 1. Fix: Add birth_date to users table (migration 00011 incorrectly targeted user_profiles)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Fix: Add INSERT RLS policy for big_wins
-- Uses subquery through dream_journeys (which has user_id) because big_wins only has journey_id
CREATE POLICY "Users can insert own big wins"
  ON big_wins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dream_journeys
      WHERE dream_journeys.id = big_wins.journey_id
        AND dream_journeys.user_id = auth.uid()
    )
  );

-- 3. Fix: Add INSERT RLS policy for small_wins
-- Uses subquery through big_wins → dream_journeys → user_id chain
CREATE POLICY "Users can insert own small wins"
  ON small_wins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM big_wins b
      JOIN dream_journeys j ON b.journey_id = j.id
      WHERE b.id = small_wins.big_win_id
        AND j.user_id = auth.uid()
    )
  );

-- 4. Fix: Add FK indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_dream_journeys_user_id ON dream_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_dream_journeys_status ON dream_journeys(status);
CREATE INDEX IF NOT EXISTS idx_dream_journeys_template_slug ON dream_journeys(template_slug);
CREATE INDEX IF NOT EXISTS idx_big_wins_journey_id ON big_wins(journey_id);
CREATE INDEX IF NOT EXISTS idx_small_wins_big_win_id ON small_wins(big_win_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id_date ON daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_journey_id ON daily_activities(journey_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id ON daily_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_timeline_events_user_id ON growth_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_timeline_events_journey_id ON growth_timeline_events(journey_id);

-- 5. Fix: Add DELETE policy for circle_members (users can leave circles)
CREATE POLICY "Users can leave circles"
  ON circle_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Fix: Add INSERT policy for milestones
CREATE POLICY "Users can insert own milestones"
  ON milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
