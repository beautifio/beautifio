-- ============================================================================
-- Migration: recover_dream_phases
-- Memulihkan dream_phases + small_win_templates untuk 28 template
-- (football-player dari 00019 ikut disertakan karena data hilang oleh TRUNCATE CASCADE)
-- Idempotent: DELETE lalu INSERT ulang
-- ============================================================================

-- Hapus data lama untuk slug yang akan di-seed ulang
DELETE FROM small_win_templates
WHERE phase_id IN (
  SELECT id FROM dream_phases
  WHERE dream_template_slug IN ('badminton-player','esports-player','doctor','programmer','content-creator','ui-ux-designer','game-developer','psychologist','pilot','entrepreneur','digital-marketer','dentist','chef','youtuber','teacher','musician','actor','swimmer','basketball-player','photographer','graphic-designer','data-scientist','ai-specialist','social-media-manager','event-organizer','financial-planner','pharmacist','fashion-designer','football-player')
);

DELETE FROM dream_phases
WHERE dream_template_slug IN ('badminton-player','esports-player','doctor','programmer','content-creator','ui-ux-designer','game-developer','psychologist','pilot','entrepreneur','digital-marketer','dentist','chef','youtuber','teacher','musician','actor','swimmer','basketball-player','photographer','graphic-designer','data-scientist','ai-specialist','social-media-manager','event-organizer','financial-planner','pharmacist','fashion-designer','football-player');

-- ============================================================
-- Atlet Bulu Tangkis Profesional
-- benchmark: atlet-bulu-tangkis-profesional => template: badminton-player
-- 4 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fondasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'badminton-player', 1, 'Fondasi', '7', '12', 'Bergabung klub bulutangkis resmi dan ikut turnamen pertama', NULL, 'PBSI rekomendasikan anak mulai latihan terstruktur usia 7-9. Mayoritas atlet nasional mulai di klub usia 8-10.', 'Meraih podium di turnamen antar klub tingkat kota usia <12', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Teknik dasar 4 pukulan', NULL, 'Smash, netting, dropshot, clear konsistensi 6/10', NULL, 'Sesi latihan dengan pelatih', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Footwork dasar', NULL, 'Pola footwork 6 titik lapangan dalam <12 detik', NULL, 'Stopwatch saat latihan', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rally konsistensi', NULL, 'Rally 30+ pukulan berturut-turut', NULL, 'Hitung sendiri saat latihan', 3);

  -- FASE 2: Kompetitif Junior
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'badminton-player', 2, 'Kompetitif Junior', '12', '15', 'Meraih medali (emas/perak/perunggu) di turnamen tingkat provinsi', NULL, 'Turnamen PBSI antar klub dan O2SN adalah tangga kompetisi resmi. Usia 13-15 adalah jenjang U-15 PBSI.', 'Masuk Pelatda Provinsi; menang turnamen nasional antar klub U-15', 'Di usia 15 belum pernah mewakili klub di turnamen resmi', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kecepatan smash', NULL, 'Smash minimal 160 km/jam', NULL, 'Alat radar atau estimasi pelatih', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Stamina match', NULL, 'Bermain 3 game penuh tanpa penurunan performa', NULL, 'Evaluasi pelatih + heart rate recovery', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Konsistensi turnamen', NULL, 'Ikut minimal 4 turnamen resmi dalam setahun', NULL, 'Log nama turnamen + hasil', 3);

  -- FASE 3: Nasional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'badminton-player', 3, 'Nasional', '15', '18', 'Masuk Pelatnas PBSI Pratama atau mewakili provinsi di PON/POMNas', NULL, 'Pelatnas PBSI: Pratama (junior) → Muda → Utama. Kevin Sanjaya masuk Pelatnas usia 15.', 'Memenangkan turnamen nasional U-19; masuk Pelatnas Muda sebelum 18', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Ranking nasional PBSI', NULL, 'Masuk 50 besar ranking nasional kategori usia', NULL, 'Cek ranking resmi PBSI', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Stamina elite', NULL, 'VO2Max > 60 ml/kg/min putra, > 55 putri', NULL, 'Tes laboratorium olahraga', 2);

  -- FASE 4: Profesional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'badminton-player', 4, 'Profesional', '18', NULL, 'Ranking BWF Top 200 Dunia; kontrak dengan klub liga internasional', NULL, NULL, 'Top 50 BWF sebelum usia 22; medali di turnamen Super Series/BWF Tour', NULL, 4)
  RETURNING id INTO v_phase_id;

END $$;

-- Pemain E-Sports / Pro Player
-- benchmark: pemain-e-sports => template: esports-player
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Dari Casual ke Serius
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'esports-player', 1, 'Dari Casual ke Serius', '13', '16', 'Mencapai rank Mythic (Mobile Legends) atau setara top tier di game pilihan', NULL, 'MPL Indonesia mensyaratkan rank Mythic. Top Mythic (top 1000 server) adalah pintu masuk scouting.', 'Masuk Top 100 Global ranking sebelum usia 15', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rank Mythic', NULL, 'Mythic star 5+ atau Global ranking <500', NULL, 'Screenshot rank in-game', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Win rate konsisten', NULL, 'Win rate overall >55%, hero spesifik >60%', NULL, 'Statistik in-game', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Spesialisasi 2-3 hero', NULL, 'Main rate >100 match pada 2-3 hero, win rate >65%', NULL, 'Profile in-game', 3);

  -- FASE 2: Semi-Pro dan Turnamen
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'esports-player', 2, 'Semi-Pro dan Turnamen', '15', '18', 'Memenangkan turnamen online/offline dengan hadiah uang atau bergabung tim akademi', NULL, 'EVOS, RRQ, ONIC punya tim akademi rekrut usia 15+. Banyak pro player Indonesia debut MPL usia 16-17.', 'Langsung masuk roster utama MPL tanpa akademi; viral clip yang disorot komunitas', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'MVP konsisten', NULL, 'MVP rate >35% dalam 50 match terakhir', NULL, 'Statistik in-game', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Menang turnamen online pertama', NULL, 'Podium di minimal 1 turnamen dengan hadiah', NULL, 'Screenshot hasil', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Bangun reputasi komunitas', NULL, '1.000+ followers di media sosial game', NULL, 'Follower count', 3);

  -- FASE 3: Pro Scene
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'esports-player', 3, 'Pro Scene', '17', '21', 'Bergabung roster resmi tim yang berkompetisi di MPL Indonesia Season atau liga setara', NULL, 'MPL Indonesia adalah liga tertinggi MLBB. Slot terbatas (~10 tim, 5-7 pemain + substitute).', 'MVP MPL season; dipanggil timnas Indonesia untuk M-Series atau SEA Games', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kontrak dengan tim pro', NULL, 'Kontrak berbayar dengan tim yang memiliki management resmi', NULL, 'Dokumen kontrak', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Statistik MPL', NULL, 'KDA > 4.0 secara konsisten dalam satu season', NULL, 'Statistik MPL resmi', 2);

END $$;

