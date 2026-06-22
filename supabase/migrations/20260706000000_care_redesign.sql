-- Beautifio Care Redesign: add columns, chat tables, schedule

-- 1. Add columns to care_categories
ALTER TABLE care_categories
ADD COLUMN IF NOT EXISTS panduan_steps JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS template_laporan TEXT,
ADD COLUMN IF NOT EXISTS template_wa TEXT,
ADD COLUMN IF NOT EXISTS template_email TEXT;

-- Update seed data with templates
UPDATE care_categories SET
  panduan_steps = '[
    "Dokumentasikan kejadian dengan foto/video jika aman",
    "Catat tanggal, waktu, dan lokasi kejadian",
    "Simpan bukti komunikasi (screenshot, pesan)",
    "Hubungi orang terpercaya di sekitarmu",
    "Laporkan ke lembaga yang tepat dengan panduan di bawah"
  ]'::jsonb,
  template_laporan = E'Nama: {{nama}}\nTanggal Kejadian: {{tanggal}}\nLokasi: {{lokasi}}\nDeskripsi Kejadian: {{deskripsi}}\nTindakan yang Sudah Diambil: {{tindakan}}\nHarapan/Permintaan: {{harapan}}',
  template_wa = E'Halo, saya membutuhkan bantuan terkait {{kategori}}.\n\nNama saya {{nama}} dan saya mengalami:\n{{deskripsi}}\n\nKejadian terjadi pada {{tanggal}} di {{lokasi}}.\n\nMohon bantuannya. Terima kasih.',
  template_email = E'Kepada Yth. Tim {{lembaga}},\n\nSaya yang bertanda tangan di bawah ini:\nNama    : {{nama}}\nAlamat  : {{lokasi}}\nTanggal : {{tanggal}}\n\nDengan ini melaporkan kejadian sebagai berikut:\n{{deskripsi}}\n\nTindakan yang sudah saya ambil:\n{{tindakan}}\n\nHarapan/permintaan saya:\n{{harapan}}\n\nDemikian laporan ini saya buat dengan sebenar-benarnya.\nMohon bantuan dan tindak lanjutnya.\n\nHormat saya,\n{{nama}}'
WHERE name = 'Perlindungan';

UPDATE care_categories SET
  panduan_steps = '[
    "Kumpulkan dokumen hukum yang kamu miliki",
    "Catat kronologi kejadian secara detail",
    "Simpan bukti pendukung (surat, kontrak, bukti pembayaran)",
    "Konsultasikan dengan ahli hukum",
    "Ajukan bantuan hukum ke lembaga terkait"
  ]'::jsonb,
  template_wa = E'Halo, saya butuh bantuan hukum terkait {{kategori}}.\n\nNama saya {{nama}}.\n{{deskripsi}}\n\nMohon informasinya. Terima kasih.'
WHERE name = 'Bantuan Hukum';

UPDATE care_categories SET
  panduan_steps = '[
    "Cari tempat yang tenang dan nyaman",
    "Tar napas dalam-dalam beberapa kali",
    "Ingat bahwa kamu tidak sendirian",
    "Hubungi konselor atau teman terpercaya",
    "Ikuti panduan konselor untuk langkah selanjutnya"
  ]'::jsonb,
  template_wa = E'Halo, saya ingin konsultasi psikologi.\n\nNama saya {{nama}}.\n{{deskripsi}}\n\nMohon bantuannya. Terima kasih.'
WHERE name = 'Psikologi & Mental Health';

UPDATE care_categories SET
  panduan_steps = '[
    "Tenangkan diri dan ambil wudhu jika perlu",
    "Tulis pertanyaan atau masalah yang ingin ditanyakan",
    "Sampaikan dengan jujur dan terbuka",
    "Ikuti nasihat dengan hati terbuka"
  ]'::jsonb,
  template_wa = E'Halo, saya ingin konsultasi agama.\n\nNama saya {{nama}}.\n{{deskripsi}}\n\nMohon bimbingannya. Terima kasih.'
WHERE name = 'Konsultasi Agama';

UPDATE care_categories SET
  panduan_steps = '[
    "Segera jauhkan diri dari pelaku jika masih dalam situasi berbahaya",
    "Dokumentasikan bukti bullying (screenshot, rekaman, saksi)",
    "Laporkan ke pihak berwenang (sekolah, kampus, polisi)",
    "Hubungi lembaga perlindungan untuk pendampingan",
    "Jangan simpan sendiri - ceritakan pada orang terpercaya"
  ]'::jsonb,
  template_wa = E'Halo, saya mengalami bullying/kekerasan.\n\nNama saya {{nama}}.\n{{deskripsi}}\n\nKejadian terjadi pada {{tanggal}} di {{lokasi}}.\n\nMohon bantuannya. Terima kasih.'
WHERE name = 'Kekerasan & Bullying';

UPDATE care_categories SET
  panduan_steps = '[
    "Jangan panik, kamu sudah di tempat yang tepat",
    "Ceritakan situasimu dengan tenang",
    "Tim kami akan mengarahkanmu ke bantuan yang sesuai",
    "Ikuti panduan yang diberikan"
  ]'::jsonb,
  template_wa = E'Halo, saya butuh bantuan.\n\nNama saya {{nama}}.\n{{deskripsi}}\n\nMohon diarahkan. Terima kasih.'
WHERE name = 'Hotline Umum';

-- 2. Chat sessions table
CREATE TABLE IF NOT EXISTS care_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  user_address TEXT,
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting','active','closed')),
  officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE care_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON care_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create sessions"
  ON care_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage sessions"
  ON care_chat_sessions FOR ALL
  USING (public.user_has_role(ARRAY['admin','superadmin','redaksi']));

-- 3. Chat messages table
CREATE TABLE IF NOT EXISTS care_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES care_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user','officer','system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_messages_session
  ON care_chat_messages(session_id, created_at);

ALTER TABLE care_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants view messages"
  ON care_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM care_chat_sessions
      WHERE id = session_id
      AND (user_id = auth.uid() OR officer_id = auth.uid())
    ) OR public.user_has_role(ARRAY['admin','superadmin','redaksi'])
  );

CREATE POLICY "Users send messages"
  ON care_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 4. Officer schedule table
CREATE TABLE IF NOT EXISTS care_officer_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  next_available TIMESTAMPTZ,
  message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO care_officer_schedule (category, is_online, message)
VALUES
  ('psikologi', false, 'Konselor psikologi kami akan segera hadir'),
  ('agama', false, 'Tim konselor agama akan segera hadir'),
  ('umum', false, 'Tim Beautifio Care akan segera hadir')
ON CONFLICT DO NOTHING;

ALTER TABLE care_officer_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read schedule"
  ON care_officer_schedule FOR SELECT USING (true);

CREATE POLICY "Admin manage schedule"
  ON care_officer_schedule FOR ALL
  USING (public.user_has_role(ARRAY['admin','superadmin']));
