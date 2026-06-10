-- === CERITA (Stories) Module ===

-- Story category enum
CREATE TYPE story_category AS ENUM (
  'education',
  'career',
  'business',
  'sports',
  'music',
  'gaming',
  'creator',
  'beauty',
  'technology'
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  category story_category NOT NULL,
  reading_time INT NOT NULL DEFAULT 1,
  like_count INT NOT NULL DEFAULT 0,
  save_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Story likes (unique per user per story)
CREATE TABLE story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Story saves (bookmark)
CREATE TABLE story_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Story comments (supports nested replies via parent_id)
CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Story recommendations (polymorphic: roadmap, circle, product)
CREATE TABLE story_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('roadmap', 'circle', 'product')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  resource_description TEXT,
  resource_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stories_category ON stories(category) WHERE is_published = true;
CREATE INDEX idx_stories_published_at ON stories(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_stories_slug ON stories(slug);
CREATE INDEX idx_story_likes_story ON story_likes(story_id);
CREATE INDEX idx_story_saves_story ON story_saves(story_id);
CREATE INDEX idx_story_comments_story ON story_comments(story_id);
CREATE INDEX idx_story_comments_parent ON story_comments(parent_id);
CREATE INDEX idx_story_recommendations_story ON story_recommendations(story_id);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies: published stories readable by everyone
CREATE POLICY "Published stories are public" ON stories
  FOR SELECT USING (is_published = true AND deleted_at IS NULL);

-- Authenticated users can like/save/comment
CREATE POLICY "Authenticated users can like" ON story_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can save" ON story_saves
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can comment" ON story_comments
  FOR ALL USING (auth.uid() = user_id);

-- Recommendations are public
CREATE POLICY "Recommendations are public" ON story_recommendations
  FOR SELECT USING (true);
