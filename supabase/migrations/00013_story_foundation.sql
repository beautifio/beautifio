-- Story Foundation V1
-- Weekly & Monthly Reviews

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  proud TEXT,
  difficult TEXT,
  improve TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES dream_journeys(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  changed TEXT,
  learned TEXT,
  grateful TEXT,
  focus_next TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weekly reviews"
  ON weekly_reviews FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own monthly reviews"
  ON monthly_reviews FOR ALL
  USING (auth.uid() = user_id);