-- Dokter Umum
-- benchmark: dokter-umum => template: doctor
-- 4 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Persiapan Masuk FK
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'doctor', 1, 'Persiapan Masuk FK', '15', '18', 'Lulus SNBT/UTBK dan diterima di Fakultas Kedokteran negeri', NULL, 'FK UI cut-off UTBK >750/1000. FK Undip/Unpad/UGM >720. FK swasta terakreditasi A >650.', 'Diterima FK UI/UGM/Unair/Undip pada percobaan pertama dengan beasiswa', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Nilai rata-rata IPA', NULL, 'Rata-rata nilai raport Biologi, Kimia, Fisika, Matematika ≥ 85', NULL, 'Raport semester', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Skor UTBK/SNBT simulasi', NULL, 'Skor simulasi tryout ≥ 700', NULL, 'Tryout resmi minimal 2x per semester', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kemampuan Biologi & Kimia', NULL, 'Nilai ulangan harian Bio & Kim ≥ 88; bisa menjawab 80% soal UTBK 3 tahun terakhir', NULL, 'Latihan soal arsip UTBK', 3);

  -- FASE 2: Preklinik / S1 Kedokteran
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'doctor', 2, 'Preklinik / S1 Kedokteran', '18', '22', 'Menyelesaikan fase preklinik dengan IPK ≥ 3.0 dan lulus ujian OSCE blok', NULL, 'IPK <2.75 di semester 3+ adalah sinyal bahaya drop-out. Rata-rata IPK lulus FK: 3.1-3.4.', 'IPK > 3.5; memenangkan lomba karya ilmiah/PKM; aktif di riset dosen', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'IPK per semester', NULL, 'IPK tiap semester ≥ 3.0; tidak ada nilai D atau E', NULL, 'Transkrip akademik', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus OSCE', NULL, 'Lulus semua station OSCE di tiap blok tanpa remedial', NULL, 'Hasil OSCE resmi FK', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Membaca jurnal ilmiah', NULL, 'Membaca dan merangkum minimal 2 jurnal ilmiah/bulan', NULL, 'Catatan jurnal review', 3);

  -- FASE 3: Koas / Klinik
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'doctor', 3, 'Koas / Klinik', '22', '24', 'Menyelesaikan semua stase koas dan dapat gelar S.Ked / dr.', NULL, 'Ada 15+ stase koas, tiap stase 4-8 minggu. Total koas ~24 bulan.', 'Menyelesaikan koas < 22 bulan; nilai supervisor A di semua stase', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus tiap stase tanpa remedial', NULL, 'Nilai minimal B di setiap stase koas', NULL, 'Buku log koas', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Keterampilan klinis', NULL, 'Bisa melakukan prosedur dasar mandiri: infus, EKG, suturing', NULL, 'Penilaian pembimbing', 2);

  -- FASE 4: UKMPPD dan Internship
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'doctor', 4, 'UKMPPD dan Internship', '24', '25', 'Lulus UKMPPD first attempt dan gelar dr. resmi', NULL, 'Pass rate UKMPPD nasional ~70-75%. Lulus first try adalah target.', 'Nilai UKMPPD >75; langsung dapat penempatan internship pilihan', NULL, 4)
  RETURNING id INTO v_phase_id;

  -- SW 4.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Skor CBT UKMPPD simulasi', NULL, 'Skor simulasi ≥ 68 (passing grade resmi ~63-65)', NULL, 'Try-out UKMPPD dari AIPKI', 1);

END $$;

-- Software Engineer / Programmer
-- benchmark: software-engineer => template: programmer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar Dasar
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'programmer', 1, 'Belajar Dasar', '12', '17', 'Membuat dan mempublikasikan proyek pertama yang bisa digunakan orang lain', NULL, 'Junior developer Indonesia rata-rata mulai belajar coding usia 15-19. Mulai usia 12-14 punya head start.', 'Memenangkan lomba coding sebelum usia 16', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai 1 bahasa programming', NULL, 'Program sederhana (kalkulator, to-do list) tanpa tutorial', NULL, 'Project dari awal', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Selesaikan 1 course online', NULL, 'Certificate completion dari Dicoding/Codecademy/freeCodeCamp', NULL, 'Screenshot sertifikat', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'GitHub aktif', NULL, 'Akun GitHub dengan minimal 5 repository publik', NULL, 'Link GitHub', 3);

  -- FASE 2: Intermediate & Portfolio
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'programmer', 2, 'Intermediate & Portfolio', '17', '20', 'Mendapat income pertama dari coding (freelance, magang berbayar, atau bounty)', NULL, 'Developer Indonesia mulai freelance rata-rata usia 19-21.', 'Magang di startup sebelum semester 4 kuliah; income freelance > 3 juta/bulan', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portfolio 3 project selesai', NULL, '3 project berbeda genre yang live/deployed', NULL, 'Link deploy', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kontribusi open source', NULL, 'Minimal 1 pull request yang di-merge', NULL, 'Link PR', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Problem solving', NULL, '50 soal di LeetCode, minimal 20 medium', NULL, 'Profile LeetCode', 3);

  -- FASE 3: Junior Developer
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'programmer', 3, 'Junior Developer', '20', '23', 'Full-time job sebagai Software Engineer di perusahaan tech', NULL, 'Entry level developer Indonesia 2024: Rp 5-12 juta/bulan (startup), Rp 15-30 juta (perusahaan besar)', 'Dapat kerja sebelum lulus; langsung mid-level setelah 1 tahun', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus technical interview', NULL, 'Lulus setidaknya 1 technical test', NULL, 'Offer letter', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai tech stack pasar', NULL, 'Mahir minimal 1 stack populer (React+Node, Flutter, Django+React)', NULL, 'Full-stack project dalam 2 minggu', 2);

END $$;

-- Content Creator (TikTok / YouTube / Instagram)
-- benchmark: content-creator => template: content-creator
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Mulai & Konsisten
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'content-creator', 1, 'Mulai & Konsisten', NULL, NULL, 'Mencapai 1.000 followers/subscribers pertama', NULL, 'Rata-rata waktu mencapai 1K followers TikTok: 1-3 bulan dengan konten konsisten. YouTube: 3-6 bulan.', '10.000 followers dalam 3 bulan pertama; 1 konten viral >100K views', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Konsistensi posting', NULL, 'Upload minimal 3 konten/minggu selama 8 minggu berturut-turut', NULL, 'Cek tanggal upload', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '1.000 followers pertama', NULL, '1.000 followers organik', NULL, 'Follower count', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Engagement rate', NULL, 'Average engagement rate >5%', NULL, 'Platform analytics', 3);

  -- FASE 2: Growing
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'content-creator', 2, 'Growing', NULL, NULL, '10.000 followers dan dapat endorsement/paid partnership pertama', NULL, 'Brand mulai melirik micro-influencer di 10K followers. Rate endorsement Indonesia: Rp 200K - 2 juta per post.', '100K followers dalam 1 tahun; income dari konten > UMR', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '10.000 followers', NULL, '10K followers/subscribers organik', NULL, 'Follower count', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Viral pertama', NULL, 'Minimal 1 konten mencapai 100K views', NULL, 'View count', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kolaborasi dengan kreator lain', NULL, 'Kolaborasi dengan minimal 2 kreator yang followersnya lebih banyak', NULL, 'Tag/mention', 3);

  -- FASE 3: Monetisasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'content-creator', 3, 'Monetisasi', NULL, NULL, 'Income dari konten konsisten melebihi Rp 5 juta/bulan', NULL, 'YouTube monetize mulai 1.000 subs + 4.000 jam tayang. TikTok Creator Fund: 10K followers.', 'Income >Rp 20 juta/bulan dari konten sebelum usia 20; Silver Play Button (100K subs)', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Monetisasi platform', NULL, 'Memenuhi syarat dan aktif di program monetisasi', NULL, 'Status dashboard', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Media Kit profesional', NULL, 'Punya media kit, dapat minimal 3 paid collaboration', NULL, 'Jumlah kontrak', 2);

END $$;

-- UI/UX Designer
-- benchmark: ui-ux-designer => template: ui-ux-designer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar Fundamental
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ui-ux-designer', 1, 'Belajar Fundamental', NULL, NULL, 'Menyelesaikan 3 studi kasus desain lengkap dan masuk portfolio', NULL, 'Entry-level UX designer Indonesia butuh minimal 3-5 case study di portfolio.', 'Case study viral di Behance/LinkedIn dan dapat 1K+ likes', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai Figma', NULL, 'Prototype interaktif lengkap tanpa tutorial', NULL, 'Link project Figma', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Selesaikan kursus UX', NULL, 'Sertifikat Google UX Design Certificate atau Dicoding UX', NULL, 'Screenshot sertifikat', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pahami riset user', NULL, '3 sesi user interview dan laporan insight', NULL, 'Dokumen riset', 3);

  -- FASE 2: Portfolio & Internship
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ui-ux-designer', 2, 'Portfolio & Internship', NULL, NULL, 'Magang sebagai UI/UX Designer di perusahaan tech atau startup', NULL, 'Gaji magang UI/UX startup Indonesia: Rp 1-4 juta/bulan. Perusahaan besar: Rp 3-8 juta/bulan.', 'Langsung freelance >Rp 5 juta/bulan sebelum magang', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portfolio di Behance/Dribbble', NULL, '3 project di Behance dengan total views >500', NULL, 'Behance analytics', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pemahaman user research', NULL, 'Bisa jelaskan usability testing, user interview, card sorting', NULL, 'Menulis artikel', 2);

  -- FASE 3: Junior Designer
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ui-ux-designer', 3, 'Junior Designer', NULL, NULL, 'Full-time job sebagai UI/UX Designer dengan gaji di atas UMR', NULL, 'Junior UX Designer Indonesia 2024: Rp 6-15 juta/bulan. Senior (3+ tahun): Rp 15-40 juta.', 'Dapat kerja di perusahaan Series B+ atau MNC dalam 1 tahun belajar', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Game Developer
-- benchmark: game-developer => template: game-developer
-- 2 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar Dasar
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'game-developer', 1, 'Belajar Dasar', '13', '18', 'Merilis game pertama yang bisa dimainkan orang lain', NULL, 'Game jam (Ludum Dare, Game Jam lokal) cara tercepat buktikan kemampuan. IGDX dukung game dev muda.', 'Game pertama masuk top 50 di Game Jam internasional', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai 1 game engine', NULL, 'Game sederhana (platformer atau puzzle) di Unity/Godot', NULL, 'Link game di itch.io', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rilis di itch.io', NULL, 'Publish minimal 1 game, dapat 50 downloads', NULL, 'itch.io analytics', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Ikut Game Jam', NULL, 'Selesai dan submit entry di minimal 1 Game Jam', NULL, 'Link submission', 3);

  -- FASE 2: Pengembangan Serius
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'game-developer', 2, 'Pengembangan Serius', '17', '22', 'Rilis game dengan pendapatan pertama (berbayar atau in-app purchase)', NULL, 'Game indie Indonesia sukses: DreadOut, Coffee Talk (Visual Deluxe). Mobile: Play Store dengan Free+IAP.', NULL, NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rilis di Google Play Store', NULL, 'Game dengan rating minimal 3.5 dari 10 review organik', NULL, 'Link Play Store', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pendapatan pertama', NULL, 'Menghasilkan minimal Rp 500.000 dari game', NULL, 'Dashboard revenue', 2);

