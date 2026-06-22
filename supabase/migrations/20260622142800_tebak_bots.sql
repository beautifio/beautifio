-- Migration: Add bot support for Tebak Aku game
-- Adds bot columns to users table, seeds 100 bot accounts

-- 1. Add bot columns to public.users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_games INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_losses INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bot_win_rate INTEGER
  CHECK (bot_win_rate IS NULL OR (bot_win_rate >= 0 AND bot_win_rate <= 100));

-- 2. RLS: allow reading bot users (needed for leaderboard)
DROP POLICY IF EXISTS "Anyone can read bot profiles" ON users;
CREATE POLICY "Anyone can read bot profiles"
  ON users FOR SELECT
  USING (is_bot = true OR auth.uid() = id);

-- 3. Bypass triggers and FK constraints to insert bot users
SET session_replication_role = replica;

-- 3a. Insert 100 bot users (10 per win-rate tier)
INSERT INTO users (id, email, full_name, avatar_url, bio, is_bot, bot_win_rate) VALUES

-- Tier 10% win rate
('a0000000-0000-0000-0000-000000000001', 'bot-001@beautifio-bot.local', 'Budi Santoso',   'https://api.dicebear.com/7.x/initials/svg?seed=BS', 'Suka kopi dan jalan-jalan', true, 10),
('a0000000-0000-0000-0000-000000000002', 'bot-002@beautifio-bot.local', 'Sari Wijaya',    'https://api.dicebear.com/7.x/initials/svg?seed=SW', 'Hobi baca novel dan masak', true, 10),
('a0000000-0000-0000-0000-000000000003', 'bot-003@beautifio-bot.local', 'Dewi Kusuma',    'https://api.dicebear.com/7.x/initials/svg?seed=DK', 'Mahasiswi semester akhir', true, 10),
('a0000000-0000-0000-0000-000000000004', 'bot-004@beautifio-bot.local', 'Agus Pratama',   'https://api.dicebear.com/7.x/initials/svg?seed=AP', 'Freelancer web developer', true, 10),
('a0000000-0000-0000-0000-000000000005', 'bot-005@beautifio-bot.local', 'Rina Nugroho',   'https://api.dicebear.com/7.x/initials/svg?seed=RN', 'Guru SD di kota kecil', true, 10),
('a0000000-0000-0000-0000-000000000006', 'bot-006@beautifio-bot.local', 'Adi Wibowo',     'https://api.dicebear.com/7.x/initials/svg?seed=AW', 'Karyawan swasta', true, 10),
('a0000000-0000-0000-0000-000000000007', 'bot-007@beautifio-bot.local', 'Maya Suryana',   'https://api.dicebear.com/7.x/initials/svg?seed=MS', 'Ibu rumah tangga, suka berkebun', true, 10),
('a0000000-0000-0000-0000-000000000008', 'bot-008@beautifio-bot.local', 'Eko Saputra',    'https://api.dicebear.com/7.x/initials/svg?seed=ES', 'Mahasiswa teknik informatika', true, 10),
('a0000000-0000-0000-0000-000000000009', 'bot-009@beautifio-bot.local', 'Ratna Handayani','https://api.dicebear.com/7.x/initials/svg?seed=RH', 'Kerja di startup edtech', true, 10),
('a0000000-0000-0000-0000-00000000000a', 'bot-010@beautifio-bot.local', 'Andi Gunawan',   'https://api.dicebear.com/7.x/initials/svg?seed=AG', 'Suka main game dan ngoding', true, 10),

