-- ============================================================================
-- 00006_core_tables.sql
-- Beautifio — Core Application Tables Missing From Original Migrations
--
-- These tables are queried by the application code but were never defined
-- in the original 5 migration files. Add this as migration 00006.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- user_goals
-- Referenced by: queries.ts (select, insert), onboarding/page.tsx (insert)
-- Type: Goal (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_category TEXT NOT NULL CHECK (goal_category IN ('karir', 'pendidikan', 'skill', 'bisnis')),
  target_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- circles
-- Referenced by: queries.ts (select)
-- Type: Circle (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_category TEXT NOT NULL,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_url TEXT,
  capacity INT NOT NULL DEFAULT 50,
  member_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_circles_category ON circles(goal_category);

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circles are public" ON circles
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- circle_members
-- Referenced by: queries.ts (select, insert)
-- Type: CircleMember (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'co-host')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ
);

CREATE INDEX idx_circle_members_user ON circle_members(user_id);
CREATE INDEX idx_circle_members_circle ON circle_members(circle_id);
CREATE UNIQUE INDEX idx_circle_members_active ON circle_members(circle_id, user_id) WHERE left_at IS NULL;

ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own memberships" ON circle_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join circles" ON circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- messages
-- Referenced by: queries.ts (insert), circle/[id]/page-client.tsx (realtime)
-- Type: Message (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_circle ON messages(circle_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(circle_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by circle members" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );

CREATE POLICY "Circle members can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_id = messages.circle_id
        AND user_id = auth.uid()
        AND left_at IS NULL
    )
  );

-- Enable realtime for messages (required by circle/[id]/page-client.tsx)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ────────────────────────────────────────────────────────────────────────────
-- milestones
-- Referenced by: queries.ts (select, update)
-- Type: Milestone (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_goal ON milestones(goal_id);
CREATE INDEX idx_milestones_user ON milestones(user_id);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- opportunities
-- Referenced by: queries.ts (select)
-- Type: Opportunity (types/index.ts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beasiswa', 'magang', 'pekerjaan', 'turnamen', 'kompetisi', 'relawan', 'pendanaan', 'program-kreator')),
  organization TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_active ON opportunities(is_active);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities are public" ON opportunities
  FOR SELECT USING (is_active = true);

-- ────────────────────────────────────────────────────────────────────────────
-- saved_opportunities
-- Referenced by: queries.ts (insert)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX idx_saved_opps_user ON saved_opportunities(user_id);

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved opportunities" ON saved_opportunities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save opportunities" ON saved_opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave opportunities" ON saved_opportunities
  FOR DELETE USING (auth.uid() = user_id);