END $$;

-- Psikolog Klinis
-- benchmark: psikolog-klinis => template: psychologist
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Persiapan Masuk Psikologi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'psychologist', 1, 'Persiapan Masuk Psikologi', '15', '18', 'Diterima di jurusan Psikologi PTN atau PTS terakreditasi A', NULL, 'Psikologi UI, UGM, Undip, Unair pilihan terbaik. SNBT psikologi UI: >700.', 'Masuk Psikologi UI/UGM jalur SNBT', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Nilai rata-rata IPS/Soshum', NULL, 'Rata-rata Sosiologi, Ekonomi, Sejarah, Bahasa Indonesia ≥ 83', NULL, 'Raport', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Memahami profesi', NULL, 'Membaca minimal 5 buku/artikel tentang psikologi klinis', NULL, 'Catatan review', 2);

  -- FASE 2: S1 Psikologi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'psychologist', 2, 'S1 Psikologi', '18', '22', 'Lulus S1 Psikologi dengan IPK ≥ 3.0 dan skripsi bidang klinis', NULL, 'IPK minimal masuk S2 Profesi Psikologi Klinis: 3.0-3.2.', NULL, NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'IPK konsisten', NULL, 'IPK tiap semester ≥ 3.0', NULL, 'KHS per semester', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pengalaman asisten penelitian atau relawan', NULL, 'Aktif minimal 1 kegiatan', NULL, 'Sertifikat', 2);

  -- FASE 3: S2 Profesi + HIMPSI
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'psychologist', 3, 'S2 Profesi + HIMPSI', '22', '26', 'Lulus Magister Psikologi Profesi (M.Psi., Psikolog) dan mendapat SIPP', NULL, 'Hanya lulusan S2 Profesi yang bisa sebut diri \', 'Lulus S2 Profesi dalam 2 tahun; langsung buka praktik mandiri', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Pilot Pesawat Komersial
-- benchmark: pilot-pesawat-komersial => template: pilot
-- 4 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Persiapan & Seleksi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pilot', 1, 'Persiapan & Seleksi', '17', '19', 'Lulus seleksi dan masuk sekolah penerbangan (STPI Curug, AAU, atau sekolah swasta terakreditasi)', NULL, 'STPI Curug (negeri) sangat kompetitif. Sekolah swasta: biaya Rp 500 juta - 1.5 miliar total.', 'Diterima STPI Curug; mendapat beasiswa dari maskapai', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kesehatan kelas 1 ICAO', NULL, 'Lulus medical check-up kelas 1', NULL, 'Medical examination resmi', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Nilai matematika & fisika', NULL, 'Nilai Mat & Fisika ≥ 85', NULL, 'Nilai raport + tryout', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kemampuan bahasa Inggris', NULL, 'TOEFL ITP ≥ 500 atau IELTS ≥ 5.5', NULL, 'Skor resmi', 3);

  -- FASE 2: Ground School & Solo Flight
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pilot', 2, 'Ground School & Solo Flight', '18', '20', 'Lulus ground school dan berhasil solo flight pertama', NULL, 'Solo flight biasanya di jam terbang ke-12-20. Momen bersejarah setiap pilot.', 'Solo flight < 12 jam terbang', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Jam terbang 50+', NULL, '50 jam terbang dalam 6 bulan pertama', NULL, 'Logbook penerbangan', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus ujian teori PPL', NULL, 'Lulus teori PPL dengan nilai ≥ 75%', NULL, 'Hasil ujian DGCA', 2);

  -- FASE 3: CPL & Instrument Rating
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pilot', 3, 'CPL & Instrument Rating', '20', '22', 'Mendapat CPL-IR — lisensi minimum untuk terbang komersial', NULL, 'Total jam terbang untuk CPL: minimal 200 jam (DGCA Indonesia).', NULL, NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '200 jam terbang', NULL, '200 jam terbang di logbook', NULL, 'Logbook diverifikasi instruktur', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus checkride CPL', NULL, 'Lulus ujian praktik terbang CPL', NULL, 'Lisensi CPL', 2);

  -- FASE 4: First Officer
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pilot', 4, 'First Officer', '22', '25', 'Diterima sebagai First Officer di maskapai komersial Indonesia', NULL, 'Garuda, Lion Air, Batik Air, Citilink target. Starting salary FO: Rp 15-25 juta/bulan.', 'Diterima di Garuda Indonesia dalam 2 tahun mendapat CPL', NULL, 4)
  RETURNING id INTO v_phase_id;

END $$;

-- Entrepreneur / CEO Startup
-- benchmark: entrepreneur-ceo-startup => template: entrepreneur
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar Jualan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'entrepreneur', 1, 'Belajar Jualan', NULL, NULL, 'Mendapat Rp 1 juta pertama dari bisnis sendiri', NULL, '90% startup gagal. Founder sukses sudah pernah jualan sebelum bikin startup formal.', 'Rp 10 juta pertama dalam 1 bulan; produk terjual organik', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Validasi ide', NULL, 'Bicara dengan 10 calon pelanggan SEBELUM buat produk', NULL, 'Catatan interview', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Penjualan pertama', NULL, 'Menjual ke orang yang TIDAK kenal kamu', NULL, 'Bukti transaksi', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Customer review pertama', NULL, '5 ulasan/testimonial positif', NULL, 'Screenshot ulasan', 3);

  -- FASE 2: Bisnis Terbukti
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'entrepreneur', 2, 'Bisnis Terbukti', NULL, NULL, 'Revenue konsisten Rp 10 juta/bulan dan punya minimal 1 karyawan/mitra', NULL, 'Revenue 10 juta/bulan = setara UMR rata-rata nasional 2024.', 'Revenue > Rp 100 juta/bulan sebelum usia 20', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '50 pelanggan aktif', NULL, 'Minimal 50 orang pernah bayar', NULL, 'Database pelanggan', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Repeat order rate', NULL, 'Minimal 30% pelanggan kembali beli', NULL, 'CRM sederhana', 2);

  -- SW 2.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Unit economics positif', NULL, 'HPP per produk < 40% dari harga jual', NULL, 'Spreadsheet', 3);

  -- FASE 3: Scale Up
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'entrepreneur', 3, 'Scale Up', NULL, NULL, 'Pendanaan eksternal (investor, grant, pinjaman bank) ATAU revenue > Rp 1 miliar/tahun', NULL, 'Startup Indonesia yang dapat seed funding rata-rata revenue > Rp 500 juta dan pertumbuhan 20%+/bulan.', 'Masuk Y Combinator, Iterative, Antler, Startup Studio Indonesia', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Digital Marketer
-- benchmark: digital-marketer => template: digital-marketer
-- 2 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fondasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'digital-marketer', 1, 'Fondasi', NULL, NULL, 'Sertifikasi digital marketing pertama DAN proyek freelance/magang pertama', NULL, 'Google, Meta, HubSpot semua punya sertifikasi gratis. Ini minimum untuk magang.', 'Langsung dapat klien berbayar tanpa magang; ROAS > 3x', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Sertifikasi Google Digital Marketing', NULL, 'Selesaikan Google Digital Marketing Certificate', NULL, 'Sertifikat', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Meta Blueprint Certified', NULL, 'Lulus minimal 1 exam Meta Blueprint', NULL, 'Sertifikat', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Praktik langsung', NULL, 'Kelola akun iklan budget Rp 500.000, catat hasil', NULL, 'Screenshot dashboard', 3);

  -- FASE 2: Spesialisasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'digital-marketer', 2, 'Spesialisasi', NULL, NULL, 'Mendapat klien/perusahaan yang membayar > Rp 3 juta/bulan', NULL, 'Freelance digital marketer Indonesia: Rp 2-15 juta/project. In-house junior: Rp 4-8 juta/bulan.', 'Portofolio kampanye hasilkan growth revenue >50%; income freelance >Rp 15 juta/bulan', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Spesialisasi 1 channel', NULL, 'Kuasai Meta Ads/Google Ads/TikTok Ads/SEO/Email Marketing', NULL, 'Portofolio hasil', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portofolio 3 klien', NULL, 'Kelola kampanye untuk minimal 3 bisnis berbeda', NULL, 'Portofolio dengan angka', 2);

