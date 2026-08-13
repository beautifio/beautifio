-- ============================================
-- 30 BOT SYSTEM: auth.users + public.users + profiles + cards
-- ============================================

-- 1. All 30 bot auth.users entries
DO $$
BEGIN
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role) VALUES
  ('a0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','b1@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','b2@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','b3@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','b4@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','b5@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','b6@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','b7@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','b8@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','b9@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000000','b10@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000001f','00000000-0000-0000-0000-000000000000','b11@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000000','b12@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000000','b13@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000000','b14@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000000','b15@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000000','b16@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000000','b17@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000000','b18@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000000','b19@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000000','b20@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000005b','00000000-0000-0000-0000-000000000000','b21@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000005c','00000000-0000-0000-0000-000000000000','b22@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000005d','00000000-0000-0000-0000-000000000000','b23@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000005e','00000000-0000-0000-0000-000000000000','b24@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-00000000005f','00000000-0000-0000-0000-000000000000','b25@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000060','00000000-0000-0000-0000-000000000000','b26@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000061','00000000-0000-0000-0000-000000000000','b27@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000062','00000000-0000-0000-0000-000000000000','b28@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000063','00000000-0000-0000-0000-000000000000','b29@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated'),
  ('a0000000-0000-0000-0000-000000000064','00000000-0000-0000-0000-000000000000','b30@bi.internal','',NOW(),'{}',NOW(),NOW(),'authenticated','authenticated')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 2. All 30 public.users entries