-- Tier 20% win rate
('a0000000-0000-0000-0000-00000000000b', 'bot-011@beautifio-bot.local', 'Dewi Lestari',   'https://api.dicebear.com/7.x/initials/svg?seed=DL', 'Content creator pemula', true, 20),
('a0000000-0000-0000-0000-00000000000c', 'bot-012@beautifio-bot.local', 'Candra Hartono', 'https://api.dicebear.com/7.x/initials/svg?seed=CH', 'Desainer grafis freelance', true, 20),
('a0000000-0000-0000-0000-00000000000d', 'bot-013@beautifio-bot.local', 'Irma Setiawan',  'https://api.dicebear.com/7.x/initials/svg?seed=IS', 'Psikolog muda', true, 20),
('a0000000-0000-0000-0000-00000000000e', 'bot-014@beautifio-bot.local', 'Yoga Susanto',   'https://api.dicebear.com/7.x/initials/svg?seed=YS', 'Atlet e-sports', true, 20),
('a0000000-0000-0000-0000-00000000000f', 'bot-015@beautifio-bot.local', 'Dita Pertiwi',   'https://api.dicebear.com/7.x/initials/svg?seed=DP', 'Penulis lepas', true, 20),
('a0000000-0000-0000-0000-000000000010', 'bot-016@beautifio-bot.local', 'Ari Wulandari',  'https://api.dicebear.com/7.x/initials/svg?seed=AW2', 'Data analyst junior', true, 20),
('a0000000-0000-0000-0000-000000000011', 'bot-017@beautifio-bot.local', 'Rini Wahyuni',   'https://api.dicebear.com/7.x/initials/svg?seed=RW', 'Suka traveling dan foto', true, 20),
('a0000000-0000-0000-0000-000000000012', 'bot-018@beautifio-bot.local', 'Bayu Anggraini', 'https://api.dicebear.com/7.x/initials/svg?seed=BA', 'Mahasiswa kedokteran', true, 20),
('a0000000-0000-0000-0000-000000000013', 'bot-019@beautifio-bot.local', 'Desi Fitriani',  'https://api.dicebear.com/7.x/initials/svg?seed=DF', 'Guru les privat', true, 20),
('a0000000-0000-0000-0000-000000000014', 'bot-020@beautifio-bot.local', 'Fajar Pratiwi',  'https://api.dicebear.com/7.x/initials/svg?seed=FP', 'Barista di coffee shop', true, 20),

-- Tier 30% win rate
('a0000000-0000-0000-0000-000000000015', 'bot-021@beautifio-bot.local', 'Nita Rachmawati','https://api.dicebear.com/7.x/initials/svg?seed=NR', 'Social media specialist', true, 30),
('a0000000-0000-0000-0000-000000000016', 'bot-022@beautifio-bot.local', 'Guntur Purnomo', 'https://api.dicebear.com/7.x/initials/svg?seed=GP', 'Tukang bakso keliling', true, 30),
('a0000000-0000-0000-0000-000000000017', 'bot-023@beautifio-bot.local', 'Kartika Dewi',   'https://api.dicebear.com/7.x/initials/svg?seed=KD', 'Perawat di RS daerah', true, 30),
('a0000000-0000-0000-0000-000000000018', 'bot-024@beautifio-bot.local', 'Dimas Prakoso',  'https://api.dicebear.com/7.x/initials/svg?seed=DP2', 'Fullstack developer', true, 30),
('a0000000-0000-0000-0000-000000000019', 'bot-025@beautifio-bot.local', 'Permata Sari',   'https://api.dicebear.com/7.x/initials/svg?seed=PS', 'Pengusaha kue online', true, 30),
('a0000000-0000-0000-0000-00000000001a', 'bot-026@beautifio-bot.local', 'Hendra Saputra', 'https://api.dicebear.com/7.x/initials/svg?seed=HS', 'Driver ojol', true, 30),
('a0000000-0000-0000-0000-00000000001b', 'bot-027@beautifio-bot.local', 'Intan Rahayu',   'https://api.dicebear.com/7.x/initials/svg?seed=IR', 'Mahasiswi hukum', true, 30),
('a0000000-0000-0000-0000-00000000001c', 'bot-028@beautifio-bot.local', 'Joko Utami',     'https://api.dicebear.com/7.x/initials/svg?seed=JU', 'Petani milenial', true, 30),
('a0000000-0000-0000-0000-00000000001d', 'bot-029@beautifio-bot.local', 'Kusuma Yulianti','https://api.dicebear.com/7.x/initials/svg?seed=KY', 'Arsitek lanskap', true, 30),
('a0000000-0000-0000-0000-00000000001e', 'bot-030@beautifio-bot.local', 'Laras Hasanah',  'https://api.dicebear.com/7.x/initials/svg?seed=LH', 'Resepsionis hotel', true, 30),

