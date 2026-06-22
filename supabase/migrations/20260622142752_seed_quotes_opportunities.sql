-- Seed 30 quotes harian
INSERT INTO quotes (content, author, category, is_active) VALUES

-- MIMPI & MASA DEPAN
('Mimpimu bukan terlalu besar. Langkahmu yang perlu dimulai.',
 'Anonim', 'mimpi', true),
('Masa depan milik mereka yang percaya pada keindahan mimpinya.',
 'Eleanor Roosevelt', 'mimpi', true),
('Jangan tunggu sempurna. Mulai sekarang, perbaiki di jalan.',
 'Anonim', 'mimpi', true),
('Satu langkah kecil hari ini lebih berarti dari seribu rencana yang tidak dimulai.',
 'Anonim', 'mimpi', true),
('Kamu tidak harus terlihat hebat untuk memulai, tapi kamu harus memulai untuk terlihat hebat.',
 'Zig Ziglar', 'mimpi', true),

-- KARIR & PERTUMBUHAN
('Kesuksesan bukan soal seberapa cepat kamu tiba, tapi seberapa konsisten kamu berjalan.',
 'Anonim', 'karir', true),
('Bukan bakat yang menentukan segalanya, tapi ketekunan yang mengubah biasa jadi luar biasa.',
 'Anonim', 'karir', true),
('Setiap ahli pernah menjadi pemula. Teruslah belajar.',
 'Helen Hayes', 'karir', true),
('Pekerjaan terbaik adalah yang membuatmu lupa itu pekerjaan.',
 'Anonim', 'karir', true),
('Investasi terbaik yang bisa kamu lakukan adalah pada dirimu sendiri.',
 'Warren Buffett', 'karir', true),

-- MENTAL HEALTH & SELF LOVE
('Merawat diri sendiri bukan egois. Itu kebutuhan.',
 'Anonim', 'mental_health', true),
('Kamu tidak harus kuat setiap saat. Istirahat juga bagian dari perjalanan.',
 'Anonim', 'mental_health', true),
('Bandingkan dirimu dengan dirimu kemarin, bukan dengan orang lain hari ini.',
 'Jordan Peterson', 'mental_health', true),
('Pikiran yang tenang adalah harta yang paling berharga.',
 'Anonim', 'mental_health', true),
('Tidak apa-apa belum tahu arahnya. Yang penting kamu masih bergerak.',
 'Anonim', 'mental_health', true),

-- PEREMPUAN & EMPOWERMENT
('Perempuan yang mendukung perempuan lain adalah kekuatan paling nyata di dunia.',
 'Anonim', 'perempuan', true),
('Kamu lebih kuat dari yang kamu kira, lebih berani dari yang kamu percaya.',
 'A.A. Milne', 'perempuan', true),
('Jadilah perempuan yang ingin kamu lihat di dunia.',
 'Anonim', 'perempuan', true),
('Keberanianmu menginspirasi lebih banyak orang dari yang kamu sadari.',
 'Anonim', 'perempuan', true),
('Suaramu penting. Ceritamu berharga. Hidupmu berarti.',
 'Anonim', 'perempuan', true),

-- PENDIDIKAN & BELAJAR
('Pendidikan bukan mengisi ember, tapi menyalakan api.',
 'W.B. Yeats', 'pendidikan', true),
('Semakin banyak kamu belajar, semakin banyak kamu tahu bisa dicapai.',
 'Anonim', 'pendidikan', true),
('Buku adalah jendela dunia, rasa ingin tahu adalah kuncinya.',
 'Anonim', 'pendidikan', true),
('Jangan takut salah. Kesalahan adalah guru terbaik yang pernah ada.',
 'Anonim', 'pendidikan', true),
('Setiap hari adalah kesempatan untuk belajar sesuatu yang baru.',
 'Anonim', 'pendidikan', true),

-- HUBUNGAN & KOMUNITAS
('Kamu tidak harus melewati segalanya sendirian.',
 'Anonim', 'komunitas', true),
('Orang yang tepat akan mendukung mimpimu, bukan memadamkannya.',
 'Anonim', 'komunitas', true),
('Lingkungan yang baik adalah investasi terbaik untuk masa depanmu.',
 'Anonim', 'komunitas', true),
