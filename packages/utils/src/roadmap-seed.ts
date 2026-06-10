interface SeedMilestone {
  id: string; template_id: string; title: string; description?: string;
  order_index: number; tasks: { title: string }[]; estimated_days?: number; created_at: string;
}

interface SeedRecommendation {
  id: string; template_id: string; milestone_id?: string;
  resource_type: "circle" | "mentor" | "opportunity";
  resource_id: string; resource_name: string; resource_description?: string; resource_image?: string;
}

export const ROADMAP_CATEGORIES = [
  { slug: "health", label: "Kesehatan", emoji: "🩺" },
  { slug: "sports", label: "Olahraga", emoji: "🏃" },
  { slug: "creative", label: "Kreatif", emoji: "🎨" },
  { slug: "business", label: "Bisnis & Karir", emoji: "💼" },
  { slug: "tech", label: "Teknologi", emoji: "💻" },
] as const;

export const ROADMAP_TEMPLATE_CATEGORIES: Record<string, string> = {
  doctor: "health",
  "football-player": "sports",
  runner: "sports",
  golfer: "sports",
  musician: "creative",
  "content-creator": "creative",
  entrepreneur: "business",
  "digital-marketer": "business",
  programmer: "tech",
  "beauty-creator": "creative",
};

export const ROADMAP_SEED_MILESTONES: Record<string, SeedMilestone[]> = {
  doctor: [
    { id: "doc-m1", template_id: "doctor", title: "Pendidikan Kedokteran Dasar", description: "Menyelesaikan pendidikan S1 Kedokteran dan lulus ujian profesi.", order_index: 1, tasks: [{ title: "Lulus SMA dengan nilai IPA unggul" }, { title: "Masuk fakultas kedokteran terakreditasi" }, { title: "Selesaikan S1 Kedokteran (6 semester)" }, { title: "Ikuti ujian profesi dokter (UKMPPD)" }], estimated_days: 1825, created_at: "" },
    { id: "doc-m2", template_id: "doctor", title: "Program Internsip", description: "Menjalani masa internsip di rumah sakit atau puskesmas.", order_index: 2, tasks: [{ title: "Daftar program internsip" }, { title: "Rotasi di departemen utama" }, { title: "Dapatkan surat tanda registrasi (STR)" }, { title: "Selesaikan internsip dengan evaluasi baik" }], estimated_days: 365, created_at: "" },
    { id: "doc-m3", template_id: "doctor", title: "Pendidikan Spesialisasi", description: "Memilih dan menjalani pendidikan spesialisasi.", order_index: 3, tasks: [{ title: "Pilih spesialisasi (bedah, anak, penyakit dalam)" }, { title: "Ikuti ujian masuk program spesialis" }, { title: "Selesaikan pendidikan spesialis (8 semester)" }, { title: "Publikasikan jurnal ilmiah" }], estimated_days: 1460, created_at: "" },
    { id: "doc-m4", template_id: "doctor", title: "Praktik Mandiri & Karir", description: "Memulai praktik sebagai dokter spesialis.", order_index: 4, tasks: [{ title: "Dapatkan izin praktik (SIP)" }, { title: "Bergabung dengan rumah sakit atau buka praktik" }, { title: "Ikuti seminar dan pelatihan berkelanjutan" }, { title: "Bangun jaringan dengan kolega" }], estimated_days: 730, created_at: "" },
  ],
  programmer: [
    { id: "prog-m1", template_id: "programmer", title: "Fundamental Programming", description: "Mempelajari dasar-dasar pemrograman.", order_index: 1, tasks: [{ title: "Pilih bahasa pemrograman pertama (Python/JS)" }, { title: "Kuasai variabel, fungsi, loop, conditional" }, { title: "Pahami struktur data dasar (array, object)" }, { title: "Selesaikan 50+ soal coding di platform" }], estimated_days: 60, created_at: "" },
    { id: "prog-m2", template_id: "programmer", title: "Frontend atau Backend", description: "Memilih dan mendalami jalur frontend atau backend.", order_index: 2, tasks: [{ title: "Frontend: Kuasai HTML, CSS, JavaScript" }, { title: "Backend: Kuasai API, database, server" }, { title: "Buat project portofolio pertama" }, { title: "Pelajari version control (Git & GitHub)" }], estimated_days: 90, created_at: "" },
    { id: "prog-m3", template_id: "programmer", title: "Full Stack & Deployment", description: "Menguasai full-stack development dan deployment.", order_index: 3, tasks: [{ title: "Pelajari database (SQL & NoSQL)" }, { title: "Kuasai deployment (Vercel, Railway, AWS)" }, { title: "Buat full-stack application" }, { title: "Pelajari testing dan CI/CD" }], estimated_days: 90, created_at: "" },
    { id: "prog-m4", template_id: "programmer", title: "Karir Profesional", description: "Memulai karir sebagai programmer profesional.", order_index: 4, tasks: [{ title: "Bangun portofolio dan GitHub yang rapi" }, { title: "Siapkan CV dan LinkedIn yang menarik" }, { title: "Mulai lamaran kerja dan interview" }, { title: "Kontribusi ke open source project" }], estimated_days: 180, created_at: "" },
  ],
  "content-creator": [
    { id: "cc-m1", template_id: "content-creator", title: "Fundamental Konten", description: "Menentukan niche dan memulai membuat konten.", order_index: 1, tasks: [{ title: "Tentukan niche dan target audiens" }, { title: "Pilih platform utama (TikTok/IG/YouTube)" }, { title: "Buat jadwal posting konsisten" }, { title: "Pelajari dasar editing video" }], estimated_days: 45, created_at: "" },
    { id: "cc-m2", template_id: "content-creator", title: "Pertumbuhan Audiens", description: "Mengembangkan audiens dan engagement.", order_index: 2, tasks: [{ title: "Optimasi profil dan SEO konten" }, { title: "Gunakan tren dan audio viral" }, { title: "Interaksi aktif dengan audiens" }, { title: "Capai 1.000 followers" }], estimated_days: 90, created_at: "" },
    { id: "cc-m3", template_id: "content-creator", title: "Monetisasi", description: "Mulai menghasilkan pendapatan dari konten.", order_index: 3, tasks: [{ title: "Ikuti program monetisasi platform" }, { title: "Tawarkan jasa endorsement atau sponsor" }, { title: "Buat produk digital (ebook, template)" }, { title: "Capai 10.000 followers" }], estimated_days: 120, created_at: "" },
    { id: "cc-m4", template_id: "content-creator", title: "Scaling & Brand", description: "Mengembangkan personal brand dan scaling bisnis.", order_index: 4, tasks: [{ title: "Bangun tim atau kolaborator" }, { title: "Diversifikasi platform dan sumber pendapatan" }, { title: "Ciptakan produk fisik atau merch" }, { title: "Capai 50.000+ followers" }], estimated_days: 180, created_at: "" },
  ],
  entrepreneur: [
    { id: "ent-m1", template_id: "entrepreneur", title: "Ideasi & Validasi", description: "Menemukan ide bisnis dan memvalidasinya.", order_index: 1, tasks: [{ title: "Identifikasi masalah yang ingin dipecahkan" }, { title: "Lakukan riset pasar dan kompetitor" }, { title: "Validasi ide dengan target customer" }, { title: "Buat value proposition yang jelas" }], estimated_days: 60, created_at: "" },
    { id: "ent-m2", template_id: "entrepreneur", title: "MVP & Launch", description: "Membangun produk minimum dan meluncurkan bisnis.", order_index: 2, tasks: [{ title: "Buat MVP (Minimum Viable Product)" }, { title: "Tentukan model bisnis dan harga" }, { title: "Urus legalitas usaha (SIUP, NIB)" }, { title: "Launch produk ke pasar" }], estimated_days: 90, created_at: "" },
    { id: "ent-m3", template_id: "entrepreneur", title: "Traction & Growth", description: "Mendapatkan pelanggan pertama dan pertumbuhan.", order_index: 3, tasks: [{ title: "Dapatkan 100 customer pertama" }, { title: "Optimasi strategi pemasaran" }, { title: "Kumpulkan dan olah feedback" }, { title: "Capai break-even point" }], estimated_days: 180, created_at: "" },
    { id: "ent-m4", template_id: "entrepreneur", title: "Skalasi Bisnis", description: "Memperluas bisnis dan mencari pendanaan.", order_index: 4, tasks: [{ title: "Rekrut tim inti pertama" }, { title: "Ekspansi ke pasar baru" }, { title: "Ajukan pendanaan (angel/VC)" }, { title: "Bangun sistem dan operasional skalabel" }], estimated_days: 365, created_at: "" },
  ],
  "digital-marketer": [
    { id: "dm-m1", template_id: "digital-marketer", title: "Fundamental Marketing", description: "Dasar-dasar pemasaran digital.", order_index: 1, tasks: [{ title: "Pelajari marketing funnel dan customer journey" }, { title: "Kuasai SEO dasar (on-page & off-page)" }, { title: "Pahami social media marketing" }, { title: "Belajar Google Analytics" }], estimated_days: 60, created_at: "" },
    { id: "dm-m2", template_id: "digital-marketer", title: "Spesialisasi Channel", description: "Mendalami channel pemasaran tertentu.", order_index: 2, tasks: [{ title: "Pilih spesialisasi (SEO/SEM/Social/Email)" }, { title: "Kuasai Google Ads atau Meta Ads" }, { title: "Dapatkan sertifikasi Google Digital Marketing" }, { title: "Kelola campaign nyata" }], estimated_days: 90, created_at: "" },
    { id: "dm-m3", template_id: "digital-marketer", title: "Strategi & Analisis", description: "Strategi marketing berbasis data.", order_index: 3, tasks: [{ title: "Pelajari marketing automation tools" }, { title: "Kuasai data analysis dan reporting" }, { title: "Buat marketing strategy plan" }, { title: "Optimasi conversion rate (CRO)" }], estimated_days: 90, created_at: "" },
    { id: "dm-m4", template_id: "digital-marketer", title: "Kepemimpinan & Konsultan", description: "Memimpin tim marketing atau menjadi konsultan.", order_index: 4, tasks: [{ title: "Bangun portofolio case studies" }, { title: "Kembangkan skill leadership" }, { title: "Bangun personal brand sebagai marketer" }, { title: "Tawarkan jasa konsultan marketing" }], estimated_days: 180, created_at: "" },
  ],
  "beauty-creator": [
    { id: "bc-m1", template_id: "beauty-creator", title: "Dasar Kecantikan", description: "Fundamental skincare dan makeup.", order_index: 1, tasks: [{ title: "Pelajari jenis kulit dan skin concerns" }, { title: "Kuasai basic skincare routine" }, { title: "Pelajari teknik makeup dasar" }, { title: "Kenali alat dan produk kecantikan" }], estimated_days: 45, created_at: "" },
    { id: "bc-m2", template_id: "beauty-creator", title: "Konten Kecantikan", description: "Membuat konten kecantikan yang engaging.", order_index: 2, tasks: [{ title: "Buat konten tutorial skincare/makeup" }, { title: "Pelajari teknik fotografi produk" }, { title: "Konsisten posting di IG/TikTok" }, { title: "Review produk kecantikan" }], estimated_days: 60, created_at: "" },
    { id: "bc-m3", template_id: "beauty-creator", title: "Kolaborasi & Brand", description: "Berkolaborasi dengan brand kecantikan.", order_index: 3, tasks: [{ title: "Bangun media kit profesional" }, { title: "Tawarkan jasa review ke brand kecil" }, { title: "Ikuti beauty event dan gathering" }, { title: "Capai 5.000 followers" }], estimated_days: 90, created_at: "" },
    { id: "bc-m4", template_id: "beauty-creator", title: "Brand Pribadi", description: "Membangun brand kecantikan sendiri.", order_index: 4, tasks: [{ title: "Ciptakan produk kecantikan sendiri" }, { title: "Bangun website dan toko online" }, { title: "Kolaborasi dengan sesama beauty creator" }, { title: "Capai 20.000+ followers" }], estimated_days: 180, created_at: "" },
  ],
  musician: [
    { id: "mus-m1", template_id: "musician", title: "Dasar Musik", description: "Teori musik dan memilih alat musik.", order_index: 1, tasks: [{ title: "Pelajari teori musik dasar (notasi, ritme)" }, { title: "Pilih alat musik utama (gitar/piano/vokal)" }, { title: "Kuasai teknik dasar alat musik" }, { title: "Mainkan lagu sederhana" }], estimated_days: 120, created_at: "" },
    { id: "mus-m2", template_id: "musician", title: "Pengembangan Skill", description: "Kemampuan teknis dan musikalitas.", order_index: 2, tasks: [{ title: "Pelajari skala dan mode" }, { title: "Latihan improvisasi dasar" }, { title: "Bergabung dengan band atau ansambel" }, { title: "Rekam cover lagu" }], estimated_days: 180, created_at: "" },
    { id: "mus-m3", template_id: "musician", title: "Produksi & Performa", description: "Produksi musik dan tampil di depan publik.", order_index: 3, tasks: [{ title: "Pelajari DAW (Digital Audio Workstation)" }, { title: "Produksi lagu orisinal pertama" }, { title: "Tampil di acara atau open mic" }, { title: "Bangun portofolio musik" }], estimated_days: 365, created_at: "" },
    { id: "mus-m4", template_id: "musician", title: "Karir Musik", description: "Monetisasi bakat musik dan membangun karir.", order_index: 4, tasks: [{ title: "Rilis lagu di platform digital (Spotify, Apple)" }, { title: "Bangun audiens di media sosial" }, { title: "Cari manajer atau label rekaman" }, { title: "Tur dan pertunjukan berbayar" }], estimated_days: 730, created_at: "" },
  ],
  "football-player": [
    { id: "fb-m1", template_id: "football-player", title: "Akademi Sepak Bola", description: "Bergabung dengan akademi sepak bola.", order_index: 1, tasks: [{ title: "Ikuti seleksi akademi sepak bola lokal" }, { title: "Kuasai teknik dasar (passing, dribbling, shooting)" }, { title: "Latihan rutin 4-5 kali seminggu" }, { title: "Ikuti kompetisi antar akademi" }], estimated_days: 730, created_at: "" },
    { id: "fb-m2", template_id: "football-player", title: "Tim Junior", description: "Masuk tim junior dan mengembangkan taktik.", order_index: 2, tasks: [{ title: "Masuk tim junior klub sepak bola" }, { title: "Pelajari formasi dan strategi permainan" }, { title: "Tingkatkan kebugaran fisik" }, { title: "Ikuti turnamen regional" }], estimated_days: 730, created_at: "" },
    { id: "fb-m3", template_id: "football-player", title: "Tim Senior & Profesional", description: "Menembus tim senior dan kontrak profesional.", order_index: 3, tasks: [{ title: "Promosi ke tim senior" }, { title: "Tanda tangan kontrak profesional" }, { title: "Jaga performa konsisten" }, { title: "Bangun personal branding di media sosial" }], estimated_days: 730, created_at: "" },
    { id: "fb-m4", template_id: "football-player", title: "Puncak Karir", description: "Performa puncak di level tertinggi.", order_index: 4, tasks: [{ title: "Targetkan caps tim nasional" }, { title: "Jaga kondisi fisik dan mental" }, { title: "Kelola keuangan karir" }, { title: "Rencanakan karir setelah pensiun" }], estimated_days: 1095, created_at: "" },
  ],
  runner: [
    { id: "run-m1", template_id: "runner", title: "Dasar Lari & 5K", description: "Memulai kebiasaan lari hingga 5K.", order_index: 1, tasks: [{ title: "Beli sepatu lari yang sesuai" }, { title: "Ikuti program Couch to 5K" }, { title: "Lari 3 kali seminggu konsisten" }, { title: "Selesaikan lari 5K non-stop" }], estimated_days: 60, created_at: "" },
    { id: "run-m2", template_id: "runner", title: "10K & Half Marathon", description: "Meningkatkan jarak ke 10K dan half marathon.", order_index: 2, tasks: [{ title: "Tingkatkan jarak lari bertahap (10% per minggu)" }, { title: "Ikuti program latihan 10K" }, { title: "Selesaikan lari 10K" }, { title: "Latihan half marathon (21K)" }], estimated_days: 120, created_at: "" },
    { id: "run-m3", template_id: "runner", title: "Full Marathon", description: "Menaklukkan maraton penuh (42.195 km).", order_index: 3, tasks: [{ title: "Ikuti program latihan maraton 16 minggu" }, { title: "Pelajari nutrisi dan hidrasi lari jarak jauh" }, { title: "Selesaikan long run 30K+" }, { title: "Finish maraton pertama!" }], estimated_days: 150, created_at: "" },
    { id: "run-m4", template_id: "runner", title: "Peningkatan Performa", description: "Meningkatkan waktu dan lomba kompetitif.", order_index: 4, tasks: [{ title: "Ikuti program speed work (interval, tempo)" }, { title: "Targetkan personal best baru" }, { title: "Ikuti lomba lari nasional" }, { title: "Bergabung dengan komunitas lari" }], estimated_days: 180, created_at: "" },
  ],
  golfer: [
    { id: "gol-m1", template_id: "golfer", title: "Fundamental Golf", description: "Teknik dasar bermain golf.", order_index: 1, tasks: [{ title: "Pelajari grip dan stance yang benar" }, { title: "Kuasai teknik swing dasar" }, { title: "Latihan putting di practice green" }, { title: "Pahami etika dan peraturan golf" }], estimated_days: 90, created_at: "" },
    { id: "gol-m2", template_id: "golfer", title: "Short Game & Lapangan", description: "Memperbaiki short game dan bermain di lapangan.", order_index: 2, tasks: [{ title: "Latihan chipping dan pitching" }, { title: "Kuasai bunker shots" }, { title: "Main 9 hole reguler" }, { title: "Catat skor dan evaluasi" }], estimated_days: 120, created_at: "" },
    { id: "gol-m3", template_id: "golfer", title: "Manajemen Lapangan", description: "Strategi bermain di berbagai tipe lapangan.", order_index: 3, tasks: [{ title: "Pelajari manajemen risiko di lapangan" }, { title: "Kuasai berbagai jenis pukulan" }, { title: "Main 18 hole reguler" }, { title: "Konsisten di skor 90-100" }], estimated_days: 180, created_at: "" },
    { id: "gol-m4", template_id: "golfer", title: "Kompetisi & Turnamen", description: "Mengikuti turnamen dan meningkatkan peringkat.", order_index: 4, tasks: [{ title: "Ikuti turnamen amatir lokal" }, { title: "Dapatkan handicap resmi" }, { title: "Konsisten di skor 80-90" }, { title: "Bangun jaringan dengan pegolf lain" }], estimated_days: 365, created_at: "" },
  ],
};

