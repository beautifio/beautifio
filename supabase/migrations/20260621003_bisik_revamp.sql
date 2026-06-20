-- BISIK REVAMP
-- 1. Dinamic topics (gantikan enum bisik_category)
-- 2. Subscription plans + user subscriptions
-- 3. Chat limit checking

-- 1. TABEL TOPIK
CREATE TABLE IF NOT EXISTS bisik_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '💬',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bisik_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active bisik topics"
  ON bisik_topics FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage bisik topics"
  ON bisik_topics FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

INSERT INTO bisik_topics (name, emoji, display_order) VALUES
  ('Karir', '💼', 1),
  ('Keluarga', '🏠', 2),
  ('Percintaan', '💕', 3),
  ('Pertemanan', '🤝', 4),
  ('Mimpi & Masa Depan', '⭐', 5),
  ('Mental Health', '🌿', 6),
  ('Finansial', '💰', 7),
  ('Pendidikan', '📚', 8),
  ('Hobi', '🎯', 9),
  ('Lainnya', '💬', 10)
ON CONFLICT (name) DO NOTHING;

-- 2. TAMBAH topic_id KE bisik_sessions
ALTER TABLE bisik_sessions
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES bisik_topics(id);

-- 3. TAMBAH topic_id KE bisik_queue
ALTER TABLE bisik_queue
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES bisik_topics(id);

-- 4. PREFERENSI TOPIK USER
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bisik_topic_ids UUID[] DEFAULT '{}';

-- 5. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_type TEXT NOT NULL
    CHECK (duration_type IN ('daily', 'monthly', 'yearly')),
  price_idr INTEGER NOT NULL,
  max_active_chats INTEGER NOT NULL DEFAULT 20,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active plans"
  ON subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage plans"
  ON subscription_plans FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

INSERT INTO subscription_plans
  (name, duration_type, price_idr, max_active_chats, features, display_order)
VALUES
  ('Pro Harian', 'daily', 5000, 20,
   '["Hingga 20 obrolan aktif","Prioritas di stack orang lain","Badge Pro"]'::jsonb, 1),
  ('Pro Bulanan', 'monthly', 49000, 20,
   '["Hingga 20 obrolan aktif","Prioritas di stack orang lain","Badge Pro","Hemat vs harian"]'::jsonb, 2),
  ('Pro Tahunan', 'yearly', 399000, 20,
   '["Hingga 20 obrolan aktif","Prioritas di stack orang lain","Badge Pro","Hemat terbaik"]'::jsonb, 3);

-- 6. USER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscriptions"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- 7. FUNCTION: cek batas chat aktif
CREATE OR REPLACE FUNCTION get_user_max_chats(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE v_max INTEGER := 5;
BEGIN
  SELECT sp.max_active_chats INTO v_max
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.expires_at > NOW()
  ORDER BY sp.max_active_chats DESC
  LIMIT 1;
  RETURN COALESCE(v_max, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Payment info settings
INSERT INTO app_settings (key, value) VALUES
  ('payment_bank_account', 'BCA 1234567890 a/n Beautifio'),
  ('payment_wa_link', 'https://wa.me/628xxx')
ON CONFLICT (key) DO NOTHING;
