-- === ROADMAP TEMPLATES MODULE ===

CREATE TABLE roadmap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  estimated_duration TEXT,
  total_milestones INT NOT NULL DEFAULT 4,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_template_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES roadmap_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_days INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roadmap_template_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES roadmap_templates(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES roadmap_template_milestones(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('circle', 'mentor', 'opportunity')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  resource_description TEXT,
  resource_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rtm_templates_slug ON roadmap_templates(slug);
CREATE INDEX idx_rtm_milestones_template ON roadmap_template_milestones(template_id);
CREATE INDEX idx_rtm_recommendations_template ON roadmap_template_recommendations(template_id);

ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_template_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_template_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are public" ON roadmap_templates FOR SELECT USING (true);
CREATE POLICY "Template milestones are public" ON roadmap_template_milestones FOR SELECT USING (true);
CREATE POLICY "Template recommendations are public" ON roadmap_template_recommendations FOR SELECT USING (true);