INSERT INTO public.users (id, full_name, email, is_bot, role, created_at) VALUES
  ('a0000000-0000-0000-0000-000000000001','Rani','b1@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000002','Bella','b2@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000003','Dewi','b3@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000004','Maya','b4@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000005','Putri','b5@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000006','Anisa','b6@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000007','Lita','b7@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000008','Karin','b8@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000009','Dian','b9@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000000a','Nadia','b10@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000001f','Reza','b11@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000020','Tika','b12@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000021','Rizky','b13@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000022','Sari','b14@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000023','Winda','b15@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000024','Gilang','b16@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000025','Vina','b17@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000026','Yoga','b18@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000027','Citra','b19@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000028','Hendra','b20@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000005b','Fikri','b21@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000005c','Rina','b22@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000005d','Bayu','b23@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000005e','Dita','b24@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-00000000005f','Ardi','b25@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000060','Intan','b26@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000061','Dimas','b27@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000062','Laras','b28@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000063','Irfan','b29@bi.internal',true,'mentor',NOW()),
  ('a0000000-0000-0000-0000-000000000064','Nita','b30@bi.internal',true,'mentor',NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. All 30 tebak_bot_profiles (DISC spread: 7D 8I 8S 7C)
INSERT INTO public.tebak_bot_profiles (id, display_name, disc_type, disc_secondary, komunikasi_type, bio, interests, typing_style, emoji_style) VALUES
  ('a0000000-0000-0000-0000-000000000001','Rani','D',NULL,'Langsung','barista Jaksel, kuliah manajemen sem akhir',ARRAY['kopi','karier','self-improvement'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000002','Bella','I',NULL,'Ekspresif','mahasiswi DKV, jualan sticker online',ARRAY['dkv','drakor','kpop'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000003','Dewi','S',NULL,'Empatik','guru TK, punya 3 kucing',ARRAY['anak kecil','kucing','baking'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000004','Maya','C',NULL,'Tenang','data analyst di startup, suka baca',ARRAY['data','buku','psikologi'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000005','Putri','D','I','Langsung','freelance sosmed, anak pertama',ARRAY['sosmed','film','self-development'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000006','Anisa','I','S','Ekspresif','event organizer, part-time model',ARRAY['fashion','event','psikologi ringan'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000007','Lita','S','C','Empatik','admin klinik, introvert',ARRAY['skincare','journaling','novel'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000008','Karin','C','D','Tenang','arsitek junior, perantau Bandung',ARRAY['arsitektur','design','coffee shop','travel'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000009','Dian','D',NULL,'Langsung','lagi ngejar target karier sambil kuliah',ARRAY['karier','fitness','side hustle'],'singkat','sedikit'),
  ('a0000000-0000-0000-0000-00000000000a','Nadia','I','S','Ekspresif','suka ngobrol random, kadang keceplosan',ARRAY['kuliner','travel','film indie'],'medium','banyak'),
  ('a0000000-0000-0000-0000-00000000001f','Reza','D','C','Langsung','freelance di bidang kreatif, suka tantangan',ARRAY['design','music','self-improvement'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000020','Tika','I',NULL,'Ekspresif','lagi kuliah sambil nyari jati diri',ARRAY['fashion','beauty','daily life'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000021','Rizky','S',NULL,'Empatik','setia dengerin curhat temen',ARRAY['music','journaling','volunteer'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000022','Sari','C','S','Tenang','teliti, kadang overthinking',ARRAY['riset','buku','life hack','produktivitas'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000023','Winda','I','D','Ekspresif','hobi explore kafe dan ketemu orang baru',ARRAY['coffee shop','fotografi','sosmed'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000024','Gilang','S',NULL,'Empatik','nyaman di rutinitas, tapi pengen keluar zona',ARRAY['gaming','kuliner','daily vlog'],'singkat','sedikit'),
  ('a0000000-0000-0000-0000-000000000025','Vina','C',NULL,'Tenang','suka belajar hal random dari internet',ARRAY['tech','edukasi','podcast','data'],'medium','jarang'),
  ('a0000000-0000-0000-0000-000000000026','Yoga','D','S','Langsung','pengen cepet mandiri dan punya usaha',ARRAY['bisnis','tech','sports'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000027','Citra','I',NULL,'Ekspresif','suka cerita random, kadang lebay',ARRAY['drakor','meme','relationship drama'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000028','Hendra','S','C','Empatik','pendengar yang baik, jarang cerita diri sendiri',ARRAY['otomotif','diy','daily life'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-00000000005b','Fikri','C','D','Tenang','perfeksionis, suka riset sebelum ambil keputusan',ARRAY['tech','investasi','life hack'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-00000000005c','Rina','S',NULL,'Empatik','suka hal2 tenang, pelan tapi pasti',ARRAY['gardening','baking','mindfulness'],'medium','banyak'),
  ('a0000000-0000-0000-0000-00000000005d','Bayu','D',NULL,'Langsung','ambisius, gak suka basa-basi',ARRAY['bisnis','leadership','sports'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-00000000005e','Dita','I','S','Ekspresif','suka jadi pusat perhatian, energi positif',ARRAY['event','music','volunteer'],'medium','banyak'),
  ('a0000000-0000-0000-0000-00000000005f','Ardi','C',NULL,'Tenang','analitis, pendiam, setia kawan',ARRAY['coding','game','anime'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000060','Intan','S','I','Empatik','sabar, suka bantu orang, kadang lupa diri sendiri',ARRAY['volunteer','anak kecil','kuliner'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000061','Dimas','D','C','Langsung','tegas, suka bikin keputusan cepet',ARRAY['bisnis','fitness','self-improvement'],'singkat','jarang'),
  ('a0000000-0000-0000-0000-000000000062','Laras','I',NULL,'Ekspresif','ceria, spontan, kadang random',ARRAY['dance','fashion','travel'],'medium','banyak'),
  ('a0000000-0000-0000-0000-000000000063','Irfan','S','D','Empatik','kalem tapi bisa tegas kalau perlu',ARRAY['music','coffee','daily life'],'medium','sedikit'),
  ('a0000000-0000-0000-0000-000000000064','Nita','C','S','Tenang','suka baca, jarang ngomong, tapi kalau udah nyambung seru',ARRAY['novel','journaling','psikologi'],'singkat','sedikit')
ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name, disc_type=EXCLUDED.disc_type, bio=EXCLUDED.bio, interests=EXCLUDED.interests, typing_style=EXCLUDED.typing_style, emoji_style=EXCLUDED.emoji_style, is_active=true;

-- 4. All 30 bisik_cards
DO $$
DECLARE
  topic_id UUID;
  c1 TEXT := 'Kadang ngerasa stuck antara passion sama tuntutan hidup. Udah semester akhir masih bingung. Ada yang relate?';
  c2 TEXT := 'Aku tipe yg overthinking abis ngobrol. Duh tadi ngomongnya aneh gak ya? Sampe susah tidur. Ada yg sama?';
  c3 TEXT := 'Kerjaan yg itu-itu aja bikin ngerasa gak berkembang. Tapi takut keluar zona nyaman. Ada yg pernah?';
  c4 TEXT := 'Overthinking tiap malem: apa aku cukup baik ya? Kenapa semua orang di sosmed lebih sukses?';
  c5 TEXT := 'Capek jadi anak pertama yg harus selalu kuat. Kadang pengen ada yg dengerin tanpa nge-judge.';
  c6 TEXT := 'Baru sadar temenku toxic setelah 3 tahun. Gimana cara move on dari pertemanan kayak gini?';
  c7 TEXT := 'Aku introvert yg pengen punya temen ngobrol, tapi susah mulai duluan. Kadang kesepian.';
  c8 TEXT := 'Baru pindah kota sendirian buat kerja. Sepi banget tapi gengsi ngaku. Ada temen ngobrol?';
BEGIN
  SELECT id INTO topic_id FROM public.bisik_topics WHERE is_active = true ORDER BY display_order LIMIT 1;
  IF topic_id IS NULL THEN SELECT id INTO topic_id FROM public.bisik_topics LIMIT 1; END IF;
  IF topic_id IS NULL THEN INSERT INTO public.bisik_topics (name, emoji, is_active, display_order) VALUES ('Curhat','💭',true,1) RETURNING id INTO topic_id; END IF;

  DELETE FROM public.bisik_cards WHERE user_id IN (SELECT id FROM public.users WHERE is_bot = true);

  INSERT INTO public.bisik_cards (user_id, topic_id, content, is_active, expires_at) VALUES
    ('a0000000-0000-0000-0000-000000000001',topic_id,c1,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000002',topic_id,c2,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000003',topic_id,c3,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000004',topic_id,c4,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000005',topic_id,c5,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000006',topic_id,c6,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000007',topic_id,c7,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000008',topic_id,c8,true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000009',topic_id,'Lagi di fase hidup yg semua serba gas. Tapi jujur capek. Butuh ngobrol santai tanpa dituntut.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000000a',topic_id,'Hidup tuh random banget ya. Baru aja ngalamin hal absurd. Ada yg mau dengerin cerita receh?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000001f',topic_id,'Kerja keras setiap hari tapi ngerasa gak kemana-mana. Pengen cerita sama orang yg ngerti.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000020',topic_id,'Lagi butuh temen random buat ngobrolin hal receh. Dari drakor sampe meme. Siapa tau nyambung!',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000021',topic_id,'Seneng jadi pendengar, tapi kadang pengen didengerin juga. Ada yg paham gak sih rasanya?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000022',topic_id,'Suka riset segala hal sampe detail. Tapi soal relationship, bingung sendiri. Ada tips?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000023',topic_id,'Kadang ngerasa semua orang punya circle kecuali aku. Pengen ngobrol aja gak tau mulai dari mana.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000024',topic_id,'Hidup tenang itu enak, tapi kadang ngerasa hidup tuh gitu-gitu aja. Butuh temen ngobrol baru.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000025',topic_id,'Punya standar tinggi buat diri sendiri. Tapi kadang nyiksa. Gimana caranya lebih santai ya?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000026',topic_id,'Capek harus selalu jadi leader. Kadang pengen jadi orang yg santai aja. Ada temen ngobrol?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000027',topic_id,'Baru putus dan pengen ngobrol random biar gak kepikiran terus. Ada yg mau nemenin?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000028',topic_id,'Kadang ngerasa terlalu baik ke orang lain, giliran butuh malah sepi. Capek jadi people pleaser.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000005b',topic_id,'Suka overthinking tentang masa depan. Semua udah direncanain tapi tetep anxious. Ada yg sama?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000005c',topic_id,'Pengen hidup simple dan tenang aja. Tapi dunia kayaknya maksa kita buat selalu hustle. Capek.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000005d',topic_id,'Target tahun ini banyak yg belum tercapai. Ngerasa gagal tapi gak mau nyerah. Butuh temen ngobrol.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000005e',topic_id,'Kangen masa kuliah yg seru. Sekarang kerja rutin bikin ngerasa tua sebelum waktunya. Huhu.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-00000000005f',topic_id,'Diem bukan berarti gak peduli. Cuma susah ekspresiin perasaan. Ada yg ngerti?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000060',topic_id,'Kadang lupa sama diri sendiri karena sibuk ngurusin orang lain. Butuh diingetin buat self-care.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000061',topic_id,'Bosen kerja kantoran, pengen coba hal baru. Tapi takut financially gak stabil. Dilema.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000062',topic_id,'Hidup udah susah, masak gak boleh happy? Yuk ngobrol random aja, lupakan masalah bentar.',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000063',topic_id,'Baru move on setelah 2 tahun. Ternyata bisa juga ya. Tapi takut mulai lagi. Ada yg relate?',true,'2099-12-31'),
    ('a0000000-0000-0000-0000-000000000064',topic_id,'Suka bantu orang lain tapi kadang ngerasa dimanfaatin. Gimana cara bikin boundaries yg sehat?',true,'2099-12-31');
END $$;
