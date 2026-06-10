-- Seed data for Roadmap Templates

DO $$
DECLARE
  t_id UUID;
  m1 UUID; m2 UUID; m3 UUID; m4 UUID;
BEGIN

-- ============ DOCTOR ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('doctor', 'Dokter', 'Jalur lengkap menjadi dokter profesional dari pendidikan kedokteran hingga spesialisasi.', 'doctor', 'Stethoscope', 'from-blue-600 to-cyan-500', '8-12 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Pendidikan Kedokteran Dasar', 'Menyelesaikan pendidikan S1 Kedokteran dan lulus ujian profesi.', 1, '[{"title":"Lulus SMA dengan nilai IPA unggul"},{"title":"Masuk fakultas kedokteran terakreditasi"},{"title":"Selesaikan S1 Kedokteran (6 semester)"},{"title":"Ikuti ujian profesi dokter (UKMPPD)"}]', 1825) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Program Internsip', 'Menjalani masa internsip di rumah sakit atau puskesmas.', 2, '[{"title":"Daftar program internsip"},{"title":"Rotasi di departemen utama"},{"title":"Dapatkan surat tanda registrasi (STR)"},{"title":"Selesaikan internsip dengan evaluasi baik"}]', 365) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Pendidikan Spesialisasi', 'Memilih dan menjalani pendidikan spesialisasi.', 3, '[{"title":"Pilih spesialisasi (bedah, anak, penyakit dalam)"},{"title":"Ikuti ujian masuk program spesialis"},{"title":"Selesaikan pendidikan spesialis (8 semester)"},{"title":"Publikasikan jurnal ilmiah"}]', 1460) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Praktik Mandiri & Karir', 'Memulai praktik sebagai dokter spesialis dan mengembangkan karir.', 4, '[{"title":"Dapatkan izin praktik (SIP)"},{"title":"Bergabung dengan rumah sakit atau buka praktik"},{"title":"Ikuti seminar dan pelatihan berkelanjutan"},{"title":"Bangun jaringan dengan kolega"}]', 730) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '1', 'Tech Founders Circle', 'Diskusi dengan mahasiswa kedokteran dari berbagai universitas.'),
  (t_id, m3, 'mentor', '1', 'Dr. Rudi Hartono', 'Dokter spesialis bedah dengan 15 tahun pengalaman.'),
  (t_id, m4, 'opportunity', '1', 'Program Dokter PTT', 'Penempatan dokter di daerah terpencil dengan insentif menarik.');

-- ============ FOOTBALL PLAYER ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('football-player', 'Pemain Sepak Bola', 'Roadmap menjadi pemain sepak bola profesional dari akademi hingga karir pro.', 'football-player', 'Trophy', 'from-green-600 to-emerald-500', '8-15 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Akademi Sepak Bola', 'Bergabung dengan akademi sepak bola dan menguasai fundamental.', 1, '[{"title":"Ikuti seleksi akademi sepak bola lokal"},{"title":"Kuasai teknik dasar (passing, dribbling, shooting)"},{"title":"Latihan rutin 4-5 kali seminggu"},{"title":"Ikuti kompetisi antar akademi"}]', 730) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Tim Junior', 'Masuk tim junior dan mengembangkan kemampuan taktik.', 2, '[{"title":"Masuk tim junior klub sepak bola"},{"title":"Pelajari formasi dan strategi permainan"},{"title":"Tingkatkan kebugaran fisik"},{"title":"Ikuti turnamen regional"}]', 730) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Tim Senior & Profesional', 'Menembus tim senior dan menandatangani kontrak profesional.', 3, '[{"title":"Promosi ke tim senior"},{"title":"Tanda tangan kontrak profesional"},{"title":"Jaga performa konsisten"},{"title":"Bangun personal branding di media sosial"}]', 730) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Puncak Karir', 'Mencapai performa puncak dan berkontribusi di level tertinggi.', 4, '[{"title":"Targetkan caps tim nasional"},{"title":"Jaga kondisi fisik dan mental"},{"title":"Kelola keuangan karir"},{"title":"Rencanakan karir setelah pensiun"}]', 1095) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '4', 'Green Warriors Circle', 'Temukan teman latihan dan sparing partner.'),
  (t_id, m3, 'mentor', '2', 'Bambang Pamungkas', 'Eks pemain timnas dengan pengalaman karir profesional.'),
  (t_id, m4, 'opportunity', '2', 'Program Pembinaan Atlet Muda', 'Beasiswa dan fasilitas latihan untuk atlet berbakat.');

