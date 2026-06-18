-- ============================================================================
-- Migration: 20260618213113_recover_30_templates.sql
-- Memperbaiki regresi 00021: slug pro-*, big_wins cuma 5 item
-- Idempotent via ON CONFLICT (slug) DO UPDATE
-- ============================================================================

DELETE FROM dream_templates WHERE slug LIKE 'pro-%';


INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('football-player', 'Pemain Sepak Bola Profesional', '⚽', '#16A34A', 'Sports', '8-15 tahun', 'Bermain di klub profesional, mewakili tim di liga domestik maupun internasional.', 'Sepak bola mengajarkan disiplin, kerja tim, dan ketekunan yang berlaku di semua aspek kehidupan. Menjadi pemain profesional berarti menginspirasi jutaan orang.', ARRAY['Pelatih Kepala', 'Analis Data Tim', 'Agen Pemain', 'Manajer Klub', 'Komentator Olahraga', 'Fisioterapis Tim'], '[]'::jsonb, '[
{
"title": "Bergabung SSB atau Akademi Junior",
"description": "Mulai latihan terstruktur di lingkungan kompetitif",
"why_it_matters": "Fondasi teknik yang benar menentukan segalanya",
"alternative_path": "Bisa menjadi pelatih junior atau wasit",
"order": 1
},
{
"title": "Masuk Tim Kompetitif Tingkat Daerah",
"description": "Lolos seleksi dan rutin ikut kompetisi resmi",
"why_it_matters": "Kompetisi adalah guru terbaik",
"alternative_path": "Fokus ke akademi klub",
"order": 2
},
{
"title": "Debut di Level Profesional",
"description": "Kontrak pertama atau trial di klub profesional",
"why_it_matters": "Gerbang menuju karir yang sesungguhnya",
"alternative_path": "Jalur manajemen atau pelatih",
"order": 3
},
{
"title": "Karier Profesional Penuh",
"description": "Regular starter di liga resmi dengan konsistensi",
"why_it_matters": "Puncak dari bertahun-tahun perjuangan",
"alternative_path": "Buka sekolah sepak bola sendiri",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Bergabung SSB atau Akademi Junior",
"title": "Kuasai 4 teknik dasar",
"description": "Passing, dribbling, shooting, heading konsisten",
"order": 1
},
{
"big_win_title": "Bergabung SSB atau Akademi Junior",
"title": "Ikut 5 pertandingan resmi",
"description": "Akumulasi pengalaman bertanding",
"order": 2
},
{
"big_win_title": "Masuk Tim Kompetitif Tingkat Daerah",
"title": "VO2 Max >46 ml/kg/min",
"description": "Standar kebugaran atlet muda",
"order": 3
},
{
"big_win_title": "Masuk Tim Kompetitif Tingkat Daerah",
"title": "Sprint 30m <5.0 detik",
"description": "Kecepatan dasar yang kompetitif",
"order": 4
},
{
"big_win_title": "Debut di Level Profesional",
"title": "Lolos seleksi trial",
"description": "Dapat panggilan trial dari klub",
"order": 5
},
{
"big_win_title": "Debut di Level Profesional",
"title": "Tanda tangan kontrak",
"description": "Kontrak resmi level apapun",
"order": 6
},
{
"big_win_title": "Karier Profesional Penuh",
"title": "Main >500 menit per musim",
"description": "Menit bermain yang konsisten",
"order": 7
},
{
"big_win_title": "Karier Profesional Penuh",
"title": "Masuk skuad tim nasional",
"description": "Panggilan perdana ke Timnas",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Doa sebelum latihan",
"Syukur atas kesempatan bermain",
"Refleksi setelah pertandingan"
],
"physical": [
"Latihan fisik 1 jam",
"Stretching 15 menit",
"Lari pagi 3km"
],
"knowledge": [
"Analisis pertandingan",
"Baca taktik bola",
"Belajar bahasa Inggris"
],
"social": [
"Komunikasi pelatih",
"Diskusi taktik tim",
"Jaga hubungan keluarga"
],
"character": [
"Catat progres harian",
"Evaluasi latihan",
"Latihan ekstra"
],
"dream_skill": [
"Ball mastery 30 menit",
"Latihan passing berpasangan",
"Drill shooting ke gawang"
]
}'::jsonb, '[
{
"title": "Pelatih Junior",
"description": "Bagikan pengalaman sebagai pelatih di SSB atau akademi",
"skills": [
"Kepemimpinan",
"Komunikasi",
"Manajemen pemain"
]
},
{
"title": "Analis Data/Scout",
"description": "Cari dan rekrut pemain muda berbakat",
"skills": [
"Observasi",
"Penilaian bakat",
"Jaringan luas"
]
},
{
"title": "Komentator Olahraga",
"description": "Analis pertandingan di TV atau media",
"skills": [
"Public speaking",
"Analisis taktik",
"Pengetahuan industri"
]
},
{
"title": "Jurnalis Olahraga",
"description": "Tulis tentang sepak bola di media",
"skills": [
"Menulis",
"Storytelling",
"Pengetahuan sepak bola"
]
},
{
"title": "Event Organizer Turnamen",
"description": "Kelola turnamen dan event olahraga",
"skills": [
"Manajemen",
"Logistik",
"Networking"
]
},
{
"title": "Agen Pemain",
"description": "Jembatan antara klub dan pemain",
"skills": [
"Negosiasi",
"Hukum kontrak",
"Network industri"
]
}
]'::jsonb, 8, 35, '8-15 tahun', '[
{
"id": "ssb_status",
"type": "single_select",
"label": "Kamu sudah bergabung SSB atau klub sepak bola?",
"options": [
"Belum sama sekali",
"Baru bergabung (<6 bulan)",
"Sudah aktif >1 tahun",
"Sudah sering kompetisi"
]
},
{
"id": "posisi",
"type": "single_select",
"label": "Kamu main di posisi mana?",
"options": [
"Belum tahu",
"Penyerang",
"Gelandang",
"Bek / Kiper"
]
},
{
"id": "frekuensi",
"type": "single_select",
"label": "Seberapa sering kamu latihan sekarang?",
"options": [
"Belum rutin",
"1-2x seminggu",
"3-4x seminggu",
"Hampir setiap hari"
]
},
{
"id": "hambatan",
"type": "single_select",
"label": "Apa hambatan terbesarmu sekarang?",
"options": [
"Tidak tahu mulai dari mana",
"Tidak ada klub terjangkau",
"Fisik belum siap",
"Dukungan keluarga kurang"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('badminton-player', 'Atlet Bulu Tangkis Profesional', '🏸', '#DC2626', 'Sports', '8-15 tahun', 'Bertanding di level nasional dan internasional sebagai atlet bulu tangkis profesional.', 'Bulu tangkis adalah olahraga kebanggaan Indonesia. Jalan menuju Olimpiade dimulai dari raket pertama di tangan kamu.', ARRAY['Pelatih Bulu Tangkis', 'Komentator Olahraga', 'Pengurus PBSI', 'Brand Ambassador Olahraga', 'Wasit Internasional', 'Sport Scientist'], '[]'::jsonb, '[
{
"title": "Bergabung Klub Bulu Tangkis Resmi",
"description": "Latihan terstruktur dengan pelatih profesional",
"why_it_matters": "Fondasi teknik yang benar dari awal",
"alternative_path": "Les privat atau komunitas",
"order": 1
},
{
"title": "Meraih Medali Turnamen Regional",
"description": "Podium di tingkat kota atau provinsi",
"why_it_matters": "Kompetisi adalah bukti kemampuan",
"alternative_path": "Fokus ke peringkat PBSI",
"order": 2
},
{
"title": "Masuk Pelatnas PBSI atau Tim Nasional",
"description": "Lolos seleksi nasional",
"why_it_matters": "Batu loncatan ke level internasional",
"alternative_path": "Jalur pelatih atau manajer klub",
"order": 3
},
{
"title": "Ranking BWF Top 100",
"description": "Diakui di panggung dunia",
"why_it_matters": "Puncak karir seorang atlet",
"alternative_path": "Karir sebagai komentator atau pengusaha",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Bergabung Klub Bulu Tangkis Resmi",
"title": "Kuasai 4 teknik dasar",
"description": "Smash, netting, dropshot, clear",
"order": 1
},
{
"big_win_title": "Bergabung Klub Bulu Tangkis Resmi",
"title": "Ikut turnamen pertama",
"description": "Event kompetitif pertama",
"order": 2
},
{
"big_win_title": "Meraih Medali Turnamen Regional",
"title": "Smash >160 km/jam",
"description": "Kecepatan smash terukur",
"order": 3
},
{
"big_win_title": "Meraih Medali Turnamen Regional",
"title": "Masuk ranking nasional usia",
"description": "Peringkat PBSI untuk kelompok usia",
"order": 4
},
{
"big_win_title": "Masuk Pelatnas PBSI atau Tim Nasional",
"title": "Lolos seleksi pelatda",
"description": "Tahap awal seleksi nasional",
"order": 5
},
{
"big_win_title": "Masuk Pelatnas PBSI atau Tim Nasional",
"title": "Mewakili Indonesia di kejuaraan junior",
"description": "Debut internasional",
"order": 6
},
{
"big_win_title": "Ranking BWF Top 100",
"title": "Menang di turnamen BWF Tour",
"description": "Kemenangan di sirkuit BWF",
"order": 7
},
{
"big_win_title": "Ranking BWF Top 100",
"title": "Masuk Top 50 BWF",
"description": "Peringkat elit dunia",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Sholat 5 waktu",
"Doa sebelum tanding",
"Baca Al-Quran"
],
"physical": [
"Footwork 30 menit",
"Lari interval",
"Core 15 menit"
],
"knowledge": [
"Analisis video lawan",
"Teknik bulutangkis",
"Belajar bahasa asing"
],
"social": [
"Diskusi strategi pelatih",
"Support teman klub",
"Komunikasi orang tua"
],
"character": [
"Catat progres",
"Jurnal evaluasi",
"Jaga pola makan"
],
"dream_skill": [
"Footwork drill 20 menit",
"Latihan smash ke target",
"Shadow badminton 15 menit"
]
}'::jsonb, '[
{
"title": "Pelatih Bulu Tangkis",
"description": "Banyak mantan atlet jadi pelatih sukses. PBSI butuh pelatih muda.",
"skills": [
"Kepelatihan",
"Analisis teknik",
"Manajemen atlet",
"Komunikasi"
]
},
{
"title": "Wasit Internasional BWF",
"description": "Memahami peraturan dari sisi berbeda",
"skills": [
"Pengetahuan aturan",
"Ketegasan",
"Bahasa Inggris"
]
},
{
"title": "Pengurus PBSI",
"description": "Berkontribusi dalam pembinaan bulu tangkis nasional",
"skills": [
"Manajemen",
"Kebijakan olahraga",
"Administrasi"
]
},
{
"title": "Sport Scientist",
"description": "Bantu atlet optimize performa dan cegah cedera",
"skills": [
"Anatomi",
"Ilmu olahraga",
"Rehabilitasi"
]
},
{
"title": "Komentator Olahraga",
"description": "Analis bulu tangkis di TV atau media",
"skills": [
"Public speaking",
"Analisis pertandingan",
"Pengetahuan industri"
]
}
]'::jsonb, 7, 35, '8-15 tahun', '[
{
"id": "klub_status",
"type": "single_select",
"label": "Kamu sudah bergabung klub bulu tangkis?",
"options": [
"Belum",
"Baru bergabung",
"Sudah aktif latihan rutin",
"Sudah sering turnamen"
]
},
{
"id": "kategori",
"type": "single_select",
"label": "Kamu main di kategori apa?",
"options": [
"Belum tahu",
"Tunggal (single)",
"Ganda (double)",
"Keduanya"
]
},
{
"id": "frekuensi",
"type": "single_select",
"label": "Seberapa sering kamu latihan sekarang?",
"options": [
"Belum rutin",
"1-2x seminggu",
"3-5x seminggu",
"Hampir setiap hari"
]
},
{
"id": "target",
"type": "single_select",
"label": "Target kompetisi terdekat?",
"options": [
"Belum ada target",
"Turnamen sekolah/komunitas",
"Turnamen antar klub",
"Kejurnas atau Pelatda"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('esports-player', 'Pemain E-Sports Profesional', '🎮', '#7C3AED', 'Sports', '2-5 tahun', 'Berkompetisi di level profesional di game pilihan — MPL, PUBG, Valorant, dan turnamen internasional.', 'E-sports adalah industri miliaran dolar yang tumbuh pesat. Atlet digital punya karier serius dengan gaji, sponsor, dan ketenaran global.', ARRAY['Streamer / Content Creator Gaming', 'Game Analyst / Coach', 'Caster / Komentator E-sports', 'Event Organizer Turnamen', 'Game Developer', 'Community Manager'], '[]'::jsonb, '[
{
"title": "Mencapai Rank Mythic/Immortal",
"description": "Top tier di game pilihan",
"why_it_matters": "Rank tinggi adalah tiket masuk ke tim profesional",
"alternative_path": "Fokus ke streaming",
"order": 1
},
{
"title": "Bergabung Tim Semi-Pro atau Akademi",
"description": "Direkrut tim dengan manajemen dan jadwal latihan",
"why_it_matters": "Lingkungan kompetitif yang terstruktur",
"alternative_path": "Jalur content creator dulu",
"order": 2
},
{
"title": "Debut di Liga Profesional",
"description": "Main di liga resmi berbayar",
"why_it_matters": "Langkah pertama sebagai atlet e-sports",
"alternative_path": "Karir sebagai coach atau analyst",
"order": 3
},
{
"title": "Karier Pro dan Pengakuan Internasional",
"description": "Masuk roster top team dan dapat sponsor",
"why_it_matters": "Puncak karir e-sports",
"alternative_path": "Pensiun sebagai streamer atau coach",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Mencapai Rank Mythic/Immortal",
"title": "Win rate >55%",
"description": "Persentase kemenangan kompetitif",
"order": 1
},
{
"big_win_title": "Mencapai Rank Mythic/Immortal",
"title": "Top 500 server nasional",
"description": "Peringkat nasional",
"order": 2
},
{
"big_win_title": "Bergabung Tim Semi-Pro atau Akademi",
"title": "Menang turnamen online berbayar pertama",
"description": "Kemenangan berhadiah",
"order": 3
},
{
"big_win_title": "Bergabung Tim Semi-Pro atau Akademi",
"title": "Viral clip pertama",
"description": "Momen gameplay yang dikenal",
"order": 4
},
{
"big_win_title": "Debut di Liga Profesional",
"title": "Tanda tangan kontrak berbayar",
"description": "Kontrak resmi pertama",
"order": 5
},
{
"big_win_title": "Debut di Liga Profesional",
"title": "Main di season reguler",
"description": "Debut musim kompetitif",
"order": 6
},
{
"big_win_title": "Karier Pro dan Pengakuan Internasional",
"title": "MVP turnamen",
"description": "Most Valuable Player",
"order": 7
},
{
"big_win_title": "Karier Pro dan Pengakuan Internasional",
"title": "Mewakili Indonesia di SEA Games / M-Series",
"description": "Panggung internasional",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Istirahat mata 10 menit tiap 2 jam",
"Doa sebelum mulai",
"Syukur atas kesempatan bermain"
],
"physical": [
"Stretching jari & pergelangan 15 menit",
"Senam leher & bahu",
"Jalan kaki 10 menit"
],
"knowledge": [
"Review meta game terbaru",
"Pelajari strategi baru",
"Analisis gameplay pro player"
],
"social": [
"Komunikasi tim saat scrim",
"Interaksi dengan fans",
"Diskusi strategi dengan coach"
],
"character": [
"Review performa harian",
"Catat target rank",
"Evaluasi kesalahan"
],
"dream_skill": [
"Ranked game 2 jam (focused)",
"Review replay 30 menit",
"Pelajari meta terbaru"
]
}'::jsonb, '[
{
"title": "Streamer/YouTuber Gaming",
"description": "Main dan hibur ribuan penonton",
"skills": [
"Hiburan",
"Konsistensi",
"Personal branding"
]
},
{
"title": "Caster E-sports",
"description": "Komentator pertandingan e-sports",
"skills": [
"Public speaking",
"Pengetahuan game",
"Karisma"
]
},
{
"title": "Game Coach/Analyst",
"description": "Latih pemain lain dan analisis strategi",
"skills": [
"Analisis",
"Komunikasi",
"Strategi"
]
},
{
"title": "Event Organizer Turnamen",
"description": "Kelola turnamen e-sports",
"skills": [
"Manajemen",
"Logistik",
"Network industri"
]
},
{
"title": "Community Manager",
"description": "Bangun dan kelola komunitas game",
"skills": [
"Komunikasi",
"Event",
"Social media"
]
}
]'::jsonb, 13, 28, '2-5 tahun', '[
{
"id": "game_utama",
"type": "single_select",
"label": "Game apa yang mau kamu fokuskan?",
"options": [
"Mobile Legends (MLBB)",
"PUBG Mobile",
"Valorant",
"Game lain/belum yakin"
]
},
{
"id": "rank",
"type": "single_select",
"label": "Rank kamu sekarang?",
"options": [
"Masih rank bawah/baru main",
"Epic/Platinum atau setara",
"Legend/Diamond atau setara",
"Mythic/Immortal atau setara"
]
},
{
"id": "jam_main",
"type": "single_select",
"label": "Berapa jam per hari kamu main serius?",
"options": [
"Kurang dari 2 jam",
"2-4 jam",
"4-6 jam",
"Lebih dari 6 jam"
]
},
{
"id": "setup",
"type": "single_select",
"label": "Setup gaming kamu?",
"options": [
"HP biasa/laptop seadanya",
"HP/PC yang lumayan",
"Setup kompetitif",
"Setup pro/high-end"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('swimmer', 'Atlet Renang Profesional', '🏊', '#0284C7', 'Sports', '8-15 tahun', 'Berkompetisi di level nasional dan internasional sebagai atlet renang.', 'Renang adalah olahraga lengkap yang melatih seluruh tubuh. Indonesia butuh lebih banyak atlet renang yang bersaing di SEA Games dan Olimpiade.', ARRAY['Pelatih Renang', 'Aquatic Coach', 'Instruktur Renang', 'Sport Scientist', 'Lifeguard Profesional', 'Pengurus PRSI'], '[]'::jsonb, '[
{
"title": "Bergabung Klub Renang dan Ikut Perlombaan Pertama",
"description": "Mulai latihan terstruktur dan event kompetitif pertama",
"why_it_matters": "Fondasi teknik dan mental",
"alternative_path": "Belajar sendiri dengan video",
"order": 1
},
{
"title": "Meraih Medali di Kejuaraan Nasional Kelompok Umur",
"description": "Podium di level nasional",
"why_it_matters": "Kompetisi nasional sebagai tolak ukur",
"alternative_path": "Fokus ke level provinsi",
"order": 2
},
{
"title": "Masuk Pelatnas PRSI",
"description": "Lolos seleksi nasional PRSI",
"why_it_matters": "Gerbang ke level internasional",
"alternative_path": "Karir sebagai pelatih",
"order": 3
},
{
"title": "Mewakili Indonesia di SEA Games / Olimpiade",
"description": "Puncak karir atlet renang",
"why_it_matters": "Mengharumkan nama bangsa",
"alternative_path": "Buka sekolah renang",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Bergabung Klub Renang dan Ikut Perlombaan Pertama",
"title": "Kuasai 4 gaya renang",
"description": "Bebas, punggung, dada, kupu-kupu",
"order": 1
},
{
"big_win_title": "Bergabung Klub Renang dan Ikut Perlombaan Pertama",
"title": "Ikut lomba pertama",
"description": "Event kompetitif perdana",
"order": 2
},
{
"big_win_title": "Meraih Medali di Kejuaraan Nasional Kelompok Umur",
"title": "Standar waktu PRSI",
"description": "Mencapai waktu standar nasional",
"order": 3
},
{
"big_win_title": "Meraih Medali di Kejuaraan Nasional Kelompok Umur",
"title": "Latihan 5x/minggu",
"description": "Konsistensi latihan",
"order": 4
},
{
"big_win_title": "Masuk Pelatnas PRSI",
"title": "Lolos seleksi PRSI",
"description": "Tahapan seleksi nasional",
"order": 5
},
{
"big_win_title": "Masuk Pelatnas PRSI",
"title": "Ikut kompetisi Asia Tenggara",
"description": "Kompetisi regional",
"order": 6
},
{
"big_win_title": "Mewakili Indonesia di SEA Games / Olimpiade",
"title": "Pecahkan rekor nasional",
"description": "Rekor nasional baru",
"order": 7
},
{
"big_win_title": "Mewakili Indonesia di SEA Games / Olimpiade",
"title": "Qualify ke event FINA",
"description": "Kualifikasi level dunia",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Doa kesembuhan dan kekuatan",
"Syukur atas proses penyembuhan",
"Refleksi setelah latihan"
],
"physical": [
"Renang 2km",
"Latihan interval sprint",
"Drill start dan turn"
],
"knowledge": [
"Baca artikel teknik renang",
"Pelajari ilmu olahraga",
"Analisis video perenang top"
],
"social": [
"Komunikasi pelatih",
"Diskusi taktim tim",
"Dukungan orang tua"
],
"character": [
"Catat waktu latihan",
"Evaluasi teknik",
"Patuhi jadwal latihan"
],
"dream_skill": [
"Latihan teknik gaya spesialisasi 45 menit",
"Drill start dan turn",
"Latihan kecepatan interval"
]
}'::jsonb, '[
{
"title": "Pelatih Renang",
"description": "Membimbing atlet muda meraih prestasi",
"skills": [
"Kepelatihan",
"Teknik renang",
"Manajemen atlet"
]
},
{
"title": "Instruktur Aquatic",
"description": "Mengajar renang untuk umum",
"skills": [
"Komunikasi",
"Kesabaran",
"Sertifikasi instruktur"
]
},
{
"title": "Sport Scientist",
"description": "Bantu atlet optimize performa",
"skills": [
"Anatomi",
"Ilmu olahraga",
"Rehabilitasi"
]
},
{
"title": "Lifeguard Profesional",
"description": "Menjaga keselamatan di kolam dan pantai",
"skills": [
"Pertolongan pertama",
"Keamanan air",
"Pengawasan"
]
},
{
"title": "Pengurus PRSI",
"description": "Berkontribusi dalam pembinaan renang nasional",
"skills": [
"Manajemen olahraga",
"Administrasi",
"Kebijakan"
]
}
]'::jsonb, 6, 30, '8-15 tahun', '[
{
"id": "klub_status",
"type": "single_select",
"label": "Kamu sudah bergabung klub renang?",
"options": [
"Belum, latihan sendiri",
"Baru bergabung klub",
"Sudah aktif dan rutin",
"Sudah sering kompetisi"
]
},
{
"id": "gaya",
"type": "single_select",
"label": "Gaya renang yang mau kamu fokuskan?",
"options": [
"Belum tahu/semua gaya",
"Gaya bebas (freestyle)",
"Gaya punggung/dada",
"Gaya kupu-kupu (butterfly)"
]
},
{
"id": "kemampuan",
"type": "single_select",
"label": "Sekarang kamu bisa renang berapa jauh?",
"options": [
"Belum bisa/baru belajar",
"Bisa 25-50 meter",
"Bisa 100-200 meter",
"Lebih dari 200 meter"
]
},
{
"id": "frekuensi",
"type": "single_select",
"label": "Seberapa sering kamu latihan renang?",
"options": [
"Belum rutin",
"1-2x seminggu",
"3-4x seminggu",
"5+ kali seminggu"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('basketball-player', 'Pemain Bola Basket Profesional', '🏀', '#EA580C', 'Sports', '5-12 tahun', 'Bermain di tim basket profesional — IBL, liga Asia, atau bahkan NBA.', 'Basket mengajarkan kerja tim, disiplin, dan kreativitas dalam tekanan. Indonesia punya potensi besar di basket Asia.', ARRAY['Pelatih Basket', 'Scout Tim Profesional', 'Komentator/Analis Basket', 'Brand Ambassador', 'Event Organizer', 'Guru Olahraga'], '[]'::jsonb, '[
{
"title": "Bergabung Tim atau Klub Basket Kompetitif",
"description": "Mulai latihan terstruktur di klub",
"why_it_matters": "Fondasi teknik yang benar",
"alternative_path": "Main di ekskul sekolah",
"order": 1
},
{
"title": "Tembus Tim Sekolah/Kampus Level Nasional",
"description": "Lolos seleksi dan ikut kompetisi nasional",
"why_it_matters": "Level kompetisi yang lebih tinggi",
"alternative_path": "Fokus ke liga komunitas",
"order": 2
},
{
"title": "Kontrak dengan Tim IBL atau Setara",
"description": "Tanda tangan kontrak profesional",
"why_it_matters": "Gerbang karir profesional",
"alternative_path": "Karir di luar negeri",
"order": 3
},
{
"title": "Karier Profesional — Starter Regular",
"description": "Main reguler di liga profesional",
"why_it_matters": "Puncak karir basket",
"alternative_path": "Buka sekolah basket",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Bergabung Tim atau Klub Basket Kompetitif",
"title": "Kuasai dribbling dasar",
"description": "Control bola dengan kedua tangan",
"order": 1
},
{
"big_win_title": "Bergabung Tim atau Klub Basket Kompetitif",
"title": "Kuasai shooting dan defense",
"description": "Teknik dasar menembak dan bertahan",
"order": 2
},
{
"big_win_title": "Tembus Tim Sekolah/Kampus Level Nasional",
"title": "Ikut DBL atau kompetisi nasional pelajar",
"description": "Kompetisi pelajar nasional",
"order": 3
},
{
"big_win_title": "Tembus Tim Sekolah/Kampus Level Nasional",
"title": "Top scorer/rebounder tim",
"description": "Kontribusi statistik",
"order": 4
},
{
"big_win_title": "Kontrak dengan Tim IBL atau Setara",
"title": "Trial di tim IBL",
"description": "Kesempatan trial profesional",
"order": 5
},
{
"big_win_title": "Kontrak dengan Tim IBL atau Setara",
"title": "Tanda tangan kontrak",
"description": "Kontrak profesional pertama",
"order": 6
},
{
"big_win_title": "Karier Profesional — Starter Regular",
"title": "Main >1000 menit per musim",
"description": "Menit bermain yang konsisten",
"order": 7
},
{
"big_win_title": "Karier Profesional — Starter Regular",
"title": "Masuk skuad nasional",
"description": "Panggilan tim nasional",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Doa sebelum latihan dan pertandingan",
"Syukur atas kesehatan",
"Refleksi setelah game"
],
"physical": [
"Lari interval sprint",
"Vertical jump drills",
"Agility ladder 20 menit"
],
"knowledge": [
"Review playbook",
"Analisis video lawan",
"Pelajari strategi baru"
],
"social": [
"Komunikasi tim saat game",
"Diskusi strategi dengan coach",
"Support teman setim"
],
"character": [
"Catat progres latihan",
"Evaluasi performa game",
"Jaga pola makan"
],
"dream_skill": [
"Latihan shooting 200 tembakan",
"Dribbling drill 20 menit",
"Latihan footwork dan defense"
]
}'::jsonb, '[
{
"title": "Pelatih Basket",
"description": "Latih tim sekolah atau klub basket",
"skills": [
"Kepelatihan",
"Strategi",
"Manajemen pemain"
]
},
{
"title": "Scout Tim Pro",
"description": "Cari bakat basket muda",
"skills": [
"Observasi",
"Jaringan",
"Penilaian bakat"
]
},
{
"title": "Komentator Olahraga",
"description": "Analis pertandingan basket",
"skills": [
"Public speaking",
"Analisis taktik",
"Pengetahuan basket"
]
},
{
"title": "Brand Ambassador",
"description": "Representasikan brand olahraga",
"skills": [
"Personal branding",
"Komunikasi",
"Penampilan"
]
},
{
"title": "Event Organizer",
"description": "Kelola turnamen basket",
"skills": [
"Manajemen",
"Logistik",
"Networking"
]
}
]'::jsonb, 10, 35, '5-12 tahun', '[
{
"id": "klub_status",
"type": "single_select",
"label": "Kamu sudah bergabung tim atau komunitas basket?",
"options": [
"Belum",
"Main di ekskul/komunitas",
"Bergabung klub resmi",
"Sudah ikut kompetisi antar daerah"
]
},
{
"id": "posisi",
"type": "single_select",
"label": "Kamu main di posisi apa?",
"options": [
"Belum tahu/semua posisi",
"Point Guard/Shooting Guard",
"Small Forward/Power Forward",
"Center"
]
},
{
"id": "skill_dominan",
"type": "single_select",
"label": "Skill basket yang paling kamu andalkan?",
"options": [
"Belum ada yang menonjol",
"Shooting/tembakan",
"Dribbling/handling",
"Defense/rebounding"
]
},
{
"id": "frekuensi",
"type": "single_select",
"label": "Seberapa sering kamu latihan basket?",
"options": [
"Belum rutin",
"1-2x seminggu",
"3-4x seminggu",
"Hampir setiap hari"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('content-creator', 'Content Creator', '📱', '#EC4899', 'Creative', '1-4 tahun', 'Membangun audiens dan penghasilan melalui konten kreatif di platform digital.', 'Era digital membuka peluang tak terbatas. Content creator bisa mempengaruhi jutaan orang, membangun brand, dan menghasilkan income dari passion.', ARRAY['Brand Ambassador', 'Social Media Manager', 'Produser Konten', 'Digital Marketing Consultant', 'Podcaster', 'YouTuber Spesialis'], '[]'::jsonb, '[
{
"title": "1.000 Followers/Subscribers Pertama",
"description": "Membangun audiens awal dari nol",
"why_it_matters": "Komunitas awal adalah fondasi",
"alternative_path": "Fokus pada kualitas konten",
"order": 1
},
{
"title": "10.000 Followers dan Endorsement Pertama",
"description": "Brand mulai melirik dan collaboration",
"why_it_matters": "Titik balik dari hobi ke bisnis",
"alternative_path": "Jual produk sendiri",
"order": 2
},
{
"title": "100.000 Followers — Monetisasi Aktif",
"description": "Income stabil dari konten",
"why_it_matters": "Karier yang sustainable",
"alternative_path": "Diversifikasi ke platform lain",
"order": 3
},
{
"title": "1 Juta Followers — Full-time Creator",
"description": "Puncak karir content creator",
"why_it_matters": "Pengaruh dan dampak yang luas",
"alternative_path": "Bangun agency kreatif",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "1.000 Followers/Subscribers Pertama",
"title": "Upload konsisten 3x/minggu selama 8 minggu",
"description": "Konsistensi adalah kunci",
"order": 1
},
{
"big_win_title": "1.000 Followers/Subscribers Pertama",
"title": "1 konten >1.000 views",
"description": "Viral mini pertama",
"order": 2
},
{
"big_win_title": "10.000 Followers dan Endorsement Pertama",
"title": "Viral pertama (>100K views)",
"description": "Momen breakout",
"order": 3
},
{
"big_win_title": "10.000 Followers dan Endorsement Pertama",
"title": "Engagement rate >5%",
"description": "Keterlibatan audiens yang tinggi",
"order": 4
},
{
"big_win_title": "100.000 Followers — Monetisasi Aktif",
"title": "Silver Play Button atau setara",
"description": "Milestone official platform",
"order": 5
},
{
"big_win_title": "100.000 Followers — Monetisasi Aktif",
"title": "Income >UMR dari konten",
"description": "Penghasilan yang cukup",
"order": 6
},
{
"big_win_title": "1 Juta Followers — Full-time Creator",
"title": "Brand deal >10 juta",
"description": "Kemitraan brand nilai besar",
"order": 7
},
{
"big_win_title": "1 Juta Followers — Full-time Creator",
"title": "Tim produksi sendiri",
"description": "Mulai punya tim",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Luangkan waktu refleksi",
"Syukur atas pencapaian hari ini",
"Doa sebelum mulai konten"
],
"physical": [
"Jalan 10 menit",
"Stretching sela produksi",
"Minum air cukup"
],
"knowledge": [
"Riset trending topic",
"Analisis insight konten",
"Belajar skill produksi baru"
],
"social": [
"Balas komentar audiens",
"Interaksi dengan kreator lain",
"Bangun komunitas"
],
"character": [
"Selesaikan 1 konten hari ini",
"Evaluasi performa konten",
"Catat ide konten baru"
],
"dream_skill": [
"Buat 1 konten atau draft",
"Riset tren 15 menit",
"Edit video/foto"
]
}'::jsonb, '[
{
"title": "Social Media Manager",
"description": "Kelola akun brand besar",
"skills": [
"Strategi konten",
"Analisis",
"Komunikasi"
]
},
{
"title": "Brand Strategist",
"description": "Bantu brand bangun identitas digital",
"skills": [
"Branding",
"Pemasaran",
"Kreativitas"
]
},
{
"title": "Digital Marketing Consultant",
"description": "Konsultan pemasaran digital",
"skills": [
"Strategi",
"Iklan",
"Analisis"
]
},
{
"title": "Podcaster",
"description": "Buat podcast dengan audiens sendiri",
"skills": [
"Komunikasi",
"Produksi audio",
"Storytelling"
]
},
{
"title": "Produser Konten",
"description": "Produksi konten untuk brand",
"skills": [
"Videografi",
"Editing",
"Manajemen produksi"
]
}
]'::jsonb, 13, 40, '1-4 tahun', '[
{
"id": "platform",
"type": "single_select",
"label": "Platform mana yang mau kamu fokuskan?",
"options": [
"TikTok",
"YouTube",
"Instagram/Reels",
"Belum yakin/mau semua"
]
},
{
"id": "follower",
"type": "single_select",
"label": "Berapa follower/subscriber sekarang?",
"options": [
"Belum punya akun/baru mulai",
"Di bawah 1.000",
"1.000-10.000",
"Di atas 10.000"
]
},
{
"id": "niche",
"type": "single_select",
"label": "Topik atau niche konten yang mau kamu buat?",
"options": [
"Masih mencari",
"Edukasi/tips & trik",
"Entertainment/vlog",
"Lifestyle/beauty/kuliner"
]
},
{
"id": "frekuensi",
"type": "single_select",
"label": "Seberapa sering kamu upload sekarang?",
"options": [
"Belum pernah",
"Sesekali tidak rutin",
"1-2x seminggu",
"Hampir setiap hari"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('beauty-creator', 'Beauty & Makeup Creator', '💄', '#DB2777', 'Creative', '1-4 tahun', 'Membangun personal brand di industri kecantikan melalui konten makeup, skincare, dan lifestyle.', 'Industri beauty Indonesia adalah salah satu yang terbesar di Asia. Beauty creator punya pengaruh besar terhadap tren kecantikan jutaan perempuan.', ARRAY['Makeup Artist Profesional', 'Brand Ambassador Kecantikan', 'Beauty Consultant', 'Produser Konten Beauty', 'Pendiri Brand Kosmetik', 'Skincare Educator'], '[]'::jsonb, '[
{
"title": "10.000 Followers di Platform Beauty",
"description": "Membangun audiens beauty dari nol",
"why_it_matters": "Komunitas adalah fondasi brand",
"alternative_path": "Fokus ke engagement",
"order": 1
},
{
"title": "Kolaborasi dengan Brand Kecantikan",
"description": "Brand mulai melirik dan kerja sama",
"why_it_matters": "Titik balik dari hobi ke bisnis",
"alternative_path": "Jual produk sendiri",
"order": 2
},
{
"title": "100.000 Followers — Micro-Influencer Established",
"description": "Income stabil dari beauty content",
"why_it_matters": "Karier yang sustainable",
"alternative_path": "Buka jasa MUA",
"order": 3
},
{
"title": "Brand Sendiri atau Ambassador Major Brand",
"description": "Puncak karir beauty creator",
"why_it_matters": "Pengaruh dan legacy",
"alternative_path": "Diversifikasi ke platform lain",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "10.000 Followers di Platform Beauty",
"title": "Konsisten posting konten beauty 3x/minggu",
"description": "Rutinitas konten",
"order": 1
},
{
"big_win_title": "10.000 Followers di Platform Beauty",
"title": "Kuasai 10 teknik makeup dasar",
"description": "Skill makeup yang solid",
"order": 2
},
{
"big_win_title": "Kolaborasi dengan Brand Kecantikan",
"title": "Review produk yang viral",
"description": "Konten review tembus",
"order": 3
},
{
"big_win_title": "Kolaborasi dengan Brand Kecantikan",
"title": "Masuk radar brand lokal",
"description": "Dikenal brand",
"order": 4
},
{
"big_win_title": "100.000 Followers — Micro-Influencer Established",
"title": "Penghasilan dari beauty content >5 juta/bulan",
"description": "Income stabil",
"order": 5
},
{
"big_win_title": "100.000 Followers — Micro-Influencer Established",
"title": "Engagement rate >5%",
"description": "Keterlibatan audiens",
"order": 6
},
{
"big_win_title": "Brand Sendiri atau Ambassador Major Brand",
"title": "Luncurkan produk kolaborasi",
"description": "Produk bersama brand",
"order": 7
},
{
"big_win_title": "Brand Sendiri atau Ambassador Major Brand",
"title": "Brand deal >20 juta",
"description": "Kemitraan nilai besar",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Refleksi diri",
"Syukur atas pencapaian",
"Doa sebelum membuat konten"
],
"physical": [
"Jalan 10 menit",
"Stretching",
"Minum air putih cukup"
],
"knowledge": [
"Riset tren beauty",
"Review produk baru",
"Pelajari teknik makeup baru"
],
"social": [
"Balas komentar beauty",
"Interaksi sesama kreator",
"Bangun komunitas"
],
"character": [
"Catat ide konten baru",
"Evaluasi performa konten",
"Disiplin jadwal upload"
],
"dream_skill": [
"Latihan 1 teknik makeup baru",
"Review/test 1 produk",
"Buat konten beauty hari ini"
]
}'::jsonb, '[
{
"title": "Makeup Artist Profesional",
"description": "Merias klien untuk wedding dan event",
"skills": [
"Teknik makeup",
"Komunikasi",
"Portofolio"
]
},
{
"title": "Beauty Consultant",
"description": "Konsultan kecantikan personal",
"skills": [
"Pengetahuan produk",
"Analisis kulit",
"Komunikasi"
]
},
{
"title": "Brand Kosmetik Founder",
"description": "Ciptakan lini produk kecantikan sendiri",
"skills": [
"Kewirausahaan",
"R&D",
"Branding"
]
},
{
"title": "Skincare Educator",
"description": "Edukasi perawatan kulit",
"skills": [
"Pengetahuan skincare",
"Komunikasi",
"Konten edukasi"
]
}
]'::jsonb, 14, 40, '1-4 tahun', '[
{
"id": "fokus",
"type": "single_select",
"label": "Kamu lebih fokus ke makeup atau skincare?",
"options": [
"Makeup (riasan)",
"Skincare (perawatan)",
"Keduanya",
"Belum yakin"
]
},
{
"id": "follower",
"type": "single_select",
"label": "Berapa follower beauty account kamu?",
"options": [
"Belum punya akun khusus",
"Di bawah 1.000",
"1.000-10.000",
"Di atas 10.000"
]
},
{
"id": "skill",
"type": "single_select",
"label": "Kemampuan makeup kamu sekarang?",
"options": [
"Masih pemula",
"Bisa makeup sehari-hari",
"Bisa berbagai teknik",
"Sudah sering dandan orang lain"
]
},
{
"id": "tujuan",
"type": "single_select",
"label": "Tujuan utama kamu?",
"options": [
"Jadi influencer beauty",
"Buka jasa MUA",
"Punya brand sendiri",
"Kerja di industri beauty"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('musician', 'Musisi / Penyanyi Profesional', '🎵', '#7C3AED', 'Creative', '3-10 tahun', 'Tampil di panggung, merilis lagu, dan membangun karier musik yang berkelanjutan.', 'Musik adalah bahasa universal. Musisi profesional bisa menyentuh hati jutaan orang dan meninggalkan warisan yang tak ternilai.', ARRAY['Produser Musik', 'Sound Engineer', 'Penulis Lagu (Songwriter)', 'Guru Musik', 'Music Therapist', 'Manajer Artis'], '[]'::jsonb, '[
{
"title": "Menguasai Instrumen/Vokal dan Tampil Pertama",
"description": "Fondasi skill dan pengalaman panggung pertama",
"why_it_matters": "Skill yang solid adalah fondasi segalanya",
"alternative_path": "Fokus ke konten musik online",
"order": 1
},
{
"title": "Rilis Lagu Original Pertama di Streaming",
"description": "Dari cover ke karya original",
"why_it_matters": "Karya original adalah identitas",
"alternative_path": "Jadi session player",
"order": 2
},
{
"title": "100.000 Monthly Listeners Spotify",
"description": "Audiens mulai terbentuk",
"why_it_matters": "Pengakuan pasar",
"alternative_path": "Kolaborasi dengan artis lain",
"order": 3
},
{
"title": "Kontrak Label atau Full-time Musik",
"description": "Karier profesional yang stabil",
"why_it_matters": "Puncak sebagai musisi",
"alternative_path": "Buka sekolah musik",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Menguasai Instrumen/Vokal dan Tampil Pertama",
"title": "Kuasai 10 lagu",
"description": "Repertoar lagu yang solid",
"order": 1
},
{
"big_win_title": "Menguasai Instrumen/Vokal dan Tampil Pertama",
"title": "Tampil live di depan 50+ orang",
"description": "Pengalaman panggung pertama",
"order": 2
},
{
"big_win_title": "Rilis Lagu Original Pertama di Streaming",
"title": "Rekaman profesional",
"description": "Kualitas rekaman standar",
"order": 3
},
{
"big_win_title": "Rilis Lagu Original Pertama di Streaming",
"title": "Upload ke Spotify/Apple Music",
"description": "Distribusi digital",
"order": 4
},
{
"big_win_title": "100.000 Monthly Listeners Spotify",
"title": "10.000 monthly listeners",
"description": "Milestone streaming pertama",
"order": 5
},
{
"big_win_title": "100.000 Monthly Listeners Spotify",
"title": "Kolaborasi dengan artis lain",
"description": "Network dan eksposur",
"order": 6
},
{
"big_win_title": "Kontrak Label atau Full-time Musik",
"title": "Tanda tangan dengan label",
"description": "Kontrak label resmi",
"order": 7
},
{
"big_win_title": "Kontrak Label atau Full-time Musik",
"title": "Income musik >UMR",
"description": "Penghasilan dari musik",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Doa sebelum tampil",
"Syukur atas bakat musik",
"Refleksi setelah latihan"
],
"physical": [
"Stretching 10 menit",
"Jaga postur tubuh",
"Istirahat vokal/tangan"
],
"knowledge": [
"Teori musik 15 menit",
"Analisis lagu favorit",
"Pelajari genre baru"
],
"social": [
"Kolaborasi dengan musisi lain",
"Networking di event musik",
"Dengar feedback audiens"
],
"character": [
"Latihan rutin setiap hari",
"Catat progres",
"Jadwal latihan disiplin"
],
"dream_skill": [
"Latihan vokal atau instrumen 30 menit",
"Belajar chord baru",
"Dengarkan lagu favorit"
]
}'::jsonb, '[
{
"title": "Produser Musik",
"description": "Produksi musik untuk artis lain",
"skills": [
"Produksi audio",
"Mixing",
"Aransemen"
]
},
{
"title": "Sound Engineer",
"description": "Rekaman dan mixing audio profesional",
"skills": [
"Teknik audio",
"Peralatan studio",
"Akustik"
]
},
{
"title": "Penulis Lagu",
"description": "Ciptakan lagu untuk dirilis sendiri atau artis lain",
"skills": [
"Kreativitas",
"Lyric writing",
"Melodi"
]
},
{
"title": "Guru Musik",
"description": "Ajarkan musik ke generasi berikutnya",
"skills": [
"Pedagogi",
"Kesabaran",
"Komunikasi"
]
}
]'::jsonb, 10, 40, '3-10 tahun', '[
{
"id": "fokus",
"type": "single_select",
"label": "Kamu lebih ke vokal atau instrumen?",
"options": [
"Vokal/penyanyi",
"Instrumen (gitar/piano/dll)",
"Keduanya",
"Produser/songwriter"
]
},
{
"id": "kemampuan",
"type": "single_select",
"label": "Kemampuan musik kamu sekarang?",
"options": [
"Masih pemula, belum les",
"Sudah les/belajar sendiri",
"Sering tampil di depan orang",
"Sudah punya rekaman/konten"
]
},
{
"id": "genre",
"type": "single_select",
"label": "Genre musik yang mau kamu tekuni?",
"options": [
"Pop/R&B/ballad",
"Rock/indie/alternative",
"Dangdut/folk/tradisional",
"Masih eksplorasi"
]
},
{
"id": "platform",
"type": "single_select",
"label": "Kamu sudah punya platform berbagi musik?",
"options": [
"Belum ada",
"TikTok/YouTube musik",
"Sudah rilis di Spotify",
"Sudah punya fanbase kecil"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('youtuber', 'YouTuber / Vlogger', '📹', '#DC2626', 'Creative', '2-5 tahun', 'Membangun channel YouTube dengan konten video yang menghibur, mengedukasi, atau menginspirasi.', 'YouTube adalah platform terbesar untuk konten video. Satu channel yang sukses bisa mengubah hidup — dari passion menjadi profesi.', ARRAY['Video Producer', 'Podcaster', 'Brand Ambassador', 'Digital Marketing Specialist', 'Filmmaker', 'Content Strategist'], '[]'::jsonb, '[
{
"title": "Channel dengan 1.000 Subscribers Pertama",
"description": "Membangun audiens dari nol",
"why_it_matters": "Subscriber pertama adalah fondasi",
"alternative_path": "Fokus ke Shorts",
"order": 1
},
{
"title": "Monetisasi Aktif (1K subs + 4K jam tayang)",
"description": "Memenuhi syarat monetisasi",
"why_it_matters": "Titik balik dari hobi ke bisnis",
"alternative_path": "Terima endorse langsung",
"order": 2
},
{
"title": "Silver Play Button (100K Subscribers)",
"description": "Milestone resmi YouTube",
"why_it_matters": "Pengakuan dari platform",
"alternative_path": "Diversifikasi ke platform lain",
"order": 3
},
{
"title": "Gold Play Button (1 Juta Subscribers)",
"description": "Puncak karir YouTuber",
"why_it_matters": "Pengaruh dan dampak yang luas",
"alternative_path": "Bangun media network",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Channel dengan 1.000 Subscribers Pertama",
"title": "Upload konsisten 1x/minggu selama 3 bulan",
"description": "Konsistensi jangka panjang",
"order": 1
},
{
"big_win_title": "Channel dengan 1.000 Subscribers Pertama",
"title": "1 video >5.000 views",
"description": "Viral mini pertama",
"order": 2
},
{
"big_win_title": "Monetisasi Aktif (1K subs + 4K jam tayang)",
"title": "Rata-rata 1.000 views per video",
"description": "Viewership yang stabil",
"order": 3
},
{
"big_win_title": "Monetisasi Aktif (1K subs + 4K jam tayang)",
"title": "Income pertama dari AdSense",
"description": "Revenue pertama",
"order": 4
},
{
"big_win_title": "Silver Play Button (100K Subscribers)",
"title": "Brand deal konsisten",
"description": "Kemitraan brand rutin",
"order": 5
},
{
"big_win_title": "Silver Play Button (100K Subscribers)",
"title": "Income dari YouTube >5 juta/bulan",
"description": "Penghasilan signifikan",
"order": 6
},
{
"big_win_title": "Gold Play Button (1 Juta Subscribers)",
"title": "Tim produksi",
"description": "Mulai punya tim",
"order": 7
},
{
"big_win_title": "Gold Play Button (1 Juta Subscribers)",
"title": "Multiple revenue streams",
"description": "Merch, sponsor, course",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Refleksi diri",
"Syukur atas pencapaian",
"Doa sebelum buat konten"
],
"physical": [
"Stretching 10 menit",
"Jalan kaki",
"Minum air cukup"
],
"knowledge": [
"Riset topik trending",
"Analisis performa video",
"Belajar teknik produksi baru"
],
"social": [
"Balas komentar",
"Interaksi komunitas",
"Kolaborasi kreator"
],
"character": [
"Selesaikan 1 video hari ini",
"Evaluasi performa",
"Catat ide konten"
],
"dream_skill": [
"Rekam/edit minimal 10 menit",
"Riset keyword YouTube",
"Analisis performa video"
]
}'::jsonb, '[
{
"title": "Video Producer",
"description": "Produksi video untuk brand atau klien",
"skills": [
"Videografi",
"Editing",
"Manajemen produksi"
]
},
{
"title": "Podcaster",
"description": "Buat podcast sendiri",
"skills": [
"Komunikasi",
"Produksi audio",
"Storytelling"
]
},
{
"title": "Brand Ambassador",
"description": "Representasikan brand di YouTube",
"skills": [
"Personal branding",
"Komunikasi",
"Kreativitas"
]
},
{
"title": "Filmmaker Indie",
"description": "Buat film pendek atau dokumenter",
"skills": [
"Sinematografi",
"Storytelling",
"Sutradara"
]
}
]'::jsonb, 13, 40, '2-5 tahun', '[
{
"id": "channel",
"type": "single_select",
"label": "Status channel YouTube kamu?",
"options": [
"Belum punya channel",
"Punya channel, belum upload",
"Sudah upload tapi sedikit subs",
"Sudah >1.000 subscribers"
]
},
{
"id": "niche",
"type": "single_select",
"label": "Konten apa yang mau kamu buat?",
"options": [
"Vlog/daily life/travel",
"Gaming/review/tech",
"Edukasi/how-to/tutorial",
"Masih mencari niche"
]
},
{
"id": "peralatan",
"type": "single_select",
"label": "Peralatan yang kamu punya?",
"options": [
"Hanya HP biasa",
"HP yang cukup bagus",
"Kamera + mic basic",
"Setup lumayan lengkap"
]
},
{
"id": "waktu",
"type": "single_select",
"label": "Berapa jam per minggu bisa kamu buat konten?",
"options": [
"Kurang dari 3 jam",
"3-7 jam",
"7-15 jam",
"Lebih dari 15 jam"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('actor', 'Aktor / Aktris', '🎬', '#B45309', 'Creative', '3-10 tahun', 'Membawakan karakter di film, sinetron, web series, atau panggung teater secara profesional.', 'Industri hiburan Indonesia tumbuh pesat. Platform streaming seperti Netflix, WeTV, dan Vidio membuka peluang baru bagi aktor muda berbakat.', ARRAY['Sutradara', 'Penulis Skenario', 'Produser', 'Casting Director', 'Guru Akting', 'Presenter/MC'], '[]'::jsonb, '[
{
"title": "Les Akting dan Tampil di Pertunjukan Pertama",
"description": "Mulai belajar akting dan naik panggung",
"why_it_matters": "Skill akting dan pengalaman panggung",
"alternative_path": "Fokus ke konten digital acting",
"order": 1
},
{
"title": "Dapat Peran Berbayar (Iklan/FTV/Web Series)",
"description": "Peran profesional pertama",
"why_it_matters": "Dari latihan ke pekerjaan nyata",
"alternative_path": "Buat konten akting sendiri",
"order": 2
},
{
"title": "Peran di Film Layar Lebar atau Streaming Platform",
"description": "Peran di produksi besar",
"why_it_matters": "Level karier yang lebih tinggi",
"alternative_path": "Fokus ke series",
"order": 3
},
{
"title": "Nominasi atau Penghargaan Bergengsi",
"description": "Pengakuan industri",
"why_it_matters": "Puncak karir akting",
"alternative_path": "Buka sekolah akting",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Les Akting dan Tampil di Pertunjukan Pertama",
"title": "Kuasai 5 teknik akting dasar",
"description": "Teknik dasar yang solid",
"order": 1
},
{
"big_win_title": "Les Akting dan Tampil di Pertunjukan Pertama",
"title": "Tampil di panggung minimal sekali",
"description": "Pengalaman performa live",
"order": 2
},
{
"big_win_title": "Dapat Peran Berbayar (Iklan/FTV/Web Series)",
"title": "Ikut 10+ audisi",
"description": "Kegigihan audisi",
"order": 3
},
{
"big_win_title": "Dapat Peran Berbayar (Iklan/FTV/Web Series)",
"title": "Berhasil dapat 1 peran berbayar",
"description": "Peran profesional pertama",
"order": 4
},
{
"big_win_title": "Peran di Film Layar Lebar atau Streaming Platform",
"title": "Main di web series Netflix/Vidio/WeTV",
"description": "Debut platform streaming",
"order": 5
},
{
"big_win_title": "Peran di Film Layar Lebar atau Streaming Platform",
"title": "Dapat agen resmi",
"description": "Representasi profesional",
"order": 6
},
{
"big_win_title": "Nominasi atau Penghargaan Bergengsi",
"title": "Nominasi FFI atau festival",
"description": "Rekognisi industri",
"order": 7
},
{
"big_win_title": "Nominasi atau Penghargaan Bergengsi",
"title": "Menang penghargaan akting",
"description": "Puncak prestasi",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Doa sebelum audisi",
"Syukur atas peran yang didapat",
"Refleksi setelah syuting"
],
"physical": [
"Jaga kondisi fisik",
"Tidur cukup",
"Makan sehat"
],
"knowledge": [
"Baca skenario dan analisis karakter",
"Pelajari teknik akting baru",
"Tonton film untuk referensi"
],
"social": [
"Bangun relasi di industri",
"Networking dengan sesama aktor",
"Dengar feedback sutradara"
],
"character": [
"Disiplin latihan",
"Catat progres akting",
"Evaluasi performa"
],
"dream_skill": [
"Latihan monolog 15 menit",
"Baca 1 skenario/scene",
"Latihan ekspresi di kaca"
]
}'::jsonb, '[
{
"title": "Sutradara",
"description": "Menyutradarai film atau series",
"skills": [
"Kepemimpinan",
"Visi artistik",
"Manajemen produksi"
]
},
{
"title": "Penulis Skenario",
"description": "Menulis naskah film",
"skills": [
"Kreativitas",
"Storytelling",
"Dialog"
]
},
{
"title": "Casting Director",
"description": "Memilih aktor untuk produksi",
"skills": [
"Observasi",
"Jaringan",
"Penilaian bakat"
]
},
{
"title": "Presenter/MC",
"description": "Membawakan acara TV atau event",
"skills": [
"Public speaking",
"Karisma",
"Improvisasi"
]
}
]'::jsonb, 14, 40, '3-10 tahun', '[
{
"id": "pengalaman",
"type": "single_select",
"label": "Pengalaman akting kamu sekarang?",
"options": [
"Belum pernah sama sekali",
"Pernah drama sekolah/teater komunitas",
"Sudah ikut kelas akting",
"Sudah pernah audisi/dapat peran"
]
},
{
"id": "media",
"type": "single_select",
"label": "Kamu mau fokus ke media apa?",
"options": [
"Film layar lebar/web series",
"Sinetron/FTV",
"Teater/panggung",
"Semua/belum yakin"
]
},
{
"id": "kota",
"type": "single_select",
"label": "Kamu tinggal dekat pusat industri hiburan?",
"options": [
"Jakarta/Banten",
"Bandung/Jawa Barat",
"Kota besar lain",
"Kota kecil/daerah"
]
},
{
"id": "hambatan",
"type": "single_select",
"label": "Apa hambatan terbesarmu?",
"options": [
"Tidak tahu cara mulai",
"Belum punya keberanian",
"Keluarga kurang mendukung",
"Jarak dari pusat industri"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('graphic-designer', 'Desainer Grafis Profesional', '🎨', '#0891B2', 'Creative', '2-5 tahun', 'Menciptakan visual yang bermakna untuk brand, media, iklan, dan komunikasi digital.', 'Di era digital, desain adalah bahasa bisnis. Desainer grafis yang baik bisa mengubah ide menjadi visual yang menggerakkan orang untuk bertindak.', ARRAY['Art Director', 'UI/UX Designer', 'Brand Strategist', 'Motion Graphic Designer', 'Illustrator', 'Creative Director'], '[]'::jsonb, '[
{
"title": "Kuasai Tools Desain dan Buat Portofolio Pertama",
"description": "Fondasi skill desain",
"why_it_matters": "Skill adalah segalanya",
"alternative_path": "Fokus ke Canva dulu",
"order": 1
},
{
"title": "Klien Berbayar Pertama",
"description": "Dari belajar ke bekerja",
"why_it_matters": "Titik balik karir",
"alternative_path": "Freelance online",
"order": 2
},
{
"title": "Portofolio di Behance dengan 10K+ Views",
"description": "Dikenal di komunitas desain",
"why_it_matters": "Rekognisi dan jaringan",
"alternative_path": "Jual template desain",
"order": 3
},
{
"title": "Full-time Designer atau Freelance Stabil >10 Juta/Bulan",
"description": "Karier yang stabil dan menguntungkan",
"why_it_matters": "Puncak karir desain grafis",
"alternative_path": "Buka studio desain",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Kuasai Tools Desain dan Buat Portofolio Pertama",
"title": "Mahir Canva + Illustrator/Photoshop",
"description": "Tools standar industri",
"order": 1
},
{
"big_win_title": "Kuasai Tools Desain dan Buat Portofolio Pertama",
"title": "Selesaikan 5 project desain",
"description": "Portofolio awal",
"order": 2
},
{
"big_win_title": "Klien Berbayar Pertama",
"title": "Dapat 3 klien berbayar",
"description": "Pengalaman klien",
"order": 3
},
{
"big_win_title": "Klien Berbayar Pertama",
"title": "Rate >500K per project",
"description": "Nilai proyek",
"order": 4
},
{
"big_win_title": "Portofolio di Behance dengan 10K+ Views",
"title": "10 project di Behance",
"description": "Portofolio publik",
"order": 5
},
{
"big_win_title": "Portofolio di Behance dengan 10K+ Views",
"title": "Dikenal di komunitas desain",
"description": "Network industri",
"order": 6
},
{
"big_win_title": "Full-time Designer atau Freelance Stabil >10 Juta/Bulan",
"title": "Punya 10+ klien tetap",
"description": "Klien berulang",
"order": 7
},
{
"big_win_title": "Full-time Designer atau Freelance Stabil >10 Juta/Bulan",
"title": "Posisi Art Director",
"description": "Level leadership",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Refleksi dan syukur",
"Doa sebelum mulai kerja",
"Luangkan waktu hening"
],
"physical": [
"Stretching sela kerja",
"Jalan 10 menit",
"Istirahat mata"
],
"knowledge": [
"Baca artikel desain",
"Riset referensi",
"Pelajari tools baru"
],
"social": [
"Minta feedback desain",
"Diskusi dengan sesama desainer",
"Bangun portofolio"
],
"character": [
"Selesaikan 1 project",
"Catat progres",
"Evaluasi kualitas"
],
"dream_skill": [
"Buat 1 desain atau sketch",
"Latihan typography",
"Riset referensi Behance/Dribbble"
]
}'::jsonb, '[
{
"title": "Art Director",
"description": "Memimpin arah visual brand",
"skills": [
"Kepemimpinan kreatif",
"Branding",
"Manajemen tim"
]
},
{
"title": "UI/UX Designer",
"description": "Desain antarmuka produk digital",
"skills": [
"User research",
"Wireframing",
"Prototyping"
]
},
{
"title": "Brand Strategist",
"description": "Bangun identitas visual brand",
"skills": [
"Branding",
"Strategi",
"Konsistensi"
]
},
{
"title": "Illustrator",
"description": "Buat ilustrasi untuk berbagai media",
"skills": [
"Drawing",
"Kreativitas",
"Gaya visual"
]
}
]'::jsonb, 14, 40, '2-5 tahun', '[
{
"id": "level",
"type": "single_select",
"label": "Kemampuan desain kamu sekarang?",
"options": [
"Belum pernah belajar desain",
"Sudah pakai Canva/tools sederhana",
"Sudah belajar Figma/Adobe",
"Sudah punya portofolio"
]
},
{
"id": "tools",
"type": "single_select",
"label": "Tools desain yang sudah kamu pakai?",
"options": [
"Belum ada",
"Canva/PowerPoint",
"Figma basic",
"Figma + Adobe (intermediate)"
]
},
{
"id": "spesialisasi",
"type": "single_select",
"label": "Mau spesialisasi di mana?",
"options": [
"Branding/logo/visual identity",
"Digital/sosial media",
"Illustrasi/komik",
"Belum yakin"
]
},
{
"id": "tujuan",
"type": "single_select",
"label": "Tujuan karier kamu?",
"options": [
"Freelance dari rumah",
"In-house di perusahaan",
"Kerja di agency kreatif",
"Punya studio sendiri"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('photographer', 'Fotografer Profesional', '📷', '#374151', 'Creative', '2-6 tahun', 'Mengabadikan momen dan menciptakan karya visual untuk berbagai kebutuhan — wedding, editorial, komersial, atau seni.', 'Fotografi adalah seni yang bisa berbicara tanpa kata. Fotografer profesional punya akses ke dunia yang luar biasa — dari wedding hingga majalah internasional.', ARRAY['Videografer', 'Content Creator Visual', 'Art Director', 'Photo Editor', 'Foto Jurnalis', 'Stock Photographer'], '[]'::jsonb, '[
{
"title": "Kuasai Teknik Dasar dan Punya Kamera Layak",
"description": "Fondasi skill fotografi",
"why_it_matters": "Skill dasar yang solid adalah kunci",
"alternative_path": "Gunakan HP dulu",
"order": 1
},
{
"title": "Portofolio 20 Karya dan Klien Pertama",
"description": "Dari hobi ke bisnis",
"why_it_matters": "Mulai menghasilkan dari fotografi",
"alternative_path": "Content creator visual",
"order": 2
},
{
"title": "Spesialisasi dan Income Stabil dari Fotografi",
"description": "Pendapatan tetap sebagai fotografer",
"why_it_matters": "Karier yang sustainable",
"alternative_path": "Jual preset/course",
"order": 3
},
{
"title": "Dikenal sebagai Fotografer Profesional di Bidang Pilihan",
"description": "Puncak karir fotografi",
"why_it_matters": "Rekognisi dan pengaruh",
"alternative_path": "Buka studio sendiri",
"order": 4
}
]'::jsonb, '[
{
"big_win_title": "Kuasai Teknik Dasar dan Punya Kamera Layak",
"title": "Kuasai exposure triangle",
"description": "ISO, aperture, shutter speed",
"order": 1
},
{
"big_win_title": "Kuasai Teknik Dasar dan Punya Kamera Layak",
"title": "Punya 10 foto berkualitas",
"description": "Karya portofolio awal",
"order": 2
},
{
"big_win_title": "Portofolio 20 Karya dan Klien Pertama",
"title": "Dapat 3 klien berbayar",
"description": "Klien pertama",
"order": 3
},
{
"big_win_title": "Portofolio 20 Karya dan Klien Pertama",
"title": "Upload ke Instagram portofolio",
"description": "Portofolio online",
"order": 4
},
{
"big_win_title": "Spesialisasi dan Income Stabil dari Fotografi",
"title": "Spesialisasi niche (wedding/produk/portrait)",
"description": "Fokus pasar",
"order": 5
},
{
"big_win_title": "Spesialisasi dan Income Stabil dari Fotografi",
"title": "Booking 2+ klien/bulan",
"description": "Frekuensi klien stabil",
"order": 6
},
{
"big_win_title": "Dikenal sebagai Fotografer Profesional",
"title": "Masuk majalah atau brand besar",
"description": "Publikasi media",
"order": 7
},
{
"big_win_title": "Dikenal sebagai Fotografer Profesional",
"title": "Punya studio sendiri",
"description": "Investasi bisnis",
"order": 8
}
]'::jsonb, '{
"spiritual": [
"Refleksi dan syukur",
"Doa sebelum sesi foto",
"Luangkan waktu hening"
],
"physical": [
"Jaga kondisi fisik",
"Stretching sela syuting",
"Minum air cukup"
],
"knowledge": [
"Pelajari teknik fotografi baru",
"Riset referensi visual",
"Belajar editing"
],
"social": [
"Komunikasi dengan klien",
"Networking sesama fotografer",
"Bangun portofolio"
],
"character": [
"Catat jadwal sesi",
"Evaluasi hasil foto",
"Disiplin backup file"
],
"dream_skill": [
"Foto 20 gambar hari ini",
"Edit 5-10 foto dengan Lightroom",
"Pelajari 1 teknik baru"
]
}'::jsonb, '[
{
"title": "Videografer",
"description": "Bikin video untuk klien atau brand",
"skills": [
"Videografi",
"Editing",
"Storytelling"
]
},
{
"title": "Content Creator Visual",
"description": "Buat konten visual untuk sosial media",
"skills": [
"Fotografi",
"Kreativitas",
"Konsistensi"
]
},
{
"title": "Art Director",
"description": "Arahkan gaya visual project",
"skills": [
"Kepemimpinan",
"Visi artistik",
"Manajemen tim"
]
},
{
"title": "Photo Editor",
"description": "Edit foto untuk media atau brand",
"skills": [
"Editing",
"Color grading",
"Detail oriented"
]
}
]'::jsonb, 14, 40, '2-6 tahun', '[
{
"id": "kamera",
"type": "single_select",
"label": "Kamera yang kamu punya sekarang?",
"options": [
"Hanya kamera HP",
"Kamera mirrorless/DSLR entry level",
"Kamera mirrorless/DSLR mid-range",
"Kamera profesional"
]
},
{
"id": "spesialisasi",
"type": "single_select",
"label": "Spesialisasi fotografi yang diminati?",
"options": [
"Wedding/portrait",
"Produk/komersial",
"Landscape/travel",
"Street/dokumenter"
]
},
{
"id": "portofolio",
"type": "single_select",
"label": "Portofolio kamu sekarang?",
"options": [
"Belum ada",
"Ada beberapa foto di HP/IG",
"Sudah punya akun portofolio",
"Sudah pernah dapat klien"
]
},
{
"id": "tujuan",
"type": "single_select",
"label": "Tujuan utama kamu?",
"options": [
"Freelance sampingan",
"Full-time fotografer",
"Punya studio sendiri",
"Foto jurnalis/editorial"
]
}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;


-- ============================================================
-- 18 remaining templates: Tech(5), Business(5), Health(4), Education(1), Lifestyle(3)
-- ============================================================
INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('programmer','Programmer Profesional','💻','#3B82F6','Tech','2-5 tahun','Menjadi programmer handal yang menciptakan solusi teknologi inovatif. Dari kode pertama hingga aplikasi yang digunakan jutaan orang.','Teknologi menggerakkan dunia. Programmer adalah arsitek masa depan digital Indonesia.',ARRAY['Tech Lead','Software Architect','Product Manager','DevOps Engineer','CTO Startup','Tech Consultant'],'[]'::jsonb,
'[
    {"title": "Kuasai 1 Bahasa Pemrograman", "description": "Python, JavaScript, atau bahasa pilihan", "why_it_matters": "Fondasi coding yang solid", "alternative_path": "Bootcamp online gratis", "order": 1},
    {"title": "Buat dan Deploy Project Pertama", "description": "Project live yang bisa diakses orang lain", "why_it_matters": "Portofolio nyata", "alternative_path": "Kontribusi open source", "order": 2},
    {"title": "Magang atau Pekerjaan Pertama", "description": "Pengalaman kerja nyata di perusahaan tech", "why_it_matters": "Belajar di lingkungan profesional", "alternative_path": "Freelance platform", "order": 3},
    {"title": "Senior Developer atau Tech Lead", "description": "Memimpin tim dan proyek teknis", "why_it_matters": "Puncak karir teknis", "alternative_path": "Startup founder", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai 1 Bahasa Pemrograman", "title": "Selesaikan 1 course online", "description": "Course Python/JavaScript di Dicoding atau setara", "order": 1},
    {"big_win_title": "Kuasai 1 Bahasa Pemrograman", "title": "Buat 5 program sederhana", "description": "Kalkulator, to-do list, game sederhana", "order": 2},
    {"big_win_title": "Buat dan Deploy Project Pertama", "title": "Push 5+ repo ke GitHub", "description": "Portofolio coding publik", "order": 3},
    {"big_win_title": "Buat dan Deploy Project Pertama", "title": "Project live dipakai 10+ orang", "description": "Deploy dan dapat user nyata", "order": 4},
    {"big_win_title": "Buat dan Deploy Project Pertama", "title": "Kuasai 1 framework populer", "description": "React, Laravel, Django, atau Flutter", "order": 5},
    {"big_win_title": "Magang atau Pekerjaan Pertama", "title": "Lulus technical test", "description": "Lulus setidaknya 1 technical interview", "order": 6},
    {"big_win_title": "Senior Developer atau Tech Lead", "title": "Lead 1 project tim", "description": "Memimpin project dengan 2+ developer", "order": 7},
    {"big_win_title": "Senior Developer atau Tech Lead", "title": "Mentor junior developer", "description": "Membimbing developer junior", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum coding", "Syukur atas tech yang dipelajari", "Refleksi progres"], "physical": ["Stretching leher & bahu 10 menit", "Istirahat mata tiap 2 jam", "Jalan kaki 15 menit"], "knowledge": ["Baca dokumentasi tech", "Tutorial framework baru", "Baca tech blog"], "social": ["Daily standup meeting", "Code review tim", "Diskusi arsitektur"], "character": ["Commit progres harian", "Catat problem solved", "Evaluasi coding skill"], "dream_skill": ["Coding project pribadi 1 jam", "Solve LeetCode 1 soal", "Belajar konsep baru 30 menit"]}'::jsonb,
'[
    {"title": "Tech Lead", "description": "Memimpin tim developer dan arsitektur teknis", "skills": ["Kepemimpinan", "Arsitektur", "Manajemen"]},
    {"title": "Product Manager", "description": "Jembatan antara bisnis dan tech", "skills": ["Strategi", "Komunikasi", "Analisis"]},
    {"title": "DevOps Engineer", "description": "Infrastruktur dan deployment", "skills": ["Cloud", "CI/CD", "Infra"]},
    {"title": "Tech Consultant", "description": "Konsultan teknologi untuk perusahaan", "skills": ["Analisis", "Solusi", "Komunikasi"]}
]'::jsonb,
14, 40, '2-5 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level coding kamu sekarang?", "options": ["Belum pernah coding", "Pemula (baru belajar syntax)", "Intermediate (bisa bikin project)", "Lanjutan (sudah pernah kerja/freelance)"]},
    {"id": "fokus", "type": "single_select", "label": "Bidang programming yang diminati?", "options": ["Web Development", "Mobile Apps", "Data Science / AI", "Game Development"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir programming?", "options": ["Kerja di perusahaan tech", "Freelance remote", "Bikin startup sendiri", "Jadi tech lead / arsitek"]},
    {"id": "waktu", "type": "single_select", "label": "Berapa jam per minggu bisa kamu coding?", "options": ["Kurang dari 5 jam", "5-15 jam", "15-30 jam", "Lebih dari 30 jam"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('ui-ux-designer','UI/UX Designer Profesional','✨','#A855F7','Tech','2-5 tahun','Menciptakan pengalaman digital yang intuitif, indah, dan manusiawi. Setiap desain adalah jembatan antara teknologi dan pengguna.','Desain yang baik menyelamatkan jutaan menit kebingungan pengguna. UI/UX designer adalah suara user di meja product.',ARRAY['Product Designer','UX Researcher','Design Lead','Creative Director','Freelance Designer','Design Educator'],'[]'::jsonb,
'[
    {"title": "Kuasai Tools Desain dan Dasar UX", "description": "Figma, design principles, UX research dasar", "why_it_matters": "Fondasi skill yang benar", "alternative_path": "Bootcamp desain online", "order": 1},
    {"title": "Selesaikan 3 Studi Kasus Portfolio", "description": "Case study lengkap dari riset hingga final design", "why_it_matters": "Portofolio adalah mata uang designer", "alternative_path": "Redesign app populer", "order": 2},
    {"title": "Dapat Proyek atau Pekerjaan Desain Pertama", "description": "Pengalaman kerja nyata sebagai designer", "why_it_matters": "Dari belajar ke dampak nyata", "alternative_path": "Freelance di platform", "order": 3},
    {"title": "Senior atau Lead Designer", "description": "Memimpin arah desain produk dan tim", "why_it_matters": "Puncak karir desain", "alternative_path": "Buka agency desain", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Tools Desain dan Dasar UX", "title": "Selesaikan Figma course", "description": "Bisa bikin prototype interaktif tanpa tutorial", "order": 1},
    {"big_win_title": "Kuasai Tools Desain dan Dasar UX", "title": "Pahami UX research dasar", "description": "User interview, persona, journey map", "order": 2},
    {"big_win_title": "Selesaikan 3 Studi Kasus Portfolio", "title": "Upload 3 case study ke Behance", "description": "Dari riset ke hi-fi design", "order": 3},
    {"big_win_title": "Selesaikan 3 Studi Kasus Portfolio", "title": "Design system kecil", "description": "Buat komponen reusable di Figma", "order": 4},
    {"big_win_title": "Dapat Proyek atau Pekerjaan Pertama", "title": "Dapat 1 klien berbayar", "description": "Project desain dengan klien real", "order": 5},
    {"big_win_title": "Dapat Proyek atau Pekerjaan Pertama", "title": "Lulus portofolio review", "description": "Diterima di perusahaan atau agency", "order": 6},
    {"big_win_title": "Senior atau Lead Designer", "title": "Design lead 1 product", "description": "Lead desain untuk 1 produk dari awal", "order": 7},
    {"big_win_title": "Senior atau Lead Designer", "title": "Mentor 1 junior designer", "description": "Membimbing designer yang lebih junior", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mulai desain", "Syukur atas ide kreatif", "Refleksi hasil kerja"], "physical": ["Stretching sela kerja", "Istirahat mata 10 menit", "Jalan kaki 15 menit"], "knowledge": ["Riset referensi desain", "Baca artikel UX", "Pelajari tools baru"], "social": ["Minta feedback desain", "Diskusi dengan product team", "User testing session"], "character": ["Selesaikan 1 screen desain", "Catat progres portofolio", "Evaluasi kualitas desain"], "dream_skill": ["Desain 1 screen di Figma", "Buat 1 prototype interaktif", "Latihan visual hierarchy"]}'::jsonb,
'[
    {"title": "Product Designer", "description": "Desain produk digital end-to-end", "skills": ["UX", "UI", "Prototyping"]},
    {"title": "UX Researcher", "description": "Riset dan wawancara user", "skills": ["Riset", "Analisis", "Empati"]},
    {"title": "Creative Director", "description": "Arahkan visi kreatif brand", "skills": ["Kepemimpinan", "Branding", "Strategi"]},
    {"title": "Design Educator", "description": "Ajarkan desain ke generasi baru", "skills": ["Komunikasi", "Kurikulum", "Mentoring"]}
]'::jsonb,
14, 40, '2-5 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level UI/UX kamu sekarang?", "options": ["Belum pernah belajar desain", "Pemula (baru kenal Figma)", "Intermediate (punya beberapa project)", "Mahir (sudah pernah kerja/proyek)"]},
    {"id": "fokus", "type": "single_select", "label": "Bidang desain yang diminati?", "options": ["Mobile App", "Website / Dashboard", "Game UI", "Design System"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir desain?", "options": ["Product Designer di startup", "UX Researcher", "Freelance Designer", "Design Lead / Creative Director"]},
    {"id": "tools", "type": "single_select", "label": "Tools desain yang dikuasai?", "options": ["Belum ada", "Figma dasar", "Figma + Adobe", "Figma + prototyping tools"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('game-developer','Game Developer Profesional','🎮','#10B981','Tech','2-6 tahun','Menciptakan dunia virtual dan petualangan interaktif. Dari konsep hingga rilis, setiap game adalah mahakarya digital.','Indonesia punya potensi besar di industri game. Game developer bisa menciptakan hiburan yang dinikmati jutaan orang global.',ARRAY['Game Designer','Technical Artist','Producer','QA Lead','Indie Founder','Game Educator'],'[]'::jsonb,
'[
    {"title": "Kuasai Game Engine dan Buat Game Pertama", "description": "Unity, Godot, atau Unreal Engine", "why_it_matters": "Fondasi teknis game dev", "alternative_path": "Game engine berbasis web", "order": 1},
    {"title": "Rilis Game yang Bisa Dimainkan Orang", "description": "Publikasi di itch.io, Play Store, atau platform lain", "why_it_matters": "Game selesai lebih baik dari game sempurna", "alternative_path": "Ikut Game Jam", "order": 2},
    {"title": "Pendapatan Pertama dari Game", "description": "Game menghasilkan uang via penjualan, IAP, atau sponsor", "why_it_matters": "Dari hobi ke bisnis", "alternative_path": "Freelance game dev", "order": 3},
    {"title": "Bekerja di Studio Game Profesional", "description": "Bergabung dengan studio game nasional atau internasional", "why_it_matters": "Karir game dev yang stabil", "alternative_path": "Founder studio indie", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Game Engine dan Buat Game Pertama", "title": "Selesaikan course game engine", "description": "Unity/Godot course dari Udemy atau setara", "order": 1},
    {"big_win_title": "Kuasai Game Engine dan Buat Game Pertama", "title": "Buat prototype game sederhana", "description": "Platformer atau puzzle sederhana", "order": 2},
    {"big_win_title": "Rilis Game yang Bisa Dimainkan Orang", "title": "Ikut 1 Game Jam", "description": "Selesaikan game dalam waktu terbatas", "order": 3},
    {"big_win_title": "Rilis Game yang Bisa Dimainkan Orang", "title": "Publikasi game di itch.io", "description": "Game bisa dimainkan publik", "order": 4},
    {"big_win_title": "Rilis Game yang Bisa Dimainkan Orang", "title": "Dapat 100+ downloads", "description": "Minimal 100 orang mainkan game kamu", "order": 5},
    {"big_win_title": "Pendapatan Pertama dari Game", "title": "Pendapatan pertama dari game", "description": "Penjualan, iklan, atau sponsor", "order": 6},
    {"big_win_title": "Bekerja di Studio Game Profesional", "title": "Portofolio 3 game selesai", "description": "3 game berbeda genre/mechanic", "order": 7},
    {"big_win_title": "Bekerja di Studio Game Profesional", "title": "Diterima di studio game", "description": "Offer kerja sebagai game developer", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mulai coding game", "Syukur atas kreativitas", "Refleksi progres"], "physical": ["Stretching sela coding", "Jalan kaki 15 menit", "Olahraga ringan"], "knowledge": ["Baca tutorial game engine", "Pelajari game design pattern", "Analisis game favorit"], "social": ["Diskusi di komunitas game dev", "Playtest dengan teman", "Dapat feedback player"], "character": ["Catat progress harian", "Evaluasi gameplay", "Fokus pada target"], "dream_skill": ["Coding gameplay 1 jam", "Buat 1 asset/programming", "Playtest build hari ini"]}'::jsonb,
'[
    {"title": "Game Designer", "description": "Desain mekanik dan level game", "skills": ["Game Design", "Level Design", "Balance"]},
    {"title": "Technical Artist", "description": "Jembatan antara art dan programming", "skills": ["Shader", "Pipeline", "Optimasi"]},
    {"title": "QA Lead", "description": "Testing dan quality assurance game", "skills": ["Testing", "Detail", "Reporting"]},
    {"title": "Indie Founder", "description": "Bikin studio game sendiri", "skills": ["Kewirausahaan", "Produksi", "Manajemen"]}
]'::jsonb,
13, 40, '2-6 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level game dev kamu sekarang?", "options": ["Belum pernah coba", "Pemula (baru belajar engine)", "Intermediate (punya 1 game)", "Mahir (pernah rilis game)"]},
    {"id": "engine", "type": "single_select", "label": "Game engine yang mau dipelajari?", "options": ["Unity (C#)", "Godot (GDScript)", "Unreal Engine (C++)", "Belum yakin"]},
    {"id": "platform", "type": "single_select", "label": "Platform target?", "options": ["Mobile (Android/iOS)", "PC/Desktop", "Console", "Web/HTML5"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir game dev?", "options": ["Kerja di studio game", "Jadi indie developer", "Buat game sendiri sebagai side project", "Freelance game dev"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('data-scientist','Data Scientist Profesional','📊','#F59E0B','Tech','2-6 tahun','Mengubah data mentah menjadi wawasan berharga. Dengan analisis dan machine learning, kamu membantu perusahaan membuat keputusan berbasis data.','Data adalah minyak baru di era digital. Data scientist membantu organisasi membuat keputusan yang lebih cerdas dan berdampak.',ARRAY['Data Analyst','ML Engineer','Data Engineer','AI Researcher','BI Lead','Data Consultant'],'[]'::jsonb,
'[
    {"title": "Kuasai Fundamental Data Science", "description": "Python, SQL, statistik, dan machine learning dasar", "why_it_matters": "Fondasi yang kokoh untuk karir data", "alternative_path": "Bootcamp data science", "order": 1},
    {"title": "Selesaikan Project Data End-to-End", "description": "Dari data cleaning ke insight dan presentasi", "why_it_matters": "Portofolio nyata yang menunjukkan kemampuan", "alternative_path": "Kompetisi Kaggle", "order": 2},
    {"title": "Magang atau Pekerjaan Data Pertama", "description": "Pengalaman professional di bidang data", "why_it_matters": "Aplikasi skill di dunia nyata", "alternative_path": "Freelance data analyst", "order": 3},
    {"title": "Senior Data Scientist atau Lead Data", "description": "Memimpin tim data dan strategi data-driven", "why_it_matters": "Puncak karir data", "alternative_path": "AI Researcher / PhD", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Fundamental Data Science", "title": "Kuasai Python pandas + numpy", "description": "Bisa manipulasi data dengan Python", "order": 1},
    {"big_win_title": "Kuasai Fundamental Data Science", "title": "Kuasai SQL intermediate", "description": "SELECT, JOIN, subquery, window functions", "order": 2},
    {"big_win_title": "Kuasai Fundamental Data Science", "title": "Pahami statistik dasar", "description": "Distribusi, korelasi, hipotesis testing", "order": 3},
    {"big_win_title": "Selesaikan Project Data End-to-End", "title": "Upload 1 EDA notebook di GitHub", "description": "Exploratory Data Analysis dengan insight", "order": 4},
    {"big_win_title": "Selesaikan Project Data End-to-End", "title": "Buat 1 ML model sederhana", "description": "Regresi atau klasifikasi dengan scikit-learn", "order": 5},
    {"big_win_title": "Magang atau Pekerjaan Data Pertama", "title": "Portofolio 3 project data", "description": "3 project berbeda menunjukkan skill", "order": 6},
    {"big_win_title": "Senior Data Scientist atau Lead Data", "title": "Deploy model ke production", "description": "Model ML yang live digunakan", "order": 7},
    {"big_win_title": "Senior Data Scientist atau Lead Data", "title": "Lead 1 data project tim", "description": "Memimpin project data dengan tim", "order": 8}
]'::jsonb,
'{"spiritual": ["Syukur atas data yang dipelajari", "Refleksi hasil analisis", "Doa sebelum presentasi"], "physical": ["Stretching sela kerja", "Jalan 10 menit", "Minum air cukup"], "knowledge": ["Baca paper ML", "Pelajari algoritma baru", "Eksperimen tools baru"], "social": ["Diskusi insight dengan tim", "Presentasi temuan", "Kaggle competition"], "character": ["Catat progres eksperimen", "Evaluasi model performance", "Dokumentasi project"], "dream_skill": ["Analisis dataset 1 jam", "Train 1 model ML", "Review statistik 30 menit"]}'::jsonb,
'[
    {"title": "ML Engineer", "description": "Bangun dan deploy model ML", "skills": ["ML", "Engineering", "Production"]},
    {"title": "Data Engineer", "description": "Pipeline dan infrastruktur data", "skills": ["ETL", "Big Data", "Cloud"]},
    {"title": "BI Lead", "description": "Dashboard dan reporting strategis", "skills": ["Visualisasi", "BI Tools", "Storytelling"]},
    {"title": "AI Researcher", "description": "Riset dan publikasi AI", "skills": ["Riset", "Deep Learning", "Publikasi"]}
]'::jsonb,
15, 40, '2-6 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level data science kamu sekarang?", "options": ["Belum pernah belajar", "Pemula (tahu Python dasar)", "Intermediate (bisa analisis data)", "Mahir (punya portfolio ML)"]},
    {"id": "minat", "type": "single_select", "label": "Bidang data yang diminati?", "options": ["Data Analytics / Visualisasi", "Machine Learning / AI", "Data Engineering", "Semua/belum yakin"]},
    {"id": "tools", "type": "single_select", "label": "Tools yang udah kamu kuasai?", "options": ["Belum ada / Excel aja", "Python / SQL basic", "Python + SQL + pandas", "PyTorch / TensorFlow"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir data?", "options": ["Data Analyst", "ML Engineer", "Data Scientist", "AI Researcher"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('ai-specialist','AI Specialist Profesional','🤖','#06B6D4','Tech','3-8 tahun','Mendorong batasan teknologi kecerdasan buatan. Dari pengembangan model hingga implementasi solusi AI yang berdampak nyata.','AI adalah teknologi paling transformatif abad ini. Spesialis AI Indonesia punya peluang besar di era digital global.',ARRAY['ML Engineer','AI Researcher','Computer Vision Engineer','NLP Engineer','AI Product Manager','Robotics Engineer'],'[]'::jsonb,
'[
    {"title": "Kuasai Fundamental AI dan Machine Learning", "description": "Python, ML algorithms, neural networks", "why_it_matters": "Landasan teknis yang kuat", "alternative_path": "Course Andrew Ng / fast.ai", "order": 1},
    {"title": "Buat dan Deploy Model AI Pertama", "description": "Model AI yang bisa digunakan orang lain", "why_it_matters": "Dari teori ke praktek nyata", "alternative_path": "Hugging Face Spaces", "order": 2},
    {"title": "Bekerja di Perusahaan AI atau R&D", "description": "Pengalaman profesional di bidang AI", "why_it_matters": "Belajar di lingkungan AI yang serius", "alternative_path": "Kontribusi open source AI", "order": 3},
    {"title": "Lead AI Team atau Publikasi Penelitian", "description": "Memimpin tim AI atau publish paper pertama", "why_it_matters": "Puncak karir AI", "alternative_path": "PhD AI / Dosen", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Fundamental AI dan ML", "title": "Selesaikan 1 ML course", "description": "Andrew Ng, fast.ai, atau setara", "order": 1},
    {"big_win_title": "Kuasai Fundamental AI dan ML", "title": "Train 3 model sederhana", "description": "Klasifikasi, regresi, clustering", "order": 2},
    {"big_win_title": "Kuasai Fundamental AI dan ML", "title": "Pahami CNN, RNN, Transformer", "description": "Teori dasar arsitektur neural network", "order": 3},
    {"big_win_title": "Buat dan Deploy Model AI Pertama", "title": "Buat 1 project AI end-to-end", "description": "Dari data ke model ke deployment", "order": 4},
    {"big_win_title": "Buat dan Deploy Model AI Pertama", "title": "Deploy model ke Hugging Face", "description": "Model bisa diakses publik", "order": 5},
    {"big_win_title": "Bekerja di Perusahaan AI atau R&D", "title": "Portofolio 3 AI project", "description": "3 project menunjukkan skill AI", "order": 6},
    {"big_win_title": "Lead AI Team atau Publikasi Penelitian", "title": "Publikasi 1 paper/artikel AI", "description": "arXiv, Medium, atau conference", "order": 7},
    {"big_win_title": "Lead AI Team atau Publikasi Penelitian", "title": "Lead 1 AI project production", "description": "Model yang live dipakai user", "order": 8}
]'::jsonb,
'{"spiritual": ["Refleksi etika AI", "Syukur atas perkembangan tech", "Doa sebelum riset"], "physical": ["Stretching sela coding", "Olahraga ringan", "Tidur cukup"], "knowledge": ["Baca paper AI terbaru", "Implementasi arsitektur baru", "Review SOTA"], "social": ["Diskusi dengan tim riset", "Presentasi progress", "Code review ML"], "character": ["Catat eksperimen", "Evaluasi model metrics", "Dokumentasi riset"], "dream_skill": ["Train 1 model hari ini", "Baca 1 paper AI", "Eksperimen hyperparameter"]}'::jsonb,
'[
    {"title": "ML Engineer", "description": "Production AI systems", "skills": ["ML", "Engineering", "Deployment"]},
    {"title": "AI Researcher", "description": "Riset dan publikasi AI", "skills": ["Riset", "Deep Learning", "Math"]},
    {"title": "AI Product Manager", "description": "Produk AI dari konsep ke rilis", "skills": ["Produk", "Strategi", "AI Knowledge"]},
    {"title": "Computer Vision Engineer", "description": "AI untuk gambar dan video", "skills": ["CV", "Deep Learning", "Image Processing"]}
]'::jsonb,
16, 40, '3-8 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level AI kamu sekarang?", "options": ["Belum pernah belajar AI", "Pemula (tahu ML dasar)", "Intermediate (pernah train model)", "Mahir (bisa deploy model)"]},
    {"id": "fokus", "type": "single_select", "label": "Bidang AI yang diminati?", "options": ["Computer Vision", "Natural Language Processing", "Generative AI (LLM)", "Reinforcement Learning"]},
    {"id": "tools", "type": "single_select", "label": "Framework AI yang dikuasai?", "options": ["Belum ada", "scikit-learn / TensorFlow", "PyTorch", "PyTorch + Hugging Face"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir AI?", "options": ["ML Engineer di perusahaan tech", "AI Researcher", "AI Product Manager", "Startup AI"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('entrepreneur','Entrepreneur / Founder','🚀','#8B5CF6','Business','3-10 tahun','Membangun bisnis dari nol, menciptakan solusi, dan membawa dampak nyata. Setiap tantangan adalah peluang untuk berinovasi.','Entrepreneur adalah mesin pertumbuhan ekonomi. Mereka menciptakan lapangan kerja, solusi, dan masa depan yang lebih baik.',ARRAY['CEO Startup','Angel Investor','Business Consultant','Venture Builder','Serial Entrepreneur','Corporate Innovator'],'[]'::jsonb,
'[
    {"title": "Validasi Ide Bisnis dan Dapat Customer Pertama", "description": "Dari ide ke bukti ada orang mau bayar", "why_it_matters": "Validasi adalah segalanya", "alternative_path": "Side project dulu", "order": 1},
    {"title": "Revenue Konsisten 10 Juta/Bulan", "description": "Bisnis yang terbukti menghasilkan", "why_it_matters": "Titik balik dari proyek ke bisnis nyata", "alternative_path": "Naikkan harga", "order": 2},
    {"title": "Tim Kecil dan Sistem Berjalan", "description": "Bisnis tidak tergantung kamu 100%", "why_it_matters": "Bisnis yang scalable", "alternative_path": "Outsource", "order": 3},
    {"title": "Skalabilitas — Revenue 100 Juta+/Bulan", "description": "Bisnis bertumbuh signifikan", "why_it_matters": "Puncak kesuksesan entrepreneur", "alternative_path": "Exit / akuisisi", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Validasi Ide Bisnis", "title": "Bicara dengan 20 calon pelanggan", "description": "Validasi masalah sebelum buat produk", "order": 1},
    {"big_win_title": "Validasi Ide Bisnis", "title": "Buat landing page / MVP", "description": "Produk minimal yang bisa dijual", "order": 2},
    {"big_win_title": "Validasi Ide Bisnis", "title": "Dapat 5 pelanggan pertama", "description": "Orang yang mau bayar", "order": 3},
    {"big_win_title": "Revenue Konsisten 10 Juta/Bulan", "title": "Revenue pertama 1 juta", "description": "Uang masuk pertama dari bisnis", "order": 4},
    {"big_win_title": "Revenue Konsisten 10 Juta/Bulan", "title": "Profit margin >20%", "description": "Bisnis menguntungkan", "order": 5},
    {"big_win_title": "Tim Kecil dan Sistem Berjalan", "title": "Rekrut 1 karyawan/mitra", "description": "Orang pertama yang digaji", "order": 6},
    {"big_win_title": "Skalabilitas", "title": "Sistem otomatis/dokumentasi", "description": "SOP dan sistem yang berjalan", "order": 7},
    {"big_win_title": "Skalabilitas", "title": "Revenue >100 juta/bulan", "description": "Milestone bisnis besar", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mulai bisnis", "Syukur atas progress", "Refleksi harian"], "physical": ["Olahraga 15 menit", "Jalan kaki", "Tidur cukup"], "knowledge": ["Riset pasar", "Baca buku bisnis", "Analisis kompetitor"], "social": ["Networking", "Follow up leads", "Diskusi mentor"], "character": ["Review target harian", "Evaluasi keuangan", "Disiplin eksekusi"], "dream_skill": ["Kerjakan product development", "Follow up 5 leads", "Review keuangan bisnis"]}'::jsonb,
'[
    {"title": "Angel Investor", "description": "Investasi di startup early stage", "skills": ["Finansial", "Network", "Deal flow"]},
    {"title": "Business Consultant", "description": "Bantu bisnis lain bertumbuh", "skills": ["Strategi", "Analisis", "Mentoring"]},
    {"title": "Venture Builder", "description": "Bikin banyak bisnis sekaligus", "skills": ["Portofolio", "Eksekusi", "Tim"]},
    {"title": "Serial Entrepreneur", "description": "Bangun dan exit multiple bisnis", "skills": ["Pola pikir", "Adaptasi", "Leadership"]}
]'::jsonb,
16, 50, '3-10 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap bisnis kamu sekarang?", "options": ["Masih ide", "Validasi / riset", "Sudah jalan (pre-revenue)", "Sudah generate revenue"]},
    {"id": "bidang", "type": "single_select", "label": "Bidang bisnis yang diminati?", "options": ["Teknologi / Digital", "F&B / Kuliner", "Fashion / Retail", "Jasa / Service"]},
    {"id": "target", "type": "single_select", "label": "Target utama bisnis?", "options": ["Profit bulanan stabil", "Skala nasional", "Pendanaan investor", "Exit / akuisisi"]},
    {"id": "skill", "type": "single_select", "label": "Skill yang paling perlu kamu kuasai?", "options": ["Sales & marketing", "Manajemen produk", "Finance & fundraising", "Leadership & tim"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('digital-marketer','Digital Marketer Profesional','📈','#3B82F6','Business','1-4 tahun','Menguasai seni promosi di era digital. Dari SEO hingga iklan berbayar, setiap strategi adalah jalan menuju pertumbuhan bisnis.','Di era digital, marketing adalah nyawa bisnis. Digital marketer yang handal bisa mengubah brand kecil menjadi kekuatan pasar.',ARRAY['Marketing Manager','Growth Lead','SEO Specialist','Media Buyer','Content Strategist','CMO'],'[]'::jsonb,
'[
    {"title": "Kuasai Fundamental Digital Marketing", "description": "SEO, Social Media, Email, Paid Ads, Analytics", "why_it_matters": "Skill dasar yang wajib", "alternative_path": "Google Certification gratis", "order": 1},
    {"title": "Kelola Campaign Iklan Berbayar Pertama", "description": "Meta Ads / Google Ads dengan budget nyata", "why_it_matters": "Pengalaman praktis yang paling berharga", "alternative_path": "Organic content dulu", "order": 2},
    {"title": "Hasilkan Revenue dari Marketing", "description": "Kampanye yang terbukti menghasilkan ROI positif", "why_it_matters": "Nilai nyata sebagai marketer", "alternative_path": "Freelance untuk UMKM", "order": 3},
    {"title": "Lead Marketing Team atau Agency", "description": "Memimpin strategi marketing dan tim", "why_it_matters": "Puncak karir marketing", "alternative_path": "Marketing consultant", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Fundamental Digital Marketing", "title": "Selesaikan Google Digital Marketing Cert", "description": "Sertifikat gratis dari Google", "order": 1},
    {"big_win_title": "Kuasai Fundamental Digital Marketing", "title": "Kuasai 1 channel marketing", "description": "SEO, Meta Ads, atau Email Marketing", "order": 2},
    {"big_win_title": "Kelola Campaign Iklan Berbayar Pertama", "title": "Setup dan running iklan pertama", "description": "Budget minimal Rp 500K", "order": 3},
    {"big_win_title": "Kelola Campaign Iklan Berbayar Pertama", "title": "A/B testing 3 creatives", "description": "Optimasi berdasarkan data", "order": 4},
    {"big_win_title": "Hasilkan Revenue dari Marketing", "title": "ROAS >3x campaign", "description": "Return on ad spend positif", "order": 5},
    {"big_win_title": "Hasilkan Revenue dari Marketing", "title": "Portofolio 3 campaign sukses", "description": "Dokumentasi hasil marketing", "order": 6},
    {"big_win_title": "Lead Marketing Team", "title": "Lead 1 project marketing", "description": "Koordinasi campaign end-to-end", "order": 7},
    {"big_win_title": "Lead Marketing Team", "title": "Kelola 3+ channel marketing", "description": "Multi-channel marketing strategy", "order": 8}
]'::jsonb,
'{"spiritual": ["Refleksi hasil campaign", "Syukur atas progres", "Doa sebelum launch"], "physical": ["Stretching sela kerja", "Jalan 10 menit", "Minum air cukup"], "knowledge": ["Baca case study marketing", "Update algoritma platform", "Riset tren"], "social": ["Diskusi strategi tim", "Networking marketer", "Presentasi hasil"], "character": ["Review campaign harian", "Catat learnings", "Disiplin budget"], "dream_skill": ["Cek analytics dashboard", "Optimasi 1 campaign", "Riset keyword/audiens"]}'::jsonb,
'[
    {"title": "Growth Lead", "description": "Strategi pertumbuhan bisnis", "skills": ["Growth", "Experiment", "Analisis"]},
    {"title": "SEO Specialist", "description": "Optimasi organic traffic", "skills": ["SEO", "Content", "Technical"]},
    {"title": "Media Buyer", "description": "Iklan berbayar multi-platform", "skills": ["Paid Ads", "Budgeting", "Optimasi"]},
    {"title": "CMO", "description": "Chief Marketing Officer", "skills": ["Kepemimpinan", "Strategi", "Branding"]}
]'::jsonb,
16, 40, '1-4 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level digital marketing kamu?", "options": ["Belum pernah belajar", "Pemula (tahu teori dasar)", "Intermediate (pernah campaign)", "Mahir (punya portofolio)"]},
    {"id": "channel", "type": "single_select", "label": "Channel marketing favorit?", "options": ["SEO / Organic", "Meta Ads (FB/IG)", "Google Ads", "TikTok Ads"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir marketing?", "options": ["Marketing Manager", "Growth Hacker", "Digital Marketing Agency", "Freelance Consultant"]},
    {"id": "tools", "type": "single_select", "label": "Tools marketing yang dikuasai?", "options": ["Belum ada", "Google Analytics + Search Console", "Meta Business Suite", "SEMrush / Ahrefs / HubSpot"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('social-media-manager','Social Media Manager','📱','#EC4899','Business','1-4 tahun','Membangun brand presence di dunia digital melalui konten kreatif, strategi engagement, dan analisis data sosial media.','Social media adalah wajah brand di era digital. SMM yang hebat bisa membangun komunitas dan menggerakkan bisnis.',ARRAY['Content Strategist','Brand Manager','Community Lead','Influencer Marketing Manager','Social Media Director','Creative Producer'],'[]'::jsonb,
'[
    {"title": "Bangun Personal Brand atau Portfolio SMM", "description": "Kelola akun dengan konten konsisten", "why_it_matters": "Bukti kemampuan SMM", "alternative_path": "Magang SMM", "order": 1},
    {"title": "Dapat Klien atau Pekerjaan SMM Pertama", "description": "Kelola social media untuk brand nyata", "why_it_matters": "Dari belajar ke praktik", "alternative_path": "Freelance platform", "order": 2},
    {"title": "Viral Campaign dan Growth Signifikan", "description": "Kampanye yang mencapai ribuan engagement", "why_it_matters": "Momen breakout karir SMM", "alternative_path": "Community management", "order": 3},
    {"title": "Lead Social Media Strategy", "description": "Memimpin strategi sosial media multi-brand", "why_it_matters": "Puncak karir SMM", "alternative_path": "Social media agency", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Bangun Personal Brand SMM", "title": "Konsisten posting 30 hari", "description": "Content calendar dan jadwal posting", "order": 1},
    {"big_win_title": "Bangun Personal Brand SMM", "title": "Kuasai 3 platform sosmed", "description": "Instagram, TikTok, LinkedIn atau Twitter", "order": 2},
    {"big_win_title": "Bangun Personal Brand SMM", "title": "Engagement rate >3%", "description": "Rata-rata interaksi followers", "order": 3},
    {"big_win_title": "Dapat Klien/Pekerjaan SMM Pertama", "title": "Portofolio 3 brand dikelola", "description": "Studi kasus hasil SMM", "order": 4},
    {"big_win_title": "Viral Campaign dan Growth Signifikan", "title": "1 konten >100K views", "description": "Viral mini pertama", "order": 5},
    {"big_win_title": "Viral Campaign dan Growth Signifikan", "title": "Follower growth >20%/bulan", "description": "Pertumbuhan audiens yang konsisten", "order": 6},
    {"big_win_title": "Lead Social Media Strategy", "title": "Kelola 5+ akun sekaligus", "description": "Multi-brand SMM management", "order": 7},
    {"big_win_title": "Lead Social Media Strategy", "title": "Lead 1 campaign besar", "description": "Campaign dengan budget dan tim", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mulai konten", "Refleksi dampak konten", "Syukur atas followers"], "physical": ["Stretching sela kerja", "Jalan 10 menit", "Istirahat dari layar"], "knowledge": ["Riset trending topics", "Analisis insight platform", "Pelajari tren baru"], "social": ["Balas komentar + DM", "Interaksi komunitas", "Kolaborasi kreator"], "character": ["Buat konten calendar", "Evaluasi performa", "Catat ide konten"], "dream_skill": ["Buat 1 konten hari ini", "Riset hashtag 15 menit", "Cek analytics 10 menit"]}'::jsonb,
'[
    {"title": "Content Strategist", "description": "Strategi konten untuk brand", "skills": ["Content", "Strategy", "Analytics"]},
    {"title": "Brand Manager", "description": "Kelola identitas brand", "skills": ["Branding", "Marketing", "Komunikasi"]},
    {"title": "Influencer Marketing Manager", "description": "Kelola kampanye influencer", "skills": ["Network", "Negosiasi", "Campaign"]},
    {"title": "Creative Producer", "description": "Produksi konten kreatif", "skills": ["Videografi", "Editing", "Storytelling"]}
]'::jsonb,
16, 40, '1-4 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level SMM kamu sekarang?", "options": ["Belum pernah kelola akun", "Punya akun pribadi aktif", "Pernah kelola brand/komunitas", "Profesional SMM"]},
    {"id": "platform", "type": "single_select", "label": "Platform sosmed favorit?", "options": ["Instagram", "TikTok", "LinkedIn", "Twitter/X"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir SMM?", "options": ["Brand Manager", "Social Media Agency", "Content Creator", "Community Manager"]},
    {"id": "skill", "type": "single_select", "label": "Skill yang mau dikembangkan?", "options": ["Content creation", "Copywriting", "Analytics & data", "Ads & campaign"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('event-organizer','Event Organizer Profesional','🎪','#F43F5E','Business','2-8 tahun','Menciptakan acara tak terlupakan. Dari konsep hingga eksekusi, setiap detail adalah kunci kesuksesan sebuah event.','Event menghubungkan orang, merayakan momen, dan menciptakan kenangan. EO profesional punya peran penting di balik setiap acara sukses.',ARRAY['Wedding Planner','MICE Specialist','Festival Director','Brand Activation Lead','Venue Manager','Production Manager'],'[]'::jsonb,
'[
    {"title": "Bantu Organisir Event Pertama", "description": "Terlibat dalam event nyata dari awal sampai selesai", "why_it_matters": "Pengalaman langsung yang paling berharga", "alternative_path": "Volunteer event", "order": 1},
    {"title": "Handle Event Sendiri — 100+ Peserta", "description": "Lead event secara mandiri dari A ke Z", "why_it_matters": "Kemampuan leading event", "alternative_path": "Co-organize dengan EO lain", "order": 2},
    {"title": "Event Skala Nasional atau 500+ Peserta", "description": "Event besar dengan banyak stakeholder", "why_it_matters": "Level profesional yang diakui", "alternative_path": "Spesialisasi niche event", "order": 3},
    {"title": "Punya EO Agency atau Brand Sendiri", "description": "Bisnis event yang mapan", "why_it_matters": "Puncak karir event organizer", "alternative_path": "Event consultant", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Bantu Organisir Event Pertama", "title": "Terlibat dalam 1 event", "description": "Bantu operasional atau persiapan event", "order": 1},
    {"big_win_title": "Bantu Organisir Event Pertama", "title": "Buat timeline event", "description": "Rundown acara yang detail", "order": 2},
    {"big_win_title": "Handle Event Sendiri", "title": "Kelola 5+ vendor", "description": "Koordinasi catering, dekorasi, dokumentasi, sound", "order": 3},
    {"big_win_title": "Handle Event Sendiri", "title": "Kelola budget event 50 juta+", "description": "Manajemen keuangan event", "order": 4},
    {"big_win_title": "Handle Event Sendiri", "title": "Survey kepuasan >4/5", "description": "Feedback positif dari klien", "order": 5},
    {"big_win_title": "Event Skala Nasional", "title": "Event dengan 500+ peserta", "description": "Skala event yang lebih besar", "order": 6},
    {"big_win_title": "Punya EO Agency", "title": "3+ sponsor tetap", "description": "Sponsor yang rutin bekerja sama", "order": 7},
    {"big_win_title": "Punya EO Agency", "title": "Tim 5+ orang", "description": "Tim tetap yang bisa diandalkan", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum event", "Syukur atas kelancaran", "Refleksi evaluasi"], "physical": ["Istirahat cukup sebelum H-1", "Minum air", "Manajemen energi"], "knowledge": ["Riset tren event", "Update vendor baru", "Pelajari teknis produksi"], "social": ["Koordinasi vendor", "Komunikasi klien", "Briefing tim"], "character": ["Cek list persiapan", "Review budget", "Catat lesson learned"], "dream_skill": ["Follow up vendor", "Buat rundown", "Koordinasi tim"]}'::jsonb,
'[
    {"title": "Wedding Planner", "description": "Spesialisasi event pernikahan", "skills": ["Kreativitas", "Detail", "Vendor"]},
    {"title": "Festival Director", "description": "Kelola festival musik atau budaya", "skills": ["Produksi", "Logistik", "Tim Besar"]},
    {"title": "Venue Manager", "description": "Kelola tempat event", "skills": ["Operasional", "Hospitality", "Sales"]},
    {"title": "Production Manager", "description": "Teknis dan produksi event", "skills": ["Teknis", "Panggung", "Lighting"]}
]'::jsonb,
17, 45, '2-8 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Pengalaman EO kamu?", "options": ["Belum pernah", "Pernah bantu event", "Pernah handle event sendiri", "Profesional EO"]},
    {"id": "jenis", "type": "single_select", "label": "Jenis event favorit?", "options": ["Wedding / pernikahan", "Corporate / company event", "Music concert / festival", "Exhibition / bazaar"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir EO?", "options": ["Punya EO company sendiri", "Wedding organizer specialist", "Corporate event planner", "Festival / concert organizer"]},
    {"id": "skill", "type": "single_select", "label": "Aspek EO yang mau dikuasai?", "options": ["Vendor management", "Budgeting & finance", "Creative concept", "Operasional & logistik"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('financial-planner','Financial Planner Profesional','💰','#10B981','Business','3-8 tahun','Membantu orang mencapai kebebasan finansial. Dari budgeting hingga investasi, setiap saran adalah langkah menuju masa depan yang aman.','Literasi keuangan Indonesia masih rendah. Financial planner membantu orang membuat keputusan uang yang lebih cerdas.',ARRAY['Wealth Manager','Investment Advisor','Insurance Consultant','Financial Educator','Retirement Planner','Tax Consultant'],'[]'::jsonb,
'[
    {"title": "Dapat Sertifikasi Perencana Keuangan", "description": "CFP, AAJI, atau WAPERD", "why_it_matters": "Kredibilitas profesional", "alternative_path": "Self-study + ujian", "order": 1},
    {"title": "Bantu 10 Klien dengan Financial Plan", "description": "Perencanaan keuangan untuk klien nyata", "why_it_matters": "Dari teori ke dampak nyata", "alternative_path": "Financial planning untuk diri sendiri", "order": 2},
    {"title": "Kelola Aset Klien 1 Miliar+", "description": "Portofolio investasi yang signifikan", "why_it_matters": "Kepercayaan klien yang tinggi", "alternative_path": "Konsultasi per jam", "order": 3},
    {"title": "Pakar Keuangan yang Diakui", "description": "Buku, seminar, atau media appearance", "why_it_matters": "Puncak karir financial planner", "alternative_path": "Buka kantor sendiri", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Dapat Sertifikasi Perencana Keuangan", "title": "Selesaikan course finansial", "description": "Belajar dasar perencanaan keuangan", "order": 1},
    {"big_win_title": "Dapat Sertifikasi Perencana Keuangan", "title": "Dapat sertifikat CFP/AAJI", "description": "Sertifikasi resmi perencana keuangan", "order": 2},
    {"big_win_title": "Bantu 10 Klien", "title": "Buat financial plan untuk 3 orang", "description": "Free consultation untuk portfolio", "order": 3},
    {"big_win_title": "Bantu 10 Klien", "title": "Dapat 5 klien berbayar", "description": "Klien bayar untuk konsultasi", "order": 4},
    {"big_win_title": "Kelola Aset 1 Miliar+", "title": "AUM >100 juta", "description": "Asset Under Management pertama", "order": 5},
    {"big_win_title": "Kelola Aset 1 Miliar+", "title": "Return portofolio >10%/tahun", "description": "Performance investasi positif", "order": 6},
    {"big_win_title": "Pakar Keuangan Diakui", "title": "Buat konten edukasi finansial", "description": "Blog, IG, atau YouTube finansial", "order": 7},
    {"big_win_title": "Pakar Keuangan Diakui", "title": "Jadi pembicara 1 seminar", "description": "Public speaking finansial", "order": 8}
]'::jsonb,
'{"spiritual": ["Syukur atas rezeki", "Refleksi keuangan", "Doa sebelum konsultasi"], "physical": ["Jalan pagi 15 menit", "Stretching", "Minum air cukup"], "knowledge": ["Update market news", "Baca laporan ekonomi", "Riset produk investasi"], "social": ["Konsultasi klien", "Networking advisor", "Follow up klien"], "character": ["Review portofolio", "Catat target finansial", "Evaluasi performa"], "dream_skill": ["Review 1 portofolio", "Riset 1 instrumen investasi", "Buat konten edukasi"]}'::jsonb,
'[
    {"title": "Wealth Manager", "description": "Kelola kekayaan klien High-Net-Worth", "skills": ["Investasi", "Portofolio", "Relationship"]},
    {"title": "Financial Educator", "description": "Edukasi literasi keuangan", "skills": ["Komunikasi", "Konten", "Kurikulum"]},
    {"title": "Tax Consultant", "description": "Perencanaan pajak", "skills": ["Pajak", "Regulasi", "Strategi"]},
    {"title": "Retirement Planner", "description": "Perencanaan dana pensiun", "skills": ["Proyeksi", "Investasi", "Asuransi"]}
]'::jsonb,
18, 50, '3-8 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Pengetahuan finansial kamu?", "options": ["Masih awam", "Paham budgeting dasar", "Sudah investasi", "Bersertifikasi"]},
    {"id": "layanan", "type": "single_select", "label": "Layanan finansial favorit?", "options": ["Perencanaan keuangan pribadi", "Manajemen investasi", "Perencanaan pensiun", "Asuransi & proteksi"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir finansial?", "options": ["Financial Advisor", "Wealth Manager", "Financial Educator", "Buka kantor sendiri"]},
    {"id": "tools", "type": "single_select", "label": "Tools yang dikuasai?", "options": ["Excel aja", "Aplikasi budgeting", "Tahu reksadana/saham", "Sudah punya lisensi"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('doctor','Dokter Profesional','🩺','#10B981','Health','8-12 tahun','Menyembuhkan dan menyelamatkan nyawa. Dedikasi, empati, dan ilmu medis adalah senjata utama dalam melawan penyakit.','Dokter adalah garda terdepan kesehatan masyarakat. Profesi mulia yang memberikan dampak langsung pada kualitas hidup manusia.',ARRAY['Dokter Spesialis','Dosen Kedokteran','Peneliti Medis','Konsultan Kesehatan','Kepala Rumah Sakit','Medical Entrepreneur'],'[]'::jsonb,
'[
    {"title": "Diterima di Fakultas Kedokteran", "description": "Lulus seleksi masuk FK negeri atau swasta", "why_it_matters": "Langkah pertama yang paling kompetitif", "alternative_path": "FK swasta terakreditasi", "order": 1},
    {"title": "Lulus S1 Kedokteran dan Lulus UKMPPD", "description": "Gelar dokter dan STR", "why_it_matters": "Resmi menjadi dokter", "alternative_path": "Dokter layanan primer", "order": 2},
    {"title": "Selesaikan Internship dan Mulai Praktik", "description": "Program internship dan praktik mandiri", "why_it_matters": "Pengalaman klinis nyata", "alternative_path": "Langsung ambil spesialisasi", "order": 3},
    {"title": "Spesialisasi atau Buka Praktik Sendiri", "description": "Pendidikan spesialis atau praktik mandiri", "why_it_matters": "Puncak karir medis", "alternative_path": "Karir akademik/dosen", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Diterima di Fakultas Kedokteran", "title": "Nilai IPA rata-rata >85", "description": "Biologi, Kimia, Fisika, Matematika", "order": 1},
    {"big_win_title": "Diterima di Fakultas Kedokteran", "title": "Skor UTBK >700", "description": "Tryout simulasi SNBT", "order": 2},
    {"big_win_title": "Diterima di Fakultas Kedokteran", "title": "Diterima di FK pilihan", "description": "Surat penerimaan dari FK", "order": 3},
    {"big_win_title": "Lulus S1 dan UKMPPD", "title": "IPK >3.0 setiap semester", "description": "Akademik yang solid", "order": 4},
    {"big_win_title": "Lulus S1 dan UKMPPD", "title": "Lulus OSCE preklinik", "description": "Ujian ketrampilan medis", "order": 5},
    {"big_win_title": "Lulus S1 dan UKMPPD", "title": "Lulus UKMPPD first attempt", "description": "Ujian kompetensi dokter", "order": 6},
    {"big_win_title": "Selesaikan Internship", "title": "Mendapat STR", "description": "Surat Tanda Registrasi", "order": 7},
    {"big_win_title": "Spesialisasi", "title": "Diterima di program spesialisasi", "description": "PPDS di bidang pilihan", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum praktik", "Syukur atas kesehatan", "Refleksi pelayanan"], "physical": ["Tidur cukup 7 jam", "Makan sehat", "Olahraga ringan"], "knowledge": ["Baca jurnal medis", "Update guideline klinis", "Webinar medis"], "social": ["Komunikasi pasien", "Diskusi kasus kolega", "Supervisi koas"], "character": ["Catat rekam medis", "Evaluasi diagnosis", "Disiplin jadwal"], "dream_skill": ["Review 1 kasus medis", "Baca 1 jurnal", "Latihan skill klinis"]}'::jsonb,
'[
    {"title": "Dokter Spesialis", "description": "Pendalaman di bidang tertentu", "skills": ["Klinis", "Diagnosis", "Presisi"]},
    {"title": "Peneliti Medis", "description": "Riset dan publikasi medis", "skills": ["Riset", "Data", "Publish"]},
    {"title": "Kepala Rumah Sakit", "description": "Manajemen fasilitas kesehatan", "skills": ["Manajemen", "Kepemimpinan", "Administrasi"]},
    {"title": "Medical Entrepreneur", "description": "Startup kesehatan", "skills": ["Bisnis", "Inovasi", "Network"]}
]'::jsonb,
15, 45, '8-12 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap pendidikan kamu sekarang?", "options": ["Masih SMA", "Mahasiswa kedokteran", "Koas", "Dokter umum / residen"]},
    {"id": "spesialisasi", "type": "single_select", "label": "Spesialisasi yang diminati?", "options": ["Penyakit Dalam", "Bedah", "Anak", "Obstetri-Ginekologi"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Jadi dokter spesialis", "Buka praktik sendiri", "Kerja di RS besar", "Kombinasi klinik + akademik"]},
    {"id": "hambatan", "type": "single_select", "label": "Hambatan terbesar sekarang?", "options": ["Persiapan masuk FK", "Biaya pendidikan", "Akademik yang berat", "Work-life balance"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('psychologist','Psikolog Profesional','🧠','#8B5CF6','Health','8-10 tahun','Membantu orang menemukan kesejahteraan mental. Empati, ilmu psikologi, dan kemampuan mendengar adalah kekuatan seorang psikolog.','Kesehatan mental semakin penting di era modern. Psikolog berperan krusial dalam membantu masyarakat Indonesia hidup lebih seimbang.',ARRAY['Psikolog Klinis','HR Psychologist','Industrial Psychologist','Forensic Psychologist','Academic Researcher','Counselor'],'[]'::jsonb,
'[
    {"title": "Diterima di Jurusan Psikologi", "description": "Masuk S1 Psikologi di PTN/PTS favorit", "why_it_matters": "Langkah awal karir psikologi", "alternative_path": "Psikologi jarak jauh", "order": 1},
    {"title": "Lulus S1 Psikologi dengan IPK Baik", "description": "IPK >3.0 dan skripsi bidang klinis", "why_it_matters": "Syarat masuk profesi psikolog", "alternative_path": "Langsung kerja HR", "order": 2},
    {"title": "Lulus Profesi Psikolog dan Dapat SIPP", "description": "Magister Profesi Psikologi + Surat Izin Praktik", "why_it_matters": "Resmi sebagai psikolog", "alternative_path": "Konselor tanpa lisensi", "order": 3},
    {"title": "Spesialisasi atau Praktik Mandiri", "description": "Pendalaman bidang klinis atau buka praktik", "why_it_matters": "Puncak karir psikologi", "alternative_path": "Psikolog industri/HR", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Diterima di Jurusan Psikologi", "title": "Nilai rata-rata IPS >80", "description": "Sosiologi, Biologi, Bahasa", "order": 1},
    {"big_win_title": "Diterima di Jurusan Psikologi", "title": "Skor UTBK >650", "description": "Tryout psikologi UTBK", "order": 2},
    {"big_win_title": "Lulus S1 Psikologi", "title": "IPK >3.0 setiap semester", "description": "Akademik yang solid", "order": 3},
    {"big_win_title": "Lulus S1 Psikologi", "title": "Aktif di organisasi/relawan", "description": "Pengalaman praktik psikologi", "order": 4},
    {"big_win_title": "Lulus Profesi Psikolog", "title": "Lulus seleksi S2 Profesi", "description": "Diterima di program profesi", "order": 5},
    {"big_win_title": "Lulus Profesi Psikolog", "title": "Selesaikan internship profesi", "description": "Jam praktik supervised", "order": 6},
    {"big_win_title": "Lulus Profesi Psikolog", "title": "Dapat SIPP dari HIMPSI", "description": "Izin praktik resmi", "order": 7},
    {"big_win_title": "Spesialisasi", "title": "Menangani 50+ klien", "description": "Pengalaman klinis yang solid", "order": 8}
]'::jsonb,
'{"spiritual": ["Mindfulness pagi", "Refleksi sesi konseling", "Doa untuk klien"], "physical": ["Jalan 15 menit", "Stretching", "Tidur cukup"], "knowledge": ["Baca jurnal psikologi", "Update pendekatan terapi", "Workshop profesional"], "social": ["Sesi terapi klien", "Supervisi kasus", "Peer consultation"], "character": ["Catat progress klien", "Evaluasi diri", "Jaga boundary profesional"], "dream_skill": ["Baca 1 jurnal psikologi", "Latihan active listening", "Riset 1 pendekatan terapi"]}'::jsonb,
'[
    {"title": "Psikolog Klinis", "description": "Terapi dan asesmen klinis", "skills": ["Klinis", "Terapi", "Asesmen"]},
    {"title": "HR Psychologist", "description": "Psikologi industri dan organisasi", "skills": ["HR", "Asesmen", "Pengembangan"]},
    {"title": "Academic Researcher", "description": "Riset dan publikasi psikologi", "skills": ["Riset", "Data", "Publikasi"]},
    {"title": "Counselor", "description": "Konseling individu/kelompok", "skills": ["Empati", "Komunikasi", "Krisis"]}
]'::jsonb,
15, 45, '8-10 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap pendidikan psikologi?", "options": ["Masih SMA", "Mahasiswa S1", "S2 Profesi", "Psikolog aktif"]},
    {"id": "bidang", "type": "single_select", "label": "Bidang psikologi yang diminati?", "options": ["Klinis / Terapi", "Pendidikan / Anak", "Industri / Organisasi", "Forensik"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Praktik pribadi", "Rumah sakit / klinik", "HR / Corporate", "Akademisi / Dosen"]},
    {"id": "skill", "type": "single_select", "label": "Skill yang perlu dikembangkan?", "options": ["Teknik asesmen", "Pendekatan terapi", "Komunikasi klinis", "Manajemen praktik"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('dentist','Dokter Gigi Profesional','🦷','#06B6D4','Health','8-10 tahun','Menjaga senyum indah pasien. Keahlian, ketelitian, dan teknologi dental adalah alat memberikan layanan gigi terbaik.','Kesehatan gigi dan mulut adalah bagian penting dari kesehatan umum. Dokter gigi membantu masyarakat tersenyum lebih percaya diri.',ARRAY['Dokter Gigi Spesialis','Dosen FKG','Peneliti Dental','Konsultan Estetika Gigi','Kepala Klinik Gigi','Medical Device Consultant'],'[]'::jsonb,
'[
    {"title": "Diterima di Fakultas Kedokteran Gigi", "description": "Lulus seleksi masuk FKG negeri/swasta", "why_it_matters": "Awal perjalanan karir", "alternative_path": "FKG swasta", "order": 1},
    {"title": "Lulus S1 Kedokteran Gigi", "description": "IPK >3.0 dan lulus OSCE preklinik", "why_it_matters": "Fondasi akademik klinis", "alternative_path": "Fokus ke profesi", "order": 2},
    {"title": "Lulus Profesi Dokter Gigi dan STR", "description": "Koas, UKMP2DG, dan STR diterbitkan", "why_it_matters": "Resmi sebagai dokter gigi", "alternative_path": "Service learning", "order": 3},
    {"title": "Spesialisasi atau Buka Praktik", "description": "Pendidikan spesialis atau praktik mandiri", "why_it_matters": "Puncak karir kedokteran gigi", "alternative_path": "Kerja di klinik", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Diterima di FKG", "title": "Nilai IPA rata-rata >83", "description": "Biologi, Kimia, Matematika", "order": 1},
    {"big_win_title": "Diterima di FKG", "title": "Skor UTBK >680", "description": "Tryout simulasi", "order": 2},
    {"big_win_title": "Lulus S1 Kedokteran Gigi", "title": "IPK >3.0 per semester", "description": "Akademik yang solid", "order": 3},
    {"big_win_title": "Lulus S1 Kedokteran Gigi", "title": "Lulus OSCE preklinik", "description": "Keterampilan klinis dasar", "order": 4},
    {"big_win_title": "Lulus Profesi dan STR", "title": "Selesaikan semua stase koas", "description": "Pengalaman klinis lengkap", "order": 5},
    {"big_win_title": "Lulus Profesi dan STR", "title": "Lulus UKMP2DG first attempt", "description": "Uji kompetensi dokter gigi", "order": 6},
    {"big_win_title": "Lulus Profesi dan STR", "title": "Mendapat STR", "description": "Surat Tanda Registrasi", "order": 7},
    {"big_win_title": "Spesialisasi", "title": "Diterima di spesialisasi", "description": "Program pendidikan lanjutan", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum praktik", "Syukur atas kesehatan", "Refleksi pelayanan"], "physical": ["Stretching leher & punggung", "Ergonomi praktik", "Istirahat cukup"], "knowledge": ["Baca jurnal dental", "Update teknik restorasi", "Workshop dental"], "social": ["Edukasi pasien", "Diskusi kasus kolega", "Follow up pasien"], "character": ["Catat rekam medis", "Evaluasi hasil perawatan", "Sterilisasi disiplin"], "dream_skill": ["Pelajari 1 teknik baru", "Latihan skill restorasi", "Review 1 kasus"]}'::jsonb,
'[
    {"title": "Spesialis Ortodonti", "description": "Merapikan gigi dengan behel", "skills": ["Ortodonti", "Presisi", "Estetika"]},
    {"title": "Dosen FKG", "description": "Mendidik dokter gigi muda", "skills": ["Akademik", "Penelitian", "Komunikasi"]},
    {"title": "Kepala Klinik Gigi", "description": "Manajemen klinik gigi", "skills": ["Manajemen", "Bisnis", "Leadership"]},
    {"title": "Peneliti Dental", "description": "Riset material dan teknik dental", "skills": ["Riset", "Laboratorium", "Publikasi"]}
]'::jsonb,
15, 45, '8-10 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap pendidikan kamu?", "options": ["Masih SMA", "Mahasiswa FKG", "Koas Gigi", "Dokter gigi aktif"]},
    {"id": "spesialisasi", "type": "single_select", "label": "Spesialisasi gigi yang diminati?", "options": ["Ortodonti (behel)", "Bedah mulut", "Estetika gigi", "Periodonsia (gusi)"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Buka klinik sendiri", "Spesialis", "Kerja di RS", "Dosen / akademik"]},
    {"id": "skill", "type": "single_select", "label": "Skill yang mau ditingkatkan?", "options": ["Restorasi estetik", "Bedah mulut minor", "Manajemen klinik", "Komunikasi pasien"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('pharmacist','Apoteker Profesional','💊','#EC4899','Health','5-7 tahun','Memastikan obat yang tepat untuk pasien. Pengetahuan farmasi dan ketelitian adalah kunci keselamatan dalam pengobatan.','Apoteker adalah penjaga keamanan obat. Mereka memastikan obat yang dikonsumsi pasien aman, tepat, dan efektif.',ARRAY['Apoteker Rumah Sakit','Industrial Pharmacist','Regulatory Affairs','Quality Control','Drug Researcher','Pharmacy Entrepreneur'],'[]'::jsonb,
'[
    {"title": "Diterima di Fakultas Farmasi", "description": "Masuk S1 Farmasi di PTN/PTS", "why_it_matters": "Awal karir farmasi", "alternative_path": "Farmasi jarak jauh", "order": 1},
    {"title": "Lulus S1 Farmasi", "description": "IPK >3.0 dan selesaikan PKL", "why_it_matters": "Fondasi akademik farmasi", "alternative_path": "Langsung kerja industri", "order": 2},
    {"title": "Lulus Profesi Apoteker dan Dapat SIPA", "description": "Program profesi + Surat Izin Praktik Apoteker", "why_it_matters": "Resmi sebagai apoteker", "alternative_path": "Kerja di industri farmasi", "order": 3},
    {"title": "Spesialisasi atau Buka Apotek", "description": "Pendalaman spesialisasi atau bisnis apotek", "why_it_matters": "Puncak karir farmasi", "alternative_path": "Karir di BPOM", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Diterima di Farmasi", "title": "Nilai IPA rata-rata >80", "description": "Kimia, Biologi, Matematika", "order": 1},
    {"big_win_title": "Diterima di Farmasi", "title": "Diterima di S1 Farmasi", "description": "Seleksi masuk PTN/PTS", "order": 2},
    {"big_win_title": "Lulus S1 Farmasi", "title": "IPK >3.0 per semester", "description": "Akademik yang solid", "order": 3},
    {"big_win_title": "Lulus S1 Farmasi", "title": "Selesaikan PKL", "description": "Praktek Kerja Lapangan farmasi", "order": 4},
    {"big_win_title": "Lulus Profesi Apoteker", "title": "Lulus OSCE apoteker", "description": "Uji kompetensi profesi", "order": 5},
    {"big_win_title": "Lulus Profesi Apoteker", "title": "Dapat STRA dan SIPA", "description": "Izin praktik resmi", "order": 6},
    {"big_win_title": "Spesialisasi", "title": "Ambil sertifikasi tambahan", "description": "Spesialisasi farmasi klinis/industri", "order": 7},
    {"big_win_title": "Spesialisasi", "title": "Kelola 500+ resep", "description": "Pengalaman praktik yang solid", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum melayani", "Syukur atas ilmu", "Refleksi pelayanan"], "physical": ["Stretching sela kerja", "Jalan 10 menit", "Minum air cukup"], "knowledge": ["Update DPHO", "Baca jurnal farmasi", "Review regulasi BPOM"], "social": ["Konsultasi pasien", "Diskusi resep dokter", "Edukasi obat"], "character": ["Cek stok obat", "Review resep", "Disiplin dokumentasi"], "dream_skill": ["Review 5 resep", "Pelajari 1 obat baru", "Cek stok + order"]}'::jsonb,
'[
    {"title": "Apoteker RS", "description": "Farmasi klinis di rumah sakit", "skills": ["Klinis", "Inventory", "Konsultasi"]},
    {"title": "Industrial Pharmacist", "description": "Produksi dan QC obat", "skills": ["Manufaktur", "QC", "Regulasi"]},
    {"title": "Regulatory Affairs", "description": "Urusan izin edar obat", "skills": ["Regulasi", "BPOM", "Dokumentasi"]},
    {"title": "Pharmacy Entrepreneur", "description": "Bisnis apotek atau distributor", "skills": ["Bisnis", "Jaringan", "Manajemen"]}
]'::jsonb,
16, 45, '5-7 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap pendidikan farmasi?", "options": ["Masih SMA", "Mahasiswa S1 Farmasi", "Profesi Apoteker", "Apoteker aktif"]},
    {"id": "bidang", "type": "single_select", "label": "Bidang farmasi yang diminati?", "options": ["Farmasi Klinik / RS", "Industri Farmasi", "Regulasi / BPOM", "Distribusi / Apotek"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Punya apotek sendiri", "Kerja di RS", "Karir di industri", "BPOM / regulator"]},
    {"id": "skill", "type": "single_select", "label": "Skill yang perlu dikembangkan?", "options": ["Konseling obat", "Manajemen apotek", "QC laboratorium", "Regulasi & BPOM"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('teacher','Guru Profesional','📚','#F59E0B','Education','4-6 tahun','Mencerdaskan generasi bangsa. Dedikasi, kesabaran, dan inovasi dalam mengajar adalah kunci mencetak masa depan cerah.','Guru adalah pahlawan tanpa tanda jasa yang membentuk masa depan Indonesia. Setiap guru hebat melahirkan generasi hebat.',ARRAY['Kepala Sekolah','Pengawas Sekolah','Dosen','Kurikulum Developer','Educational Consultant','EdTech Founder'],'[]'::jsonb,
'[
    {"title": "Diterima di LPTK dan Lulus S1 Pendidikan", "description": "Masuk dan lulus dari LPTK/FKIP", "why_it_matters": "Persyaratan dasar jadi guru", "alternative_path": "S1 non-pendidikan + PPG", "order": 1},
    {"title": "Lulus PPG dan Dapat Sertifikat Pendidik", "description": "Program Profesi Guru + Sertifikasi", "why_it_matters": "Resmi sebagai guru profesional", "alternative_path": "Guru honorer dulu", "order": 2},
    {"title": "Lolos PPPK/PNS Guru", "description": "Seleksi ASN guru", "why_it_matters": "Karir guru yang stabil", "alternative_path": "Guru tetap yayasan", "order": 3},
    {"title": "Guru Ahli atau Kepala Sekolah", "description": "Kenaikan pangkat dan jabatan", "why_it_matters": "Puncak karir keguruan", "alternative_path": "Dosen / widyaiswara", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Lulus S1 Pendidikan", "title": "IPK >3.0", "description": "Akademik yang solid", "order": 1},
    {"big_win_title": "Lulus S1 Pendidikan", "title": "PLP/Praktek mengajar nilai A", "description": "Pengalaman mengajar terbimbing", "order": 2},
    {"big_win_title": "Lulus S1 Pendidikan", "title": "Aktif organisasi kependidikan", "description": "UKM kependidikan atau relawan", "order": 3},
    {"big_win_title": "Lulus PPG", "title": "Lulus seleksi PPG", "description": "Diterima program PPG", "order": 4},
    {"big_win_title": "Lulus PPG", "title": "Dapat sertifikat pendidik", "description": "Sertifikasi resmi dari Kemendikbud", "order": 5},
    {"big_win_title": "Lolos PPPK/PNS", "title": "Lulus seleksi PPPK", "description": "ASN guru tahap pertama", "order": 6},
    {"big_win_title": "Lolos PPPK/PNS", "title": "Nilai UKKJ baik", "description": "Uji Kompetensi Kenaikan Jabatan", "order": 7},
    {"big_win_title": "Guru Ahli", "title": "Prestasi murid/inovasi", "description": "Murid juara atau inovasi pembelajaran", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mengajar", "Syukur atas ilmu", "Refleksi pembelajaran"], "physical": ["Tidur cukup", "Olahraga ringan", "Suara sehat"], "knowledge": ["Buat RPP", "Review materi ajar", "Baca jurnal pendidikan"], "social": ["Mengajar interaktif", "Rapat guru", "Komunikasi orang tua"], "character": ["Evaluasi pembelajaran", "Catat progres murid", "Disiplin administrasi"], "dream_skill": ["Siapkan materi ajar", "Buat media pembelajaran", "Koreksi tugas 1 kelas"]}'::jsonb,
'[
    {"title": "Kepala Sekolah", "description": "Mimpin sekolah dan staf", "skills": ["Kepemimpinan", "Manajemen", "Kurikulum"]},
    {"title": "Pengawas Sekolah", "description": "Supervisi dan mutu pendidikan", "skills": ["Supervisi", "Evaluasi", "Pembinaan"]},
    {"title": "Educational Consultant", "description": "Konsultan pendidikan", "skills": ["Kurikulum", "Training", "Strategi"]},
    {"title": "EdTech Founder", "description": "Startup teknologi pendidikan", "skills": ["Bisnis", "Teknologi", "Inovasi"]}
]'::jsonb,
17, 50, '4-6 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap karir keguruan?", "options": ["Masih calon guru (S1)", "PPG / Prajabatan", "Honorer / Guru tetap", "PNS/PPPK"]},
    {"id": "jenjang", "type": "single_select", "label": "Jenjang yang ingin diajar?", "options": ["SD/MI", "SMP/MTS", "SMA/SMK/MA", "Pendidikan tinggi"]},
    {"id": "mapel", "type": "single_select", "label": "Mata pelajaran favorit?", "options": ["Matematika / IPA", "Bahasa (Indonesia/Inggris)", "IPS / Sejarah", "Semua (guru kelas)"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Guru PNS/PPPK", "Kepala Sekolah", "Dosen / Akademik", "Pendiri sekolah/EdTech"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('chef','Chef Profesional','👨‍🍳','#EF4444','Lifestyle','5-10 tahun','Menciptakan hidangan luar biasa. Dari dapur hingga meja makan, setiap masakan adalah karya seni kuliner yang memikat lidah.','Kuliner adalah industri kreatif yang tak pernah mati. Chef profesional bisa menginspirasi dan menghibur jutaan orang melalui makanan.',ARRAY['Head Chef','Pastry Chef','Food Stylist','Food Blogger','Restaurant Owner','Culinary Instructor'],'[]'::jsonb,
'[
    {"title": "Kuasai 5 Teknik Memasak Dasar", "description": "Saute, braising, roasting, steaming, frying", "why_it_matters": "Fondasi skill chef", "alternative_path": "Course online / sekolah kuliner", "order": 1},
    {"title": "Bekerja di Dapur Profesional", "description": "Commis chef atau junior cook di restoran/hotel", "why_it_matters": "Pengalaman industri yang sesungguhnya", "alternative_path": "Magang di restoran", "order": 2},
    {"title": "Chef de Partie atau Head Chef", "description": "Memimpin station atau seluruh dapur", "why_it_matters": "Level manajerial di dapur", "alternative_path": "Sous chef dulu", "order": 3},
    {"title": "Restoran Sendiri atau Executive Chef", "description": "Bisnis kuliner sendiri atau posisi puncak chef", "why_it_matters": "Puncak karir kuliner", "alternative_path": "Buka kafe/katering", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai 5 Teknik Memasak Dasar", "title": "Kuasai knife skills", "description": "Julienne, brunoise, chiffonade konsisten", "order": 1},
    {"big_win_title": "Kuasai 5 Teknik Memasak Dasar", "title": "Kuasai 5 teknik dasar", "description": "Saute, braising, roasting, steaming, frying", "order": 2},
    {"big_win_title": "Kuasai 5 Teknik Memasak Dasar", "title": "Buat 20 resep dari 0", "description": "Tanpa lihat resep", "order": 3},
    {"big_win_title": "Bekerja di Dapur Profesional", "title": "Kerja di restoran/hotel", "description": "Diterima di dapur profesional", "order": 4},
    {"big_win_title": "Bekerja di Dapur Profesional", "title": "Bertahan >6 bulan", "description": "Adaptasi di lingkungan dapur", "order": 5},
    {"big_win_title": "Chef de Partie", "title": "Kelola 1 station dapur", "description": "Bertanggung jawab atas 1 bagian", "order": 6},
    {"big_win_title": "Head Chef", "title": "Kelola tim dapur 3+ orang", "description": "Kepemimpinan dapur", "order": 7},
    {"big_win_title": "Restoran Sendiri", "title": "Revenue restoran positif", "description": "Bisnis kuliner menguntungkan", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum memasak", "Syukur atas bahan makanan", "Refleksi pelayanan"], "physical": ["Jaga stamina dapur", "Stretching sela shift", "Makan teratur"], "knowledge": ["Riset resep baru", "Pelajari cuisine baru", "Ikut workshop"], "social": ["Koordinasi tim dapur", "Komunikasi FOH", "Feedback tamu"], "character": ["Cek stock bahan", "Review menu", "Disiplin hygiene"], "dream_skill": ["Latihan 1 teknik baru", "Eksperimen flavor pairing", "Prepping mise en place"]}'::jsonb,
'[
    {"title": "Pastry Chef", "description": "Spesialis kue dan roti", "skills": ["Baking", "Pastry", "Kreativitas"]},
    {"title": "Food Stylist", "description": "Penataan makanan untuk foto/film", "skills": ["Estetika", "Detail", "Kreativitas"]},
    {"title": "Restaurant Owner", "description": "Bisnis restoran sendiri", "skills": ["Bisnis", "Manajemen", "Kuliner"]},
    {"title": "Culinary Instructor", "description": "Mengajar di sekolah masak", "skills": ["Komunikasi", "Pedagogi", "Mastery"]}
]'::jsonb,
15, 45, '5-10 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level memasak kamu?", "options": ["Pemula (masih belajar)", "Hobi (masak rutin)", "Semi-pro (pernah kerja dapur)", "Profesional chef"]},
    {"id": "cuisine", "type": "single_select", "label": "Masakan favorit untuk dimasak?", "options": ["Indonesia / Nusantara", "Western / Eropa", "Asian (Japan/Korea/Thai)", "Pastry & Bakery"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir chef?", "options": ["Head Chef di restoran", "Punya restoran sendiri", "Food content creator", "Culinary instructor"]},
    {"id": "skill", "type": "single_select", "label": "Skill chef yang mau dikuasai?", "options": ["Knife skills & teknik dasar", "Plating & presentasi", "Manajemen dapur", "Menu development"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('fashion-designer','Fashion Designer Profesional','👗','#D946EF','Lifestyle','4-10 tahun','Menciptakan tren dan gaya. Dari sketsa hingga runway, setiap koleksi adalah pernyataan fashion yang berani dan bermakna.','Fashion adalah identitas dan ekspresi diri. Fashion designer Indonesia punya peluang besar di industri fashion global.',ARRAY['Fashion Director','Pattern Maker','Textile Designer','Fashion Buyer','Fashion Stylist','Creative Director'],'[]'::jsonb,
'[
    {"title": "Kuasai Dasar Desain Fashion", "description": "Sketsa, pola, menjahit, dan pengetahuan kain", "why_it_matters": "Fondasi teknis fashion", "alternative_path": "School of fashion", "order": 1},
    {"title": "Koleksi Pertama - 5 Look Selesai", "description": "Dari sketsa ke produk jadi", "why_it_matters": "Portofolio nyata sebagai designer", "alternative_path": "Fashion show lokal", "order": 2},
    {"title": "Produk Terjual di Pasaran", "description": "Koleksi yang dibeli orang", "why_it_matters": "Dari seni ke bisnis", "alternative_path": "Dropship / pre-order", "order": 3},
    {"title": "Brand Fashion Dikenal atau Fashion Week", "description": "Brand mapan atau tampil di fashion week", "why_it_matters": "Puncak karir fashion", "alternative_path": "Fashion consultant", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Kuasai Dasar Desain Fashion", "title": "Kuasai sketsa fashion", "description": "Bisa menggambar desain proporsional", "order": 1},
    {"big_win_title": "Kuasai Dasar Desain Fashion", "title": "Buat pola dasar", "description": "Pola badan untuk baju, rok, celana", "order": 2},
    {"big_win_title": "Koleksi Pertama - 5 Look", "title": "Selesaikan 5 desain jadi", "description": "Dari sketsa ke produk siap pakai", "order": 3},
    {"big_win_title": "Koleksi Pertama - 5 Look", "title": "Ikut fashion show lokal", "description": "Tampilkan koleksi di atas catwalk", "order": 4},
    {"big_win_title": "Produk Terjual di Pasaran", "title": "Produksi massal 50 pcs", "description": "Produksi skala kecil", "order": 5},
    {"big_win_title": "Produk Terjual di Pasaran", "title": "Revenue >5 juta/bulan", "description": "Bisnis fashion berjalan", "order": 6},
    {"big_win_title": "Brand Fashion Dikenal", "title": "Kolaborasi dengan 1 brand", "description": "Kerjasama dengan brand/influencer", "order": 7},
    {"big_win_title": "Brand Fashion Dikenal", "title": "Tampil di fashion week resmi", "description": "Indonesia Fashion Week atau setara", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum mulai desain", "Syukur atas kreativitas", "Refleksi karya"], "physical": ["Stretching sela kerja", "Jaga postur", "Minum air cukup"], "knowledge": ["Riset tren fashion", "Pelajari teknik baru", "Moodboard tren"], "social": ["Diskusi dengan penjahit", "Kolaborasi designer", "Networking buyer"], "character": ["Sketsa ide baru", "Evaluasi hasil jahit", "Disiplin jadwal"], "dream_skill": ["Sketsa 1 desain baru", "Pilih bahan kain", "Buat pola 1 look"]}'::jsonb,
'[
    {"title": "Fashion Director", "description": "Arahkan gaya dan koleksi brand", "skills": ["Kepemimpinan", "Visi Fashion", "Branding"]},
    {"title": "Textile Designer", "description": "Desain motif dan kain", "skills": ["Motif", "Tekstil", "Warna"]},
    {"title": "Fashion Stylist", "description": "Tata gaya untuk foto/film", "skills": ["Style", "Koordinasi", "Tren"]},
    {"title": "Fashion Buyer", "description": "Pembelian untuk butik/store", "skills": ["Market", "Negosiasi", "Forecasting"]}
]'::jsonb,
15, 45, '4-10 tahun', 
'[
    {"id": "level", "type": "single_select", "label": "Level fashion kamu?", "options": ["Pemula (baru tertarik)", "Hobi (bisa jahit/sketsa)", "Semi-pro (pernah bikin koleksi)", "Profesional designer"]},
    {"id": "niche", "type": "single_select", "label": "Bidang fashion favorit?", "options": ["Ready-to-wear", "Haute couture", "Streetwear", "Muslim fashion"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Punya label sendiri", "Fashion director", "Fashion stylist", "Textile designer"]},
    {"id": "skill", "type": "single_select", "label": "Skill fashion yang mau dikuasai?", "options": ["Sketsa desain", "Pola dan jahit", "Business fashion", "Branding"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

INSERT INTO dream_templates (slug, title, emoji, color, category, duration, description, why_matters, career_options, success_examples, big_wins, small_wins, daily_activities, alternative_futures, min_age, max_age, journey_duration_years, onboarding_questions)
VALUES ('pilot','Pilot Profesional','✈️','#3B82F6','Lifestyle','3-8 tahun','Mengarungi angkasa sebagai pilot profesional. Dari takeoff hingga landing, setiap penerbangan adalah tanggung jawab dan kebanggaan.','Pilot adalah salah satu profesi paling bergengsi dan menantang. Mereka menghubungkan dunia dan membawa orang ke tujuan mereka.',ARRAY['Captain','Flight Instructor','Aviation Manager','Airline Executive','Charter Pilot','Aviation Safety Inspector'],'[]'::jsonb,
'[
    {"title": "Lolos Seleksi Sekolah Penerbangan", "description": "Diterima di STPI Curug, AAU, atau sekolah swasta", "why_it_matters": "Awal perjalanan pilot", "alternative_path": "Sekolah penerbangan swasta", "order": 1},
    {"title": "Lulus Ground School dan Solo Flight", "description": "Lisensi PPL dan solo flight pertama", "why_it_matters": "Momen bersejarah setiap pilot", "alternative_path": "Fokus ke teori dulu", "order": 2},
    {"title": "Dapat Lisensi CPL dan IR", "description": "Commercial Pilot License + Instrument Rating", "why_it_matters": "Syarat minimum terbang komersial", "alternative_path": "Flight instructor", "order": 3},
    {"title": "Diterima sebagai First Officer Maskapai", "description": "Terbang komersial sebagai kopilot", "why_it_matters": "Karir penerbangan yang sesungguhnya", "alternative_path": "Pilot charter/kargo", "order": 4}
]'::jsonb,
'[
    {"big_win_title": "Lolos Seleksi Sekolah Penerbangan", "title": "Medical check kelas 1", "description": "Lulus tes kesehatan ICAO", "order": 1},
    {"big_win_title": "Lolos Seleksi Sekolah Penerbangan", "title": "Nilai Mat & Fis >85", "description": "Akademik yang kuat", "order": 2},
    {"big_win_title": "Lolos Seleksi Sekolah Penerbangan", "title": "TOEFL >500 / IELTS >5.5", "description": "Kemampuan bahasa Inggris", "order": 3},
    {"big_win_title": "Lulus Ground School", "title": "Jam terbang 50+", "description": "Akumulasi jam terbang", "order": 4},
    {"big_win_title": "Lulus Ground School", "title": "Solo flight sukses", "description": "Terbang solo pertama", "order": 5},
    {"big_win_title": "Dapat Lisensi CPL", "title": "200 jam terbang", "description": "Minimum CPL", "order": 6},
    {"big_win_title": "Dapat Lisensi CPL", "title": "Lulus checkride CPL", "description": "Ujian praktik CPL", "order": 7},
    {"big_win_title": "First Officer", "title": "Diterima di maskapai", "description": "Offer dari maskapai komersial", "order": 8}
]'::jsonb,
'{"spiritual": ["Doa sebelum terbang", "Syukur atas keselamatan", "Refleksi penerbangan"], "physical": ["Medical check rutin", "Tidur cukup", "Makan sehat"], "knowledge": ["Review flight manual", "Update regulasi penerbangan", "Belajar navigasi"], "social": ["Briefing kru", "Komunikasi ATC", "Debriefing"], "character": ["Cek flight plan", "Logbook update", "Disiplin prosedur"], "dream_skill": ["Review 1 prosedur", "Simulator practice", "Study weather patterns"]}'::jsonb,
'[
    {"title": "Captain", "description": "Pilot in command pesawat komersial", "skills": ["Kepemimpinan", "Pengalaman", "Decision making"]},
    {"title": "Flight Instructor", "description": "Mengajar pilot baru", "skills": ["Komunikasi", "Kesabaran", "Mastery"]},
    {"title": "Aviation Manager", "description": "Manajemen operasional penerbangan", "skills": ["Manajemen", "Regulasi", "Operasional"]},
    {"title": "Charter Pilot", "description": "Penerbangan pribadi/sewa", "skills": ["Fleksibel", "Jaringan", "Service"]}
]'::jsonb,
17, 40, '3-8 tahun', 
'[
    {"id": "tahap", "type": "single_select", "label": "Tahap karir pilot kamu?", "options": ["Masih sekolah / kuliah", "Baru daftar sekolah penerbangan", "Lagi sekolah / latihan terbang", "Sudah lisensi / apply maskapai"]},
    {"id": "lisensi", "type": "single_select", "label": "Lisensi pilot yang dimiliki?", "options": ["Belum ada", "PPL / Student Pilot", "CPL", "ATPL / Frozen ATPL"]},
    {"id": "target", "type": "single_select", "label": "Target utama karir?", "options": ["Garuda Indonesia", "Lion Air Group", "Pilot charter / kargo", "Flight Instructor"]},
    {"id": "kendala", "type": "single_select", "label": "Kendala terbesar sekarang?", "options": ["Biaya sekolah mahal", "Seleksi ketat", "Medical / kesehatan", "Persaingan kerja"]}
]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, emoji = EXCLUDED.emoji, color = EXCLUDED.color, category = EXCLUDED.category, duration = EXCLUDED.duration, description = EXCLUDED.description, why_matters = EXCLUDED.why_matters, career_options = EXCLUDED.career_options, success_examples = EXCLUDED.success_examples, big_wins = EXCLUDED.big_wins, small_wins = EXCLUDED.small_wins, daily_activities = EXCLUDED.daily_activities, alternative_futures = EXCLUDED.alternative_futures, min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, journey_duration_years = EXCLUDED.journey_duration_years, onboarding_questions = EXCLUDED.onboarding_questions;

-- Verifikasi akhir
SELECT category, COUNT(*) FROM dream_templates GROUP BY category ORDER BY category;
SELECT slug, title, jsonb_array_length(big_wins) as bw, jsonb_array_length(onboarding_questions) as q FROM dream_templates ORDER BY slug;