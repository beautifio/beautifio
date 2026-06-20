-- BISIK FEATURE: full schema overhaul
-- Replaces old: bisik_sessions, bisik_participants, bisik_messages,
-- bisik_reports, bisik_queue, bisik_swipes
-- New: bisik_cards, bisik_chats, bisik_messages, bisik_swipes

-- ============================================================
-- 0. DROP OLD TABLES (replaced by new schema)
-- ============================================================
DROP TABLE IF EXISTS bisik_reports CASCADE;
DROP TABLE IF EXISTS bisik_swipes CASCADE;
DROP TABLE IF EXISTS bisik_messages CASCADE;
DROP TABLE IF EXISTS bisik_participants CASCADE;
DROP TABLE IF EXISTS bisik_queue CASCADE;
DROP TABLE IF EXISTS bisik_sessions CASCADE;

-- ============================================================
-- 1. TOPIK BISIK (dikelola admin, bukan hardcode)
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bisik_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active topics" ON bisik_topics;
CREATE POLICY "Public read active topics"
  ON bisik_topics FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage topics" ON bisik_topics;
CREATE POLICY "Admin manage topics"
  ON bisik_topics FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- Seed: delete old Prompt A data first, then insert
DELETE FROM bisik_topics;

INSERT INTO bisik_topics (name, emoji, display_order) VALUES
  ('Karir', '💼', 1),
  ('Mimpi', '⭐', 2),
  ('Hubungan', '💕', 3),
  ('Mental Health', '🌿', 4),
  ('Keluarga', '🏠', 5),
  ('Pertemanan', '🤝', 6),
  ('Finansial', '💰', 7),
  ('Pendidikan', '📚', 8),
  ('Hobi', '🎯', 9),
  ('Lainnya', '💬', 10);

-- ============================================================
-- 2. PREFERENSI TOPIK USER
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bisik_topic_ids UUID[] DEFAULT '{}';

-- ============================================================
-- 3. KARTU BISIK (posting yang bisa di-swipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES bisik_topics(id),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 300),
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  swipe_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_bisik_cards_topic ON bisik_cards(topic_id);
CREATE INDEX IF NOT EXISTS idx_bisik_cards_active ON bisik_cards(is_active, expires_at);

ALTER TABLE bisik_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active cards"
  ON bisik_cards FOR SELECT
  USING (is_active = true AND expires_at > NOW() AND user_id != auth.uid());

CREATE POLICY "Users can view own cards"
  ON bisik_cards FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cards"
  ON bisik_cards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON bisik_cards FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 4. SWIPES
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES bisik_cards(id) ON DELETE CASCADE,
  card_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (swiper_id, card_id)
);

ALTER TABLE bisik_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own swipes"
  ON bisik_swipes FOR ALL USING (auth.uid() = swiper_id);

-- ============================================================
-- 5. CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES bisik_cards(id) ON DELETE SET NULL,
  initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'ended')),
  expires_at TIMESTAMPTZ,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ended_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bisik_chats_initiator ON bisik_chats(initiator_id, status);
CREATE INDEX IF NOT EXISTS idx_bisik_chats_receiver ON bisik_chats(receiver_id, status);

ALTER TABLE bisik_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats"
  ON bisik_chats FOR SELECT
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update own chats"
  ON bisik_chats FOR UPDATE
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert chats"
  ON bisik_chats FOR INSERT WITH CHECK (auth.uid() = initiator_id);

-- ============================================================
-- 6. PESAN CHAT
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES bisik_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bisik_messages_chat ON bisik_messages(chat_id, created_at);

ALTER TABLE bisik_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages"
  ON bisik_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bisik_chats
      WHERE id = chat_id
      AND (initiator_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can insert messages"
  ON bisik_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM bisik_chats
      WHERE id = chat_id
      AND (initiator_id = auth.uid() OR receiver_id = auth.uid())
      AND status IN ('pending', 'active')
    )
  );

-- ============================================================
-- 7. SUBSCRIPTION PLANS
-- ============================================================
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

DROP POLICY IF EXISTS "Public read active plans" ON subscription_plans;
CREATE POLICY "Public read active plans"
  ON subscription_plans FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage plans" ON subscription_plans;
CREATE POLICY "Admin manage plans"
  ON subscription_plans FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- Seed plan (replaces old Prompt A data)
DELETE FROM subscription_plans;

INSERT INTO subscription_plans (name, duration_type, price_idr, max_active_chats, features, display_order)
VALUES
  ('Pro Harian', 'daily', 5000, 20,
   '["Hingga 20 chat aktif","Prioritas muncul di stack orang lain","Badge Pro"]'::jsonb, 1),
  ('Pro Bulanan', 'monthly', 49000, 20,
   '["Hingga 20 chat aktif","Prioritas muncul di stack orang lain","Badge Pro","Hemat vs harian"]'::jsonb, 2),
  ('Pro Tahunan', 'yearly', 399000, 20,
   '["Hingga 20 chat aktif","Prioritas muncul di stack orang lain","Badge Pro","Hemat terbaik"]'::jsonb, 3);

-- ============================================================
-- 8. USER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subs_user ON user_subscriptions(user_id, status);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON user_subscriptions;
CREATE POLICY "Users view own subscriptions"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage subscriptions" ON user_subscriptions;
CREATE POLICY "Admin manage subscriptions"
  ON user_subscriptions FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));

-- ============================================================
-- 9. FUNCTION: CEK BATAS CHAT AKTIF
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_max_chats(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_max INTEGER := 5;
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

-- ============================================================
-- 10. FUNCTION: AUTO-EXPIRE CHATS
-- ============================================================
CREATE OR REPLACE FUNCTION expire_bisik_chats()
RETURNS void AS $$
BEGIN
  UPDATE bisik_chats
  SET status = 'expired', ended_at = NOW()
  WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  UPDATE bisik_cards
  SET is_active = false
  WHERE is_active = true AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. REALTIME PUBLICATION
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bisik_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE bisik_messages;