-- ============ RUNNER ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('runner', 'Pelari', 'Program latihan lari dari pemula hingga mampu menyelesaikan maraton.', 'runner', 'Zap', 'from-orange-500 to-red-500', '6-12 bulan', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Dasar Lari & 5K', 'Memulai kebiasaan lari dan mencapai target 5 kilometer.', 1, '[{"title":"Beli sepatu lari yang sesuai"},{"title":"Ikuti program Couch to 5K"},{"title":"Lari 3 kali seminggu konsisten"},{"title":"Selesaikan lari 5K non-stop"}]', 60) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, '10K & Half Marathon', 'Meningkatkan jarak ke 10K dan setengah maraton.', 2, '[{"title":"Tingkatkan jarak lari bertahap (10% per minggu)"},{"title":"Ikuti program latihan 10K"},{"title":"Selesaikan lari 10K"},{"title":"Latihan half marathon (21K)"}]', 120) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Full Marathon', 'Menaklukkan jarak maraton penuh (42.195 km).', 3, '[{"title":"Ikuti program latihan maraton 16 minggu"},{"title":"Pelajari nutrisi dan hidrasi lari jarak jauh"},{"title":"Selesaikan long run 30K+"},{"title":"Finish maraton pertama!"}]', 150) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Peningkatan Performa', 'Meningkatkan waktu dan mengikuti lomba kompetitif.', 4, '[{"title":"Ikuti program speed work (interval, tempo)"},{"title":"Targetkan personal best baru"},{"title":"Ikuti lomba lari nasional"},{"title":"Bergabung dengan komunitas lari"}]', 180) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '4', 'Green Warriors Circle', 'Komunitas lari dan aktivitas outdoor.'),
  (t_id, m3, 'mentor', '3', 'Agus Prayogo', 'Pelari maraton nasional dengan pengalaman internasional.'),
  (t_id, m4, 'opportunity', '3', 'Event Lari Tahunan', 'Daftar event lari nasional dan dapatkan medali.');

-- ============ GOLFER ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('golfer', 'Pegolf', 'Panduan menjadi pegolf dari dasar hingga turnamen kompetitif.', 'golfer', 'Target', 'from-teal-600 to-green-500', '1-3 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Fundamental Golf', 'Menguasai teknik dasar bermain golf.', 1, '[{"title":"Pelajari grip dan stance yang benar"},{"title":"Kuasai teknik swing dasar"},{"title":"Latihan putting di practice green"},{"title":"Pahami etika dan peraturan golf"}]', 90) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Short Game & Lapangan', 'Memperbaiki short game dan mulai bermain di lapangan.', 2, '[{"title":"Latihan chipping dan pitching"},{"title":"Kuasai bunker shots"},{"title":"Main 9 hole reguler"},{"title":"Catat skor dan evaluasi"}]', 120) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Manajemen Lapangan', 'Strategi bermain di berbagai tipe lapangan.', 3, '[{"title":"Pelajari manajemen risiko di lapangan"},{"title":"Kuasai berbagai jenis pukulan"},{"title":"Main 18 hole reguler"},{"title":"Konsisten di skor 90-100"}]', 180) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Kompetisi & Turnamen', 'Mengikuti turnamen dan meningkatkan peringkat.', 4, '[{"title":"Ikuti turnamen amatir lokal"},{"title":"Dapatkan handicap resmi"},{"title":"Konsisten di skor 80-90"},{"title":"Bangun jaringan dengan pegolf lain"}]', 365) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '4', 'Green Warriors Circle', 'Komunitas golf amatir dan profesional.'),
  (t_id, m3, 'mentor', '4', 'Rory Mulyadi', 'Instruktur golf profesional bersertifikasi internasional.'),
  (t_id, m4, 'opportunity', '4', 'Turnamen Golf Amatir', 'Ikuti turnamen golf amatir nasional.');