END $$;

-- Dokter Gigi
-- benchmark: dokter-gigi => template: dentist
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Persiapan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'dentist', 1, 'Persiapan', '15', '18', 'Diterima di Fakultas Kedokteran Gigi (FKG) PTN', NULL, 'FKG UI/UGM/Unair: UTBK >690. Biaya FKG swasta: Rp 50-300 juta.', 'Masuk FKG UI atau UGM via SNBT', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Nilai IPA', NULL, 'Biologi, Kimia, Matematika ≥ 85', NULL, 'Raport', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Simulasi UTBK', NULL, 'Skor tryout UTBK ≥ 680', NULL, 'Hasil tryout', 2);

  -- FASE 2: S1 Kedokteran Gigi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'dentist', 2, 'S1 Kedokteran Gigi', '18', '23', 'IPK ≥ 3.0 dan lulus semua OSCE preklinik', NULL, NULL, NULL, NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'IPK per semester', NULL, 'IPK tiap semester ≥ 3.0', NULL, 'Transkrip', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus OSCE', NULL, 'Lulus semua station OSCE tanpa remedial', NULL, 'Hasil OSCE', 2);

  -- FASE 3: Koas Gigi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'dentist', 3, 'Koas Gigi', '23', '25', 'Menyelesaikan koas gigi dan lulus UKMP2DG (uji kompetensi dokter gigi)', NULL, NULL, 'IPK > 3.5, langsung buka praktik di kota tujuan', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Chef / Juru Masak Profesional
-- benchmark: chef-juru-masak-profesional => template: chef
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fondasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'chef', 1, 'Fondasi', '15', '18', 'Menguasai 5 teknik memasak dasar dan membuat 20 resep dari 0 tanpa lihat resep', NULL, 'SMK Tata Boga, sekolah kuliner, Le Cordon Bleu jalur tercepat. Tapi banyak chef otodidak.', 'Menang lomba memasak tingkat sekolah/kota; konten masak viral pertama', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai knife skills', NULL, 'Julienne, brunoise, chiffonade konsisten dalam < 5 menit', NULL, 'Video diri', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '5 teknik dasar', NULL, 'Sauté, braising, roasting, steaming, frying benar', NULL, '1 hidangan per teknik', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Memahami flavor pairing', NULL, '3 resep original tanpa mengikuti resep', NULL, 'Foto + deskripsi', 3);

  -- FASE 2: Pengalaman Industri
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'chef', 2, 'Pengalaman Industri', '18', '22', 'Bekerja sebagai commis chef atau junior cook di restoran/hotel bintang minimal 4', NULL, 'Hierarki dapur: Kitchen Helper → Commis → Demi Chef → Chef de Partie. Gaji commis: Rp 2.5-5 juta.', 'Langsung diterima di restoran fine dining atau hotel bintang 5', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kerja di restoran/hotel', NULL, 'Bertahan > 6 bulan di dapur profesional', NULL, 'Surat referensi', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kecepatan dan presisi dapur', NULL, 'Mise en place untuk 50 cover dalam < 3 jam', NULL, 'Evaluasi Head Chef', 2);

  -- FASE 3: Spesialisasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'chef', 3, 'Spesialisasi', '22', '28', 'Chef de Partie atau Sous Chef, ATAU membuka kafe/resto sendiri dengan revenue positif', NULL, 'Chef de Partie hotel bintang 5 Jakarta: Rp 6-12 juta/bulan. Sous Chef: Rp 12-25 juta.', 'Memenangkan Bocuse d''Or Indonesia; diundang ke acara TV kuliner', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- YouTuber / Vlogger
-- benchmark: youtuber-vlogger => template: youtuber
-- 2 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Mulai & Konsisten
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'youtuber', 1, 'Mulai & Konsisten', NULL, NULL, '1.000 subscribers dan publish 30 video', NULL, 'YouTube monetize: 1.000 subs + 4.000 jam tayang. Rata-rata 3-6 bulan untuk 1K subs.', '10K subs dalam 3 bulan; 1 video viral >500K views', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Konsistensi upload', NULL, 'Upload 1 video/minggu selama 12 minggu', NULL, 'Cek tanggal upload', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '1.000 subscribers', NULL, '1.000 subs organik', NULL, 'YouTube Studio', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Jam tayang', NULL, '4.000 jam tayang publik', NULL, 'YouTube Analytics', 3);

  -- FASE 2: Monetisasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'youtuber', 2, 'Monetisasi', NULL, NULL, 'Diterima YouTube Partner Program (YPP) dan mendapat income pertama', NULL, 'RPM YouTube Indonesia: Rp 3.000-15.000 per 1.000 views tergantung niche.', '100K subs dalam 1 tahun; Silver Play Button', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '10.000 subscribers', NULL, '10K subs organik', NULL, 'YouTube Studio', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pendapatan Adsense pertama', NULL, 'Minimal Rp 1 juta dari Adsense', NULL, 'Dashboard Adsense', 2);

END $$;

-- Guru / Pendidik
-- benchmark: guru-pendidik => template: teacher
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: S1 Pendidikan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'teacher', 1, 'S1 Pendidikan', '18', '22', 'Lulus S1 dari LPTK dengan IPK ≥ 3.0', NULL, 'PTN dengan FKIP terbaik: UNY, UPI, UNNES, UM.', NULL, NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'IPK semester', NULL, 'IPK tiap semester ≥ 3.0', NULL, NULL, 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Pengalaman mengajar', NULL, 'Aktif di UKM mengajar (relawan ngajar, tutor)', NULL, NULL, 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus PLP/KKN-PPL', NULL, 'Nilai A', NULL, NULL, 3);

  -- FASE 2: PPG
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'teacher', 2, 'PPG', '22', '23', 'Lulus PPG Prajabatan dan mendapat Sertifikat Pendidik', NULL, 'PPG wajib untuk jadi guru PNS. Tanpa sertifikat tidak bisa ikut PPPK/P3K guru.', 'Lulus PPG batch pertama setelah S1; langsung diterima di sekolah favorit', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus seleksi PPG', NULL, 'Lulus seleksi administrasi dan akademik PPG', NULL, 'Surat penerimaan', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Sertifikat Pendidik', NULL, 'Mendapat sertifikat pendidik dari Kemdikbud', NULL, 'Dokumen', 2);

  -- FASE 3: Karier
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'teacher', 3, 'Karier', '23', NULL, 'Lulus PPPK (P3K) Guru atau PNS Guru', NULL, NULL, 'Lolos P3K dalam 1-2 kali seleksi; mengajar di sekolah unggulan', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Penyanyi / Musisi Profesional
-- benchmark: penyanyi-musisi-profesional => template: musician
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Membangun Kemampuan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'musician', 1, 'Membangun Kemampuan', '12', '17', 'Menang kompetisi menyanyi/musik tingkat kota ATAU viral pertama di media sosial', NULL, 'Indonesian Idol, X Factor, The Voice Indonesia jalur cepat. Era digital buka jalur langsung via TikTok/YouTube.', 'Masuk top 10 Indonesian Idol; video cover viral >1 juta views sebelum 17', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai teknik vokal/instrumen dasar', NULL, '3 lagu genre beda dengan breathing benar ATAU 10 lagu instrumen lengkap', NULL, 'Rekaman', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rekaman pertama', NULL, '1 rekaman kualitas baik untuk dipublikasi', NULL, 'File audio/video', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Tampil di depan audiens', NULL, 'Live di depan minimal 50 orang', NULL, 'Dokumentasi', 3);

  -- FASE 2: Membangun Audiens
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'musician', 2, 'Membangun Audiens', '17', '22', '100.000 monthly listeners Spotify atau 100.000 subscribers YouTube musik', NULL, '100K monthly listeners sudah bisa radar label atau booking agency.', 'Masuk chart Spotify Indonesia Top 50; kolaborasi dengan artis besar', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rilis lagu original pertama', NULL, 'Upload lagu original ke Spotify via DistroKid', NULL, 'Link Spotify', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '10.000 monthly listeners', NULL, 'Minimal 10.000 monthly listeners', NULL, 'Spotify for Artists', 2);

  -- FASE 3: Profesional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'musician', 3, 'Profesional', '22', NULL, 'Kontrak dengan label musik atau manajemen artis profesional; income dari musik > UMR', NULL, NULL, 'Menang AMI Awards; kolaborasi dengan musisi regional Asia', NULL, 3)
  RETURNING id INTO v_phase_id;