('Bersama kita tumbuh. Sendiri kita mungkin cepat, bersama kita pasti lebih jauh.',
 'Pepatah Afrika', 'komunitas', true),
('Temukan orang-orang yang percaya pada mimpimu saat kamu sendiri meragukannya.',
 'Anonim', 'komunitas', true)

ON CONFLICT DO NOTHING;

-- Helper function to generate slug from title
CREATE OR REPLACE FUNCTION slugify(title TEXT)
RETURNS TEXT
LANGUAGE SQL IMMUTABLE STRICT
AS $$
  SELECT lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
$$;

-- Seed 20 opportunities with auto-generated slugs and default location
INSERT INTO opportunities
  (title, slug, category, organization, description, deadline, url, location, is_active)
VALUES

-- BEASISWA
('Beasiswa Unggulan Kemendikbud', slugify('Beasiswa Unggulan Kemendikbud'),
 'beasiswa', 'Kemendikbud',
 'Program beasiswa dari Kementerian Pendidikan untuk mahasiswa berprestasi. Mencakup biaya kuliah, biaya hidup, dan pengembangan diri.',
 '2025-08-31', 'https://beasiswaunggulan.kemdikbud.go.id', 'Seluruh Indonesia', true),

('Program Beasiswa LPDP', slugify('Program Beasiswa LPDP'),
 'beasiswa', 'LPDP',
 'Beasiswa penuh untuk S2 dan S3 dalam dan luar negeri. Tersedia untuk berbagai bidang studi dengan dukungan penuh biaya pendidikan.',
 '2025-09-30', 'https://lpdp.kemenkeu.go.id', 'Dalam & Luar Negeri', true),

('Beasiswa Djarum Plus', slugify('Beasiswa Djarum Plus'),
 'beasiswa', 'Djarum Foundation',
 'Program beasiswa dan pengembangan soft skill untuk mahasiswa aktif S1 semester 4 ke atas dengan IPK minimal 3.0.',
 '2025-07-31', 'https://djarumbeasiswaplus.org', 'Seluruh Indonesia', true),

('Beasiswa Bank Indonesia', slugify('Beasiswa Bank Indonesia'),
 'beasiswa', 'Bank Indonesia',
 'Beasiswa untuk mahasiswa D3/S1 yang berprestasi dan aktif berkontribusi di masyarakat.',
 '2025-08-15', 'https://www.bi.go.id/beasiswa', 'Seluruh Indonesia', true),

-- MAGANG
('Magang Kampus Merdeka', slugify('Magang Kampus Merdeka'),
 'magang', 'Kemendikbud / Kampus Merdeka',
 'Program magang 1-2 semester di perusahaan mitra Kemendikbud. Diakui sebagai SKS kuliah dan mendapat uang saku.',
 '2025-07-15', 'https://kampusmerdeka.kemdikbud.go.id', 'Seluruh Indonesia', true),

('Google STEP Internship', slugify('Google STEP Internship'),
 'magang', 'Google',
 'Program magang untuk mahasiswa tahun pertama dan kedua di bidang software engineering. Bimbingan dari engineer Google.',
 '2025-08-01', 'https://careers.google.com/students', 'Remote / Jakarta', true),

('Magang Profesional BCA', slugify('Magang Profesional BCA'),
 'magang', 'Bank BCA',
 'Program magang 6 bulan di Bank BCA untuk mahasiswa S1 semester akhir berbagai jurusan.',
 '2025-07-20', 'https://www.bca.co.id/karir', 'Jakarta & Kota Besar', true),

('Microsoft Internship Program', slugify('Microsoft Internship Program'),
 'magang', 'Microsoft Indonesia',
 'Magang teknis dan non-teknis di Microsoft Indonesia. Terbuka untuk mahasiswa S1 dan S2 aktif.',
 '2025-08-10', 'https://careers.microsoft.com', 'Jakarta / Remote', true),

-- KOMPETISI
('Kompetisi Wirausaha Muda Mandiri', slugify('Kompetisi Wirausaha Muda Mandiri'),
 'kompetisi', 'Bank Mandiri',
 'Kompetisi bisnis untuk mahasiswa dan pemuda Indonesia. Hadiah ratusan juta dan mentoring dari pengusaha sukses.',
 '2025-09-15', 'https://wirausahamuda.mandiri.co.id', 'Seluruh Indonesia', true),