-- ============ MUSICIAN ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('musician', 'Musisi', 'Jalur menjadi musisi dari belajar alat musik hingga produksi dan performa.', 'musician', 'Music', 'from-purple-600 to-pink-500', '2-5 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Dasar Musik', 'Mempelajari teori musik dan memilih alat musik.', 1, '[{"title":"Pelajari teori musik dasar (notasi, ritme, harmoni)"},{"title":"Pilih alat musik utama"},{"title":"Kuasai teknik dasar alat musik"},{"title":"Mainkan lagu sederhana"}]', 120) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Pengembangan Skill', 'Mengembangkan kemampuan teknis dan musikalitas.', 2, '[{"title":"Pelajari skala dan mode"},{"title":"Latihan improvisasi dasar"},{"title":"Bergabung dengan band atau ansambel"},{"title":"Rekam cover lagu"}]', 180) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Produksi & Performa', 'Belajar produksi musik dan tampil di depan publik.', 3, '[{"title":"Pelajari DAW (Digital Audio Workstation)"},{"title":"Produksi lagu orisinal pertama"},{"title":"Tampil di acara atau open mic"},{"title":"Bangun portofolio musik"}]', 365) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Karir Musik', 'Monetisasi bakat musik dan membangun karir.', 4, '[{"title":"Rilis lagu di platform digital"},{"title":"Bangun audiens di media sosial"},{"title":"Cari manajer atau label"},{"title":"Tur dan pertunjukan berbayar"}]', 730) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m2, 'circle', '2', 'Creative Lab Circle', 'Kolaborasi dengan musisi lain dan berbagi pengalaman.'),
  (t_id, m3, 'mentor', '5', 'Tohpati', 'Gitaris dan produser musik profesional.'),
  (t_id, m4, 'opportunity', '5', 'Festival Musik Independen', 'Daftar festival musik untuk exposure dan networking.');

-- ============ CONTENT CREATOR ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('content-creator', 'Content Creator', 'Panduan menjadi content creator dari nol hingga monetisasi dan scaling.', 'content-creator', 'Camera', 'from-pink-500 to-orange-400', '6-18 bulan', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Fundamental Konten', 'Menentukan niche dan memulai membuat konten.', 1, '[{"title":"Tentukan niche dan target audiens"},{"title":"Pilih platform utama (TikTok/IG/YouTube)"},{"title":"Buat jadwal posting konsisten"},{"title":"Pelajari dasar editing video"}]', 45) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Pertumbuhan Audiens', 'Mengembangkan audiens dan engagement.', 2, '[{"title":"Optimasi profil dan SEO konten"},{"title":"Gunakan tren dan audio viral"},{"title":"Interaksi aktif dengan audiens"},{"title":"Capai 1.000 followers"}]', 90) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Monetisasi', 'Mulai menghasilkan pendapatan dari konten.', 3, '[{"title":"Ikuti program monetisasi platform"},{"title":"Tawarkan jasa endorsement atau sponsor"},{"title":"Buat produk digital (ebook, template)"},{"title":"Capai 10.000 followers"}]', 120) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Scaling & Brand', 'Mengembangkan personal brand dan scaling bisnis.', 4, '[{"title":"Bangun tim atau kolaborator"},{"title":"Diversifikasi platform dan sumber pendapatan"},{"title":"Ciptakan produk fisik atau merch"},{"title":"Capai 50.000+ followers"}]', 180) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '2', 'Creative Lab Circle', 'Komunitas kreator untuk kolaborasi dan belajar.'),
  (t_id, m3, 'mentor', '6', 'Ria SW', 'Content creator dengan 500K+ followers di TikTok.'),
  (t_id, m4, 'opportunity', '6', 'Program Kreator TikTok', 'Akses fitur eksklusif dan pendampingan kreator.');