END $$;

-- Aktor / Aktris Film & Sinetron
-- benchmark: aktor-aktris-film-sinetron => template: actor
-- 2 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Membangun Kemampuan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'actor', 1, 'Membangun Kemampuan', '14', '18', 'Diterima di sanggar/kelas akting profesional ATAU dapat peran pertama (iklan/FTV/sinetron)', NULL, 'Banyak bintang film Indonesia mulai dari iklan atau sinetron. Sanggar: Titimangsa, SMA N 70.', 'Dapat peran utama film layar lebar sebelum 18', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Teknik akting dasar', NULL, '5 teknik: subtext, physicality, improvisasi, breaking scene, emotional memory', NULL, 'Penilaian instruktur', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Penampilan pertama di depan kamera', NULL, 'Monolog 3-5 menit direkam sebagai portofolio', NULL, 'Video', 2);

  -- FASE 2: Audisi & Peran
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'actor', 2, 'Audisi & Peran', '17', '22', 'Peran utama atau supporting role dalam film layar lebar atau web series platform streaming', NULL, 'Netflix Indonesia, WeTV, Vidio aktif casting. Ini jalur tercepat.', 'Nominasi atau menang FFI sebagai aktris/aktor muda', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Ikut minimal 10 audisi', NULL, 'Daftar casting call minimal 10 kali', NULL, 'Log audisi', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Peran berbayar pertama', NULL, 'Mendapat bayaran dari peran apapun', NULL, 'Kontrak/invoice', 2);

END $$;

-- Atlet Renang Profesional
-- benchmark: atlet-renang-profesional => template: swimmer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fondasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'swimmer', 1, 'Fondasi', '6', '10', 'Bergabung klub renang dan ikut perlombaan pertama', NULL, 'PRSI rekomendasikan mulai latihan terstruktur usia 6-8. Banyak atlet nasional mulai kompetisi usia 8-10.', 'Memecahkan rekor kelompok umur di level kota sebelum usia 10', NULL, 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai 4 gaya renang dasar', NULL, '25 meter teknik benar untuk semua gaya', NULL, 'Evaluasi pelatih', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Ikut lomba pertama', NULL, 'Tampil di minimal 1 perlombaan resmi', NULL, 'Sertifikat', 2);

  -- FASE 2: Kompetitif
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'swimmer', 2, 'Kompetitif', '10', '14', 'Meraih medali di kejuaraan renang tingkat nasional kelompok umur (Kejurnas KU)', NULL, 'Kejurnas Renang KU PRSI tahunan. 100m gaya bebas putra KU II: target < 65 detik.', 'Memecahkan rekor nasional KU; terpilih di Pelatda', NULL, 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Waktu standar nasional', NULL, 'Standar waktu PRSI untuk kelompok usia', NULL, 'Waktu lomba resmi', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Konsistensi latihan', NULL, 'Latihan minimal 5x/minggu selama 6 bulan', NULL, 'Log latihan', 2);

  -- FASE 3: Elite
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'swimmer', 3, 'Elite', '14', '18', 'Masuk Pelatnas PRSI atau mewakili Indonesia di event ASEAN/Asia', NULL, 'I Gede Siman Sudartawa masuk Pelatnas usia 15.', 'Qualify ke Asian Games atau menang SEA Games sebelum 18', NULL, 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Waktu internasional', NULL, 'A Standard FINA untuk 1 nomor spesialisasi', NULL, 'Waktu lomba resmi FINA', 1);

END $$;

-- Pemain Bola Basket Profesional
-- benchmark: basketball-player => template: basketball-player
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Pembentukan Fisik & Dasar
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'basketball-player', 1, 'Pembentukan Fisik & Dasar', '10', '14', 'Bergabung tim basket kompetitif dan kuasai teknik dasar', NULL, 'DBL Indonesia mulai rekrut pemain usia 10-14 tahun', 'Masuk tim sekolah tingkat nasional', 'Belum bergabung tim di usia 13+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai dribbling dasar', NULL, 'Crossover, behind-the-back, spin move konsisten 8/10', NULL, 'Drill dribbling 15 menit/hari + catat progres', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Shooting form yang benar', NULL, 'Free throw accuracy >60% jarak 4.6m', NULL, 'Shoot 50x free throw sehari, catat akurasi', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Defense & footwork', NULL, 'Defensive slide + stance konsisten dalam 5 menit', NULL, 'Drill defense shadow 10 menit, rekam video', 3);

  -- FASE 2: Kompetitif & Rekrutmen
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'basketball-player', 2, 'Kompetitif & Rekrutmen', '14', '17', 'Tembus tim nasional pelajar atau DBL', NULL, 'DBL All Star atau Pelatnas PERBASI adalah target utama', 'Top skor/rebounder di turnamen provinsi', 'Belum masuk DBL atau seleksi daerah di usia 16+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Performa konsisten di liga', NULL, 'Rata-rata >10 poin atau >5 asis per game dalam semusim', NULL, 'Cek statistik pertandingan resmi', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Berkembang di pelatnas', NULL, 'Terpilih dalam DBL All Star atau seleksi PERBASI', NULL, 'Konfirmasi dari pelatih tim', 2);

  -- FASE 3: Profesional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'basketball-player', 3, 'Profesional', '17', '22', 'Kontrak IBL atau tim profesional', NULL, 'IBL Indonesia adalah liga basket tertinggi di Indonesia', 'Debut IBL sebelum 20 tahun', 'Belum dipanggil IBL/tim pro di usia 21+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Debut di IBL', NULL, 'Main minimal 10 pertandingan IBL di musim pertama', NULL, 'Cek jadwal dan statistik IBL', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kontribusi tim', NULL, 'Main >1000 menit per musim atau rotasi utama', NULL, 'Statistik IBL resmi', 2);

END $$;

-- Fotografer Profesional
-- benchmark: photographer => template: photographer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar & Portofolio
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'photographer', 1, 'Belajar & Portofolio', '14', '18', 'Kuasai teknik dasar dan punya 20 foto berkualitas', NULL, '20 foto yang menunjukkan penguasaan exposure triangle', 'Punya 50 foto portfolio sebelum 16 tahun', 'Belum punya 10 foto portfolio di usia 16+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai exposure triangle', NULL, 'Bisa jelaskan ISO/aperture/shutter speed dan terapkan', NULL, 'Buat 3 foto dengan setting manual berbeda', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai Lightroom', NULL, 'Hasil edit konsisten dan bisa color grading dasar', NULL, 'Edit 10 foto dengan style konsisten', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portofolio 10 foto terbaik', NULL, '10 foto dengan komposisi dan lighting yang baik', NULL, 'Upload ke Behance/Instagram, minta feedback', 3);

  -- FASE 2: Klien Berbayar
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'photographer', 2, 'Klien Berbayar', '18', '23', '3 klien berbayar dan spesialisasi 1 genre', NULL, '3 klien berbayar dengan testimoni positive', 'Booking 2+ klien/bulan, pendapatan >3 juta/bulan', 'Belum punya klien berbayar di usia 21+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Spesialisasi 1 genre', NULL, 'Pilih 1 genre dan jadi ahli di bidang itu (wedding/portrait/product)', NULL, 'Portfolio 20 foto dengan 1 genre spesifik', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portfolio online profesional', NULL, 'Website/Instagram dengan 20+ karya terbaik', NULL, 'Buat website portfolio atau highlight Instagram', 2);

  -- FASE 3: Full-time Professional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'photographer', 3, 'Full-time Professional', '22', '30', 'Income stabil >10 juta/bulan dari fotografi', NULL, 'Fotografer pro full-time di Indonesia rata-rata revenue 10-25 juta/bulan', 'Punya studio sendiri atau kontrak tetap dengan media/brand', 'Revenue masih <5 juta/bulan di usia 26+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Studio atau kontrak tetap', NULL, 'Sewa studio atau kontrak dengan brand/media sebagai in-house photographer', NULL, 'Kontrak kerja sama', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Bisnis fotografi jalan', NULL, 'Revenue >10 juta/bulan konsisten selama 6 bulan', NULL, 'Catat income bulanan', 2);

