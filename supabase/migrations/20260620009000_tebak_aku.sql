CREATE TYPE tebak_status AS ENUM ('waiting', 'active', 'finished');
CREATE TYPE tebak_round_status AS ENUM ('subject_answering', 'guesser_guessing', 'revealed', 'done');
CREATE TYPE tebak_player AS ENUM ('a', 'b');

CREATE TABLE tebak_question_bank (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options       jsonb NOT NULL,
  category      text DEFAULT 'umum' CHECK (category IN ('umum', 'makanan', 'hobi', 'kepribadian', 'hiburan', 'gaya_hidup')),
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE tebak_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_a_id      uuid REFERENCES users(id),
  player_b_id      uuid REFERENCES users(id),
  status           tebak_status NOT NULL DEFAULT 'waiting',
  score_a          int NOT NULL DEFAULT 0,
  score_b          int NOT NULL DEFAULT 0,
  current_round    int NOT NULL DEFAULT 1,
  current_q_seq    int NOT NULL DEFAULT 1,
  current_subject  tebak_player,
  created_at       timestamptz DEFAULT now(),
  finished_at      timestamptz,
  CONSTRAINT different_players CHECK (player_a_id != player_b_id)
);

CREATE TABLE tebak_rounds (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid REFERENCES tebak_sessions(id) ON DELETE CASCADE,
  subject_player tebak_player NOT NULL,
  round_number   int NOT NULL CHECK (round_number IN (1, 2)),
  status         tebak_round_status NOT NULL DEFAULT 'subject_answering',
  UNIQUE(session_id, round_number)
);

CREATE TABLE tebak_questions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id          uuid REFERENCES tebak_rounds(id) ON DELETE CASCADE,
  question_bank_id  uuid REFERENCES tebak_question_bank(id),
  question_text     text NOT NULL,
  options           jsonb NOT NULL,
  sequence_number   int NOT NULL CHECK (sequence_number BETWEEN 1 AND 5),
  correct_answer    text,
  subject_answered_at timestamptz,
  guesser_deadline  timestamptz,
  status            tebak_round_status DEFAULT 'subject_answering',
  UNIQUE(round_id, sequence_number)
);

CREATE TABLE tebak_answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES tebak_questions(id) ON DELETE CASCADE,
  guesser_id  uuid REFERENCES users(id),
  answer      text NOT NULL,
  is_correct  boolean,
  time_ms     int,
  answered_at timestamptz DEFAULT now()
);

-- TEBAK RLS
ALTER TABLE tebak_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE tebak_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tebak_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tebak_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tebak_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read active questions" ON tebak_question_bank
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin can manage question bank" ON tebak_question_bank
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('redaksi', 'superadmin')));

CREATE POLICY "players can read own sessions" ON tebak_sessions
  FOR SELECT USING (player_a_id = auth.uid() OR player_b_id = auth.uid());
CREATE POLICY "create session" ON tebak_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "players can update their session" ON tebak_sessions
  FOR UPDATE USING (player_a_id = auth.uid() OR player_b_id = auth.uid());

CREATE POLICY "players can read their rounds" ON tebak_rounds
  FOR SELECT USING (session_id IN (SELECT id FROM tebak_sessions WHERE player_a_id = auth.uid() OR player_b_id = auth.uid()));
CREATE POLICY "players can insert rounds" ON tebak_rounds FOR INSERT WITH CHECK (true);

-- Questions: players can read, but correct_answer is hidden until revealed
CREATE POLICY "players can read questions of their games" ON tebak_questions
  FOR SELECT USING (round_id IN (
    SELECT id FROM tebak_rounds WHERE session_id IN (
      SELECT id FROM tebak_sessions WHERE player_a_id = auth.uid() OR player_b_id = auth.uid()
    )
  ));
CREATE POLICY "players can insert question refs" ON tebak_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "subject can update their answer" ON tebak_questions
  FOR UPDATE USING (round_id IN (
    SELECT id FROM tebak_rounds WHERE session_id IN (
      SELECT id FROM tebak_sessions WHERE player_a_id = auth.uid() OR player_b_id = auth.uid()
    )
  ));

CREATE POLICY "players can read answers" ON tebak_answers
  FOR SELECT USING (guesser_id = auth.uid() OR question_id IN (
    SELECT id FROM tebak_questions WHERE round_id IN (
      SELECT id FROM tebak_rounds WHERE session_id IN (
        SELECT id FROM tebak_sessions WHERE player_a_id = auth.uid() OR player_b_id = auth.uid()
      )
    )
  ));