-- ============ ENTREPRENEUR ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('entrepreneur', 'Entrepreneur', 'Roadmap membangun bisnis dari ide hingga pertumbuhan.', 'entrepreneur', 'TrendingUp', 'from-amber-600 to-yellow-500', '1-3 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Ideasi & Validasi', 'Menemukan ide bisnis dan memvalidasinya.', 1, '[{"title":"Identifikasi masalah yang ingin dipecahkan"},{"title":"Lakukan riset pasar dan kompetitor"},{"title":"Validasi ide dengan target customer"},{"title":"Buat value proposition yang jelas"}]', 60) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'MVP & Launch', 'Membangun produk minimum dan meluncurkan bisnis.', 2, '[{"title":"Buat MVP (Minimum Viable Product)"},{"title":"Tentukan model bisnis dan harga"},{"title":"Urus legalitas usaha"},{"title":"Launch produk ke pasar"}]', 90) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Traction & Growth', 'Mendapatkan pelanggan pertama dan pertumbuhan.', 3, '[{"title":"Dapatkan 100 customer pertama"},{"title":"Optimasi strategi pemasaran"},{"title":"Kumpulkan dan olah feedback"},{"title":"Capai break-even point"}]', 180) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Skalasi Bisnis', 'Memperluas bisnis dan mencari pendanaan.', 4, '[{"title":"Rekrut tim inti"},{"title":"Ekspansi ke pasar baru"},{"title":"Ajukan pendanaan (angel/VC)"},{"title":"Bangun sistem dan operasional skalabel"}]', 365) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '1', 'Tech Founders Circle', 'Komunitas founder startup untuk diskusi dan mentoring.'),
  (t_id, m3, 'mentor', '7', 'William Tanuwijaya', 'Founder Tokopedia dengan pengalaman membangun unicorn.'),
  (t_id, m4, 'opportunity', '7', 'Akselerator Startup', 'Program akselerasi startup dengan pendanaan awal.');

-- ============ DIGITAL MARKETER ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('digital-marketer', 'Digital Marketer', 'Karir di pemasaran digital dari fundamental hingga strategi tingkat lanjut.', 'digital-marketer', 'Monitor', 'from-indigo-600 to-purple-500', '1-2 tahun', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Fundamental Marketing', 'Mempelajari dasar-dasar pemasaran digital.', 1, '[{"title":"Pelajari marketing funnel dan customer journey"},{"title":"Kuasai SEO dasar"},{"title":"Pahami social media marketing"},{"title":"Belajar Google Analytics"}]', 60) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Spesialisasi Channel', 'Mendalami channel pemasaran tertentu.', 2, '[{"title":"Pilih spesialisasi (SEO/SEM/Social/Email)"},{"title":"Kuasai Google Ads atau Meta Ads"},{"title":"Sertifikasi Google Digital Marketing"},{"title":"Kelola campaign nyata"}]', 90) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Strategi & Analisis', 'Mengembangkan strategi marketing berbasis data.', 3, '[{"title":"Pelajari marketing automation tools"},{"title":"Kuasai data analysis dan reporting"},{"title":"Buat marketing strategy plan"},{"title":"Optimasi conversion rate (CRO)"}]', 90) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Kepemimpinan & Konsultan', 'Memimpin tim marketing atau menjadi konsultan.', 4, '[{"title":"Bangun portofolio case studies"},{"title":"Kembangkan skill leadership"},{"title":"Bangun personal brand sebagai marketer"},{"title":"Tawarkan jasa konsultan"}]', 180) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '5', 'Data Science ID Circle', 'Analisis data untuk marketing.'),
  (t_id, m2, 'mentor', '8', 'Dina Maulana', 'Digital marketing lead di e-commerce terkemuka.'),
  (t_id, m4, 'opportunity', '8', 'Magang Digital Marketing', 'Program magang di agensi digital marketing.');