-- Tier 40% win rate
('a0000000-0000-0000-0000-00000000001f', 'bot-031@beautifio-bot.local', 'Eko Prasetyo',   'https://api.dicebear.com/7.x/initials/svg?seed=EP', 'UI/UX designer', true, 40),
('a0000000-0000-0000-0000-000000000020', 'bot-032@beautifio-bot.local', 'Wati Susanti',   'https://api.dicebear.com/7.x/initials/svg?seed=WS', 'Apoteker', true, 40),
('a0000000-0000-0000-0000-000000000021', 'bot-033@beautifio-bot.local', 'Sigit Pambudi',  'https://api.dicebear.com/7.x/initials/svg?seed=SP', 'Teknisi jaringan', true, 40),
('a0000000-0000-0000-0000-000000000022', 'bot-034@beautifio-bot.local', 'Damayanti Putri','https://api.dicebear.com/7.x/initials/svg?seed=DP3', 'Dosen muda', true, 40),
('a0000000-0000-0000-0000-000000000023', 'bot-035@beautifio-bot.local', 'Rizky Hidayat',  'https://api.dicebear.com/7.x/initials/svg?seed=RH2', 'Product manager', true, 40),
('a0000000-0000-0000-0000-000000000024', 'bot-036@beautifio-bot.local', 'Nadia Safitri',  'https://api.dicebear.com/7.x/initials/svg?seed=NS', 'Ilustrator freelance', true, 40),
('a0000000-0000-0000-0000-000000000025', 'bot-037@beautifio-bot.local', 'Reza Firmansyah','https://api.dicebear.com/7.x/initials/svg?seed=RF', 'Content writer', true, 40),
('a0000000-0000-0000-0000-000000000026', 'bot-038@beautifio-bot.local', 'Tika Puspita',   'https://api.dicebear.com/7.x/initials/svg?seed=TP', 'Sekretaris perusahaan', true, 40),
('a0000000-0000-0000-0000-000000000027', 'bot-039@beautifio-bot.local', 'Gilang Permana', 'https://api.dicebear.com/7.x/initials/svg?seed=GP2', 'Copywriter iklan', true, 40),
('a0000000-0000-0000-0000-000000000028', 'bot-040@beautifio-bot.local', 'Vina Amalia',    'https://api.dicebear.com/7.x/initials/svg?seed=VA', 'Customer service', true, 40),

-- Tier 50% win rate
('a0000000-0000-0000-0000-000000000029', 'bot-041@beautifio-bot.local', 'Doni Lesmana',   'https://api.dicebear.com/7.x/initials/svg?seed=DL2', 'Sales executive', true, 50),
('a0000000-0000-0000-0000-00000000002a', 'bot-042@beautifio-bot.local', 'Ayu Lestari',    'https://api.dicebear.com/7.x/initials/svg?seed=AL', 'Fotografer wedding', true, 50),
('a0000000-0000-0000-0000-00000000002b', 'bot-043@beautifio-bot.local', 'Cecep Gunawan',  'https://api.dicebear.com/7.x/initials/svg?seed=CG', 'Montir bengkel', true, 50),
('a0000000-0000-0000-0000-00000000002c', 'bot-044@beautifio-bot.local', 'Fitriani Dewi',  'https://api.dicebear.com/7.x/initials/svg?seed=FD', 'Makeup artist', true, 50),
('a0000000-0000-0000-0000-00000000002d', 'bot-045@beautifio-bot.local', 'Dani Kurniawan', 'https://api.dicebear.com/7.x/initials/svg?seed=DK2', 'Traveller dan blogger', true, 50),
('a0000000-0000-0000-0000-00000000002e', 'bot-046@beautifio-bot.local', 'Tina Marlina',   'https://api.dicebear.com/7.x/initials/svg?seed=TM', 'Pustakawan', true, 50),
('a0000000-0000-0000-0000-00000000002f', 'bot-047@beautifio-bot.local', 'Fikri Maulana',  'https://api.dicebear.com/7.x/initials/svg?seed=FM', 'Game developer indie', true, 50),
('a0000000-0000-0000-0000-000000000030', 'bot-048@beautifio-bot.local', 'Rani Siregar',   'https://api.dicebear.com/7.x/initials/svg?seed=RS', 'Aktivis lingkungan', true, 50),
('a0000000-0000-0000-0000-000000000031', 'bot-049@beautifio-bot.local', 'Haris Nasution', 'https://api.dicebear.com/7.x/initials/svg?seed=HN', 'Kepala cabang bank', true, 50),
('a0000000-0000-0000-0000-000000000032', 'bot-050@beautifio-bot.local', 'Mega Simbolon',  'https://api.dicebear.com/7.x/initials/svg?seed=MS2', 'Pengacara', true, 50),