END $$;

-- Graphic Designer Profesional
-- benchmark: graphic-designer => template: graphic-designer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar & Portofolio
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'graphic-designer', 1, 'Belajar & Portofolio', '14', '18', 'Kuasai tools dan selesaikan 5 project portofolio', NULL, 'Mahir Figma + Illustrator, 5 project selesai', 'Sertifikat desain dari course online', 'Belum punya 1 project portfolio di usia 16+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai Figma', NULL, 'Bisa buat UI design dan prototype interaktif', NULL, 'Upload 3 project UI ke Behance', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai Illustrator', NULL, 'Bisa buat vector illustration dan logo', NULL, 'Buat 5 vector karya orisinal', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '5 project portofolio', NULL, '5 project dengan case study di Behance/Dribbble', NULL, 'Upload portfolio dan minta feedback komunitas', 3);

  -- FASE 2: Karier & Klien
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'graphic-designer', 2, 'Karier & Klien', '18', '23', '3 klien berbayar dengan rate >1 juta/project', NULL, '3 klien berbayar dengan testimoni', '10 klien selesai, income >5 juta/bulan', 'Belum punya klien berbayar di usia 21+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '3 project berbayar', NULL, 'Selesaikan 3 project dengan klien real', NULL, 'Invoice dan testimoni klien', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Rate >1 juta/project', NULL, 'Rate desain minimal 1 juta per project', NULL, 'Catat rate per project', 2);

  -- FASE 3: Senior/Lead Designer
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'graphic-designer', 3, 'Senior/Lead Designer', '22', '35', 'Art Director di agency atau in-house brand', NULL, 'Art Director di agency ternama atau in-house brand besar', 'Punya tim desain, income >15 juta/bulan', 'Masih staff junior di usia 28+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Punya tim', NULL, 'Lead minimal 2 junior designer', NULL, 'Struktur tim resmi', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Influence di industri', NULL, 'Dikenal sebagai senior designer, pernah jadi keynote/juri', NULL, 'Portfolio diakui industri', 2);

END $$;

-- Data Scientist Profesional
-- benchmark: data-scientist => template: data-scientist
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fundamental Data
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'data-scientist', 1, 'Fundamental Data', '16', '20', 'Kuasai Python/SQL dan analisis dataset publik', NULL, 'Selesaikan kursus ML (Andrew Ng/fast.ai), analisis dataset publik', 'Top 30% di 1 kompetisi Kaggle', 'Belum bisa SQL/Python dasar di usia 18+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai Python untuk data', NULL, 'pandas, numpy, matplotlib, scikit-learn dasar', NULL, 'Buat 3 notebook EDA di GitHub', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai SQL', NULL, 'SELECT, JOIN, GROUP BY, subquery lancar', NULL, 'Selesaikan 50 soal SQL di HackerRank/LeetCode', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Project analisis dataset', NULL, 'Analisis 1 dataset publik dan publish insightnya', NULL, 'Upload notebook EDA ke GitHub + medium article', 3);

  -- FASE 2: Junior Data Professional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'data-scientist', 2, 'Junior Data Professional', '20', '24', 'Magang atau junior data analyst dengan gaji >8 juta', NULL, 'Top 30% Kaggle, bisa komunikasi insight ke stakeholder', 'Magang di perusahaan, bisa present insight ke non-tech', 'Belum punya pengalaman data di usia 22+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portfolio 3 ML project', NULL, 'Buat 3 end-to-end ML project dengan dokumentasi', NULL, 'Upload ke GitHub + blog post', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Koneksi industri', NULL, 'Ikut 2 kompetisi Kaggle, attend 3 meetup/conference', NULL, 'Kaggle profile, LinkedIn networking', 2);

  -- FASE 3: Senior Data Scientist
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'data-scientist', 3, 'Senior Data Scientist', '23', '35', 'Lead data team dengan gaji >20 juta/bulan', NULL, 'Lead data team atau jadi ML engineer senior', 'Publikasi riset, speak di conference', 'Masih posisi junior di usia 28+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lead tim atau proyek', NULL, 'Lead minimal 1 end-to-end ML project production', NULL, 'Project yang live di production', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Thought leadership', NULL, 'Publikasi 1 artikel/paper atau speak di 1 conference', NULL, 'Medium/arXiv paper, conference slide', 2);

END $$;

-- AI Specialist Profesional
-- benchmark: ai-specialist => template: ai-specialist
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fundamental AI/ML
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ai-specialist', 1, 'Fundamental AI/ML', '16', '20', 'Kuasai Python dan ML dasar dari course terstruktur', NULL, 'Selesaikan fast.ai atau Deep Learning Specialization Andrew Ng', 'Buat model klasifikasi sendiri, punya Hugging Face profile', 'Belum bisa train model ML di usia 18+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai ML fundamental', NULL, 'Linear regression, CNN, RNN, transformer basics', NULL, 'Train 3 model di Google Colab', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Project AI pertama', NULL, 'Buat model klasifikasi gambar/text dengan akurasi >80%', NULL, 'Upload ke Hugging Face Spaces', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kontribusi open source AI', NULL, 'Submit 1 PR ke project Hugging Face atau PyTorch', NULL, 'GitHub contribution', 3);

  -- FASE 2: AI Practitioner
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ai-specialist', 2, 'AI Practitioner', '20', '24', 'Deploy model di production dan kerja di perusahaan AI', NULL, 'Tanda tangan kontrak di perusahaan tech/AI', 'Model production yang dipakai >1000 user, gaji >15 juta/bulan', 'Belum punya pengalaman AI industry di usia 22+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Deploy model ke production', NULL, 'API endpoint + monitoring + retraining pipeline', NULL, 'Model serving di cloud (AWS/GCP/Azure)', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Contribution ke komunitas', NULL, 'Buat tutorial, github repo, atau artikel AI', NULL, 'Blog post, YouTube tutorial, atau conference talk', 2);

  -- FASE 3: Lead AI / Researcher
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'ai-specialist', 3, 'Lead AI / Researcher', '23', '35', 'Publish paper dan lead AI team', NULL, 'Publish paper di arXiv/conference, lead AI team', 'Paper di konferensi bereputasi, keynote speaker', 'Belum lead AI project di usia 28+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Publikasi riset', NULL, 'Submit paper ke arXiv atau konferensi AI (NeurIPS/ICML/ICLR)', NULL, 'Paper accepted', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lead AI team', NULL, 'Lead minimal 3 engineer AI, deliver product', NULL, 'Team structure + product delivered', 2);

END $$;

