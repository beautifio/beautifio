CREATE TYPE bisik_category AS ENUM (
  'karir', 'keluarga', 'percintaan',
  'pendidikan', 'kesehatan_mental', 'pertemanan', 'keuangan'
);

CREATE TYPE bisik_status AS ENUM ('waiting', 'matched', 'active', 'ended', 'reported');
CREATE TYPE bisik_mood AS ENUM ('didengar', 'mendengarkan', 'keduanya');

CREATE TABLE bisik_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     bisik_category NOT NULL,
  status       bisik_status NOT NULL DEFAULT 'waiting',
  created_at   timestamptz DEFAULT now(),
  matched_at   timestamptz,
  ended_at     timestamptz,
  end_reason   text CHECK (end_reason IN ('timeout', 'user_exit', 'reported', 'natural'))
);

CREATE TABLE bisik_participants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES bisik_sessions(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  nickname    text NOT NULL,
  mood_check  bisik_mood NOT NULL,
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

CREATE TABLE bisik_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES bisik_sessions(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES bisik_participants(id),
  content     text NOT NULL CHECK (char_length(content) <= 500),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE bisik_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid REFERENCES bisik_sessions(id),
  reporter_id  uuid REFERENCES bisik_participants(id),
  reason       text NOT NULL CHECK (reason IN ('konten_tidak_pantas', 'spam', 'pelecehan', 'ujaran_kebencian', 'lainnya')),
  detail       text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_bisik_sessions_matching ON bisik_sessions(category, status, created_at) WHERE status = 'waiting';

-- BISIK RLS
ALTER TABLE bisik_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisik_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisik_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bisik_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read bisik sessions" ON bisik_sessions FOR SELECT USING (true);
CREATE POLICY "participants can update bisik session" ON bisik_sessions
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM bisik_participants WHERE session_id = bisik_sessions.id AND user_id = auth.uid()
  ));
CREATE POLICY "users can insert bisik sessions" ON bisik_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "participants can read participants" ON bisik_participants
  FOR SELECT USING (session_id IN (SELECT session_id FROM bisik_participants WHERE user_id = auth.uid()));
CREATE POLICY "users can insert own participation" ON bisik_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "session participants can read messages" ON bisik_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM bisik_participants WHERE session_id = bisik_messages.session_id AND user_id = auth.uid()
  ));
CREATE POLICY "session participants can insert messages" ON bisik_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM bisik_participants WHERE session_id = bisik_messages.session_id AND user_id = auth.uid()
  ));

CREATE POLICY "participants can insert reports" ON bisik_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "participants can read own reports" ON bisik_reports
  FOR SELECT USING (reporter_id IN (SELECT id FROM bisik_participants WHERE user_id = auth.uid()));

-- Enable Realtime untuk tabel yang perlu
ALTER PUBLICATION supabase_realtime ADD TABLE bisik_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE bisik_messages;