-- Tier 60% win rate
('a0000000-0000-0000-0000-000000000033', 'bot-051@beautifio-bot.local', 'Irfan Situmorang','https://api.dicebear.com/7.x/initials/svg?seed=IS2', 'Entrepreneur muda', true, 60),
('a0000000-0000-0000-0000-000000000034', 'bot-052@beautifio-bot.local', 'Lina Hutapea',   'https://api.dicebear.com/7.x/initials/svg?seed=LH2', 'Dokter umum', true, 60),
('a0000000-0000-0000-0000-000000000035', 'bot-053@beautifio-bot.local', 'Jati Sinaga',    'https://api.dicebear.com/7.x/initials/svg?seed=JS', 'DevOps engineer', true, 60),
('a0000000-0000-0000-0000-000000000036', 'bot-054@beautifio-bot.local', 'Dian Sihombing', 'https://api.dicebear.com/7.x/initials/svg?seed=DS', 'HR manager', true, 60),
('a0000000-0000-0000-0000-000000000037', 'bot-055@beautifio-bot.local', 'Krisna Rajagukguk','https://api.dicebear.com/7.x/initials/svg?seed=KR', 'Data scientist', true, 60),
('a0000000-0000-0000-0000-000000000038', 'bot-056@beautifio-bot.local', 'Puri Manurung',  'https://api.dicebear.com/7.x/initials/svg?seed=PM', 'Marketing manager', true, 60),
('a0000000-0000-0000-0000-000000000039', 'bot-057@beautifio-bot.local', 'Galih Prakoso',  'https://api.dicebear.com/7.x/initials/svg?seed=GP3', 'Software architect', true, 60),
('a0000000-0000-0000-0000-00000000003a', 'bot-058@beautifio-bot.local', 'Nia Anggraeni',  'https://api.dicebear.com/7.x/initials/svg?seed=NA', 'Bidan desa', true, 60),
('a0000000-0000-0000-0000-00000000003b', 'bot-059@beautifio-bot.local', 'Edi Supriyadi',  'https://api.dicebear.com/7.x/initials/svg?seed=ES2', 'Polisi lalu lintas', true, 60),
('a0000000-0000-0000-0000-00000000003c', 'bot-060@beautifio-bot.local', 'Yanti Kuswandari','https://api.dicebear.com/7.x/initials/svg?seed=YK', 'Kepala sekolah', true, 60),

-- Tier 70% win rate
('a0000000-0000-0000-0000-00000000003d', 'bot-061@beautifio-bot.local', 'Rudi Hermawan',  'https://api.dicebear.com/7.x/initials/svg?seed=RH3', 'Manager IT', true, 70),
('a0000000-0000-0000-0000-00000000003e', 'bot-062@beautifio-bot.local', 'Sinta Nurhayati','https://api.dicebear.com/7.x/initials/svg?seed=SN', 'Akuntan publik', true, 70),
('a0000000-0000-0000-0000-00000000003f', 'bot-063@beautifio-bot.local', 'Bambang Subagio','https://api.dicebear.com/7.x/initials/svg?seed=BS2', 'PNS kementerian', true, 70),
('a0000000-0000-0000-0000-000000000040', 'bot-064@beautifio-bot.local', 'Winda Permatasari','https://api.dicebear.com/7.x/initials/svg?seed=WP', 'Jurnalis tv', true, 70),
('a0000000-0000-0000-0000-000000000041', 'bot-065@beautifio-bot.local', 'Agung Laksono',  'https://api.dicebear.com/7.x/initials/svg?seed=AL2', 'Pilot maskapai', true, 70),
('a0000000-0000-0000-0000-000000000042', 'bot-066@beautifio-bot.local', 'Citra Maharani', 'https://api.dicebear.com/7.x/initials/svg?seed=CM', 'Curator museum', true, 70),
('a0000000-0000-0000-0000-000000000043', 'bot-067@beautifio-bot.local', 'Herman Setiadi', 'https://api.dicebear.com/7.x/initials/svg?seed=HS2', 'CEO startup', true, 70),
('a0000000-0000-0000-0000-000000000044', 'bot-068@beautifio-bot.local', 'Farah Azzahra',  'https://api.dicebear.com/7.x/initials/svg?seed=FA', 'Peneliti biologi', true, 70),
('a0000000-0000-0000-0000-000000000045', 'bot-069@beautifio-bot.local', 'Tomi Suhendar',  'https://api.dicebear.com/7.x/initials/svg?seed=TS', 'Koki profesional', true, 70),
('a0000000-0000-0000-0000-000000000046', 'bot-070@beautifio-bot.local', 'Lilis Sulistiani','https://api.dicebear.com/7.x/initials/svg?seed=LS', 'Pelatih vokal', true, 70),