CREATE POLICY "players can insert answers" ON tebak_answers
  FOR INSERT WITH CHECK (guesser_id = auth.uid());

-- View untuk guesser: correct_answer disembunyikan sampai revealed
CREATE VIEW tebak_questions_for_guesser AS
  SELECT id, round_id, question_text, options, sequence_number, status,
    CASE WHEN status = 'revealed' THEN correct_answer ELSE NULL END AS correct_answer,
    guesser_deadline, subject_answered_at
  FROM tebak_questions;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tebak_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE tebak_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE tebak_answers;

-- SEED QUESTION BANK
INSERT INTO tebak_question_bank (question_text, options, category) VALUES
  ('Makanan favorit kamu adalah?', '["Bakso","Sate ayam","Mie goreng","Soto ayam"]', 'makanan'),
  ('Kalau weekend, kamu lebih suka?', '["Main di luar","Rebahan di rumah","Nongkrong kafe","Belanja"]', 'gaya_hidup'),
  ('Film yang paling sering kamu tonton ulang?', '["Action","Romantis","Komedi","Horror"]', 'hiburan'),
  ('Reaksi kamu saat kaget adalah?', '["Teriak","Diam","Ketawa","Lari"]', 'kepribadian'),
  ('Jam berapa kamu biasanya bangun pagi?', '["Sebelum 5 pagi","5-7 pagi","7-9 pagi","Setelah 9 pagi"]', 'gaya_hidup'),
  ('Minuman yang selalu ada di tanganmu?', '["Kopi","Teh","Air putih","Jus buah"]', 'makanan'),
  ('Kalau sedih, kamu cenderung?', '["Cerita ke teman","Diam sendiri","Nangis nonton film","Tidur"]', 'kepribadian'),
  ('Hobi yang paling sering kamu lakukan?', '["Baca buku","Main game","Olahraga","Dengar musik"]', 'hobi'),
  ('Warna favorit kamu?', '["Biru","Hitam","Putih","Merah"]', 'umum'),
  ('Tempat liburan impian?', '["Gunung","Pantai","Kota besar","Luar negeri"]', 'umum'),
  ('Hewan peliharaan favorit?', '["Kucing","Anjing","Kelinci","Ikan"]', 'umum'),
  ('Genre musik favorit?', '["Pop","Rock","KPop","Dangdut"]', 'hiburan'),
  ('Aplikasi yang paling sering dibuka?', '["Instagram","TikTok","YouTube","Twitter/X"]', 'gaya_hidup'),
  ('Skill yang ingin kamu kuasai?', '["Coding","Public speaking","Menulis","Desain"]', 'hobi'),
  ('Tipe orang yang kamu sukai?', '["Lucu","Pendiam","Peduli","Petualang"]', 'kepribadian'),
  ('Makanan pedas level berapa yang kamu sanggup?', '["Tidak pedas","Sedang","Pedas","Extra pedas"]', 'makanan'),
  ('Lebih suka belajar dengan cara?', '["Baca buku","Nonton video","Praktek langsung","Diskusi"]', 'pendidikan'),
  ('Tempat favorit untuk mengerjakan tugas?', '["Kamar","Kafe","Perpustakaan","Co-working space"]', 'gaya_hidup'),
  ('Zodiak kamu?', '["Api (Aries,Leo,Sagitarius)","Tanah (Taurus,Virgo,Capricorn)","Udara (Gemini,Libra,Aquarius)","Air (Cancer,Scorpio,Pisces)"]', 'kepribadian'),
  ('Kalau punya uang lebih langsung?', '["Ditabung","Investasi","Belanja","Liburan"]', 'umum'),
  ('Aktivitas favorit saat hujan?', '["Tidur","Nonton film","Baca buku","Ngopi"]', 'gaya_hidup'),
  ('Game genre favorit?', '["MOBA","FPS","Puzzle","Petualangan"]', 'hobi'),
  ('Tipe pacar idaman?', '["Setia","Lucu","Mapan","Pengertian"]', 'percintaan'),
  ('Bahasa asing yang ingin dikuasai?', '["Inggris","Jepang","Korea","Mandarin"]', 'pendidikan');

-- RPC untuk increment score
CREATE OR REPLACE FUNCTION increment_tebak_score(
  session_id uuid, column text, amount int
) RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE tebak_sessions SET %I = %I + $1 WHERE id = $2', column, column)
    USING amount, session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
