-- === JOURNAL JOURNEY Module ===

-- Journals table
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  goal_category TEXT,
  roadmap_slug TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  entry_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  reaction_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Journal entries (daily updates)
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('sangat_bahagia', 'bahagia', 'biasa', 'sedih', 'sangat_sedih')),
  day_number INT NOT NULL DEFAULT 1,
  milestone_id UUID REFERENCES journal_milestones(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal milestones
CREATE TABLE journal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal followers
CREATE TABLE journal_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id)
);

-- Journal reactions
CREATE TABLE journal_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_journals_user ON journals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_journals_slug ON journals(slug);
CREATE INDEX idx_journals_public ON journals(is_public) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_journal_entries_journal ON journal_entries(journal_id);
CREATE INDEX idx_journal_entries_day ON journal_entries(journal_id, day_number);
CREATE INDEX idx_journal_milestones_journal ON journal_milestones(journal_id);
CREATE INDEX idx_journal_followers_journal ON journal_followers(journal_id);
CREATE INDEX idx_journal_reactions_journal ON journal_reactions(journal_id);

-- RLS
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public journals are viewable by everyone" ON journals
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own journals" ON journals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Journal entries are viewable if journal is public" ON journal_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Users can manage entries in their journals" ON journal_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND user_id = auth.uid())
  );

CREATE POLICY "Milestones are viewable if journal is public" ON journal_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Users can manage milestones in their journals" ON journal_milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND user_id = auth.uid())
  );

CREATE POLICY "Followers are viewable if journal is public" ON journal_followers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Authenticated users can follow journals" ON journal_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow" ON journal_followers
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable if journal is public" ON journal_reactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM journals WHERE id = journal_id AND (is_public = true OR user_id = auth.uid()) AND deleted_at IS NULL)
  );

CREATE POLICY "Authenticated users can react" ON journal_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_journal_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE journals SET entry_count = entry_count + 1, updated_at = now() WHERE id = NEW.journal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE journals SET entry_count = GREATEST(entry_count - 1, 0), updated_at = now() WHERE id = OLD.journal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entries_count_trigger
  AFTER INSERT OR DELETE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_journal_entry_count();

CREATE OR REPLACE FUNCTION update_journal_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE journals SET follower_count = follower_count + 1 WHERE id = NEW.journal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE journals SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.journal_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_followers_count_trigger
  AFTER INSERT OR DELETE ON journal_followers
  FOR EACH ROW EXECUTE FUNCTION update_journal_follower_count();