-- Tier 80% win rate
('a0000000-0000-0000-0000-000000000047', 'bot-071@beautifio-bot.local', 'Asep Saepudin',  'https://api.dicebear.com/7.x/initials/svg?seed=AS', 'Kepala desa', true, 80),
('a0000000-0000-0000-0000-000000000048', 'bot-072@beautifio-bot.local', 'Neng Siti Fatimah','https://api.dicebear.com/7.x/initials/svg?seed=NSF', 'Pemilik butik', true, 80),
('a0000000-0000-0000-0000-000000000049', 'bot-073@beautifio-bot.local', 'Ujang Komarudin','https://api.dicebear.com/7.x/initials/svg?seed=UK', 'Pengusaha properti', true, 80),
('a0000000-0000-0000-0000-00000000004a', 'bot-074@beautifio-bot.local', 'Ai Nuraeni',     'https://api.dicebear.com/7.x/initials/svg?seed=AN', 'Kepala BPS daerah', true, 80),
('a0000000-0000-0000-0000-00000000004b', 'bot-075@beautifio-bot.local', 'Deni Mulyana',   'https://api.dicebear.com/7.x/initials/svg?seed=DM', 'System analyst', true, 80),
('a0000000-0000-0000-0000-00000000004c', 'bot-076@beautifio-bot.local', 'Tari Puspitasari','https://api.dicebear.com/7.x/initials/svg?seed=TP2', 'Penari tradisional', true, 80),
('a0000000-0000-0000-0000-00000000004d', 'bot-077@beautifio-bot.local', 'Roni Setiawan',  'https://api.dicebear.com/7.x/initials/svg?seed=RS2', 'Security engineer', true, 80),
('a0000000-0000-0000-0000-00000000004e', 'bot-078@beautifio-bot.local', 'Mila Karmila',   'https://api.dicebear.com/7.x/initials/svg?seed=MK', 'Komisaris perusahaan', true, 80),
('a0000000-0000-0000-0000-00000000004f', 'bot-079@beautifio-bot.local', 'Indra Lesmana',  'https://api.dicebear.com/7.x/initials/svg?seed=IL', 'Musisi jazz', true, 80),
('a0000000-0000-0000-0000-000000000050', 'bot-080@beautifio-bot.local', 'Karina Andriani','https://api.dicebear.com/7.x/initials/svg?seed=KA', 'VP of engineering', true, 80),

-- Tier 90% win rate
('a0000000-0000-0000-0000-000000000051', 'bot-081@beautifio-bot.local', 'Dodi Firmansyah','https://api.dicebear.com/7.x/initials/svg?seed=DF2', 'C-level executive', true, 90),
('a0000000-0000-0000-0000-000000000052', 'bot-082@beautifio-bot.local', 'Risma Ambarsari','https://api.dicebear.com/7.x/initials/svg?seed=RA', 'Dosen psikologi', true, 90),
('a0000000-0000-0000-0000-000000000053', 'bot-083@beautifio-bot.local', 'Dedy Kurniadi',  'https://api.dicebear.com/7.x/initials/svg?seed=DK3', 'CTO fintech', true, 90),
('a0000000-0000-0000-0000-000000000054', 'bot-084@beautifio-bot.local', 'Putri Ayu',      'https://api.dicebear.com/7.x/initials/svg?seed=PA', 'Professional speaker', true, 90),
('a0000000-0000-0000-0000-000000000055', 'bot-085@beautifio-bot.local', 'Hendra Wijaya',  'https://api.dicebear.com/7.x/initials/svg?seed=HW', 'VP product', true, 90),
('a0000000-0000-0000-0000-000000000056', 'bot-086@beautifio-bot.local', 'Nurul Hidayah',  'https://api.dicebear.com/7.x/initials/svg?seed=NH', 'Chief marketing officer', true, 90),
('a0000000-0000-0000-0000-000000000057', 'bot-087@beautifio-bot.local', 'Rahmat Hidayat', 'https://api.dicebear.com/7.x/initials/svg?seed=RH4', 'Direktur operasional', true, 90),
('a0000000-0000-0000-0000-000000000058', 'bot-088@beautifio-bot.local', 'Nina Zulaeha',   'https://api.dicebear.com/7.x/initials/svg?seed=NZ', 'Partner consultant', true, 90),
('a0000000-0000-0000-0000-000000000059', 'bot-089@beautifio-bot.local', 'Anton Suparman', 'https://api.dicebear.com/7.x/initials/svg?seed=AS2', 'Professor AI research', true, 90),
('a0000000-0000-0000-0000-00000000005a', 'bot-090@beautifio-bot.local', 'Sari Purnama',   'https://api.dicebear.com/7.x/initials/svg?seed=SP2', 'CEO unicorn', true, 90),