('National University Debating Championship', slugify('National University Debating Championship'),
 'kompetisi', 'NUDC',
 'Kompetisi debat bahasa Inggris tingkat nasional antar universitas. Kesempatan mewakili Indonesia di kompetisi internasional.',
 '2025-08-20', 'https://www.nudc.id', 'Seluruh Indonesia', true),

('Olimpiade Sains Nasional Mahasiswa', slugify('Olimpiade Sains Nasional Mahasiswa'),
 'kompetisi', 'Kemendikbud',
 'Kompetisi sains bergengsi untuk mahasiswa S1 di bidang matematika, fisika, kimia, biologi, dan komputer.',
 '2025-07-25', 'https://dikti.kemdikbud.go.id/osn', 'Seluruh Indonesia', true),

('Hackathon UI/UX Design Sprint', slugify('Hackathon UI UX Design Sprint'),
 'kompetisi', 'Tokopedia',
 'Kompetisi desain 48 jam untuk mahasiswa dan fresh graduate. Tema: solusi digital untuk masalah sosial Indonesia.',
 '2025-08-05', 'https://careers.tokopedia.com/hackathon', 'Jakarta / Online', true),

-- RELAWAN
('Program Indonesia Mengajar', slugify('Program Indonesia Mengajar'),
 'relawan', 'Indonesia Mengajar',
 'Program penempatan pengajar muda selama 1 tahun di daerah terpencil Indonesia. Untuk fresh graduate S1 semua jurusan.',
 '2025-08-31', 'https://indonesiamengajar.org', 'Seluruh Indonesia', true),

('Volunteer Yayasan Plan International', slugify('Volunteer Yayasan Plan International'),
 'relawan', 'Plan International Indonesia',
 'Program volunteer fokus pada pemberdayaan perempuan dan anak di Indonesia. Durasi 3-6 bulan.',
 '2025-09-01', 'https://plan-international.org/indonesia', 'Seluruh Indonesia', true),

('Program Youth Leadership AIESEC', slugify('Program Youth Leadership AIESEC'),
 'relawan', 'AIESEC Indonesia',
 'Program kepemimpinan dan volunteer internasional untuk mahasiswa aktif. Tersedia dalam dan luar negeri.',
 '2025-07-30', 'https://aiesec.or.id', 'Global', true),

-- PENDANAAN
('Startup Campus Bootcamp', slugify('Startup Campus Bootcamp'),
 'pendanaan', 'Startup Campus',
 'Bootcamp intensif 3 bulan untuk belajar product management, UI/UX, dan digital marketing dari praktisi industri.',
 '2025-07-10', 'https://startupcampus.id', 'Jakarta / Online', true),

('She Leads Program — UN Women', slugify('She Leads Program UN Women'),
 'pendanaan', 'UN Women Indonesia',
 'Program pengembangan kepemimpinan perempuan muda oleh UN Women Indonesia. Mentoring, workshop, dan networking.',
 '2025-08-15', 'https://unwomen.org/indonesia', 'Jakarta / Remote', true),

('Digital Talent Scholarship', slugify('Digital Talent Scholarship'),
 'pendanaan', 'Kominfo',
 'Program pelatihan digital gratis dari Kominfo. Tersedia kursus web dev, data science, cybersecurity, dan digital marketing.',
 '2025-09-30', 'https://digitalent.kominfo.go.id', 'Online', true),

('Gerakan 1000 Startup Digital', slugify('Gerakan 1000 Startup Digital'),
 'pendanaan', 'Kominfo',
 'Program inkubasi startup dari Kominfo untuk wirausaha muda digital. Mentoring, co-working, dan akses ke investor.',
 '2025-08-01', 'https://1000startupdigital.id', 'Seluruh Indonesia', true),

('Young Leaders for Indonesia McKinsey', slugify('Young Leaders for Indonesia McKinsey'),
 'pendanaan', 'McKinsey & Company',
 'Program kepemimpinan intensif 2 minggu untuk mahasiswa terbaik Indonesia dari McKinsey & Company.',
 '2025-07-20', 'https://mckinsey.com/yli-indonesia', 'Jakarta', true)

ON CONFLICT DO NOTHING;

DROP FUNCTION IF EXISTS slugify;