-- ============ PROGRAMMER ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('programmer', 'Programmer', 'Jalur menjadi programmer dari dasar coding hingga full-stack development.', 'programmer', 'Code', 'from-primary to-secondary', '6-12 bulan', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Fundamental Programming', 'Mempelajari dasar-dasar pemrograman.', 1, '[{"title":"Pilih bahasa pemrograman pertama"},{"title":"Kuasai variabel, fungsi, loop, conditional"},{"title":"Pahami struktur data dasar"},{"title":"Selesaikan 50+ soal coding"}]', 60) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Frontend atau Backend', 'Memilih dan mendalami jalur frontend atau backend.', 2, '[{"title":"Frontend: Kuasai HTML, CSS, JavaScript"},{"title":"Backend: Kuasai API, database, server"},{"title":"Buat project portofolio"},{"title":"Pelajari version control (Git)"}]', 90) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Full Stack & Deployment', 'Menguasai full-stack development dan deployment.', 3, '[{"title":"Pelajari database (SQL & NoSQL)"},{"title":"Kuasai deployment (Vercel, Railway, AWS)"},{"title":"Buat full-stack application"},{"title":"Pelajari testing dan CI/CD"}]', 90) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Karir Profesional', 'Memulai karir sebagai programmer profesional.', 4, '[{"title":"Bangun portofolio dan GitHub"},{"title":"Siapkan CV dan LinkedIn"},{"title":"Lamaran kerja dan interview"},{"title":"Kontribusi ke open source"}]', 180) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '5', 'Data Science ID Circle', 'Komunitas programmer untuk diskusi dan belajar.'),
  (t_id, m3, 'mentor', '9', 'Pak Anton', 'Senior engineer dengan pengalaman di FAANG.'),
  (t_id, m4, 'opportunity', '9', 'Program Magang Frontend', 'Magang di perusahaan tech terkemuka.');

-- ============ BEAUTY CREATOR ============
INSERT INTO roadmap_templates (slug, title, description, category, icon, color, estimated_duration, total_milestones)
VALUES ('beauty-creator', 'Beauty Creator', 'Panduan menjadi beauty creator dari skincare hingga konten dan brand.', 'beauty-creator', 'Sparkles', 'from-rose-500 to-pink-400', '6-18 bulan', 4)
RETURNING id INTO t_id;

INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Dasar Kecantikan', 'Mempelajari fundamental skincare dan makeup.', 1, '[{"title":"Pelajari jenis kulit dan skin concerns"},{"title":"Kuasai basic skincare routine"},{"title":"Pelajari teknik makeup dasar"},{"title":"Kenali alat dan produk kecantikan"}]', 45) RETURNING id INTO m1;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Konten Kecantikan', 'Membuat konten kecantikan yang engaging.', 2, '[{"title":"Buat konten tutorial skincare/makeup"},{"title":"Pelajari teknik fotografi produk"},{"title":"Konsisten posting di IG/TikTok"},{"title":"Review produk kecantikan"}]', 60) RETURNING id INTO m2;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Kolaborasi & Brand', 'Berkolaborasi dengan brand kecantikan.', 3, '[{"title":"Bangun media kit"},{"title":"Tawarkan jasa review ke brand kecil"},{"title":"Ikuti beauty event dan gathering"},{"title":"Capai 5.000 followers"}]', 90) RETURNING id INTO m3;
INSERT INTO roadmap_template_milestones (template_id, title, description, order_index, tasks, estimated_days) VALUES
  (t_id, 'Brand Pribadi', 'Membangun brand kecantikan sendiri.', 4, '[{"title":"Ciptakan produk kecantikan sendiri"},{"title":"Bangun website dan toko online"},{"title":"Kolaborasi dengan sesama beauty creator"},{"title":"Capai 20.000+ followers"}]', 180) RETURNING id INTO m4;
INSERT INTO roadmap_template_recommendations (template_id, milestone_id, resource_type, resource_id, resource_name, resource_description) VALUES
  (t_id, m1, 'circle', '2', 'Creative Lab Circle', 'Komunitas beauty creator untuk sharing dan kolaborasi.'),
  (t_id, m3, 'mentor', '10', 'Tasya Farasya', 'Beauty influencer dengan jutaan followers.'),
  (t_id, m4, 'opportunity', '10', 'Program Beauty Creator', 'Dukungan untuk beauty creator pemula dari brand ternama.');

END $$;