-- Tier 99% win rate
('a0000000-0000-0000-0000-00000000005b', 'bot-091@beautifio-bot.local', 'Prof Budiman',   'https://api.dicebear.com/7.x/initials/svg?seed=PB', 'Jenius psikologi manusia', true, 99),
('a0000000-0000-0000-0000-00000000005c', 'bot-092@beautifio-bot.local', 'Maya Anggraini', 'https://api.dicebear.com/7.x/initials/svg?seed=MA', 'Master of mind games', true, 99),
('a0000000-0000-0000-0000-00000000005d', 'bot-093@beautifio-bot.local', 'Surya Darma',    'https://api.dicebear.com/7.x/initials/svg?seed=SD', 'Ahli baca pikiran', true, 99),
('a0000000-0000-0000-0000-00000000005e', 'bot-094@beautifio-bot.local', 'Dewi Sartika',   'https://api.dicebear.com/7.x/initials/svg?seed=DS2', 'Telepath pro', true, 99),
('a0000000-0000-0000-0000-00000000005f', 'bot-095@beautifio-bot.local', 'Arief Wirawan',  'https://api.dicebear.com/7.x/initials/svg?seed=AW3', 'Grandmaster tebakan', true, 99),
('a0000000-0000-0000-0000-000000000060', 'bot-096@beautifio-bot.local', 'Ratu Intan',     'https://api.dicebear.com/7.x/initials/svg?seed=RI', 'Ratu tebak-tebakan', true, 99),
('a0000000-0000-0000-0000-000000000061', 'bot-097@beautifio-bot.local', 'Teguh Prasetyo', 'https://api.dicebear.com/7.x/initials/svg?seed=TP3', 'Legenda Tebak Aku', true, 99),
('a0000000-0000-0000-0000-000000000062', 'bot-098@beautifio-bot.local', 'Rara Kirana',    'https://api.dicebear.com/7.x/initials/svg?seed=RK', 'Empath ulung', true, 99),
('a0000000-0000-0000-0000-000000000063', 'bot-099@beautifio-bot.local', 'Zaky Nugraha',   'https://api.dicebear.com/7.x/initials/svg?seed=ZN', 'The undefeated', true, 99),
('a0000000-0000-0000-0000-000000000064', 'bot-100@beautifio-bot.local', 'Cantika Asmara', 'https://api.dicebear.com/7.x/initials/svg?seed=CA', 'Champion sejati', true, 99);

SET session_replication_role = origin;

-- 4. Create function to update bot stats after game finishes
CREATE OR REPLACE FUNCTION update_bot_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    -- Update player_a stats
    IF (SELECT is_bot FROM users WHERE id = NEW.player_a_id) THEN
      IF NEW.score_a > NEW.score_b THEN
        UPDATE users SET total_games = total_games + 1, total_wins = total_wins + 1 WHERE id = NEW.player_a_id;
      ELSIF NEW.score_a < NEW.score_b THEN
        UPDATE users SET total_games = total_games + 1, total_losses = total_losses + 1 WHERE id = NEW.player_a_id;
      END IF;
    END IF;

    -- Update player_b stats
    IF (SELECT is_bot FROM users WHERE id = NEW.player_b_id) THEN
      IF NEW.score_b > NEW.score_a THEN
        UPDATE users SET total_games = total_games + 1, total_wins = total_wins + 1 WHERE id = NEW.player_b_id;
      ELSIF NEW.score_b < NEW.score_a THEN
        UPDATE users SET total_games = total_games + 1, total_losses = total_losses + 1 WHERE id = NEW.player_b_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_bot_stats ON tebak_sessions;
CREATE TRIGGER trg_update_bot_stats
  AFTER UPDATE ON tebak_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'finished' AND OLD.status != 'finished')
  EXECUTE FUNCTION update_bot_stats();
