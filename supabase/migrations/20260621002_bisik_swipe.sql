-- Tabel antrian swipe (gantikan status 'waiting' di bisik_sessions)
CREATE TABLE bisik_queue (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  category     bisik_category NOT NULL,
  mood_check   bisik_mood NOT NULL,
  topic_hint   text CHECK (char_length(topic_hint) <= 60),
  nickname     text NOT NULL,
  status       text DEFAULT 'waiting'
               CHECK (status IN ('waiting', 'matched', 'expired')),
  created_at   timestamptz DEFAULT now(),
  expires_at   timestamptz DEFAULT now() + interval '10 minutes',
  UNIQUE(user_id)
);

CREATE INDEX idx_bisik_queue_discover
  ON bisik_queue(category, status, created_at)
  WHERE status = 'waiting';

ALTER TABLE bisik_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manage own queue" ON bisik_queue
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "read waiting queue" ON bisik_queue
  FOR SELECT USING (status = 'waiting');

-- Tabel riwayat swipe
CREATE TABLE bisik_swipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  target_id   uuid REFERENCES bisik_queue(id) ON DELETE CASCADE,
  direction   text NOT NULL CHECK (direction IN ('right', 'left')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(swiper_id, target_id)
);

ALTER TABLE bisik_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own swipes only" ON bisik_swipes
  FOR ALL USING (swiper_id = auth.uid());

-- Tambah kolom topic_hint ke sesi chat
ALTER TABLE bisik_sessions
  ADD COLUMN IF NOT EXISTS topic_hint text CHECK (char_length(topic_hint) <= 60);