-- Social Media Manager Profesional
-- benchmark: social-media-manager => template: social-media-manager
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Fundamental Social Media
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'social-media-manager', 1, 'Fundamental Social Media', '16', '19', 'Kelola 1 akun dan bangun skill konten', NULL, '1.000 followers dari akun yang dikelola, engagement >3%', 'Posting konsisten 1 bulan penuh', 'Belum bisa maintain jadwal posting di usia 18+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai content creation', NULL, 'Bisa buat visual + caption + hashtag strategy yang engaging', NULL, 'Analisis engagement 1 bulan posting', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Understanding analytics', NULL, 'Paham reach, impressions, engagement rate, growth metrics', NULL, 'Buat 1 monthly report analitik', 2);

  -- FASE 2: Freelance SMM
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'social-media-manager', 2, 'Freelance SMM', '19', '24', '3 klien aktif dengan income >3 juta/bulan', NULL, '3 klien aktif yang retain minimal 3 bulan', 'Follower growth >20%/bulan, 1 campaign viral minor', 'Belum punya klien bayaran di usia 22+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Handle 3 klien sekaligus', NULL, 'Kelola 3 akun berbeda dengan content calendar masing-masing', NULL, 'Client retention >3 bulan', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Run ads campaign', NULL, 'Bisa setup dan optimasi ads di Meta/TikTok', NULL, 'ROAS >2x untuk campaign klien', 2);

  -- FASE 3: Senior SMM / Agency
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'social-media-manager', 3, 'Senior SMM / Agency', '23', '35', '10 klien atau revenue >50 juta/bulan', NULL, '10 klien aktif atau revenue agency >50 juta/bulan', 'Punya tim 3+ orang, dikenal di industri', 'Revenue masih <15 juta/bulan di usia 27+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Punya tim', NULL, 'Lead 3+ orang (content creator, ads specialist, admin)', NULL, 'Struktur tim resmi', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Thought leadership', NULL, 'Dikenal sebagai expert, jadi pembicara atau konten edukasi SMM', NULL, 'Speaking engagement, course, atau konten viral', 2);

END $$;

-- Event Organizer Profesional
-- benchmark: event-organizer => template: event-organizer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: EO Fundamentals
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'event-organizer', 1, 'EO Fundamentals', '17', '21', 'Bantu organize 3 event dan kuasai vendor management', NULL, 'Bantu 3 event dari awal sampai selesai', 'Punya SOP event sendiri, handle 5 vendor berbeda', 'Belum pernah terlibat dalam event official di usia 20+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai vendor management', NULL, 'Bisa koordinasi dengan catering, dekorasi, dokumentasi, sound system', NULL, 'Buat vendor database + kontak', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Punya SOP event', NULL, 'Buat timeline, rundown, budget sheet, dan evaluation form', NULL, 'Implementasikan SOP di 1 event', 2);

  -- FASE 2: EO Professional
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'event-organizer', 2, 'EO Professional', '21', '26', '20 event sukses dengan brand dikenal', NULL, '20 event sukses dengan testimoni klien, brand dikenal di niche tertentu', '3 sponsor tetap, booking 2+ event/bulan', 'Belum punya klien berbayar tetap di usia 24+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Handle event berbayar', NULL, 'Handle 5 event berbayar dengan klien yang puas', NULL, 'Testimoni klien + portfolio event', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Sponsor tetap', NULL, 'Dapat 3 sponsor yang rutin bekerja sama', NULL, 'MOU/contract sponsor', 2);

  -- FASE 3: EO Established
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'event-organizer', 3, 'EO Established', '25', '40', 'Omzet >500 juta/tahun dengan tim 10+', NULL, 'Omzet >500 juta/tahun, tim 10+ orang', 'Handle event nasional, punya venue atau alat sendiri', 'Omzet masih <100 juta/tahun di usia 30+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Handle event nasional', NULL, 'Lead event dengan peserta >1000 orang atau skala nasional', NULL, 'Event coverage + participant count', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Punya aset sendiri', NULL, 'Punya venue, alat sound system, atau lighting sendiri', NULL, 'Aset perusahaan', 2);

END $$;

-- Financial Planner Profesional
-- benchmark: financial-planner => template: financial-planner
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Sertifikasi & Dasar
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'financial-planner', 1, 'Sertifikasi & Dasar', '18', '22', 'Dapat sertifikat CFP atau AAJI', NULL, 'Sertifikat CFP atau AAJI diakui industri', 'Kuasai produk investasi/suransi, 5 klien simulasi', 'Belum punya sertifikat finansial di usia 21+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Sertifikasi profesional', NULL, 'Dapat minimal 1 sertifikasi (CFP/AAJI/WAPERD)', NULL, 'Sertifikat resmi', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai produk finansial', NULL, 'Paham reksadana, saham, obligasi, asuransi, dana pensiun', NULL, 'Buat laporan analisis 3 produk investasi', 2);

  -- FASE 2: Financial Advisor
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'financial-planner', 2, 'Financial Advisor', '22', '27', '10 klien aktif dengan AUM >1 miliar', NULL, '10 klien aktif yang retain minimal 6 bulan', 'Track record portofolio positif, income >8 juta/bulan', 'Belum punya 5 klien di usia 25+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Portofolio klien positif', NULL, 'Minimal 8 dari 10 klien punya return positif dalam setahun', NULL, 'Performance report portofolio', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Referral network', NULL, 'Dapat 3 klien baru dari referral dalam 6 bulan', NULL, 'Client referral tracking', 2);

  -- FASE 3: Pakar Keuangan
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'financial-planner', 3, 'Pakar Keuangan', '26', '40', '50 klien aktif dengan AUM >10 miliar', NULL, '50 klien aktif dengan AUM >10 miliar', 'Buku/podcast keuangan, income >20 juta/bulan', 'AUM masih <2 miliar di usia 30+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Punya buku atau podcast', NULL, 'Terbitkan buku finansial atau podcast rutin', NULL, 'Buku terbit/podcast episode >20', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Influence di industri', NULL, 'Jadi pembicara di seminar finansial, kolomis media', NULL, 'Speaking engagement + media coverage', 2);

END $$;

-- Apoteker Profesional
-- benchmark: pharmacist => template: pharmacist
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Pendidikan Farmasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pharmacist', 1, 'Pendidikan Farmasi', '16', '20', 'Masuk dan jalani S1 Farmasi dengan IPK >3.0', NULL, 'IPK minimal 3.0, lulus semua mata kuliah dasar farmasi', 'Nilai Kimia/Biologi/Farmasetika >85', 'IPK <2.5 atau tidak naik semester di usia 19+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Nilai akademik kuat', NULL, 'IPK >3.0 per semester dengan nilai >85 di Kimia, Biologi, Farmasetika', NULL, 'Transkrip nilai', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'PKL pertama', NULL, 'Lakukan Praktek Kerja Lapangan di apotek/industri', NULL, 'Laporan PKL + sertifikat', 2);

  -- FASE 2: Profesi Apoteker
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pharmacist', 2, 'Profesi Apoteker', '20', '23', 'Lulus Program Profesi Apoteker dan dapat STRA', NULL, 'Lulus OSCE Apoteker, STRA diterbitkan', 'Lulus S1 <4.5 tahun, lulus profesi <2 tahun', 'Belum lulus profesi di usia 24+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Lulus OSCE Apoteker', NULL, 'Lulus ujian kompetensi apoteker Indonesia', NULL, 'Sertifikat kompetensi', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'STRA + SIA aktif', NULL, 'STRA terbit, SIA aktif dan bisa praktik', NULL, 'STR + SIA dokumen', 2);

  -- FASE 3: Karier Farmasi
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'pharmacist', 3, 'Karier Farmasi', '23', '35', 'Posisi senior di apotek/industri/RS dengan income >10 juta', NULL, 'Posisi senior atau spesialis di bidang farmasi pilihan', 'Spesialisasi klinis/industri/regulasi', 'Masih entry level di usia 28+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Spesialisasi', NULL, 'Ambil sertifikasi tambahan (klinis/industri/regulasi)', NULL, 'Sertifikat spesialisasi', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Leadership', NULL, 'Lead tim farmasi minimal 3 orang', NULL, 'Struktur organisasi', 2);

END $$;

