-- Add is_journey_activity to daily_activities
ALTER TABLE daily_activities ADD COLUMN IF NOT EXISTS is_journey_activity BOOLEAN NOT NULL DEFAULT true;

-- Allow journey_id to be nullable for general (non-journey) activities
ALTER TABLE daily_activities ALTER COLUMN journey_id DROP NOT NULL;
