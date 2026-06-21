-- Beautifio Care: categories & officers tables

CREATE TABLE IF NOT EXISTS care_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🆘',
  description TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_wa TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE care_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active categories"
  ON care_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin manage categories"
  ON care_categories FOR ALL
  USING (public.user_has_role(ARRAY['admin','superadmin']));

CREATE TABLE IF NOT EXISTS care_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES care_categories(id),
  is_online BOOLEAN DEFAULT false,
  next_available TIMESTAMPTZ,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE care_officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read officers"
  ON care_officers FOR SELECT
  USING (true);

CREATE POLICY "Admin manage officers"
  ON care_officers FOR ALL
  USING (public.user_has_role(ARRAY['admin','superadmin']));

-- Seed categories
INSERT INTO care_categories (name, emoji, description, contact_name, contact_phone, contact_wa, display_order) VALUES
('Perlindungan', '🛡️', 'Jika kamu mengalami kekerasan, ancaman, atau merasa tidak aman. Kami akan menghubungkanmu ke lembaga perlindungan terdekat.', 'Komnas Perempuan', '021-3903963', '08111129129', 1),
('Bantuan Hukum', '⚖️', 'Butuh pendampingan hukum atau tidak tahu hak-hakmu? Tim kami siap membantu mencarikan akses bantuan hukum.', 'YLBHI', '021-3929840', NULL, 2),
('Psikologi & Mental Health', '🧠', 'Merasa tertekan, cemas berlebihan, atau butuh seseorang untuk diajak bicara? Konselor kami siap mendengarkan.', 'Into The Light Indonesia', NULL, '081287877788', 3),
('Konsultasi Agama', '🕌', 'Butuh bimbingan spiritual atau konsultasi keagamaan dari ustadz/pendeta/pemuka agama terpercaya.', 'Tim Konselor Agama Beautifio', NULL, NULL, 4),
('Kekerasan & Bullying', '🚨', 'Mengalami bullying online/offline, kekerasan fisik atau verbal? Laporkan dan kami bantu prosesnya.', 'KPAI', '021-31901556', NULL, 5),
('Hotline Umum', '📞', 'Tidak tahu harus ke mana? Ceritakan masalahmu dan kami bantu arahkan ke bantuan yang tepat.', 'Hotline Beautifio Care', '119', NULL, 6)
ON CONFLICT DO NOTHING;