-- Fashion Designer Profesional
-- benchmark: fashion-designer => template: fashion-designer
-- 3 phases

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

  -- FASE 1: Belajar & Koleksi Pertama
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'fashion-designer','football-player', 1, 'Belajar & Koleksi Pertama', '15', '19', 'Kuasai pola dasar dan selesaikan 5 desain', NULL, 'Kuasai pola dasar, teknik menjahit, dan selesaikan 5 desain', 'Portofolio 10 desain, tampil di 1 fashion show lokal', 'Belum punya 1 desain jadi di usia 18+', 1)
  RETURNING id INTO v_phase_id;

  -- SW 1.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kuasai pola dasar', NULL, 'Bisa buat pola dasar badan (blouse, skirt, pants) dengan benar', NULL, 'Hasil pola yang siap potong', 1);

  -- SW 1.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, '5 desain selesai', NULL, 'Selesaikan 5 look dari sketsa sampai jadi', NULL, 'Foto portfolio 5 look', 2);

  -- SW 1.3
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Fashion show pertama', NULL, 'Tampil di 1 fashion show lokal atau sekolah', NULL, 'Video/documentation fashion show', 3);

  -- FASE 2: Produk & Brand
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'fashion-designer','football-player', 2, 'Produk & Brand', '19', '25', 'Produk terjual dengan revenue >5 juta/bulan', NULL, 'Brand dikenal, revenue >5 juta/bulan, media coverage', '50+ pcs terjual, kolaborasi dengan 1 brand lain', 'Belum ada penjualan produk di usia 23+', 2)
  RETURNING id INTO v_phase_id;

  -- SW 2.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Produksi massal pertama', NULL, 'Produksi minimal 50 pcs 1 desain dan terjual', NULL, 'Laporan penjualan', 1);

  -- SW 2.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Kolaborasi brand', NULL, 'Kolaborasi dengan 1 brand/influencer lain', NULL, 'Dokumentasi kolaborasi', 2);

  -- FASE 3: Brand Established
  INSERT INTO dream_phases (
    dream_template_slug, phase_number, phase_name,
    age_min, age_max,
    big_win_title, big_win_description,
    industry_benchmark, over_achievement, behind_schedule_signal,
    sort_order
  ) VALUES (
    'fashion-designer','football-player', 3, 'Brand Established', '24', '40', 'Revenue >50 juta/bulan dan ekspor', NULL, 'Brand established dengan revenue >50 juta/bulan', 'Hadir di Indonesia Fashion Week, punya tim 5+', 'Revenue masih <10 juta/bulan di usia 28+', 3)
  RETURNING id INTO v_phase_id;

  -- SW 3.1
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Indonesia Fashion Week', NULL, 'Tampil di IFW atau fashion week resmi lainnya', NULL, 'Official IFW participation', 1);

  -- SW 3.2
  INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
  VALUES (v_phase_id, 'Ekspor', NULL, 'Produk tembus pasar luar negeri (ASEAN atau lebih)', NULL, 'Invoice ekspor', 2);

END $$;

-- Total: 83 phases, 172 small_wins

-- ═══════════════════════════════════════════════════════════════════════════════
-- Football Player — phases (recovered from 00019, lost by 00021 TRUNCATE CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

INSERT INTO dream_phases (dream_template_slug, phase_number, phase_name, age_min, age_max, big_win_title, big_win_description, industry_benchmark, over_achievement, behind_schedule_signal, sort_order)
VALUES ('football-player', 1, 'Fondasi', 8, 12, 'Bergabung dan aktif di SSB atau akademi junior lokal', 'Mulai latihan terstruktur di Sekolah Sepak Bola (SSB) atau akademi usia muda.', 'Di usia 12, pemain berbakat di Indonesia sudah aktif di SSB minimal 2 tahun (PSSI Grassroots Program).', 'Terpilih di seleksi tim daerah (POPDA/O2SN) sebelum 12', 'Belum punya tim/SSB di usia 11+', 1)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Kuasai teknik dasar bola', 'Jugling, passing, kontrol bola dasar', '50 jugling berturut-turut, passing akurasi 7/10 jarak 10m', NULL, 'Hitung sendiri dan catat video', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Stamina dasar', 'Daya tahan lari', 'Lari 1.2km tanpa berhenti (Cooper Test >1.600m/12 menit)', NULL, 'Test Cooper di lapangan', 2);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Ikut pertandingan resmi pertama', 'Pengalaman bertanding resmi', 'Minimal 5 pertandingan resmi dalam setahun', 'pertandingan', 'Catat nama kompetisi dan tanggal', 3);

INSERT INTO dream_phases (dream_template_slug, phase_number, phase_name, age_min, age_max, big_win_title, big_win_description, industry_benchmark, over_achievement, behind_schedule_signal, sort_order)
VALUES ('football-player', 2, 'Pengembangan', 12, 15, 'Masuk akademi resmi klub Liga atau tim daerah kompetitif', 'Bergabung dengan akademi resmi klub Liga 1/Liga 2 yang terstruktur.', 'Akademi Liga 1 rekrut pemain U-13 dan U-15. Di usia 14, pemain top sudah di akademi top.', 'Dipanggil seleksi timnas U-14 atau U-15 PSSI', 'Di usia 15 belum pernah ikut seleksi akademi manapun', 2)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'VO2 Max standar', 'Kapasitas aerobik', '46-48 ml/kg/min', 'ml/kg/min', 'Beep Test 20m shuttle run', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Sprint 30m', 'Kecepatan sprint', '< 5.0 detik', 'detik', 'Stopwatch, 3 percobaan', 2);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Akurasi passing', 'Passing jarak 15-20m', '75% akurasi (15 dari 20 umpan)', '%', 'Latihan dengan rekan', 3);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Kompetisi regional', 'Tampil di kompetisi tingkat daerah', 'Minimal 1 kompetisi kabupaten/kota', 'kompetisi', 'Nama turnamen + dokumentasi', 4);

INSERT INTO dream_phases (dream_template_slug, phase_number, phase_name, age_min, age_max, big_win_title, big_win_description, industry_benchmark, over_achievement, behind_schedule_signal, sort_order)
VALUES ('football-player', 3, 'Elite Junior', 15, 17, 'Bergabung tim Elite Pro U-17/U-18 atau mewakili provinsi di tingkat nasional', 'Masuk jenjang tertinggi akademi Indonesia.', 'Liga 1 Elite Pro Academy (EPA) adalah jenjang tertinggi akademi Indonesia.', 'Dipanggil timnas U-16/U-17 PSSI; Garuda Select', 'Di usia 17 belum pernah tampil di kompetisi resmi', 3)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'VO2 Max elite junior', 'Level elite', '52-55 ml/kg/min', 'ml/kg/min', 'Beep Test level 10+', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Konsistensi performa', 'Jumlah pertandingan resmi', 'Minimal 15 pertandingan resmi per musim', 'pertandingan', 'Log pertandingan', 2);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Keunggulan teknis terukur', 'Spesialisasi posisi', 'Kiper: clean sheet >40%; Striker: 1 gol/3 match; Bek: aerial duel >60%', NULL, 'Statistik pertandingan resmi', 3);

INSERT INTO dream_phases (dream_template_slug, phase_number, phase_name, age_min, age_max, big_win_title, big_win_description, industry_benchmark, over_achievement, behind_schedule_signal, sort_order)
VALUES ('football-player', 4, 'Kontrak Pro Pertama', 18, 21, 'Menandatangani kontrak profesional pertama dengan klub Liga 1, Liga 2, atau Liga 3', 'Transisi dari junior ke profesional dengan kontrak resmi.', 'Rata-rata pemain Indonesia kontrak pro pertama usia 19-21.', 'Kontrak pro sebelum 18; langsung di Liga 1', 'Di usia 22 belum pernah dapat tawaran kontrak', 4)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Debut tim senior', 'Masuk skuad senior', 'Masuk skuad minimal 5 pertandingan resmi', 'pertandingan', 'Dokumentasi match sheet', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Fisik setara standar pro', 'Kondisi fisik profesional', 'VO2Max >58; sprint 30m <4.5 detik', NULL, 'Tes fisik resmi', 2);

INSERT INTO dream_phases (dream_template_slug, phase_number, phase_name, age_min, age_max, big_win_title, big_win_description, industry_benchmark, over_achievement, behind_schedule_signal, sort_order)
VALUES ('football-player', 5, 'Karier Profesional', 21, 35, 'Debut resmi di Liga 1 Indonesia / kontrak internasional', 'Puncak karir — bermain di liga tertinggi Indonesia.', 'Puncak karir pemain sepak bola profesional.', 'Dipanggil timnas senior sebelum 22; kontrak luar negeri', 'Di usia 25 belum pernah masuk skuad Liga 1', 5)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Debut Liga 1', 'Penampilan pertama', 'Debut resmi di Liga 1 Indonesia', NULL, 'Match sheet resmi', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Menit bermain konsisten', 'Waktu bermain reguler', 'Akumulasi >500 menit bermain per musim', 'menit', 'Statistik resmi Liga 1', 2);

END $$;

-- Verifikasi akhir
SELECT dream_template_slug, COUNT(*) as phase_count FROM dream_phases GROUP BY dream_template_slug ORDER BY dream_template_slug;
SELECT COUNT(*) as total_phases FROM dream_phases;
SELECT COUNT(*) as total_small_wins FROM small_win_templates;