export const ROADMAP_SEED_RECOMMENDATIONS: Record<string, SeedRecommendation[]> = {
  doctor: [
    { id: "doc-rec1", template_id: "doctor", milestone_id: "doc-m1", resource_type: "circle", resource_id: "1", resource_name: "Tech Founders Circle", resource_description: "Diskusi dengan mahasiswa kedokteran dari berbagai universitas." },
    { id: "doc-rec2", template_id: "doctor", milestone_id: "doc-m3", resource_type: "mentor", resource_id: "1", resource_name: "Dr. Rudi Hartono", resource_description: "Dokter spesialis bedah dengan 15 tahun pengalaman." },
    { id: "doc-rec3", template_id: "doctor", milestone_id: "doc-m4", resource_type: "opportunity", resource_id: "1", resource_name: "Program Dokter PTT", resource_description: "Penempatan dokter di daerah terpencil dengan insentif menarik." },
  ],
  programmer: [
    { id: "prog-rec1", template_id: "programmer", milestone_id: "prog-m1", resource_type: "circle", resource_id: "5", resource_name: "Data Science ID Circle", resource_description: "Komunitas programmer untuk diskusi dan belajar." },
    { id: "prog-rec2", template_id: "programmer", milestone_id: "prog-m3", resource_type: "mentor", resource_id: "9", resource_name: "Pak Anton", resource_description: "Senior engineer dengan pengalaman di FAANG." },
    { id: "prog-rec3", template_id: "programmer", milestone_id: "prog-m4", resource_type: "opportunity", resource_id: "9", resource_name: "Program Magang Frontend", resource_description: "Magang di perusahaan tech terkemuka." },
  ],
  "content-creator": [
    { id: "cc-rec1", template_id: "content-creator", milestone_id: "cc-m1", resource_type: "circle", resource_id: "2", resource_name: "Creative Lab Circle", resource_description: "Komunitas kreator untuk kolaborasi dan belajar." },
    { id: "cc-rec2", template_id: "content-creator", milestone_id: "cc-m3", resource_type: "mentor", resource_id: "6", resource_name: "Ria SW", resource_description: "Content creator dengan 500K+ followers di TikTok." },
    { id: "cc-rec3", template_id: "content-creator", milestone_id: "cc-m4", resource_type: "opportunity", resource_id: "6", resource_name: "Program Kreator TikTok", resource_description: "Akses fitur eksklusif dan pendampingan kreator." },
  ],
  entrepreneur: [
    { id: "ent-rec1", template_id: "entrepreneur", milestone_id: "ent-m1", resource_type: "circle", resource_id: "1", resource_name: "Tech Founders Circle", resource_description: "Komunitas founder startup untuk diskusi dan mentoring." },
    { id: "ent-rec2", template_id: "entrepreneur", milestone_id: "ent-m3", resource_type: "mentor", resource_id: "7", resource_name: "William Tanuwijaya", resource_description: "Founder Tokopedia dengan pengalaman membangun unicorn." },
    { id: "ent-rec3", template_id: "entrepreneur", milestone_id: "ent-m4", resource_type: "opportunity", resource_id: "7", resource_name: "Akselerator Startup", resource_description: "Program akselerasi startup dengan pendanaan awal." },
  ],
  "digital-marketer": [
    { id: "dm-rec1", template_id: "digital-marketer", milestone_id: "dm-m1", resource_type: "circle", resource_id: "5", resource_name: "Data Science ID Circle", resource_description: "Analisis data untuk marketing." },
    { id: "dm-rec2", template_id: "digital-marketer", milestone_id: "dm-m2", resource_type: "mentor", resource_id: "8", resource_name: "Dina Maulana", resource_description: "Digital marketing lead di e-commerce terkemuka." },
    { id: "dm-rec3", template_id: "digital-marketer", milestone_id: "dm-m4", resource_type: "opportunity", resource_id: "8", resource_name: "Magang Digital Marketing", resource_description: "Program magang di agensi digital marketing." },
  ],
  "beauty-creator": [
    { id: "bc-rec1", template_id: "beauty-creator", milestone_id: "bc-m1", resource_type: "circle", resource_id: "2", resource_name: "Creative Lab Circle", resource_description: "Komunitas beauty creator untuk sharing dan kolaborasi." },
    { id: "bc-rec2", template_id: "beauty-creator", milestone_id: "bc-m3", resource_type: "mentor", resource_id: "10", resource_name: "Tasya Farasya", resource_description: "Beauty influencer dengan jutaan followers." },
    { id: "bc-rec3", template_id: "beauty-creator", milestone_id: "bc-m4", resource_type: "opportunity", resource_id: "10", resource_name: "Program Beauty Creator", resource_description: "Dukungan untuk beauty creator pemula dari brand ternama." },
  ],
  musician: [
    { id: "mus-rec1", template_id: "musician", milestone_id: "mus-m2", resource_type: "circle", resource_id: "2", resource_name: "Creative Lab Circle", resource_description: "Kolaborasi dengan musisi lain dan berbagi pengalaman." },
    { id: "mus-rec2", template_id: "musician", milestone_id: "mus-m3", resource_type: "mentor", resource_id: "5", resource_name: "Tohpati", resource_description: "Gitaris dan produser musik profesional." },
    { id: "mus-rec3", template_id: "musician", milestone_id: "mus-m4", resource_type: "opportunity", resource_id: "5", resource_name: "Festival Musik Independen", resource_description: "Daftar festival musik untuk exposure dan networking." },
  ],
  "football-player": [
    { id: "fb-rec1", template_id: "football-player", milestone_id: "fb-m1", resource_type: "circle", resource_id: "4", resource_name: "Green Warriors Circle", resource_description: "Temukan teman latihan dan sparing partner." },
    { id: "fb-rec2", template_id: "football-player", milestone_id: "fb-m3", resource_type: "mentor", resource_id: "2", resource_name: "Bambang Pamungkas", resource_description: "Eks pemain timnas dengan pengalaman karir profesional." },
    { id: "fb-rec3", template_id: "football-player", milestone_id: "fb-m4", resource_type: "opportunity", resource_id: "2", resource_name: "Program Pembinaan Atlet Muda", resource_description: "Beasiswa dan fasilitas latihan untuk atlet berbakat." },
  ],
  runner: [
    { id: "run-rec1", template_id: "runner", milestone_id: "run-m1", resource_type: "circle", resource_id: "4", resource_name: "Green Warriors Circle", resource_description: "Komunitas lari dan aktivitas outdoor." },
    { id: "run-rec2", template_id: "runner", milestone_id: "run-m3", resource_type: "mentor", resource_id: "3", resource_name: "Agus Prayogo", resource_description: "Pelari maraton nasional dengan pengalaman internasional." },
    { id: "run-rec3", template_id: "runner", milestone_id: "run-m4", resource_type: "opportunity", resource_id: "3", resource_name: "Event Lari Tahunan", resource_description: "Daftar event lari nasional dan dapatkan medali." },
  ],
  golfer: [
    { id: "gol-rec1", template_id: "golfer", milestone_id: "gol-m1", resource_type: "circle", resource_id: "4", resource_name: "Green Warriors Circle", resource_description: "Komunitas golf amatir dan profesional." },
    { id: "gol-rec2", template_id: "golfer", milestone_id: "gol-m3", resource_type: "mentor", resource_id: "4", resource_name: "Rory Mulyadi", resource_description: "Instruktur golf profesional bersertifikasi internasional." },
    { id: "gol-rec3", template_id: "golfer", milestone_id: "gol-m4", resource_type: "opportunity", resource_id: "4", resource_name: "Turnamen Golf Amatir", resource_description: "Ikuti turnamen golf amatir nasional." },
  ],
};
