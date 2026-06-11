import type {
  RoadmapV3, DailyReflection, LearningVaultItem,
  RoadmapDailyWinCategory, RoadmapSmallWinCategory, RoadmapBigWin,
  RoadmapBlueprint, RoadmapDream,
} from "@beautifio/types";

export const ROADMAP_V3_SEED: Record<string, RoadmapV3> = {};

function r(slug: string, data: RoadmapV3) {
  ROADMAP_V3_SEED[slug] = data;
}

r("football-player", {
  slug: "football-player",
  title: "Pemain Sepak Bola Profesional",
  description: "Jalur menjadi pemain sepak bola profesional — dari latihan dasar hingga karier profesional.",
  emoji: "\u26bd",
  color: "from-green-600 to-emerald-500",
  duration: "8-15 tahun",
  category: "sports",
  dream: {
    title: "Pemain Sepak Bola Profesional",
    description: "Bermain di klub profesional, baik di liga domestik maupun internasional, dan mewakili tim nasional.",
    whyMatters: "Sepak bola bukan hanya olahraga — ia mengajarkan disiplin, kerja tim, dan ketekunan. Menjadi pemain profesional berarti menginspirasi generasi muda dan mengharumkan nama bangsa.",
    estimatedJourney: "8-15 tahun tergantung bakat, kerja keras, dan kesempatan.",
    careerPossibilities: [
      "Pemain Klub Profesional (Liga 1, Liga 2)",
      "Tim Nasional Indonesia",
      "Pemain Luar Negeri (Asia, Eropa)",
      "Pelatih Profesional",
      "Akademi Pembinaan Muda",
      "Analis Sepak Bola",
      "Manajer Olahraga",
    ],
    successExamples: [
      "Bambang Pamungkas — 85 gol tim nasional, legenda Persija",
      "Evan Dimas — gelandang timnas, karier di Malaysia & Indonesia",
      "Pratama Arhan — bek kiri timnas, karier di Jepang (Tokyo Verdy)",
      "Asnawi Mangkualam — bek kanan timnas, karier di Korea Selatan (Jeonnam Dragons)",
    ],
  },
  dailyWins: [
    {
      category: "Pagi Hari",
      emoji: "\u2600\uFE0F",
      habits: [
        { id: "fb-dw-1", title: "Bangun Pagi (05:00)", description: "Bangun sebelum subuh untuk memulai hari lebih awal", icon: "Sunrise" },
        { id: "fb-dw-2", title: "Doa & Refleksi", description: "Berdoa dan bersyukur untuk hari yang baru", icon: "Heart" },
        { id: "fb-dw-3", title: "Stretching Dinamis", description: "Peregangan 10 menit untuk menyiapkan tubuh", icon: "Zap" },
        { id: "fb-dw-4", title: "Sarapan Sehat", description: "Karbohidrat kompleks + protein + buah", icon: "Clock" },
      ],
    },
    {
      category: "Latihan",
      emoji: "\uD83C\uDFC3",
      habits: [
        { id: "fb-dw-5", title: "Ball Mastery (30 menit)", description: "Kontrol bola, juggling, dribbling dasar", icon: "Target" },
        { id: "fb-dw-6", title: "Passing & Receiving", description: "Latihan operan pendek, panjang, dan one-touch", icon: "Zap" },
        { id: "fb-dw-7", title: "Physical Training", description: "Sprint, agility ladder, dan kekuatan tubuh", icon: "Flame" },
        { id: "fb-dw-8", title: "Small Sided Game", description: "Game 4v4 atau 5v5 untuk aplikasi teknik", icon: "Users" },
      ],
    },
    {
      category: "Malam Hari",
      emoji: "\uD83C\uDF19",
      habits: [
        { id: "fb-dw-9", title: "Recovery Session", description: "Stretching statis, foam roller, atau ice bath", icon: "Clock" },
        { id: "fb-dw-10", title: "Tidur Sebelum 22:00", description: "Tidur cukup 8 jam untuk pemulihan optimal", icon: "Moon" },
        { id: "fb-dw-11", title: "Jurnal Harian", description: "Catat progres latihan dan perasaan hari ini", icon: "BookOpen" },
      ],
    },
  ],
  smallWins: [
    {
      category: "Teknikal",
      emoji: "\uD83E\uDD45",
      skills: [
        { id: "fb-sw-1", name: "First Touch", description: "Kemampuan mengontrol bola dari berbagai arah dan kecepatan", levels: [
          { label: "Pemula", target: "Kontrol bola diam", description: "Mampu menghentikan bola dari operan lambat" },
          { label: "Menengah", target: "Kontrol bola bergerak", description: "Mengontrol bola dari operan cepat dengan kedua kaki" },
          { label: "Mahir", target: "Kontrol dalam tekanan", description: "Mengontrol bola sambil melindungi dari lawan" },
          { label: "Pro", target: "Kontrol instan", description: "Satu sentuhan langsung ke arah yang diinginkan" },
        ]},
        { id: "fb-sw-2", name: "Passing Accuracy", description: "Akurasi operan pendek dan panjang", levels: [
          { label: "Pemula", target: "70% akurasi 10m", description: "Operan dasar kaki bagian dalam" },
          { label: "Menengah", target: "80% akurasi 20m", description: "Operan berbagai jarak dengan kedua kaki" },
          { label: "Mahir", target: "85% akurasi 30m", description: "Operan terobosan dan crossing akurat" },
          { label: "Pro", target: "90%+ semua jarak", description: "Operan first-time, no-look, dan variasi" },
        ]},
        { id: "fb-sw-3", name: "Dribbling", description: "Kemampuan menggiring bola dalam kecepatan", levels: [
          { label: "Pemula", target: "Lurus dengan kontrol", description: "Menggiring lurus dengan kaki dominan" },
          { label: "Menengah", target: "Berganti arah", description: "Menggiring dengan kedua kaki, berbelok" },
          { label: "Mahir", target: "Melewati lawan", description: "Feint, stepover, dan body feint" },
          { label: "Pro", target: "Kecepatan penuh", description: "Dribbling kecepatan tinggi dengan kontrol sempurna" },
        ]},
        { id: "fb-sw-4", name: "Finishing", description: "Kemampuan mencetak gol", levels: [
          { label: "Pemula", target: "Tembak tepat sasaran", description: "Menembak bola diam ke gawang" },
          { label: "Menengah", target: "1 lawan 1", description: "Penyelesaian satu lawan satu dengan kiper" },
          { label: "Mahir", target: "Finishing bervariasi", description: "Chip, voli, header, dan first-time finish" },
          { label: "Pro", target: "Klinis & konsisten", description: "Finishing presisi dalam tekanan pertandingan" },
        ]},
      ],
    },
    {
      category: "Fisik",
      emoji: "\uD83D\uDCAA",
      skills: [
        { id: "fb-sw-5", name: "Speed", description: "Kecepatan lari sprint", levels: [
          { label: "Pemula", target: "30m dalam 5.0-5.5 detik", description: "Sprint dasar" },
          { label: "Menengah", target: "30m dalam 4.5-5.0 detik", description: "Teknik lari sprint" },
          { label: "Mahir", target: "30m dalam 4.0-4.5 detik", description: "Start eksplosif" },
          { label: "Pro", target: "30m di bawah 4.0 detik", description: "Kecepatan elit" },
        ]},
        { id: "fb-sw-6", name: "Endurance", description: "Daya tahan kardio", levels: [
          { label: "Pemula", target: "5km dalam 30 menit", description: "Lari jarak jauh dasar" },
          { label: "Menengah", target: "10km dalam 55 menit", description: "Interval running" },
          { label: "Mahir", target: "15km dalam 90 menit", description: "High-intensity interval" },
          { label: "Pro", target: "VO2Max 50+", description: "Daya tahan level atlet" },
        ]},
        { id: "fb-sw-7", name: "Strength", description: "Kekuatan otot untuk duel dan stabilitas", levels: [
          { label: "Pemula", target: "Bodyweight squat 20", description: "Latihan beban tubuh" },
          { label: "Menengah", target: "Bench press 50kg", description: "Angkat beban dasar" },
          { label: "Mahir", target: "Bench press 80kg", description: "Kekuatan fungsional" },
          { label: "Pro", target: "Squat 120kg+", description: "Kekuatan atlet profesional" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "fb-bw-1", title: "Gabung SSB (Sekolah Sepak Bola)", description: "Mulai latihan terstruktur di klub usia muda", order: 1, isEssential: true, stage: "beginner" },
    { id: "fb-bw-2", title: "Jadi Starter Tim SSB", description: "Menjadi pemain inti di kelompok usia", order: 2, isEssential: true, stage: "beginner" },
    { id: "fb-bw-3", title: "Menang Turnamen Lokal", description: "Juara turnamen antar-SSB sekota", order: 3, isEssential: false, stage: "beginner" },
    { id: "fb-bw-4", title: "Masuk Akademi Klub Profesional", description: "Diterima di akademi Liga 1/Liga 2", order: 4, isEssential: true, stage: "intermediate" },
    { id: "fb-bw-5", title: "Seleksi Daerah", description: "Terpilih mewakili kota/kabupaten di ajang POPDA/PON", order: 5, isEssential: true, stage: "intermediate" },
    { id: "fb-bw-6", title: "Seleksi Nasional", description: "Dipanggil ke pemusatan latihan timnas kelompok umur", order: 6, isEssential: false, stage: "intermediate" },
    { id: "fb-bw-7", title: "Debut Profesional", description: "Main pertama di kompetisi profesional (Liga 2/Liga 3)", order: 7, isEssential: true, stage: "advanced" },
    { id: "fb-bw-8", title: "Kontrak Profesional Pertama", description: "Tanda tangan kontrak dengan klub profesional", order: 8, isEssential: true, stage: "advanced" },
    { id: "fb-bw-9", title: "Tim Nasional Senior", description: "Panggilan pertama ke tim nasional senior", order: 9, isEssential: false, stage: "professional" },
    { id: "fb-bw-10", title: "Karier Luar Negeri", description: "Bermain di klub luar negeri (Asia/Eropa)", order: 10, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Teknik dasar bola (passing, dribbling, shooting) harus otomatis",
      "Kebugaran fisik level atlet (VO2Max 50+, sprint 30m < 4.5 detik)",
      "Pemahaman taktik (formasi, transisi, positioning)",
      "Mental kuat (resiliensi, fokus, leadership)",
      "Komunikasi tim yang efektif di lapangan",
    ],
    habits: [
      "Latihan 5-6 hari seminggu, jadwal teratur",
      "Pola makan bergizi seimbang (50% karbohidrat, 25% protein, 25% sayur)",
      "Tidur 8 jam per hari untuk recovery",
      "Minum air putih minimal 3 liter sehari",
      "Jurnal harian untuk tracking progres",
      "Analisis video pertandingan sendiri dan pemain top",
    ],
    mindset: [
      "Growth mindset — setiap kegagalan adalah pelajaran",
      "Disiplin — lakukan hal benar walau tidak ada yang melihat",
      "Resiliensi — bangkit lebih kuat setelah kekalahan",
      "Profesionalisme — jaga attitude, datang tepat waktu",
      "Bersyukur — hargai setiap kesempatan bermain",
    ],
    tools: [
      "Sepatu bola sesuai posisi (FG/AG untuk rumput)",
      "GPS tracker (Catapult atau Polar) untuk monitor beban latihan",
      "Aplikasi analisis video (Hudl, Veo)",
      "Foam roller untuk recovery",
      "Jurnal latihan fisik (buku atau aplikasi)",
      "Konsultan gizi olahraga",
    ],
    commonMistakes: [
      "Terlalu fokus ke teknik, lupakan kebugaran fisik",
      "Malas recovery — latihan keras tanpa istirahat cukup = cedera",
      "Makan sembarangan — junk food merusak performa",
      "Tidak punya rencana jangka panjang — hanya ikut latihan tanpa target",
      "Membandingkan diri dengan pemain lain secara tidak sehat",
      "Abaikan pendidikan — sepak bola tidak selamanya",
    ],
    successFactors: [
      "Konsistensi latihan selama bertahun-tahun, bukan setahun",
      "Mental kuat menghadapi kritik dan persaingan",
      "Dukungan keluarga dan lingkungan positif",
      "Nutrisi dan recovery yang baik mencegah cedera",
      "Manajer/agen yang jujur dan kompeten",
      "Terus belajar dari pemain yang lebih berpengalaman",
      "Bersyukur dan rendah hati — tetap lapar akan prestasi",
    ],
  },
  agePath: [
    { ageRange: "8-12", title: "Fundamentals & Love for the Game", description: "Usia emas untuk membangun koordinasi motorik dan kecintaan pada sepak bola.", milestones: ["Gabung SSB lokal", "Latihan 2-3x seminggu", "Main bebas minimal 1 jam/hari", "Tonton pertandingan langsung"] },
    { ageRange: "13-15", title: "School Team & Local Competition", description: "Transisi dari bermain untuk senang ke bermain untuk berkembang.", milestones: ["Masuk tim sekolah", "Ikut turnamen antar-SSB", "Mulai latihan 4-5x seminggu", "Pilih posisi spesifik"] },
    { ageRange: "16-18", title: "Academy & Elite Pathway", description: "Titik kritis — performa di usia ini menentukan peluang karier.", milestones: ["Masuk akademi klub profesional", "Ikut seleksi daerah (POPDA)", "Jaga pendidikan formal", "Bangun profil digital (video highlight)"] },
    { ageRange: "19-21", title: "Professional Breakthrough", description: "Window utama untuk debut profesional. Alternatif: karier di luar negeri atau non-pemain.", milestones: ["Debut di kompetisi senior", "Tanda tangan kontrak pertama", "Ikut seleksi timnas U23", "Pertimbangkan kuliah sebagai backup"] },
    { ageRange: "22+", title: "Professional Career & Legacy", description: "Puncak karier. Manajemen karier sama penting dengan performa di lapangan.", milestones: ["Konsisten main di level profesional", "Panggilan timnas senior", "Bangun personal branding", "Rencanakan karier pasca-pensiun"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Dasar Gerak & Bola", description: "Kenali bola, bangun kebiasaan latihan rutin.", keyActions: ["Latihan 3x seminggu", "Fokus kontrol bola dasar", "Juggling target 10x"] },
    { period: "3-12 Bulan", title: "Konsistensi & Fundamentals", description: "Bagian tersulit — bertahan saat progres terasa lambat.", keyActions: ["Latihan rutin 4x seminggu", "Ikut SSB atau klub", "Main minimal 1 pertandingan/bulan"] },
    { period: "1-3 Tahun", title: "Kompetisi & Pengembangan", description: "Mulai bersaing. Performa diukur dari kontribusi ke tim.", keyActions: ["Jadi starter reguler di tim", "Ikut turnamen rutin", "Pilih posisi spesialisasi"] },
    { period: "3-5 Tahun", title: "Akademi & Seleksi", description: "Fase paling kompetitif. Mental sama penting dengan skill.", keyActions: ["Masuk akademi klub", "Seleksi daerah/nasional", "Video highlight untuk exposure"] },
    { period: "5-10 Tahun", title: "Karier Profesional", description: "Debut profesional adalah awal, bukan akhir. Konsistensi adalah segalanya.", keyActions: ["Debut profesional", "Kontrak pertama", "Bangun reputasi"] },
  ],
  realityCheck: {
    hardTruths: [
      "Dari 100 anak yang bercita-cita jadi pemain bola, kurang dari 1 yang menjadi pemain profesional.",
      "Cedera serius (ACL, patah tulang) bisa mengakhiri karier kapan saja tanpa peringatan.",
      "Bakat saja tidak cukup — ribuan pemain berbakat gagal karena mental atau disiplin.",
      "Sepak bola tidak mengenal 'istirahat' — kompetisi berjalan setiap minggu selama 9-10 bulan setahun.",
    ],
    silverLinings: [
      "Sepak bola membentuk karakter yang berguna di bidang apapun — disiplin, kerja tim, ketahanan mental.",
      "Jaringan pertemanan dari sepak bola sering bertahan seumur hidup dan membuka peluang karier lain.",
      "Banyak mantan pemain sukses di luar lapangan — pelatih, komentator, manajer, bahkan pengusaha.",
    ],
    transferableSkills: [
      "Kepemimpinan dan komunikasi tim — berlaku di karier manajemen dan organisasi.",
      "Ketahanan fisik dan mental — berlaku di profesi apa pun yang menuntut tekanan tinggi.",
      "Analisis cepat dan pengambilan keputusan di bawah tekanan — berlaku di militer, keamanan, dan krisis management.",
    ],
  },
  alternativePaths: [
    { scenario: "Tidak lolos akademi setelah 2 tahun mencoba", steps: [
      { transition: "Evaluasi ulang posisi dan kelebihan", role: "Pemain Non-Akademi", description: "Banyak pemain profesional berasal dari jalur sekolah dan klub amatir, bukan akademi." },
      { transition: "Fokus ke pendidikan + klub semi-profesional", role: "Mahasiswa-Atlet", description: "Ikut UKM sepak bola di universitas sambil main di klub Liga 3." },
      { transition: "Jika skill cukup, coba trial di klub kecil", role: "Pemain Semi-Pro", description: "Klub Liga 3/Liga 4 sering menerima trial terbuka." },
    ]},
    { scenario: "Cedera serius mengakhiri jalan sebagai pemain", steps: [
      { transition: "Fokus ke pemulihan sambil explore peran non-pemain", role: "Pelatih Muda", description: "Ambil lisensi pelatih GRASSROOTS atau D." },
      { transition: "Kuliah di bidang olahraga", role: "Analis atau Fisioterapis", description: "Ilmu kedokteran olahraga atau sport science." },
      { transition: "Gunakan pengalaman main untuk content creation", role: "Konten Kreator Sepak Bola", description: "Review pertandingan, tutorial skill, atau analisis taktik." },
    ]},
    { scenario: "Tidak ada kesempatan di sepak bola Indonesia", steps: [
      { transition: "Cari peluang di luar negeri", role: "Pemain Diaspora", description: "Coba trial di Malaysia, Thailand, atau Vietnam yang kompetisinya lebih maju." },
      { transition: "Kuliah sambil main di liga kampus LN", role: "Student-Athlete", description: "Beasiswa olahraga ke universitas di Jepang, Australia, atau Eropa." },
    ]},
  ],
  masterclassLessons: [
    { person: "Bambang Pamungkas", role: "Legenda Timnas Indonesia & Persija", lesson: "Karir panjang dibangun dari disiplin kecil setiap hari, bukan momen besar sesekali.", story: "Bambang Pamungkas pensiun di usia 39 setelah 19 tahun karier profesional. Rahasianya: latihan ekstra setelah sesi tim selesai, menjaga pola makan sepanjang tahun (bukan hanya saat kompetisi), dan tidak pernah puas dengan pencapaian.", keyInsight: "Konsistensi dalam hal-hal kecil — stretching tambahan, 10 menit finishing setelah latihan, tidur cukup — terakumulasi jadi karir 19 tahun.", actionItem: "Tambahkan satu 'latihan ekstra' 15 menit setelah sesi utama fokus pada kelemahanmu (finishing, dribbling, atau heading)." },
    { person: "Pratama Arhan", role: "Bek Kiri Timnas Indonesia — Karier di Jepang", lesson: "Peluang datang saat kamu siap, bukan saat kamu menunggu.", story: "Arhan tidak dari akademi besar. Ia ditempa di PSIS Semarang, lalu mendapatkan kesempatan trial di Tokyo Verdy. Saat banyak pemain menolak tantangan di luar negeri, Arhan mengambil risiko pindah ke liga Jepang yang lebih kompetitif dan profesional.", keyInsight: "Keberanian mengambil peluang di luar zona nyaman membedakan pemain biasa dari pemain luar biasa.", actionItem: "Setiap 6 bulan, coba trial atau selection camp — di klub, daerah, atau event — untuk mengukur progres." },
    { person: "Cristiano Ronaldo", role: "Legenda Sepak Bola Dunia", lesson: "Talenta menentukan batas awal, tapi kerja keras menentukan batas akhir.", story: "Ronaldo berasal dari Madeira, pulau kecil. Saat muda, ia tidak selalu yang paling berbakat. Tapi ia dikenal sebagai pemain pertama datang dan terakhir pulang dari latihan. Ia melakukan 1.000 sit-up setiap pagi dan rutin latihan tambahan setelah sesi tim.", keyInsight: "Bakat akan bertemu dengan orang yang juga berbakat. Yang membedakan adalah siapa yang bekerja lebih keras setelah semua orang pulang.", actionItem: "Buat rutinitas 'extra mile': 20 menit latihan tambahan setiap hari di luar jadwal resmi." },
  ],
});

r("entrepreneur", {
  slug: "entrepreneur",
  title: "Entrepreneur",
  description: "Membangun bisnis dari ide hingga pertumbuhan — roadmap menjadi founder sukses.",
  emoji: "\uD83D\uDCC8",
  color: "from-amber-600 to-yellow-500",
  duration: "1-3 tahun",
  category: "business",
  dream: {
    title: "Entrepreneur Sukses",
    description: "Membangun bisnis yang scalable, berdampak, dan menguntungkan.",
    whyMatters: "Entrepreneurship adalah jalan untuk menciptakan solusi nyata bagi masalah masyarakat, menciptakan lapangan kerja, dan membangun kemandirian finansial.",
    estimatedJourney: "1-3 tahun untuk mencapai tahap stabil dan menguntungkan.",
    careerPossibilities: [
      "CEO & Founder Startup",
      "Serial Entrepreneur",
      "Angel Investor",
      "Venture Capital",
      "Business Consultant",
      "Corporate Innovator",
    ],
    successExamples: [
      "Nadiem Makarim — Gojek, unicorn pertama Indonesia",
      "William Tanuwijaya — Tokopedia, e-commerce raksasa",
      "Achmad Zaky — Bukalapak, unicorn teknologi",
      "Ferry Unardi — Traveloka, platform travel terbesar",
    ],
  },
  dailyWins: [
    {
      category: "Pagi", emoji: "\u2600\uFE0F",
      habits: [
        { id: "en-dw-1", title: "Bangun Pagi (05:30)", description: "Mulai hari lebih awal untuk perencanaan", icon: "Sunrise" },
        { id: "en-dw-2", title: "Review Goal Harian", description: "Tulis 3 prioritas utama hari ini", icon: "Target" },
        { id: "en-dw-3", title: "Baca/Belajar 30 Menit", description: "Buku, artikel, atau podcast bisnis", icon: "BookOpen" },
      ],
    },
    {
      category: "Kerja", emoji: "\uD83D\uDCBB",
      habits: [
        { id: "en-dw-4", title: "Deep Work Session (2 jam)", description: "Fokus tanpa distraksi pada prioritas #1", icon: "Zap" },
        { id: "en-dw-5", title: "Customer Development", description: "Ngobrol dengan customer atau prospek", icon: "Users" },
        { id: "en-dw-6", title: "Review Metrik Bisnis", description: "Cek revenue, traffic, conversion hari ini", icon: "TrendingUp" },
      ],
    },
    {
      category: "Malam", emoji: "\uD83C\uDF19",
      habits: [
        { id: "en-dw-7", title: "Review & Refleksi Harian", description: "Apa yang berhasil? Apa yang bisa lebih baik?", icon: "BookOpen" },
        { id: "en-dw-8", title: "Digital Detox 1 Jam", description: "Jauhkan HP sebelum tidur", icon: "Moon" },
        { id: "en-dw-9", title: "Tidur Sebelum 23:00", description: "Istirahat cukup untuk produktivitas besok", icon: "Clock" },
      ],
    },
  ],
  smallWins: [
    {
      category: "Bisnis", emoji: "\uD83D\uDCCA",
      skills: [
        { id: "en-sw-1", name: "Product Development", description: "Kemampuan mengembangkan produk dari ide ke MVP", levels: [
          { label: "Pemula", target: "Validasi ide", description: "Riset pasar dan problem validation" },
          { label: "Menengah", target: "MVP launch", description: "Produk minimum viable siap dirilis" },
          { label: "Mahir", target: "Product-market fit", description: "Retensi pengguna > 30% bulanan" },
          { label: "Pro", target: "Scale produk", description: "Produk melayani 10.000+ pengguna" },
        ]},
        { id: "en-sw-2", name: "Sales & Marketing", description: "Kemampuan menjual dan memasarkan produk", levels: [
          { label: "Pemula", target: "Dapat 5 customer", description: "Penjualan langsung dan referral" },
          { label: "Menengah", target: "Revenue Rp10jt/bln", description: "Sales funnel dan digital marketing" },
          { label: "Mahir", target: "Revenue Rp100jt/bln", description: "Sales team dan strategi growth" },
          { label: "Pro", target: "Revenue Rp1M+/bln", description: "Skalasi sales melalui channel" },
        ]},
      ],
    },
    {
      category: "Finansial", emoji: "\uD83D\uDCB0",
      skills: [
        { id: "en-sw-3", name: "Financial Management", description: "Mengelola arus kas dan keuangan bisnis", levels: [
          { label: "Pemula", target: "Catat pengeluaran", description: "Pembukuan sederhana" },
          { label: "Menengah", target: "Break even", description: "Bisnis tidak rugi" },
          { label: "Mahir", target: "Profit konsisten", description: "Margin keuntungan stabil" },
          { label: "Pro", target: "Scale dengan funding", description: "Pendanaan eksternal untuk ekspansi" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "en-bw-1", title: "Validasi Ide", description: "Konfirmasi bahwa masalah nyata dan orang mau bayar", order: 1, isEssential: true, stage: "beginner" },
    { id: "en-bw-2", title: "MVP Launch", description: "Produk pertama dirilis ke pengguna awal", order: 2, isEssential: true, stage: "beginner" },
    { id: "en-bw-3", title: "First Revenue", description: "Pendapatan pertama dari pelanggan sungguhan", order: 3, isEssential: true, stage: "beginner" },
    { id: "en-bw-4", title: "First Employee", description: "Mempekerjakan orang pertama", order: 4, isEssential: false, stage: "intermediate" },
    { id: "en-bw-5", title: "Product-Market Fit", description: "Retensi tinggi dan pertumbuhan organik", order: 5, isEssential: true, stage: "intermediate" },
    { id: "en-bw-6", title: "First Profitable Month", description: "Pendapatan > pengeluaran selama sebulan", order: 6, isEssential: true, stage: "advanced" },
    { id: "en-bw-7", title: "Funding/Investment", description: "Mendapatkan pendanaan dari investor", order: 7, isEssential: false, stage: "advanced" },
    { id: "en-bw-8", title: "Scale 10x", description: "Revenue atau pengguna tumbuh 10 kali lipat", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Problem solving — temukan masalah nyata, bukan solusi cari masalah",
      "Sales — kemampuan menjual visi, produk, dan diri sendiri",
      "Leadership — bangun tim yang lebih hebat dari dirimu",
      "Financial literacy — pahami unit ekonomi, cash flow, margin",
      "Adaptability — pivot cepat saat data bilang berubah arah",
    ],
    habits: [
      "Customer obsession — ngobrol dengan customer setiap minggu",
      "Data-driven — semua keputusan berdasarkan data, bukan feeling",
      "Continuous learning — baca buku bisnis, ikut perkembangan industri",
      "Network aggressively — bangun relasi, cari mentor, hadiri event",
      "Fail fast — uji ide dengan cepat dan murah",
    ],
    mindset: [
      "Abundance mindset — cukup untuk semua, kolaborasi bukan kompetisi",
      "Resilience — kegagalan adalah batu loncatan",
      "Long-term thinking — bangun untuk 10 tahun ke depan",
      "Customer-first — customer bahagia = bisnis berkembang",
      "Bersyukur — nikmati perjalanan, bukan hanya tujuan",
    ],
    tools: [
      "Notion atau Linear untuk manajemen produk",
      "Stripe atau Xendit untuk payment gateway",
      "Google Analytics atau Mixpanel untuk tracking",
      "HubSpot atau Mailchimp untuk CRM",
      "Legal: konsultan hukum untuk pendirian PT",
      "Accounting: software akuntansi (Jurnal, Accurate)",
    ],
    commonMistakes: [
      "Membangun produk sebelum validasi masalah",
      "Hire terlalu cepat atau terlalu lambat",
      "Pricing terlalu rendah karena takut",
      "Mengabaikan cash flow — fokus cuma ke revenue",
      "Co-founder conflict karena tidak ada pembagian peran jelas",
      "Skalasi sebelum product-market fit tercapai",
    ],
    successFactors: [
      "Founder-market fit — pahami industri yang kamu masuki",
      "Co-founder komplementer — skillset saling melengkapi",
      "Mentor dan advisory board yang tepat",
      "Tim yang solid dan punya misi sama",
      "Modal cukup untuk 18-24 bulan operasi",
      "Market timing — masuk pasar di waktu yang tepat",
    ],
  },
  agePath: [
    { ageRange: "16-18", title: "Eksplorasi & Problem Finding", description: "Temukan masalah nyata yang ingin kamu selesaikan — bukan cari ide bisnis.", milestones: ["Praktik jualan kecil-kecilan (online shop, jasa)", "Magang di startup atau UKM", "Baca 10 buku bisnis & entrepreneurship", "Bangun network di komunitas wirausaha"] },
    { ageRange: "19-22", title: "Kuliah + Side Project", description: "Kampus adalah safety net untuk mencoba hal baru tanpa risiko besar.", milestones: ["Side project atau bisnis kecil selama kuliah", "Validasi ide dengan 20+ wawancara customer", "Mulai freelance/agency kecil", "Ikut program entrepreneur kampus"] },
    { ageRange: "23-27", title: "First Venture & Early Failure", description: "Usia paling umum untuk memulai venture serius — dan mengalami kegagalan pertama.", milestones: ["Launch produk/MVP pertama", "Dapat 10 paying customers", "Experience first failure (produk gagal, co-founder conflict)", "Evaluasi: pivot atau lanjut?"] },
    { ageRange: "28-35", title: "Scale & Fundraising", description: "Jika venture bertahan, fase scaling. Jika tidak, pengalaman jadi modal.", milestones: ["Hire first 3-5 employees", "Raise seed/Series A atau bootstrap profitable", "Bangun sistem dan culture", "Kelola cash flow sehat"] },
    { ageRange: "35+", title: "Portfolio & Impact", description: "Entrepreneur mapan biasanya mulai investasi, mentoring, atau venture baru.", milestones: ["Angel invest atau jadi advisor", "Bangun portfolio bisnis", "Mentor entrepreneur muda", "Exit atau IPO"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Idea Validation", description: "Cari masalah, bukan solusi.", keyActions: ["Wawancara 20+ calon customer", "Buat problem statement", "Cek apakah orang mau bayar"] },
    { period: "3-12 Bulan", title: "MVP & First Revenue", description: "Ship cepat. Pendapatan pertama adalah milestone paling jujur.", keyActions: ["Build MVP dalam 2-4 minggu", "Launch ke 50 user pertama", "Dapat pendapatan pertama"] },
    { period: "1-3 Tahun", title: "Product-Market Fit", description: "Retensi, bukan akuisisi. Apakah user kembali?", keyActions: ["Kejar retention > 30% bulanan", "Iterasi berdasarkan feedback", "Hire employee pertama"] },
    { period: "3-5 Tahun", title: "Growth & Systems", description: "Scale requires systems, not just heroics.", keyActions: ["Bangun SOP dan tim", "Diversifikasi revenue stream", "Buka fundraising atau bootstrap profitable"] },
    { period: "5-10 Tahun", title: "Maturity & Exit/Expansion", description: "Bisnis stabil atau siap di-scale ke level berikutnya.", keyActions: ["Ekspansi ke pasar/vertikal baru", "Siapkan exit atau IPO", "Bangun legacy"] },
  ],
  realityCheck: {
    hardTruths: [
      "90% startup gagal dalam 3 tahun pertama. Ini bukan statistik menakutkan — ini realita yang harus kamu terima sebelum mulai.",
      "Menjadi founder berarti kesepian, stres, dan gaji tidak tetap selama 1-3 tahun. Keluarga mungkin tidak akan paham.",
      "Co-founder conflict adalah penyebab #1 kegagalan startup, bukan produk atau pasar. Pilih partner seperti memilih pasangan hidup.",
      "Modal bukan jaminan sukses. Banyak startup dengan funding besar tetap gagal karena unit ekonomi tidak sehat.",
    ],
    silverLinings: [
      "Skill yang kamu pelajari (sales, problem-solving, leadership) berlaku di karier apapun — bahkan jika bisnis gagal.",
      "Gagal di venture pertama adalah 'MBA mahal' — founder yang gagal punya tingkat sukses lebih tinggi di venture kedua.",
      "Ekosistem startup Indonesia tumbuh pesat. Ada lebih banyak mentor, investor, dan program akselerator dari sebelumnya.",
    ],
    transferableSkills: [
      "Problem-solving dan critical thinking — dicari di karier konsultan, manajemen, dan teknologi.",
      "Public speaking, pitching, dan negosiasi — berlaku di sales, hukum, dan hubungan masyarakat.",
      "Manajemen keuangan dan operasional — berlaku di peran manajemen dan kepemimpinan apapun.",
    ],
  },
  alternativePaths: [
    { scenario: "Produk tidak mencapai product-market fit setelah 2 tahun", steps: [
      { transition: "Analisis data: pivot atau tutup?", role: "Pivot Founder", description: "Evaluasi apa yang berhasil. Pivot ke masalah terkait atau segmen berbeda." },
      { transition: "Jika pivot juga gagal, tutup dengan elegan", role: "Operator Sukses", description: "Kembalikan sisa modal ke investor, bantu tim dapat kerja baru. Tidak ada malu dalam kegagalan." },
      { transition: "Gunakan pengalaman untuk karir korporat", role: "Product Manager / GM", description: "Founder experience adalah nilai jual tinggi untuk peran manajemen produk atau general manager." },
    ]},
    { scenario: "Tidak bisa fundraising karena kondisi pasar", steps: [
      { transition: "Bootstrap — jalankan bisnis dengan revenue", role: "Bootstrapper", description: "Buffer, Mailchimp, dan Basecamp jadi besar tanpa VC. Fokus ke profit, bukan growth." },
      { transition: "Cari alternate funding", role: "Founder Alternatif", description: "Revenue-based financing, hibah pemerintah, angel investor kecil, atau crowdfunding." },
    ]},
    { scenario: "Co-founder conflict tidak bisa diselesaikan", steps: [
      { transition: "Mediasi dengan advisor atau board", role: "Co-founder", description: "Advisor netral bisa membantu memisahkan ego dari masalah bisnis." },
      { transition: "Buyout atau pisah jalan", role: "Solo Founder", description: "Salah satu co-founder keluar. Sisa kepemilikan dinegosiasikan." },
    ]},
  ],
  masterclassLessons: [
    { person: "Nadiem Makarim", role: "Founder Gojek — Menteri Pendidikan", lesson: "Solusi hebat lahir dari masalah sederhana yang dialami banyak orang.", story: "Nadiem melihat ojek mangkal di jalan menunggu penumpang, sementara orang-orang butuh transportasi cepat di jalan macet. Ia tidak menciptakan teknologi baru — ia mengaplikasikan teknologi ke masalah lama dengan cara baru.", keyInsight: "Masalah sehari-hari yang membuat frustrasi adalah ladang bisnis paling subur.", actionItem: "Setiap kali frustrasi dengan sesuatu minggu ini, tulis masalahnya dan tanya: 'Apakah 100.000 orang lain juga merasakan ini?' Lalu cari solusinya." },
    { person: "William Tanuwijaya", role: "Founder Tokopedia", lesson: "Kesabaran dan misi jangka panjang mengalahkan strategi jangka pendek.", story: "Tokopedia butuh 6 tahun untuk mencapai profit. Di tengah jalan, banyak yang bilang Tokopedia harus berubah model bisnis. William tetap fokus pada misi 'pemerataan ekonomi secara digital'. Hari ini Tokopedia adalah platform e-commerce terbesar di Indonesia.", keyInsight: "Misi yang jelas membuat kamu bertahan saat strategi jangka pendek gagal.", actionItem: "Tulis misi perusahaan dalam satu kalimat. Sebelum setiap keputusan besar, tanya: 'Apakah ini mendekatkan kita pada misi?'" },
    { person: "Achmad Zaky", role: "Founder Bukalapak", lesson: "Tidak semua keputusan bisnis harus 'pintar' — kadang keputusan 'hati' yang tepat.", story: "Saat banyak marketplace fokus ke kota besar, Zaky memilih fokus ke UMKM di kota kecil dan desa. Secara bisnis, ini keputusan 'bodoh' — biaya aquisisi lebih tinggi, logistik lebih susah. Tapi ini selaras dengan misi memberdayakan UKM Indonesia.", keyInsight: "Keputusan yang selaras dengan misi sering terlihat 'tidak efisien' di awal, tapi membangun moat yang kuat di jangka panjang.", actionItem: "Buat satu keputusan minggu ini yang mengutamakan misi, bukan efisiensi jangka pendek." },
  ],
});

r("programmer", {
  slug: "programmer",
  title: "Programmer",
  description: "Jalur menjadi programmer dari coding pertama hingga full-stack engineer profesional.",
  emoji: "\uD83D\uDCBB",
  color: "from-primary to-secondary",
  duration: "6-12 bulan",
  category: "tech",
  dream: {
    title: "Software Engineer Profesional",
    description: "Membangun karir sebagai programmer yang bisa membuat aplikasi, bekerja di perusahaan teknologi, dan terus belajar teknologi baru.",
    whyMatters: "Programming adalah superpower di era digital. Dengan coding, kamu bisa menciptakan solusi untuk jutaan orang, bekerja dari mana saja, dan memiliki karir yang terus berkembang.",
    estimatedJourney: "6-12 bulan untuk siap kerja, 3-5 tahun untuk menjadi senior.",
    careerPossibilities: [
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack Developer",
      "Mobile Developer",
      "Data Scientist",
      "DevOps Engineer",
      "Tech Lead / Engineering Manager",
      "Founder Teknologi",
    ],
    successExamples: [
      "Haryanto Hidayat — Software Engineer di Google",
      "Felicia Putri — Frontend Engineer di Gojek",
      "Dika Pratama — Full-stack Developer, founder startup edtech",
      "Rina Amalia — Data Scientist di Tokopedia",
    ],
  },
  dailyWins: [
    {
      category: "Pagi", emoji: "\u2600\uFE0F",
      habits: [
        { id: "pr-dw-1", title: "Bangun Pagi (06:00)", description: "Mulai hari dengan cukup waktu persiapan", icon: "Sunrise" },
        { id: "pr-dw-2", title: "Baca Tech News 15 Menit", description: "Update perkembangan teknologi terbaru", icon: "BookOpen" },
        { id: "pr-dw-3", title: "Review Code Yesterday", description: "Cek PR/commit kemarin, rencanakan hari ini", icon: "Target" },
      ],
    },
    {
      category: "Ngoding", emoji: "\uD83D\uDCBB",
      habits: [
        { id: "pr-dw-4", title: "Deep Coding Session (2 jam)", description: "Fokus coding tanpa distraksi", icon: "Zap" },
        { id: "pr-dw-5", title: "Solve 1 Algorithm Challenge", description: "LeetCode, HackerRank, atau Codewars", icon: "Trophy" },
        { id: "pr-dw-6", title: "Code Review", description: "Review code teman atau open source", icon: "Users" },
      ],
    },
    {
      category: "Malam", emoji: "\uD83C\uDF19",
      habits: [
        { id: "pr-dw-7", title: "Dokumentasi & Jurnal Coding", description: "Catat apa yang dipelajari hari ini", icon: "BookOpen" },
        { id: "pr-dw-8", title: "Side Project 30 Menit", description: "Bangun portofolio dengan project pribadi", icon: "Sparkles" },
        { id: "pr-dw-9", title: "Tidur Sebelum 23:00", description: "Istirahat cukup untuk produktivitas", icon: "Moon" },
      ],
    },
  ],
  smallWins: [
    {
      category: "Frontend", emoji: "\uD83C\uDFA8",
      skills: [
        { id: "pr-sw-1", name: "HTML & CSS", description: "Fundamental struktur dan styling web", levels: [
          { label: "Pemula", target: "Buat halaman statis", description: "HTML semantic, CSS dasar, responsive" },
          { label: "Menengah", target: "Layout kompleks", description: "Flexbox, Grid, animasi CSS" },
          { label: "Mahir", target: "CSS architecture", description: "Tailwind, CSS Modules, design system" },
          { label: "Pro", target: "Performance & aksesibilitas", description: "Core Web Vitals, ARIA, SSR" },
        ]},
        { id: "pr-sw-2", name: "JavaScript/TypeScript", description: "Bahasa utama pengembangan web", levels: [
          { label: "Pemula", target: "Dasar JS", description: "Variabel, function, loops, DOM" },
          { label: "Menengah", target: "ES6+ & Async", description: "Promise, async/await, destructuring, modules" },
          { label: "Mahir", target: "TypeScript", description: "Types, generics, utility types" },
          { label: "Pro", target: "Advanced patterns", description: "Design patterns, monorepo, testing" },
        ]},
        { id: "pr-sw-3", name: "React/Next.js", description: "Framework frontend modern", levels: [
          { label: "Pemula", target: "Komponen dasar", description: "JSX, props, state, useEffect" },
          { label: "Menengah", target: "Routing & state", description: "Next.js App Router, Zustand/Context" },
          { label: "Mahir", target: "Full Next.js", description: "Server Components, API routes, auth" },
          { label: "Pro", target: "Arsitektur frontend", description: "Micro-frontend, monorepo, performance" },
        ]},
      ],
    },
    {
      category: "Backend", emoji: "\uD83D\uDD17",
      skills: [
        { id: "pr-sw-4", name: "Node.js / Python", description: "Backend runtime dan API", levels: [
          { label: "Pemula", target: "Buat API sederhana", description: "Express/Fastify, CRUD endpoints" },
          { label: "Menengah", target: "Database & auth", description: "PostgreSQL, Prisma, JWT auth" },
          { label: "Mahir", target: "Arsitektur backend", description: "Clean architecture, testing, caching" },
          { label: "Pro", target: "Microservices", description: "Message queues, Docker, CI/CD" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "pr-bw-1", title: "Website Pertama", description: "Buat dan deploy website pribadi", order: 1, isEssential: true, stage: "beginner" },
    { id: "pr-bw-2", title: "Selesaikan Bootcamp/Kursus", description: "Tamatkan kursus programming terstruktur", order: 2, isEssential: true, stage: "beginner" },
    { id: "pr-bw-3", title: "First Open Source PR", description: "Kontribusi ke project open source", order: 3, isEssential: false, stage: "beginner" },
    { id: "pr-bw-4", title: "Portofolio Project", description: "Project nyata yang bisa ditunjukkan ke recruiter", order: 4, isEssential: true, stage: "intermediate" },
    { id: "pr-bw-5", title: "First Freelance/Job", description: "Dapat proyek berbayar atau pekerjaan pertama", order: 5, isEssential: true, stage: "intermediate" },
    { id: "pr-bw-6", title: "Tech Talk/Presentasi", description: "Presentasi di meetup atau konferensi", order: 6, isEssential: false, stage: "intermediate" },
    { id: "pr-bw-7", title: "Lead Project", description: "Memimpin project engineering dari awal", order: 7, isEssential: true, stage: "advanced" },
    { id: "pr-bw-8", title: "Mentor Junior Developer", description: "Membimbing programmer lain", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Fundamental CS (data structures & algorithms)",
      "Satu bahasa pemrograman dikuasai dengan dalam",
      "Version control (Git) — wajib hukumnya",
      "Database (SQL + NoSQL) untuk menyimpan data",
      "API design (REST/GraphQL) — menghubungkan sistem",
      "Testing — jamin kualitas kode",
      "Deployment & DevOps — shipping ke production",
    ],
    habits: [
      "Code setiap hari — konsistensi > intensitas",
      "Baca kode orang lain — open source adalah sekolah gratis",
      "Dokumentasi apa yang dipelajari — blog atau catatan",
      "Ikut komunitas programming — Discord, Telegram, meetup",
      "Kerjakan side project — portofolio jauh lebih kuat dari sertifikat",
    ],
    mindset: [
      "Growth mindset — teknologi berubah, kamu harus terus belajar",
      "Problem solver — programming adalah tentang memecahkan masalah",
      "Detail-oriented — satu titik koma bisa bedain sukses dan error",
      "Sabar — debugging bisa berjam-jam, itu normal",
      "Kolaboratif — kode yang baik adalah yang bisa dibaca tim",
    ],
    tools: [
      "Code editor: VS Code atau Cursor/ Windsurf",
      "Version control: Git + GitHub/GitLab",
      "Terminal: iTerm2, Warp, atau terminal bawaan",
      "Design: Figma untuk kolaborasi dengan designer",
      "API testing: Postman atau Bruno",
      "AI Assistant: Claude, Cursor, GitHub Copilot",
    ],
    commonMistakes: [
      "Tutorial hell — terus ikut tutorial tanpa bikin project sendiri",
      "Not invented here — bikin ulang yang sudah ada",
      "Abaikan fundamental — langsung ke framework tanpa paham dasar",
      "Perfect is enemy of done — terlalu perfeksionis sampai tidak ship",
      "Burnout — coding 12 jam sehari tanpa istirahat",
      "Impostor syndrome — merasa tidak cukup pintar, padahal normal",
    ],
    successFactors: [
      "Konsistensi coding setiap hari minimal 1-2 jam",
      "Bangun network di komunitas tech",
      "Side project yang relevan dengan industri",
      "Mentor yang bisa memberi feedback kode",
      "Portofolio yang menunjukkan proses, bukan hanya hasil",
      "Kemampuan komunikasi dan teamwork",
      "Terus belajar — teknologi berubah setiap 6 bulan",
    ],
  },
  agePath: [
    { ageRange: "13-17", title: "Eksplorasi & Fundamental", description: "Usia ideal untuk eksplorasi — coba HTML, CSS, Python, atau scratch.", milestones: ["Buat website/animasi pertama", "Pelajari logika pemrograman", "Ikut coding club atau bootcamp singkat"] },
    { ageRange: "18-21", title: "Pendidikan Formal + Side Projects", description: "Universitas memberikan foundation, side project memberikan portofolio.", milestones: ["Pilih jurusan terkait (Ilmu Komputer, Sistem Informasi)", "Kerjakan 2-3 side project", "Ikut organisasi atau hackathon", "Mulai kontribusi open source"] },
    { ageRange: "22-25", title: "Karir Awal & Specialisasi", description: "3-5 tahun pertama adalah investasi terbesar untuk skill.", milestones: ["Dapat kerja pertama di tech", "Pilih spesialisasi (frontend/backend/mobile/data)", "Bangun reputasi di komunitas"] },
    { ageRange: "25-30", title: "Senior & Leadership", description: "Transisi dari 'menyelesaikan tugas' ke 'memimpin solusi'.", milestones: ["Jadi senior engineer atau tech lead", "Lead project dari 0 ke production", "Mentor engineer junior"] },
    { ageRange: "30+", title: "Staff/Principal atau Manajemen", description: "Dua jalur: IC track (staff/principal) atau management track (EM/CTO).", milestones: ["Pilih IC atau management track", "Bangun pengaruh lintas tim", "Kontribusi ke industri (talk, blog, open source)"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Fundamental Programming", description: "Variable, function, loop adalah alfabet programming.", keyActions: ["Pilih satu bahasa (JS/Python)", "Kuasai logika dasar", "Buat proyek kecil (kalkulator, todo app)"] },
    { period: "3-12 Bulan", title: "Web/Mobile Fundamentals", description: "Pahami cara internet bekerja, request-response, database dasar.", keyActions: ["HTML/CSS/JS atau React Native", "Koneksikan frontend ke database", "Deploy proyek pertama ke internet"] },
    { period: "1-3 Tahun", title: "Production Readiness", description: "Kode yang jalan berbeda dengan kode yang siap production.", keyActions: ["Pelajari Git, testing, CI/CD", "Pahami design patterns", "Kerjakan proyek portofolio"] },
    { period: "3-5 Tahun", title: "Senior Engineering", description: "Dari menulis kode ke merancang arsitektur.", keyActions: ["System design & scalability", "Mentor junior", "Lead project end-to-end"] },
    { period: "5-10 Tahun", title: "Staff/Principal or EM", description: "Puncak karir engineering — influence tanpa otoritas.", keyActions: ["Deep specialization atau broad architecture", "Cross-team impact", "Industry contribution"] },
  ],
  realityCheck: {
    hardTruths: [
      "Programming itu 80% debugging, 20% coding. Jika kamu tidak sabar mencari error, profesi ini akan menyiksa.",
      "Teknologi berganti setiap 2-3 tahun. Yang kamu pelajari hari ini bisa obsolete dalam 5 tahun — continuous learning bukan pilihan, tapi keharusan.",
      "Gaji tinggi di tahun pertama bukan jaminan. Banyak programmer yang stagnan di level menengah karena berhenti belajar.",
      "Work-life balance di industri tech semakin buruk. 'Crunch time' dan 'on-call' adalah norma di banyak perusahaan.",
    ],
    silverLinings: [
      "Programming memberi kemampuan untuk menciptakan sesuatu dari nol — kekuatan yang hampir tidak ada di profesi lain.",
      "Remote working dan freelance memungkinkan gaya hidup yang fleksibel secara geografis.",
      "Komunitas tech Indonesia sangat suportif — dari Discord, Telegram, hingga meetup offline.",
    ],
    transferableSkills: [
      "Logical thinking dan problem decomposition — berlaku di bidang hukum, keuangan, dan konsultasi.",
      "System thinking — kemampuan memahami sistem kompleks yang berlaku di operasional bisnis.",
      "Attention to detail — berlaku di bidang yang membutuhkan ketelitian tinggi (akuntansi, editing, QA).",
    ],
  },
  alternativePaths: [
    { scenario: "Tidak kuat dengan matematika/logika programming", steps: [
      { transition: "Coba role non-coding di tech", role: "Technical Writer", description: "Buat dokumentasi API, tutorial, atau content teknis." },
      { transition: "Pindah ke UI/UX Design", role: "UX Designer", description: "Desain interface tanpa coding. Coding membantu tapi tidak wajib." },
      { transition: "QA / Testing Engineer", role: "QA Engineer", description: "Testing membutuhkan ketelitian, bukan kreativitas coding." },
    ]},
    { scenario: "Bootcamp graduate yang tidak dapat kerja setelah 6 bulan", steps: [
      { transition: "Tambah portofolio dengan 1-2 full-stack project", role: "Full-Stack Developer", description: "Buat project nyata (bukan tutorial) yang solve masalah sehari-hari." },
      { transition: "Freelance kecil untuk pengalaman", role: "Freelance Developer", description: "Platform seperti Upwork, Sribulancer, atau Fastwork untuk proyek kecil." },
      { transition: "Magang atau volunteer di startup", role: "Intern Developer", description: "Startup kecil sering menerima magang tanpa bayaran demi portofolio." },
    ]},
    { scenario: "Bosan dengan frontend/backend, ingin tantangan baru", steps: [
      { transition: "Explore DevOps / Cloud", role: "DevOps Engineer", description: "Docker, K8s, AWS/GCP — automation dan infrastructure." },
      { transition: "Pindah ke Data Science / AI", role: "Data Engineer", description: "Python + SQL + statistics — analisis data dan machine learning." },
      { transition: "Mobile Development", role: "Mobile Developer", description: "React Native, Flutter, atau Kotlin/Swift untuk aplikasi mobile." },
    ]},
  ],
  masterclassLessons: [
    { person: "Linus Torvalds", role: "Penulis Linux & Git", lesson: "Kode yang baik adalah kode yang tidak perlu ditulis ulang oleh orang lain.", story: "Torvalds menulis Linux sebagai proyek hobi. Ia tidak membuat kernel yang sempurna — ia membuat kernel yang cukup baik dan membiarkan komunitas mengembangkannya. Git pun lahir dari frustrasi dengan version control yang ada.", keyInsight: "Jangan tunda release demi kesempurnaan. Rilis cepat, iterasi berdasarkan feedback. Linux dan Git dimulai dari 'cukup baik', bukan 'sempurna'.", actionItem: "Bulan ini, rilis satu proyek side project ke publik meskipun belum sempurna. YouTube, GitHub, atau blog." },
    { person: "Haryanto Hidayat", role: "Software Engineer di Google", lesson: "Karier programming adalah maraton, bukan sprint — jaga pace-mu.", story: "Haryanto memulai dari nol tanpa latar belakang computer science. Ia belajar sambil kerja, konsisten 1-2 jam coding setiap malam, dan dalam 5 tahun mencapai level yang membawanya ke Google.", keyInsight: "Progress 1% setiap hari = 37x improvement dalam setahun. Konsistensi mengalahkan intensitas.", actionItem: "Commit untuk coding minimal 30 menit setiap hari tanpa libur — bahkan hari libur. Track streak-mu." },
    { person: "Felicia Putri", role: "Frontend Engineer di Gojek", lesson: "Karier bukan linear. Detours often lead to the best destinations.", story: "Felicia awalnya kuliah desain grafis, bukan computer science. Ia belajar coding otodidak untuk membuat website portofolio dan jatuh cinta. Sekarang ia Frontend Engineer di salah satu unicorn terbesar.", keyInsight: "Latar belakang non-CS justru bisa jadi kekuatan — perspektif berbeda dalam memecahkan masalah.", actionItem: "Aplikasikan skill non-teknis ke coding-mu. Jika kamu suka desain, jadi frontend specialist. Jika suka psikologi, explore UX." },
  ],
});

r("runner", {
  slug: "runner",
  title: "Pelari Profesional",
  description: "Jalur menjadi pelari dari pemula hingga atlet lari jarak jauh dan sprint.",
  emoji: "\uD83C\uDFC3",
  color: "from-sky-600 to-cyan-500",
  duration: "1-3 tahun",
  category: "sports",
  dream: {
    title: "Atlet Lari Profesional",
    description: "Mencapai performa puncak sebagai pelari yang mampu bersaing di level nasional dan internasional.",
    whyMatters: "Lari mengajarkan disiplin, ketekunan, dan kekuatan mental. Menjadi pelari profesional berarti menginspirasi gaya hidup sehat dan aktif.",
    estimatedJourney: "1-3 tahun untuk race pertama, 5+ tahun untuk level kompetitif.",
    careerPossibilities: ["Atlet Lari Profesional", "Pelatih Lari", "Fisioterapis Olahraga", "Event Organizer Race", "Content Creator Fitness"],
    successExamples: ["Agus Prayogo — pelari maraton nasional, perak SEA Games", "Robi Syianturi — pelari jarak jauh Indonesia, emas SEA Games"],
  },
  dailyWins: [
    { category: "Pagi", emoji: "\u2600\uFE0F", habits: [
      { id: "rn-dw-1", title: "Bangun Pagi (05:00)", description: "Mulai hari lebih awal untuk lari pagi", icon: "Sunrise" },
      { id: "rn-dw-2", title: "Stretching & Warm-up", description: "Peregangan dinamis 15 menit", icon: "Zap" },
      { id: "rn-dw-3", title: "Sarapan Bernutrisi", description: "Oatmeal, pisang, atau roti gandum", icon: "Heart" },
    ]},
    { category: "Latihan", emoji: "\uD83C\uDFC3", habits: [
      { id: "rn-dw-4", title: "Easy Run (30-45 menit)", description: "Lari santai untuk endurance", icon: "Target" },
      { id: "rn-dw-5", title: "Strength Training", description: "Core, squat, lunges untuk kekuatan kaki", icon: "Flame" },
      { id: "rn-dw-6", title: "Cool Down & Stretching", description: "Peregangan statis 10-15 menit", icon: "Clock" },
    ]},
    { category: "Malam", emoji: "\uD83C\uDF19", habits: [
      { id: "rn-dw-7", title: "Catat Jurnal Lari", description: "Jarak, waktu, pace, dan perasaan hari ini", icon: "BookOpen" },
      { id: "rn-dw-8", title: "Tidur Sebelum 21:30", description: "Tidur 8 jam untuk recovery optimal", icon: "Moon" },
    ]},
  ],
  smallWins: [{
    category: "Lari", emoji: "\uD83C\uDFC3", skills: [
      { id: "rn-sw-1", name: "Endurance", description: "Daya tahan lari jarak jauh", levels: [
        { label: "Pemula", target: "Lari 3km nonstop", description: "Mulai dengan jogging 3km" },
        { label: "Menengah", target: "Lari 10km nonstop", description: "Membangun base mileage" },
        { label: "Mahir", target: "Lari half marathon", description: "21km dengan pace konsisten" },
        { label: "Pro", target: "Lari full marathon", description: "42km dengan pace kompetitif" },
      ]},
      { id: "rn-sw-2", name: "Speed", description: "Kecepatan lari sprint dan interval", levels: [
        { label: "Pemula", target: "Pace 8 min/km", description: "Lari santai" },
        { label: "Menengah", target: "Pace 6 min/km", description: "Lari tempo" },
        { label: "Mahir", target: "Pace 5 min/km", description: "Interval training" },
        { label: "Pro", target: "Pace < 4 min/km", description: "Kecepatan kompetitif" },
      ]},
      { id: "rn-sw-3", name: "Teknik Lari", description: "Form dan efisiensi lari", levels: [
        { label: "Pemula", target: "Postur dasar", description: "Tegap, pandangan ke depan" },
        { label: "Menengah", target: "Cadence 160+", description: "Langkah kaki cepat dan ringan" },
        { label: "Mahir", target: "Cadence 170+", description: "Mid-foot strike efisien" },
        { label: "Pro", target: "Form optimal", description: "Efisiensi energi maksimal" },
      ]},
    ],
  }],
  bigWins: [
    { id: "rn-bw-1", title: "Lari 5km Nonstop", description: "Pertama kali lari 5km tanpa berhenti", order: 1, isEssential: true, stage: "beginner" },
    { id: "rn-bw-2", title: "Race Pertama (5km/10km)", description: "Ikut event lari resmi pertama", order: 2, isEssential: true, stage: "beginner" },
    { id: "rn-bw-3", title: "Sub-30 Menit 5km", description: "Finish 5km di bawah 30 menit", order: 3, isEssential: false, stage: "beginner" },
    { id: "rn-bw-4", title: "Half Marathon Finish", description: "Selesaikan 21km dalam event resmi", order: 4, isEssential: true, stage: "intermediate" },
    { id: "rn-bw-5", title: "Full Marathon Finish", description: "Selesaikan 42km dalam event resmi", order: 5, isEssential: true, stage: "advanced" },
    { id: "rn-bw-6", title: "Podium Race Lokal", description: "Top 3 di event lari lokal", order: 6, isEssential: false, stage: "advanced" },
    { id: "rn-bw-7", title: "Qualify Event Nasional", description: "Memenuhi syarat untuk event nasional", order: 7, isEssential: true, stage: "professional" },
  ],
  blueprint: {
    skills: ["Teknik lari efisien dan ekonomis", "Kekuatan core dan kaki", "Manajemen pace dan energi", "Nutrisi olahraga dan hidrasi", "Pemulihan dan pencegahan cedera"],
    habits: ["Lari 4-5 kali seminggu", "Cross-training (renang, sepeda)", "Sleep hygiene 8 jam", "Foam rolling dan stretching harian", "Catat progres lari setiap hari"],
    mindset: ["Konsisten adalah kunci — kecepatan datang dari volume", "Dengarkan tubuhmu — istirahat sama penting dengan latihan", "Nikmati proses, bukan hanya tujuan finish", "Setiap lari adalah kemenangan kecil"],
    tools: ["Sepatu lari sesuai tipe kaki", "GPS watch (Garmin/Polar/Coros)", "Aplikasi Strava untuk tracking", "Foam roller dan massage gun", "Hydration belt untuk long run"],
    commonMistakes: ["Terlalu cepat menambah jarak — risiko cedera", "Abaikan strength training", "Pace terlalu cepat di awal race", "Malas pemanasan dan pendinginan"],
    successFactors: ["Konsistensi latihan selama bertahun-tahun", "Periodisasi latihan yang terstruktur", "Dukungan komunitas lari", "Nutrisi dan hidrasi optimal", "Istirahat cukup dan manajemen stres"],
  },
  agePath: [
    { ageRange: "15-20", title: "Base Building & Discovery", description: "Temukan jenis lari yang cocok — sprint, jarak menengah, atau marathon.", milestones: ["Lari rutin 3x seminggu", "Finish 5km nonstop", "Ikut fun run 5km/10km", "Cek postur dan sepatu lari"] },
    { ageRange: "21-25", title: "Racing & Community", description: "Mulai ikut race reguler. Bergabung dengan komunitas lari.", milestones: ["Finish half marathon", "Gabung running club", "Ikut 2-3 race per tahun", "Mulai track progres dengan GPS watch"] },
    { ageRange: "26-35", title: "Competitive Peak", description: "Potensi fisik puncak untuk pelari jarak jauh.", milestones: ["Finish marathon", "Target sub-4 jam marathon", "Ikut race nasional", "Konsisten latihan 5-6x seminggu"] },
    { ageRange: "35-45", title: "Master Athlete & Coaching", description: "Pelari veteran dengan kebijaksanaan dan konsistensi.", milestones: ["Kompetisi master division", "Mulai coaching atau mentoring", "Explore trail/ultra running"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Mulai Lari", description: "Dari jalan cepat ke jogging konsisten.", keyActions: ["Couch to 5K program", "Streching setelah lari", "Cari sepatu yang pas"] },
    { period: "3-12 Bulan", title: "Base Mileage", description: "Bangun volume dengan aman.", keyActions: ["Lari 10-15km/minggu", "Cross-training 1x/minggu", "Ikut fun run pertama"] },
    { period: "1-3 Tahun", title: "Racing Regular", description: "Kompetisi rutin untuk ukur progres.", keyActions: ["Half marathon finish", "Latihan interval & tempo", "Strength training 2x/minggu"] },
    { period: "3-5 Tahun", title: "Marathon & Beyond", description: "Full marathon adalah milestone.", keyActions: ["Full marathon finish", "Periodisasi latihan", "Race pacing strategy"] },
  ],
  realityCheck: {
    hardTruths: ["Cedera adalah bagian dari lari — ITBS, shin splints, plantar fasciitis hampir pasti akan kamu alami.", "Progres tidak linear. Ada minggu terasa mundur — itu normal.", "Race day tidak selalu sesuai rencana. Cuaca, pencernaan, mental — banyak faktor di luar kendali."],
    silverLinings: ["Lari mengajarkan bahwa tujuan besar dicapai langkah demi langkah.", "Komunitas lari Indonesia sangat solid dan suportif — dari Runners Community hingga induk organisasi.", "Manfaat kesehatan lari (jantung, mental, imun) terasa bahkan saat kamu tidak lagi kompetitif."],
    transferableSkills: ["Goal setting dan periodisasi — berlaku di manajemen proyek dan karir.", "Resilience — kemampuan terus maju saat tubuh dan pikiran ingin berhenti.", "Data analysis — memahami pace, heart rate, splits bisa diterapkan di analitik bisnis."],
  },
  alternativePaths: [
    { scenario: "Cedera kronis tidak bisa lari jarak jauh", steps: [
      { transition: "Ganti ke low-impact cardio", role: "Swimmer / Cyclist", description: "Renang dan sepeda memberi kardio tanpa impact." },
      { transition: "Fokus ke coaching daripada lari", role: "Running Coach", description: "Pengalaman lari berharga untuk melatih orang lain." },
    ]},
    { scenario: "Tidak ada waktu untuk latihan marathon", steps: [
      { transition: "Fokus ke 5km/10km", role: "Speed Runner", description: "Jarak pendek tapi intensitas tinggi." },
      { transition: "Parkrun atau lari komunitas", role: "Social Runner", description: "Lari tanpa target waktu, fokus ke kebersamaan." },
    ]},
  ],
  masterclassLessons: [
    { person: "Eliud Kipchoge", role: "Pelari Marathon — Rekor Dunia", lesson: "No human is limited — batasan ada di pikiran, bukan di tubuh.", story: "Kipchoge berlari marathon di bawah 2 jam — sesuatu yang dianggap mustahil oleh ilmuwan olahraga. Rahasianya: ia percaya tubuh mampu, pikiran yang harus dilatih. Ia bermeditasi, visualisasi finish line, dan tidak pernah mengeluh tentang kondisi.", keyInsight: "Kebanyakan pelari berhenti karena pikirannya menyerah, bukan tubuhnya. Latih mental sama keras seperti fisik.", actionItem: "Di race berikutnya, saat ingin berhenti, ulangi: 'This is where the real race begins.' lalu lanjutkan." },
    { person: "Agus Prayogo", role: "Pelari Marathon Nasional Indonesia", lesson: "Konsistensi di hari-hari biasa menentukan hasil di hari race.", story: "Agus dikenal dengan latihan disiplinnya — lari setiap pagi jam 5, tidak peduli hujan atau panas. Ia tidak menunggu 'mood lari' — ia membuat lari sebagai rutinitas seperti gosok gigi.", keyInsight: "Motivasi bersifat sementara. Disiplin bersifat permanen. Bangun sistem, jangan andalkan motivasi.", actionItem: "Buat jadwal lari mingguan dan tempel di dinding. Ceklis setiap selesai. Target: streak 30 hari." },
  ],
});

r("musician", {
  slug: "musician",
  title: "Musisi Profesional",
  description: "Jalur menjadi musisi dari belajar alat musik hingga tampil dan berkarya profesional.",
  emoji: "\uD83C\uDFB5",
  color: "from-purple-600 to-pink-500",
  duration: "2-5 tahun",
  category: "creative",
  dream: {
    title: "Musisi Profesional",
    description: "Menguasai alat musik, berkarya, dan tampil di panggung sebagai musisi profesional.",
    whyMatters: "Musik adalah bahasa universal. Menjadi musisi berarti bisa mengekspresikan perasaan, menginspirasi orang lain, dan menciptakan karya yang abadi.",
    estimatedJourney: "2-5 tahun untuk mahir, 5-10 tahun untuk profesional.",
    careerPossibilities: ["Pemain Musik Profesional", "Pengajar Musik", "Session Musician", "Komposer/Arranger", "Music Producer", "Music Content Creator"],
    successExamples: ["Andre Dinuth — gitaris ternama Indonesia", "Tohpati — musisi jazz fusion Indonesia", "Rieka Roeslan — vokalis dan penulis lagu"],
  },
  dailyWins: [
    { category: "Latihan", emoji: "\uD83C\uDFB5", habits: [
      { id: "mu-dw-1", title: "Warm-up 15 Menit", description: "Scales, finger exercises, atau vocal warm-up", icon: "Zap" },
      { id: "mu-dw-2", title: "Teknik 30 Menit", description: "Fokus pada teknik spesifik (chord, scale, rhythm)", icon: "Target" },
      { id: "mu-dw-3", title: "Repertoar 30 Menit", description: "Latihan lagu atau materi yang akan dibawakan", icon: "BookOpen" },
    ]},
    { category: "Kreatif", emoji: "\u2728", habits: [
      { id: "mu-dw-4", title: "Improvisasi 15 Menit", description: "Bermain bebas tanpa struktur", icon: "Sparkles" },
      { id: "mu-dw-5", title: "Rekam Ide Musik", description: "Catat ide melodi atau progresi chord", icon: "Music" },
      { id: "mu-dw-6", title: "Dengar Musik Baru", description: "Eksplorasi genre atau artis baru untuk inspirasi", icon: "Headphones" },
    ]},
    { category: "Teori", emoji: "\uD83D\uDCDA", habits: [
      { id: "mu-dw-7", title: "Teori Musik 15 Menit", description: "Baca atau review teori musik", icon: "BookOpen" },
      { id: "mu-dw-8", title: "Ear Training", description: "Latihan pendengaran (interval, chord)", icon: "Headphones" },
    ]},
  ],
  smallWins: [{
    category: "Musik", emoji: "\uD83C\uDFB5", skills: [
      { id: "mu-sw-1", name: "Teknik Instrumen", description: "Penguasaan alat musik utama", levels: [
        { label: "Pemula", target: "Main lagu sederhana", description: "Chord dasar dan rhythm sederhana" },
        { label: "Menengah", target: "Main berbagai genre", description: "Pop, rock, jazz dasar" },
        { label: "Mahir", target: "Teknik lanjutan", description: "Sweep, tapping, improv complex" },
        { label: "Pro", target: "Ekspresi penuh", description: "Dynamic control, feeling, stage presence" },
      ]},
      { id: "mu-sw-2", name: "Musicianship", description: "Kemampuan musikal secara umum", levels: [
        { label: "Pemula", target: "Kenal notasi dasar", description: "Baca tab/not balok sederhana" },
        { label: "Menengah", target: "Main dengan metronome", description: "Timing dan rhythm konsisten" },
        { label: "Mahir", target: "Ear training baik", description: "Tebak chord dan interval dengan telinga" },
        { label: "Pro", target: "Transcribe lagu", description: "Tulis ulang lagu hanya dengan didengar" },
      ]},
    ],
  }],
  bigWins: [
    { id: "mu-bw-1", title: "Main Lagu Lengkap", description: "Main satu lagu dari awal sampai akhir", order: 1, isEssential: true, stage: "beginner" },
    { id: "mu-bw-2", title: "Tampil di Depan Umum", description: "Open mic atau pentas pertama", order: 2, isEssential: true, stage: "beginner" },
    { id: "mu-bw-3", title: "Rekam Cover/Lagu", description: "Produksi rekaman pertama", order: 3, isEssential: true, stage: "intermediate" },
    { id: "mu-bw-4", title: "Gabung Band/Grup", description: "Bermain dengan musisi lain secara rutin", order: 4, isEssential: false, stage: "intermediate" },
    { id: "mu-bw-5", title: "Tampil di Event Resmi", description: "Pentas di acara berbayar", order: 5, isEssential: true, stage: "advanced" },
    { id: "mu-bw-6", title: "Rilis Karya Orisinil", description: "Single atau album pertama", order: 6, isEssential: true, stage: "advanced" },
    { id: "mu-bw-7", title: "Tur atau Residensi", description: "Serangkaian pertunjukan terjadwal", order: 7, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Teknik alat musik solid", "Teori musik (harmoni, rhythm, melodi)", "Ear training", "Stage presence dan performance", "Berkolaborasi dengan musisi lain"],
    habits: ["Latihan rutin setiap hari minimal 1 jam", "Rekam dan evaluasi permainan sendiri", "Dengar banyak genre musik", "Ikut komunitas musik dan jam session", "Jaga kesehatan telinga dan tangan"],
    mindset: ["Disiplin — teknik dibangun dari latihan berulang", "Kreatif — jangan takut bereksperimen", "Rendah hati — selalu ada yang bisa dipelajari", "Konsisten — bakat tanpa latihan tidak cukup"],
    tools: ["Instrumen berkualitas sesuai standar", "Tuner/metronome (digital atau fisik)", "Audio interface untuk rekaman", "DAW (Ableton/GarageBand/Reaper)", "Headphone studio monitor"],
    commonMistakes: ["Latihan tanpa struktur — asal main", "Abaikan teori musik karena bosan", "Terlalu perfeksionis sampai tidak produktif", "Membandingkan diri dengan musisi lain secara tidak sehat"],
    successFactors: ["Latihan terstruktur dengan target jelas", "Mentor atau guru musik yang baik", "Jaringan dan kolaborasi sesama musisi", "Konsistensi jangka panjang", "Kemampuan adaptasi berbagai genre"],
  },
  agePath: [
    { ageRange: "6-12", title: "Eksplorasi & Enjoyment", description: "Golden age untuk membangun cinta musik tanpa tekanan.", milestones: ["Coba 2-3 alat musik", "Main lagu anak-anak sederhana", "Ikut paduan suara atau ekstrakurikuler musik"] },
    { ageRange: "13-17", title: "Fundamentals & Discipline", description: "Teknik dasar dibangun di usia ini. Teori musik mulai penting.", milestones: ["Pilih instrumen utama", "Les rutin dengan guru", "Main 5 lagu lengkap", "Belajar baca notasi balok/tab"] },
    { ageRange: "18-22", title: "Performance & Creation", description: "Transisi dari murid ke musisi. Pentas dan rekaman.", milestones: ["Tampil di event kampus/komunitas", "Rekam demo atau cover", "Bergabung dengan band/grup", "Mulai eksplorasi genre spesifik"] },
    { ageRange: "23-30", title: "Professional Path", description: "Karir musik atau industri kreatif.", milestones: ["Jadi session musician atau pengajar", "Rilis karya original pertama", "Bangun portofolio dan personal brand"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "First Notes", description: "Kenali alat musikmu. Bunyi yang baik, postur yang benar.", keyActions: ["Latihan 15 menit setiap hari", "Hafal chord/kunci dasar", "Main 1 lagu sederhana"] },
    { period: "3-12 Bulan", title: "Building Foundation", description: "Teknik mulai terbentuk. Ritme mulai stabil.", keyActions: ["Latihan 30 menit/hari", "Main 5-10 lagu", "Belajar teori dasar (skala, interval)"] },
    { period: "1-3 Tahun", title: "Intermediate Level", description: "Improvisasi mulai mungkin. Genre mulai terbentuk.", keyActions: ["Main dengan metronome", "Coba 2-3 genre berbeda", "Tampil di depan teman/keluarga"] },
    { period: "3-5 Tahun", title: "Advanced & Performing", description: "Teknik cukup matang. Saatnya berekspresi.", keyActions: ["Rekam performa", "Ikut jam session reguler", "Eksplorasi produksi musik"] },
  ],
  realityCheck: {
    hardTruths: ["Penghasilan musisi tidak stabil. Banyak musisi hebat yang tetap punya side job.", "Bakat saja tidak cukup. Ratusan jam latihan membosankan diperlukan sebelum kamu 'mahir'.", "Industri musik Indonesia kecil dan sulit ditembus tanpa koneksi — jaringan sama penting dengan skill."],
    silverLinings: ["Era digital memungkinkan musisi independen merilis karya tanpa label.", "Musik membuka pintu ke industri kreatif lebih luas — produksi konten, advertising, game.", "Skill musik adalah investasi seumur hidup — semakin tua semakin dalam pengalaman bermusik."],
    transferableSkills: ["Performa di depan umum — berlaku di public speaking, presentasi, dan pitching.", "Kolaborasi dan dinamika tim — berlaku di manajemen proyek dan organisasi.", "Disiplin latihan — praktik yang berharga di bidang apapun yang butuh mastery."],
  },
  alternativePaths: [
    { scenario: "Tidak bisa memonetisasi musik sebagai performa", steps: [
      { transition: "Jadi pengajar musik", role: "Guru Musik", description: "Giving lessons is stable income dan tetap bermain musik." },
      { transition: "Produksi musik untuk konten", role: "Music Producer", description: "Buat beat, jingle, atau scoring untuk video, podcast, game." },
      { transition: "Teknisi audio / sound engineer", role: "Audio Engineer", description: "Mix, master, dan produksi untuk musisi lain." },
    ]},
    { scenario: "Gagal masuk konservatori atau sekolah musik", steps: [
      { transition: "Belajar online + komunitas", role: "Self-Taught Musician", description: "YouTube, Masterclass, dan komunitas lokal bisa menggantikan pendidikan formal." },
      { transition: "Gabung scene musik lokal", role: "Live Musician", description: "Kafe, bar, dan acara lokal sering cari musisi tanpa ijazah." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tohpati", role: "Gitaris Jazz Fusion Indonesia", lesson: "Mastery bukan tentang menjadi yang terbaik — tentang menjadi yang paling autentik.", story: "Tohpati dikenal dengan gaya bermain yang khas Indonesia — memadukan jazz dengan gamelan dan musik tradisional. Ia tidak mencoba menjadi gitaris jazz ala Amerika, ia menciptakan suara yang hanya bisa dimainkan oleh orang Indonesia.", keyInsight: "Keunikanmu adalah kekuatanmu. Jangan tiru — transformasi. Ciptakan suara yang tidak bisa ditiru orang lain.", actionItem: "Cari satu elemen budaya/daerahmu yang bisa kamu padukan dengan alat musikmu minggu ini." },
    { person: "Andre Dinuth", role: "Gitaris Session & Pengajar", lesson: "Kerja keras 10.000 jam itu nyata. Tidak ada jalan pintas.", story: "Andre dikenal sebagai gitaris yang teknisnya sangat presisi. Rahasianya: ia menghabiskan ribuan jam latihan skala dan teknik dasar sebelum memainkan lagu kompleks. Ia percaya fundamental yang kuat membuat teknik apapun bisa dimainkan.", keyInsight: "Jangan terburu-buru ke lagu favoritmu. Bangun fondasi yang kuat. Skill tingkat lanjut hanyalah variasi dari dasar yang solid.", actionItem: "Luangkan 15 menit SETIAP latihan hanya untuk teknik dasar — scale, chord, atau rhythm — bukan lagu." },
  ],
});

r("content-creator", {
  slug: "content-creator",
  title: "Content Creator",
  description: "Jalur menjadi content creator dari nol hingga profesional di platform digital.",
  emoji: "\uD83D\uDCF9",
  color: "from-rose-600 to-pink-500",
  duration: "6-12 bulan",
  category: "creative",
  dream: {
    title: "Content Creator Profesional",
    description: "Membangun personal brand dan audiens melalui konten kreatif di platform digital.",
    whyMatters: "Content creation adalah karir masa depan. Dengan kreativitas dan konsistensi, kamu bisa membangun komunitas, mempengaruhi orang, dan menciptakan dampak positif.",
    estimatedJourney: "6-12 bulan untuk growth awal, 2-3 tahun untuk full-time.",
    careerPossibilities: ["YouTuber", "TikTok Creator", "Instagram Content Creator", "Podcaster", "Brand Consultant", "Digital Strategist", "Creative Director"],
    successExamples: ["Raditya Dika — kreator konten pertama Indonesia", "Arief Muhammad — content creator & entrepreneur", "Nessie Judge — YouTuber edukasi"],
  },
  dailyWins: [
    { category: "Pagi", emoji: "\u2600\uFE0F", habits: [
      { id: "cc-dw-1", title: "Review Tren & Insight", description: "Cek trending topics di platform", icon: "Target" },
      { id: "cc-dw-2", title: "Ide Konten 3 Topik", description: "Brainstorm ide konten baru", icon: "Sparkles" },
      { id: "cc-dw-3", title: "Interaksi Audiens", description: "Balas komentar dan DM", icon: "Users" },
    ]},
    { category: "Produksi", emoji: "\uD83C\uDFA5", habits: [
      { id: "cc-dw-4", title: "Produksi Konten", description: "Rekam atau buat konten hari ini", icon: "Zap" },
      { id: "cc-dw-5", title: "Edit & Post", description: "Edit dan upload konten ke platform", icon: "Clock" },
      { id: "cc-dw-6", title: "Analytics Check", description: "Review performa konten kemarin", icon: "TrendingUp" },
    ]},
    { category: "Pengembangan", emoji: "\uD83D\uDCA1", habits: [
      { id: "cc-dw-7", title: "Belajar Skill Baru", description: "Editing, copywriting, atau fotografi", icon: "BookOpen" },
      { id: "cc-dw-8", title: "Konten Stok (Batch)", description: "Buat konten untuk jadwal mendatang", icon: "Clock" },
    ]},
  ],
  smallWins: [{
    category: "Content", emoji: "\uD83D\uDCF9", skills: [
      { id: "cc-sw-1", name: "Video Production", description: "Kemampuan produksi video berkualitas", levels: [
        { label: "Pemula", target: "Rekam HP dasar", description: "Pencahayaan dan audio dasar" },
        { label: "Menengah", target: "Edit sederhana", description: "Cut, transition, BGM" },
        { label: "Mahir", target: "Sinematografi", description: "Komposisi, color grading, motion graphics" },
        { label: "Pro", target: "Production value tinggi", description: "Studio setup, multi-cam, sound design" },
      ]},
      { id: "cc-sw-2", name: "Audience Growth", description: "Kemampuan membangun audiens", levels: [
        { label: "Pemula", target: "100 followers", description: "Konsisten posting 2-3x/minggu" },
        { label: "Menengah", target: "1.000 followers", description: "Engagement rutin dengan audiens" },
        { label: "Mahir", target: "10.000 followers", description: "Viral konten atau kolaborasi" },
        { label: "Pro", target: "100.000+ followers", description: "Brand deals dan monetisasi" },
      ]},
      { id: "cc-sw-3", name: "Copywriting", description: "Kemampuan menulis konten yang engaging", levels: [
        { label: "Pemula", target: "Caption dasar", description: "Deskripsi dan hashtag" },
        { label: "Menengah", target: "Storytelling", description: "Narasi yang menarik audiens" },
        { label: "Mahir", target: "Copy yang konversi", description: "CTA dan brand collaboration" },
        { label: "Pro", target: "Brand voice kuat", description: "Gaya bahasa yang ikonik" },
      ]},
    ],
  }],
  bigWins: [
    { id: "cc-bw-1", title: "Posting Konten Pertama", description: "Upload konten pertama ke platform", order: 1, isEssential: true, stage: "beginner" },
    { id: "cc-bw-2", title: "100 Followers", description: "Mencapai 100 pengikut organik", order: 2, isEssential: true, stage: "beginner" },
    { id: "cc-bw-3", title: "Konten Viral Pertama", description: "Konten mencapai 10.000+ views", order: 3, isEssential: false, stage: "beginner" },
    { id: "cc-bw-4", title: "1.000 Followers", description: "Komunitas mulai terbentuk", order: 4, isEssential: true, stage: "intermediate" },
    { id: "cc-bw-5", title: "Brand Deal Pertama", description: "Kolaborasi berbayar dengan brand", order: 5, isEssential: true, stage: "intermediate" },
    { id: "cc-bw-6", title: "10.000 Followers", description: "TikTok/IG content creator established", order: 6, isEssential: true, stage: "advanced" },
    { id: "cc-bw-7", title: "Full-Time Creator", description: "Penghasilan dari konten cukup untuk hidup", order: 7, isEssential: true, stage: "advanced" },
    { id: "cc-bw-8", title: "100.000+ Followers", description: "Influencer level menengah", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Video production & editing", "Copywriting & storytelling", "SEO & algoritma platform", "Personal branding", "Business & negotiation skills"],
    habits: ["Konsisten posting 3-5x seminggu", "Engage dengan audiens setiap hari", "Riset tren dan kompetitor", "Batch production untuk efisiensi", "Evaluasi analytics mingguan"],
    mindset: ["Konsistensi > viral — bangun audiens setia", "Authenticity matters — jadi diri sendiri", "Belajar terus — platform berubah cepat", "Terima kritik dengan lapang dada"],
    tools: ["HP dengan kamera bagus", "Tripod dan lighting sederhana", "CapCup/Adobe Rush untuk edit", "Canva untuk thumbnail dan grafis", "Analytics tools (native platform)"],
    commonMistakes: ["Membandingkan growth dengan kreator lain", "Mengejar viralitas, lupakan kualitas", "Tidak konsisten — posting lalu hilang berbulan-bulan", "Mengabaikan komunitas dan engagement"],
    successFactors: ["Niche yang spesifik dan autentik", "Konsistensi jangka panjang", "Kolaborasi dengan kreator lain", "Adaptif terhadap tren dan algoritma", "Kualitas konten terus meningkat"],
  },
  agePath: [
    { ageRange: "13-17", title: "Exploration & First Content", description: "Mulai dengan apa yang kamu suka. Jangan khawatir tentang kualitas.", milestones: ["Buat akun di 1-2 platform", "Posting 10 konten pertama", "Eksplorasi format (foto, video, tulisan)", "Cari niche yang terasa natural"] },
    { ageRange: "18-21", title: "Learning & Building", description: "Kuliah adalah waktu aman untuk bereksperimen dengan konten.", milestones: ["Konsisten posting 2-3x/minggu", "Capai 1.000 followers organik", "Pelajari editing dan storytelling", "Bangun personal brand"] },
    { ageRange: "22-25", title: "Growth & Monetization", description: "Audiens mulai terbentuk. Mulai monetisasi kecil-kecilan.", milestones: ["Brand deal atau endorsement pertama", "Konsisten 5.000-10.000 followers", "Coba 2-3 platform berbeda", "Bangun sistem produksi konten"] },
    { ageRange: "26-30", title: "Full-Time Creator or Agency", description: "Pilih: full-time creator atau bangun bisnis konten.", milestones: ["Pendapatan dari konten stabil", "Tim minimal 1-2 orang", "Diversifikasi revenue stream"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Getting Started", description: "Mulai tanpa perfeksionisme.", keyActions: ["Buat akun dan posting 5 konten", "Tentukan niche awal", "Pelajari dasar editing"] },
    { period: "3-12 Bulan", title: "Finding Your Voice", description: "Ratusan konten untuk tahu gaya kamu.", keyActions: ["Posting 3x/minggu konsisten", "Analisis konten mana yang paling engaging", "Interaksi dengan kreator lain"] },
    { period: "1-3 Tahun", title: "Growth Phase", description: "Seperti bola salju — growth mulai terakselerasi.", keyActions: ["Capai 10.000 followers", "Brand collaboration pertama", "Bangun aset (website, mailing list)"] },
    { period: "3-5 Tahun", title: "Professional Creator", description: "Konten sebagai karier penuh waktu.", keyActions: ["Revenue dari 3+ sumber", "Tim atau outsourcing", "Strategic partnerships"] },
  ],
  realityCheck: {
    hardTruths: ["Algoritma berubah setiap saat. Apa yang bekerja bulan lalu mungkin tidak bekerja bulan ini.", "Brand deals tidak sebesar yang terlihat. Banyak kreator dengan 100K followers masih struggling secara finansial.", "Burnout adalah #1 alasan kreator berhenti — produksi konten setiap hari menguras mental.", "Komentar negatif dan haters adalah paket lengkap. Jika mentalmu lemah, ini akan menghancurkanmu."],
    silverLinings: ["Kamu bisa mulai dengan HP saja. Modal awal hampir nol.", "Indonesia adalah salah satu pasar konten terbesar di dunia — peluang sangat luas.", "Skill konten berlaku di industri apapun — perusahaan besar butuh kreator internal."],
    transferableSkills: ["Storytelling dan komunikasi — berlaku di marketing, sales, dan public relations.", "Video editing dan produksi — dicari di industri film, event, dan periklanan.", "Personal branding — berlaku di karir apapun, dari karyawan hingga founder."],
  },
  alternativePaths: [
    { scenario: "Gagal mencapai growth yang diharapkan setelah 1 tahun", steps: [
      { transition: "Evaluasi niche — terlalu sempit atau terlalu umum?", role: "Niche Pivot", description: "Coba niche turunan yang lebih spesifik atau lebih luas." },
      { transition: "Ganti platform utama", role: "Platform Switch", description: "Konten yang gagal di YouTube bisa viral di TikTok atau sebaliknya." },
      { transition: "Jadi ghostwriter atau content strategist", role: "Content Strategist", description: "Banyak brand butuh kreator yang paham konten tapi bekerja di belakang layar." },
    ]},
    { scenario: "Brand deal tidak cukup untuk hidup", steps: [
      { transition: "Diversifikasi pendapatan", role: "Multi-Income Creator", description: "Affiliate marketing, digital products (template, ebook), membership." },
      { transition: "Jadi konsultan konten", role: "Content Consultant", description: "Bantu brand atau startup bikin strategi konten." },
    ]},
  ],
  masterclassLessons: [
    { person: "Raditya Dika", role: "Kreator Konten Pertama Indonesia", lesson: "Konsistensi 10 tahun mengalahkan viral dalam satu malam.", story: "Raditya Dika memulai dari blog. Blog. Sebelum YouTube, sebelum Instagram. Ia nulis setiap hari selama bertahun-tahun sebelum bukunya laku. Ia kemudian pindah ke YouTube, lalu film — selalu konsisten, selalu hadir.", keyInsight: "Viral adalah keberuntungan. Konsistensi adalah pilihan. Pilih yang bisa kamu kontrol.", actionItem: "Buat jadwal konten mingguan dan tempel di dinding. Target: tidak pernah telat jadwal selama 3 bulan." },
    { person: "Nessie Judge", role: "YouTuber Edukasi — 2M+ Subscribers", lesson: "Konten berkualitas adalah konten yang membantu orang lain memahami sesuatu.", story: "Nessie memulai YouTube dengan konten misteri dan true crime — niche yang sebelumnya tidak populer di Indonesia. Ia riset berjam-jam untuk setiap video, memastikan akurasi dan nilai edukasi. Kesuksesannya datang dari menghargai kecerdasan audiens.", keyInsight: "Jangan underestimate audiensmu. Berikan nilai, bukan sekadar hiburan. Audiens akan merasa dihargai dan kembali.", actionItem: "Untuk 3 konten ke depan, tambahkan satu 'nilai edukasi' yang membuat audiens merasa lebih pintar setelah nonton." },
  ],
});

r("digital-marketer", {
  slug: "digital-marketer",
  title: "Digital Marketer",
  description: "Jalur menjadi ahli pemasaran digital dari dasar hingga strategi marketing komprehensif.",
  emoji: "\uD83D\uDCC8",
  color: "from-blue-600 to-indigo-500",
  duration: "6-12 bulan",
  category: "business",
  dream: {
    title: "Digital Marketing Specialist",
    description: "Menguasai pemasaran digital dari SEO, SEM, social media, hingga marketing analytics.",
    whyMatters: "Digital marketing adalah skill paling dicari di era digital. Setiap bisnis butuh pemasaran online untuk bertahan dan berkembang.",
    estimatedJourney: "6-12 bulan untuk siap kerja, 2-3 tahun menjadi spesialis.",
    careerPossibilities: ["SEO Specialist", "Social Media Manager", "Content Marketing Manager", "PPC Specialist", "Marketing Analytics", "Growth Marketing", "CMO"],
    successExamples: ["Doni Prasetyo — SEO expert, founder Startup Digital", "Sari Ramadhani — Head of Marketing startup e-commerce", "Bowo Hartono — Digital marketing consultant ternama"],
  },
  dailyWins: [
    { category: "Riset", emoji: "\uD83D\uDD0D", habits: [
      { id: "dm-dw-1", title: "Cek Analytics", description: "Review Google Analytics & platform metrics", icon: "TrendingUp" },
      { id: "dm-dw-2", title: "Riset Keyword", description: "Cari keyword baru untuk konten", icon: "Target" },
      { id: "dm-dw-3", title: "Competitor Research", description: "Pantau aktivitas marketing kompetitor", icon: "Users" },
    ]},
    { category: "Eksekusi", emoji: "\u2699\uFE0F", habits: [
      { id: "dm-dw-4", title: "Optimasi SEO", description: "On-page atau technical SEO", icon: "Zap" },
      { id: "dm-dw-5", title: "Konten Marketing", description: "Buat atau jadwalkan konten", icon: "BookOpen" },
      { id: "dm-dw-6", title: "Social Media Engagement", description: "Posting dan interaksi di sosial media", icon: "Users" },
    ]},
    { category: "Belajar", emoji: "\uD83D\uDCDA", habits: [
      { id: "dm-dw-7", title: "Baca Artikel Marketing", description: "Update tren marketing terkini", icon: "BookOpen" },
      { id: "dm-dw-8", title: "Review Campaign", description: "Evaluasi performa campaign kemarin", icon: "Target" },
    ]},
  ],
  smallWins: [{
    category: "Marketing", emoji: "\uD83D\uDCC8", skills: [
      { id: "dm-sw-1", name: "SEO", description: "Search Engine Optimization", levels: [
        { label: "Pemula", target: "On-page SEO dasar", description: "Meta tags, headings, keyword optimization" },
        { label: "Menengah", target: "Technical SEO", description: "Site speed, sitemap, structured data" },
        { label: "Mahir", target: "Link building & content strategy", description: "Backlink profile, pillar-cluster model" },
        { label: "Pro", target: "SEO strategy komprehensif", description: "Enterprise SEO, international SEO" },
      ]},
      { id: "dm-sw-2", name: "Social Media Marketing", description: "Pemasaran via platform sosial", levels: [
        { label: "Pemula", target: "Bikin konten rutin", description: "Posting 3-5x/minggu" },
        { label: "Menengah", target: "Growth followers 1K+", description: "Strategi engagement dan komunitas" },
        { label: "Mahir", target: "Paid social campaigns", description: "FB/IG ads, TikTok ads" },
        { label: "Pro", target: "Full funnel marketing", description: "Awareness ke conversion via sosial media" },
      ]},
      { id: "dm-sw-3", name: "Analytics", description: "Kemampuan analisis data marketing", levels: [
        { label: "Pemula", target: "Baca dashboard", description: "Kenali metrics dasar (impressions, clicks)" },
        { label: "Menengah", target: "Google Analytics", description: "Setup goals, conversion tracking" },
        { label: "Mahir", target: "Data-driven decisions", description: "A/B testing, cohort analysis" },
        { label: "Pro", target: "Marketing attribution", description: "Multi-touch attribution, ROAS optimization" },
      ]},
    ],
  }],
  bigWins: [
    { id: "dm-bw-1", title: "Sertifikasi Marketing", description: "Google Analytics atau Facebook Blueprint", order: 1, isEssential: true, stage: "beginner" },
    { id: "dm-bw-2", title: "Website/Blog Optimized", description: "SEO on-page selesai untuk website pribadi", order: 2, isEssential: true, stage: "beginner" },
    { id: "dm-bw-3", title: "Campaign Pertama", description: "Jalankan campaign marketing pertama", order: 3, isEssential: true, stage: "beginner" },
    { id: "dm-bw-4", title: "1.000 Organic Visitors", description: "Traffic organik konsisten ke website", order: 4, isEssential: false, stage: "intermediate" },
    { id: "dm-bw-5", title: "Paid Ads Berhasil", description: "ROAS positif dari iklan berbayar", order: 5, isEssential: true, stage: "intermediate" },
    { id: "dm-bw-6", title: "Lead Generation System", description: "Sistem konversi dari traffic ke lead", order: 6, isEssential: true, stage: "advanced" },
    { id: "dm-bw-7", title: "Marketing Strategy Lead", description: "Memimpin strategi marketing tim", order: 7, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["SEO & SEM dasar hingga advanced", "Social media marketing & content strategy", "Copywriting untuk marketing", "Data analytics & reporting", "Marketing automation tools"],
    habits: ["Cek analytics setiap hari", "Update tren marketing mingguan", "A/B testing terus-menerus", "Baca case study marketing", "Jaringan dengan sesama marketer"],
    mindset: ["Data-driven — semua keputusan berdasarkan data", "Customer-centric — pahami audiensmu", "Adaptif — algoritma dan tren berubah cepat", "Creative problem solver — marketing butuh kreativitas"],
    tools: ["Google Analytics & Search Console", "SEMrush/Ahrefs untuk SEO", "Meta Business Suite", "Mailchimp untuk email marketing", "Canva untuk visual marketing"],
    commonMistakes: ["Fokus ke vanity metrics (likes, followers)", "Abaikan SEO karena hasilnya lambat", "Tidak tracking konversi dengan benar", "Mengabaikan mobile optimization"],
    successFactors: ["Pemahaman mendalam tentang audiens target", "Kemampuan adaptasi dengan tren baru", "Portofolio case study yang kuat", "Sertifikasi yang relevan", "Network dengan praktisi marketing"],
  },
  agePath: [
    { ageRange: "17-20", title: "Belajar Dasar & Sertifikasi", description: "Marketing digital bisa dipelajari siapa saja tanpa latar belakang khusus.", milestones: ["Selesaikan Google Digital Marketing Certificate", "Pelajari SEO, SEM, dan social media dasar", "Buat website/blog pribadi", "Magang di agency atau startup"] },
    { ageRange: "21-24", title: "Praktik & Spesialisasi Awal", description: "Coba semua channel, lalu pilih satu yang paling cocok.", milestones: ["Kelola 1-2 campaign nyata", "Tentukan spesialisasi (SEO/paid ads/content/social)", "Hasilkan traffic organik 1.000/bulan", "Bangun portofolio case study"] },
    { ageRange: "25-30", title: "Senior & Lead Role", description: "Dari mengeksekusi ke merancang strategi.", milestones: ["Pimpin strategi marketing untuk brand", "Kelola budget marketing Rp50jt+/bln", "Mentor junior marketer", "Bangun personal brand sebagai expert"] },
    { ageRange: "30+", title: "Head of Marketing atau Konsultan", description: "Dua jalur: in-house leadership atau consulting.", milestones: ["Head of Marketing atau CMO", "Konsultan independen dengan klien tetap", "Bangun agency sendiri"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Fundamentals & Sertifikasi", description: "SEO, SEM, social media, analytics — teori dasar.", keyActions: ["Google Analytics Certification", "Facebook Blueprint atau setara", "Buat website/blog pribadi"] },
    { period: "3-12 Bulan", title: "Praktik Nyata", description: "Teori tanpa praktik tidak berguna dalam marketing.", keyActions: ["Kelola campaign kecil (organik/paid)", "Analisis data dan buat report", "Hasilkan 5 leads atau penjualan"] },
    { period: "1-3 Tahun", title: "Spesialisasi & Portfolio", description: "Pilih satu area dan jadi ahli di situ.", keyActions: ["Spesialisasi di 1-2 channel", "Bangun 5+ case study", "Freelance atau full-time di agency"] },
    { period: "3-5 Tahun", title: "Lead Strategi", description: "Dari taktik ke strategi. Dari channel ke funnel.", keyActions: ["Pimpin strategi marketing komprehensif", "Kelola tim dan budget", "Hasilkan measurable business impact"] },
  ],
  realityCheck: {
    hardTruths: ["Digital marketing berubah setiap 3-6 bulan — apa yang kamu pelajari hari ini mungkin obsolete tahun depan.", "Hasil marketing tidak instan. SEO butuh 3-6 bulan. Paid ads butuh testing budget. Banyak klien tidak sabar.", "Marketing sering dianggap 'biaya' bukan 'investasi'. Kamu akan terus membuktikan ROI.", "Kompetisi sangat ketat. Ratusan ribu orang mengaku 'digital marketer' — gelar saja tidak cukup."],
    silverLinings: ["Digital marketing adalah salah satu skill paling dicari — setiap bisnis butuh, dari UKM hingga korporasi.", "Kerja di marketing memberi kamu pemahaman tentang bagaimana bisnis benar-benar berfungsi.", "Remote-friendly — banyak posisi marketing bisa dilakukan dari mana saja."],
    transferableSkills: ["Analisis data dan interpretasi metrik — berlaku di konsultasi, manajemen produk, dan finance.", "Copywriting dan komunikasi — berlaku di PR, sales, dan content creation.", "Strategi dan perencanaan campaign — berlaku di event management dan operasional."],
  },
  alternativePaths: [
    { scenario: "Certifications tidak membawa pekerjaan", steps: [
      { transition: "Bangun portfolio nyata", role: "Freelance Marketer", description: "Tawarkan jasa gratis/diskron ke UKM lokal untuk portfolio." },
      { transition: "Magang di agency", role: "Junior Account Executive", description: "Agency sering terima fresh graduate tanpa pengalaman." },
      { transition: "Start sebagai admin social media", role: "Social Media Admin", description: "Entry-level, tapi pintu masuk ke industri." },
    ]},
    { scenario: "Bosan dengan satu channel, ingin lebih luas", steps: [
      { transition: "Eksplorasi channel baru", role: "Full-Funnel Marketer", description: "Dari SEO ke paid ads ke email — jadi generalist yang paham semua." },
      { transition: "Pindah ke growth marketing", role: "Growth Marketer", description: "Fokus ke eksperimen cepat dan scalable growth." },
    ]},
  ],
  masterclassLessons: [
    { person: "Seth Godin", role: "Marketing Visionary — Penulis 'Purple Cow' & 'This Is Marketing'", lesson: "Marketing bukan tentang menipu orang untuk membeli — tentang menciptakan sesuatu yang layak dibeli.", story: "Godin mengubah cara dunia memandang marketing. Ia berargumen bahwa iklan tradisional sudah mati — yang bekerja adalah 'purple cow': sesuatu yang luar biasa sehingga orang tidak bisa tidak memperhatikannya.", keyInsight: "Jangan tanya 'bagaimana cara menjual?' Tanya 'produk apa yang layak dipasarkan?' Produk hebat tidak butuh banyak marketing.", actionItem: "Sebelum campaign berikutnya, tanya: 'Apakah produk/komunikasi ini layak dibicarakan orang?' Jika tidak, kembali ke papan gambar." },
    { person: "Brian Dean", role: "Founder Backlinko — SEO Expert", lesson: "SKYSCRAER technique: jangan buat konten yang sama — buat konten 10x lebih baik.", story: "Brian Dean menemukan bahwa konten nomor 1 di Google mendapat 10x traffic dari konten nomor 10. Strateginya: cari konten terbaik di topik tertentu, lalu buat versi yang lebih baik secara signifikan.", keyInsight: "Jangan bersaing dengan 'cukup baik'. Buat sesuatu yang 10x lebih baik dari yang sudah ada. Itu satu-satunya cara memenangkan pasar yang padat.", actionItem: "Cari satu topik kompetitif di industrimu. Riset 3 konten teratas. Buat satu versi yang jelas 10x lebih baik." },
  ],
});

r("doctor", {
  slug: "doctor",
  title: "Dokter",
  description: "Jalur menjadi dokter dari pendidikan kedokteran hingga praktik profesional.",
  emoji: "\uD83E\uDDCD",
  color: "from-teal-600 to-emerald-500",
  duration: "5-7 tahun",
  category: "health",
  dream: {
    title: "Dokter Profesional",
    description: "Lulus pendidikan kedokteran, lulus ujian profesi, dan menjadi dokter yang melayani masyarakat.",
    whyMatters: "Menjadi dokter adalah panggilan jiwa untuk membantu sesama. Setiap hari menyelamatkan nyawa dan memberikan harapan bagi pasien.",
    estimatedJourney: "5-7 tahun pendidikan + 1-2 tahun internship.",
    careerPossibilities: ["Dokter Umum", "Dokter Spesialis", "Dosen Kedokteran", "Peneliti Medis", "Dokter Militer", "Konsultan Kesehatan"],
    successExamples: ["dr. Tirta — dokter influencer edukasi kesehatan", "dr. Gamal Albinsaid — dokter sosial pendiri GESINDO", "Prof. dr. Nila Moeloek — mantan Menteri Kesehatan"],
  },
  dailyWins: [
    { category: "Belajar", emoji: "\uD83D\uDCDA", habits: [
      { id: "dc-dw-1", title: "Belajar 2 Jam", description: "Baca materi kuliah atau textbook kedokteran", icon: "BookOpen" },
      { id: "dc-dw-2", title: "Review Kasus", description: "Review 2-3 kasus medis atau jurnal", icon: "Target" },
      { id: "dc-dw-3", title: "Flashcard Farmakologi", description: "Review 10 obat baru", icon: "Zap" },
    ]},
    { category: "Klinik", emoji: "\uD83C\uDFE5", habits: [
      { id: "dc-dw-4", title: "Anamnesis Latihan", description: "Latihan wawancara pasien", icon: "Users" },
      { id: "dc-dw-5", title: "Physical Exam Practice", description: "Latihan pemeriksaan fisik", icon: "Heart" },
      { id: "dc-dw-6", title: "Diagnosis Drill", description: "Latihan diagnosis banding", icon: "Brain" },
    ]},
    { category: "Diri", emoji: "\uD83D\uDCAA", habits: [
      { id: "dc-dw-7", title: "Me Time 30 Menit", description: "Jaga kesehatan mental di tengah tekanan", icon: "Heart" },
      { id: "dc-dw-8", title: "Tidur 7 Jam", description: "Istirahat cukup untuk performa belajar", icon: "Moon" },
    ]},
  ],
  smallWins: [{
    category: "Kedokteran", emoji: "\uD83E\uDDCD", skills: [
      { id: "dc-sw-1", name: "Ilmu Dasar Kedokteran", description: "Anatomi, fisiologi, patologi dasar", levels: [
        { label: "Pemula", target: "Kenali anatomi dasar", description: "Sistem organ utama" },
        { label: "Menengah", target: "Pahami fisiologi", description: "Mekanisme tubuh normal" },
        { label: "Mahir", target: "Kuasi patologi", description: "Mekanisme penyakit" },
        { label: "Pro", target: "Integrasi klinis", description: "Hubungkan dasar dengan kasus klinis" },
      ]},
      { id: "dc-sw-2", name: "Keterampilan Klinis", description: "Pemeriksaan dan diagnosis", levels: [
        { label: "Pemula", target: "Anamnesis dasar", description: "Wawancara pasien terstruktur" },
        { label: "Menengah", target: "Pemeriksaan fisik", description: "Head-to-toe examination" },
        { label: "Mahir", target: "Diagnosis banding", description: "Beda 3+ diagnosis dari satu kasus" },
        { label: "Pro", target: "Manajemen pasien", description: "Rencana tatalaksana komprehensif" },
      ]},
    ],
  }],
  bigWins: [
    { id: "dc-bw-1", title: "Lulus Semester 1", description: "Melewati tahun pertama pendidikan dokter", order: 1, isEssential: true, stage: "beginner" },
    { id: "dc-bw-2", title: "Lulus Pre-Klinik", description: "Selesaikan semua blok pre-klinik", order: 2, isEssential: true, stage: "beginner" },
    { id: "dc-bw-3", title: "Masuk Kepaniteraan (Koas)", description: "Mulai stase klinik di rumah sakit", order: 3, isEssential: true, stage: "intermediate" },
    { id: "dc-bw-4", title: "Lulus Semua Stase", description: "Selesaikan semua stase kepaniteraan", order: 4, isEssential: true, stage: "intermediate" },
    { id: "dc-bw-5", title: "Lulus Uji Kompetensi", description: "Lulus UKMPPD — ujian kompetensi dokter", order: 5, isEssential: true, stage: "advanced" },
    { id: "dc-bw-6", title: "Sumpah Dokter", description: "Wisuda dan pengambilan sumpah dokter", order: 6, isEssential: true, stage: "advanced" },
    { id: "dc-bw-7", title: "Internship Selesai", description: "Tamat program internship 1 tahun", order: 7, isEssential: true, stage: "professional" },
    { id: "dc-bw-8", title: "Praktik Mandiri", description: "Mulai praktik sebagai dokter umum", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Ilmu dasar kedokteran solid", "Keterampilan klinis (anamnesis, pemeriksaan)", "Komunikasi efektif dengan pasien", "Empati dan etika kedokteran", "Manajemen waktu dan stres"],
    habits: ["Belajar rutin dengan jadwal", "Review jurnal mingguan", "Latihan keterampilan klinis", "Jaga kesehatan fisik dan mental", "Refleksi dan evaluasi diri"],
    mindset: ["Empati — dengarkan pasien dengan hati", "Teliti — detail kecil bisa sangat penting", "Resilien — tekanan adalah bagian dari profesi", "Belajar seumur hidup — ilmu kedokteran selalu berkembang"],
    tools: ["Buku referensi (Harrison, Schwartz, dll)", "Aplikasi medis (UpToDate, Medscape)", "Alat diagnostik (stetoskop, otoskop)", "OSCE kit untuk latihan", "Anki/Flashcard untuk review"],
    commonMistakes: ["Menunda belajar sampai ujian", "Abaikan kesehatan mental — burnout dokter", "Kurang komunikasi dengan pasien", "Terlalu perfeksionis sampai lambat bertindak"],
    successFactors: ["Konsistensi belajar dari hari ke hari", "Mentor dan senior yang membimbing", "Teman seangkatan yang supportif", "Doa dan spiritualitas", "Kesehatan fisik dan mental terjaga"],
  },
  agePath: [
    { ageRange: "17-18", title: "Persiapan Masuk Kedokteran", description: "Persaingan paling ketat di pendidikan Indonesia.", milestones: ["Persiapan SNMPTN/SNBT/UTBK", "Les atau bimbel intensif", "Relawan di PMI atau rumah sakit", "Pastikan nilai biologi, kimia, fisika kuat"] },
    { ageRange: "19-22", title: "Pendidikan Pre-Klinik", description: "Tahun-tahun paling berat secara akademis. Ilmu dasar kedokteran.", milestones: ["Lulus blok anatomi, fisiologi, patologi", "Ikut organisasi (BEM, UKM)", "Latihan keterampilan klinis dasar", "Jaga IPK minimal 3.0"] },
    { ageRange: "23-24", title: "Koas (Kepaniteraan Klinik)", description: "Tidur 4 jam sehari adalah norma. Stase di rumah sakit.", milestones: ["Selesaikan semua stase (16-20 stase)", "Ikut jaga malam", "Kumpulkan logbook kasus", "Lulus ujian stase tiap bagian"] },
    { ageRange: "25", title: "UKMPPD & Sumpah Dokter", description: "Puncak pendidikan. Ujian kompetensi + sumpah.", milestones: ["Lulus UKMPPD (tryout, CBT, OSCE)", "Wisuda dan sumpah dokter", "Urus STR (Surat Tanda Registrasi)"] },
    { ageRange: "26-27", title: "Internship", description: "Tahun transisi dari mahasiswa ke dokter.", milestones: ["Selesaikan internship 1 tahun di faskes", "Kumpulkan pengalaman praktik mandiri", "Ambil SIP (Surat Izin Praktik)"] },
    { ageRange: "27+", title: "Praktik atau Spesialisasi", description: "Dua jalur: praktik sebagai dokter umum atau lanjut PPDS.", milestones: ["Pilih: praktik umum atau PPDS", "Jika PPDS: ikut ujian masuk spesialis", "Jika praktik: cari faskes atau buka praktik"] },
  ],
  timeline: [
    { period: "0-6 Bulan", title: "Persiapan Masuk", description: "UTBK, seleksi mandiri, atau jalur prestasi.", keyActions: ["Bimbel intensif 3-6 bulan", "Latihan soal UTBK setiap hari", "Ikut tryout tiap bulan"] },
    { period: "2-4 Tahun", title: "Pre-Klinik", description: "Ilmu dasar: anatomi, fisiologi, biokimia, farmakologi.", keyActions: ["Belajar sistem per sistem (kardio, respirasi, dll)", "Latihan OSCE tiap semester", "Ikut organisasi dan relawan"] },
    { period: "1.5-2 Tahun", title: "Koas (Stase Klinik)", description: "Rotasi di semua bagian Ilmu Kedokteran.", keyActions: ["Ikut jaga malam 3-4x/minggu", "Kumpulkan logbook kasus", "Presentasi journal reading"] },
    { period: "6-12 Bulan", title: "UKMPPD & Sumpah", description: "Tryout, CBT, OSCE, sumpah, STR.", keyActions: ["Tryout UKMPPD tiap minggu", "Review soal 3-5 tahun terakhir", "Urus administrasi STR"] },
    { period: "1 Tahun", title: "Internship", description: "Praktik mandiri dengan supervisi.", keyActions: ["Tanganin pasien mandiri", "Kelola administrasi faskes", "Persiapan PPDS atau SIP"] },
  ],
  realityCheck: {
    hardTruths: ["Kedokteran bukan tentang 'panggilan jiwa' setiap hari — banyak hari yang berat, melelahkan, dan tidak glamor.", "Tidur 4-5 jam per malam selama koas adalah normal — ini menguji batas fisik dan mentalmu.", "Gaji dokter umum di Indonesia tidak sebanding dengan biaya pendidikan dan pengorbanan — terutama di awal karir.", "Kesalahan medis, meskipun kecil, bisa menghantui mentalmu selama bertahun-tahun."],
    silverLinings: ["Tidak ada profesi yang memberi kepuasan batin sebesar menyembuhkan pasien dan melihat mereka sembuh.", "Dokter dihormati di mana saja — secara sosial dan di komunitas.", "Ilmu kedokteran adalah bekal seumur hidup — kamu akan jadi orang yang paling 'sadar kesehatan' di keluargamu."],
    transferableSkills: ["Komunikasi dan empati — dokter adalah komunikator ulung. Berlaku di konsultasi, coaching, dan leadership.", "Pengambilan keputusan di bawah tekanan — berlaku di krisis management, militer, dan emergency response.", "Manajemen waktu dan prioritas — berlaku di manajemen proyek dan operasional."],
  },
  alternativePaths: [
    { scenario: "Tidak lulus UTBK/SBMPTN kedokteran", steps: [
      { transition: "Coba jalur mandiri atau kedokteran swasta", role: "Mahasiswa Kedokteran Jalur Mandiri", description: "Biaya lebih tinggi, tapi tetap jadi dokter." },
      { transition: "Ambil S1 Ilmu Kesehatan lain, lalu S2 Kedokteran", role: "Lintas Jalur", description: "Farmasi, keperawatan, atau biologi — lalu lanjut pendidikan dokter di S2." },
      { transition: "Kuliah di luar negeri (Rusia, China, Malaysia)", role: "Mahasiswa Kedokteran LN", description: "Biaya bervariasi, beberapa negara punya biaya lebih murah dari PTS Indonesia." },
    ]},
    { scenario: "Gagal UKMPPD (tidak lulus ujian kompetensi)", steps: [
      { transition: "Ikut tryout intensif 3-6 bulan", role: "Koas Lulusan", description: "Fokus ke OSCE dan soal-soal yang sering gagal." },
      { transition: "Ambil kursus persiapan UKMPPD", role: "Peserta Bimbingan UKMPPD", description: "Banyak lembaga bimbingan khusus UKMPPD." },
    ]},
    { scenario: "Tidak lanjut PPDS (spesialisasi)", steps: [
      { transition: "Praktik sebagai dokter umum", role: "Dokter Umum Praktik", description: "Buka praktik mandiri atau kerja di klinik/faskes." },
      { transition: "Dokter industri atau perusahaan", role: "Company Doctor", description: "Perusahaan besar butuh dokter untuk klinik karyawan." },
      { transition: "Dokter estetika atau non-klinis", role: "Dokter Estetika", description: "Pelatihan tambahan estetika tanpa PPDS." },
    ]},
  ],
  masterclassLessons: [
    { person: "dr. Gamal Albinsaid", role: "Founder GESINDO — Dokter Sosial", lesson: "Dokter tidak harus di rumah sakit — solusi bisa datang dari mana saja, bahkan dari kardus bekas.", story: "Gamal menciptakan asuransi kesehatan berbasis sampah. Masyarakat membayar premi dengan sampah yang didaur ulang. Ide ini lahir dari keprihatinan melihat warga tidak mampu berobat karena biaya. Ia membuktikan bahwa dokter bisa menjadi inovator sosial.", keyInsight: "Masalah kesehatan masyarakat sering bukan masalah medis, tapi masalah ekonomi dan akses. Dokter yang paham ini bisa menciptakan dampak jauh lebih besar.", actionItem: "Cari satu masalah kesehatan di lingkunganmu yang bukan masalah 'penyakit' — tapi masalah akses, biaya, atau edukasi." },
    { person: "Prof. dr. Nila Moeloek", role: "Mantan Menteri Kesehatan RI — Dokter Mata", lesson: "Karir dokter tidak linear — dari operasi mata hingga kebijakan kesehatan nasional.", story: "Nila Moeloek adalah dokter spesialis mata yang kemudian menjadi Menteri Kesehatan. Ia tidak pernah membayangkan akan mengatur sistem kesehatan 250 juta orang. Tapi ia siap karena setiap peran sebelumnya membangun perspektif.", keyInsight: "Jangan tutup diri pada kesempatan di luar 'menjadi dokter'. Leadership, kebijakan, edukasi — semua butuh perspektif medis.", actionItem: "Setiap tahun, ambil satu peran non-klinis (organisasi, penulisan, pengajaran) untuk memperluas dampakmu." },
    { person: "dr. Tirta", role: "Dokter Sekaligus Content Creator Edukasi", lesson: "Ilmu yang tidak dibagikan adalah ilmu yang hilang.", story: "dr. Tirta menggunakan media sosial untuk edukasi kesehatan dengan cara yang tidak konvensional — bahasa kasar, humor, dan gamblang. Ia dikritik banyak senior, tapi ia menjangkau jutaan anak muda yang tidak pernah tertarik dengan edukasi kesehatan.", keyInsight: "Cara menyampaikan ilmu sama pentingnya dengan ilmu itu sendiri. Jangan takut menggunakan media non-tradisional.", actionItem: "Buat satu konten edukasi kesehatan (poster, video, atau artikel) untuk audiens awam bulan ini." },
  ],
});

r("athlete", {
  slug: "athlete",
  title: "Atlet Profesional",
  description: "Jalur menjadi atlet profesional dari olahraga spesifik hingga prestasi nasional dan internasional.",
  emoji: "\uD83C\uDFC5",
  color: "from-red-600 to-rose-500",
  duration: "3-10 tahun",
  category: "sports",
  dream: {
    title: "Atlet Profesional",
    description: "Berlatih dan berkompetisi di level tertinggi dalam cabang olahraga pilihan.",
    whyMatters: "Olahraga bukan hanya fisik — ia membentuk karakter, disiplin, dan ketahanan mental. Atlet profesional menginspirasi jutaan orang.",
    estimatedJourney: "3-10 tahun tergantung cabang olahraga dan bakat.",
    careerPossibilities: ["Atlet Nasional", "Atlet Internasional", "Pelatih Profesional", "Manajer Olahraga", "Komentator/Analis Olahraga", "Pengusaha Sport"],
    successExamples: ["Tontowi Ahmad — atlet bulutangkis, emas Olimpiade", "Lalu Muhammad Zohri — sprinter, emas Kejuaraan Dunia U20", "Windy Cantika Aisah — atlet angkat besi, medali Olimpiade"],
  },
  dailyWins: [
    { category: "Pagi", emoji: "\u2600\uFE0F", habits: [
      { id: "at-dw-1", title: "Bangun Pagi (04:30)", description: "Mulai hari dengan latihan pagi", icon: "Sunrise" },
      { id: "at-dw-2", title: "Warm-up Komplet", description: "15 menit warming-up spesifik olahraga", icon: "Zap" },
      { id: "at-dw-3", title: "Sarapan Atlet", description: "Protein + karbohidrat kompleks", icon: "Heart" },
    ]},
    { category: "Latihan", emoji: "\uD83C\uDFCB", habits: [
      { id: "at-dw-4", title: "Latihan Teknik", description: "2 jam fokus skill spesifik", icon: "Target" },
      { id: "at-dw-5", title: "Strength & Conditioning", description: "1 jam latihan kekuatan dan kondisi", icon: "Flame" },
      { id: "at-dw-6", title: "Recovery Aktif", description: "Stretching, foam roller, ice bath", icon: "Clock" },
    ]},
    { category: "Malam", emoji: "\uD83C\uDF19", habits: [
      { id: "at-dw-7", title: "Review Performa", description: "Analisis video latihan atau pertandingan", icon: "BookOpen" },
      { id: "at-dw-8", title: "Tidur 8-9 Jam", description: "Tidur cukup untuk recovery optimal", icon: "Moon" },
    ]},
  ],
  smallWins: [{
    category: "Olahraga", emoji: "\uD83C\uDFC5", skills: [
      { id: "at-sw-1", name: "Teknik Olahraga", description: "Skill spesifik cabang olahraga", levels: [
        { label: "Pemula", target: "Gerakan dasar", description: "Fundamental skill benar" },
        { label: "Menengah", target: "Konsisten 70%", description: "Eksekusi teknik dengan konsistensi" },
        { label: "Mahir", target: "Konsisten 85%", description: "Teknik otomatis dalam tekanan" },
        { label: "Pro", target: "Teknik level dunia", description: "Presisi dan efisiensi maksimal" },
      ]},
      { id: "at-sw-2", name: "Kondisi Fisik", description: "Kebugaran atletik menyeluruh", levels: [
        { label: "Pemula", target: "Basic fitness", description: "Push-up, sit-up, lari 2km" },
        { label: "Menengah", target: "Sport-specific fitness", description: "Tes fisik sesuai cabang olahraga" },
        { label: "Mahir", target: "Elite conditioning", description: "VO2Max 50+, strength rasio baik" },
        { label: "Pro", target: "Peak performance", description: "Fisik prima sepanjang musim" },
      ]},
      { id: "at-sw-3", name: "Mental Game", description: "Ketahanan mental kompetisi", levels: [
        { label: "Pemula", target: "Kenali tekanan", description: "Sadar akan tekanan kompetisi" },
        { label: "Menengah", target: "Atasi kecemasan", description: "Teknik pernapasan dan visualisasi" },
        { label: "Mahir", target: "Flow state", description: "Perform optimal di tekanan tinggi" },
        { label: "Pro", target: "Mental juara", description: "Bangkit setelah kekalahan, konsisten menang" },
      ]},
    ],
  }],
  bigWins: [
    { id: "at-bw-1", title: "Gabung Klub/Akademi", description: "Latihan terstruktur di klub resmi", order: 1, isEssential: true, stage: "beginner" },
    { id: "at-bw-2", title: "Kompetisi Pertama", description: "Event kompetitif pertama", order: 2, isEssential: true, stage: "beginner" },
    { id: "at-bw-3", title: "Juara Tingkat Kota", description: "Menang event level kota/kabupaten", order: 3, isEssential: false, stage: "beginner" },
    { id: "at-bw-4", title: "Masuk Pelatda", description: "Pusat latihan daerah persiapan nasional", order: 4, isEssential: true, stage: "intermediate" },
    { id: "at-bw-5", title: "Juara Tingkat Provinsi", description: "Medali di event provinsi", order: 5, isEssential: true, stage: "intermediate" },
    { id: "at-bw-6", title: "Masuk Pelatnas", description: "Pusat latihan nasional", order: 6, isEssential: true, stage: "advanced" },
    { id: "at-bw-7", title: "Medali Nasional", description: "Podium di event nasional (PON/Kejurnas)", order: 7, isEssential: true, stage: "advanced" },
    { id: "at-bw-8", title: "Medali Internasional", description: "Podium di event SEA Games atau setara", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Teknik spesifik cabang olahraga", "Kebugaran fisik atletik", "Strategi dan taktik pertandingan", "Nutrisi olahraga", "Pencegahan dan rehabilitasi cedera"],
    habits: ["Latihan 6 hari seminggu", "Analisis video pertandingan rutin", "Sleep hygiene dan recovery", "Jurnal latihan harian", "Konsultasi dengan pelatih dan psikolog"],
    mindset: ["Disiplin — tidak ada hari tanpa latihan", "Resilien — kalah adalah guru terbaik", "Profesional — jaga attitude di luar lapangan", "Growth mindset — selalu ada level di atas"],
    tools: ["Peralatan olahraga sesuai standar", "GPS tracker dan heart rate monitor", "Foam roller, massage gun, ice pack", "Aplikasi analisis video", "Sport psychologist dan nutritionist"],
    commonMistakes: ["Overtraining — lupa istirahat", "Abaikan teknik dasar — fokus ke hasil", "Makan sembarangan — nutrisi penting", "Bandingkan diri dengan atlet lain secara tidak sehat"],
    successFactors: ["Konsistensi jangka panjang", "Pelatih yang tepat dan suportif", "Dukungan keluarga dan lingkungan", "Manajemen cedera yang baik", "Mental kuat dan percaya diri"],
  },
  agePath: [
    { ageRange: "8-12", title: "Discovery & Fun", description: "Coba berbagai cabang olahraga. Yang penting adalah senang bergerak.", milestones: ["Coba 3+ olahraga berbeda", "Gabung klub atau ekstrakurikuler", "Bangun koordinasi motorik dasar"] },
    { ageRange: "13-15", title: "Specialization Begins", description: "Pilih satu cabang olahraga. Mulai latihan terstruktur.", milestones: ["Pilih 1-2 cabang olahraga", "Latihan 4-5x seminggu", "Mulai kompetisi level pelajar", "Jaga nilai akademik"] },
    { ageRange: "16-18", title: "Competitive Pipeline", description: "Tahun kritis untuk masuk jalur atlet nasional.", milestones: ["Masuk pelatda atau puslat", "Target juara tingkat provinsi", "Bangun fisik dan teknik", "Persiapan pendidikan tinggi (SIP/SKP)"] },
    { ageRange: "19-23", title: "National/International Level", description: "Puncak fisik untuk sebagian besar cabang olahraga.", milestones: ["Masuk pelatnas", "Target medali nasional", "Sea Games atau setara", "Mulai bangun karir pasca-atlet"] },
    { ageRange: "24+", title: "Peak Performance & Transition", description: "Beberapa cabang bisa di puncak hingga 30+. Mulai persiapan transisi.", milestones: ["Konsisten di level internasional", "Bangun portofolio non-atlet", "Lisensi atau sertifikasi pelatih", "Siapkan pensiun atlet"] },
  ],
  timeline: [
    { period: "0-6 Bulan", title: "Fundamental Movement", description: "Gerakan dasar yang benar mencegah cedera di masa depan.", keyActions: ["Latihan 3x seminggu", "Fokus ke teknik dasar", "Tes kebugaran awal"] },
    { period: "6-18 Bulan", title: "Sport-Specific Training", description: "Latihan spesifik cabang olahraga mulai intensif.", keyActions: ["Latihan 5x seminggu", "Kompetisi internal", "Video analysis teknik"] },
    { period: "1.5-3 Tahun", title: "Competitive Level", description: "Mulai bersaing di level provinsi/nasional.", keyActions: ["Latihan 6x seminggu", "Periodisasi latihan", "Kompetisi rutin 1x/bulan"] },
    { period: "3-5 Tahun", title: "Elite Pipeline", description: "Pelatnas dan target internasional.", keyActions: ["Full-time training", "Psikolog olahraga", "Nutrisi periodisasi"] },
  ],
  realityCheck: {
    hardTruths: ["Dari ribuan atlet muda, hanya segelintir yang mencapai level nasional. Dari situ, hanya beberapa yang ke internasional.", "Cedera adalah bagian dari profesi — ACL, patah tulang, cedera otot bisa menghancurkan musim atau karir.", "Kehidupan atlet tidak glamor — latihan 6 jam sehari, jauh dari keluarga, minim kehidupan sosial.", "Pensiun atlet terjadi di usia 25-35 — kamu harus punya rencana untuk 40+ tahun setelahnya."],
    silverLinings: ["Olahraga membentuk disiplin dan mental baja yang berlaku di bidang apapun.", "Atlet dapat beasiswa pendidikan — S1 bahkan S2 gratis jika berpretasi.", "Jaringan pertemanan dan mentor yang kamu dapat di olahraga sering bertahan seumur hidup."],
    transferableSkills: ["Disiplin dan konsistensi — atlet adalah pekerja keras alami di bidang apapun.", "Teamwork dan leadership — kapten tim adalah calon pemimpin organisasi.", "Goal setting dan periodisasi — kemampuan membagi tujuan besar ke target harian yang terukur."],
  },
  alternativePaths: [
    { scenario: "Tidak masuk pelatnas", steps: [
      { transition: "Tetap kompetisi di level provinsi sambil kuliah", role: "Mahasiswa-Atlet", description: "UKM olahraga di kampus + event provinsi." },
      { transition: "Fokus ke pendidikan dan coaching", role: "Pelatih Muda", description: "Ambil lisensi pelatih sambil S1 Ilmu Olahraga." },
    ]},
    { scenario: "Cedera mengakhiri karir atlet", steps: [
      { transition: "Rehabilitasi sambil cari peran baru", role: "Fisioterapis Olahraga", description: "Kuliah fisioterapi — pengalaman atlet adalah nilai jual." },
      { transition: "Content creation olahraga", role: "Sports Content Creator", description: "Review pertandingan, tips latihan, atau vlog atlet." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tontowi Ahmad", role: "Atlet Bulutangkis — Emas Olimpiade 2016", lesson: "Konsistensi di latihan adalah ibadah. Tidak ada hari tanpa progres.", story: "Tontowi dikenal sebagai pemain yang tidak pernah bolos latihan. Bahkan saat libur lebaran, ia tetap latihan. Bakatnya biasa, tapi disiplinnya luar biasa. Olimpiade 2016 adalah puncak dari 15 tahun konsistensi.", keyInsight: "Bakat menentukan awal, tapi konsistensi menentukan akhir. Jadikan latihan sebagai rutinitas yang tidak bisa ditawar.", actionItem: "Buat 'non-negotiable rule': tidak ada hari tanpa latihan minimal 30 menit, bahkan saat libur." },
    { person: "Lalu Muhammad Zohri", role: "Sprinter — Emas Kejuaraan Dunia U20", lesson: "Latarbelakang bukan batasan. Dari Lombok ke podium dunia.", story: "Zohri berasal dari Lombok, latihan di lapangan seadanya. Ia tidak punya fasilitas seperti atlet kota besar. Tapi ia punya mimpi dan kerja keras. Di Kejuaraan Dunia U20, ia menang dan mengharumkan Indonesia.", keyInsight: "Fasilitas membantu, tapi mental juara lahir dari dalam. Jangan pernah menjadikan 'kondisi' sebagai alasan.", actionItem: "Visualisasikan keberhasilanmu setiap hari. Zohri visualisasi lari 100m setiap malam sebelum tidur." },
  ],
});

r("beauty-creator", {
  slug: "beauty-creator",
  title: "Beauty & Makeup Creator",
  description: "Jalur menjadi beauty creator dari belajar makeup dasar hingga influencer kecantikan profesional.",
  emoji: "\uD83D\uDC84",
  color: "from-pink-600 to-rose-500",
  duration: "6-12 bulan",
  category: "creative",
  dream: {
    title: "Beauty & Makeup Creator",
    description: "Menguasai seni makeup, skincare, dan membangun personal brand di industri kecantikan.",
    whyMatters: "Kecantikan adalah bentuk ekspresi diri dan pemberdayaan. Menjadi beauty creator berarti menginspirasi kepercayaan diri dan kreativitas.",
    estimatedJourney: "6-12 bulan untuk foundational skills, 2-3 tahun untuk established creator.",
    careerPossibilities: ["Makeup Artist (MUA)", "Beauty Influencer", "Skincare Educator", "Product Reviewer", "Brand Ambassador", "Beauty Entrepreneur"],
    successExamples: ["Tasya Farasya — beauty influencer Indonesia", "Sari Tilaar — founder PT Martina Berto", "Rachel Goddard — MUA internasional dari Indonesia"],
  },
  dailyWins: [
    { category: "Skill", emoji: "\uD83C\uDFA8", habits: [
      { id: "bc-dw-1", title: "Practice Makeup 30 Menit", description: "Latihan teknik makeup baru", icon: "Zap" },
      { id: "bc-dw-2", title: "Skincare Routine", description: "Pagi dan malam rutin skincare", icon: "Heart" },
      { id: "bc-dw-3", title: "Review Produk", description: "Coba produk baru untuk review", icon: "Sparkles" },
    ]},
    { category: "Konten", emoji: "\uD83D\uDCF9", habits: [
      { id: "bc-dw-4", title: "Konten Hari Ini", description: "Buat tutorial atau review konten", icon: "Target" },
      { id: "bc-dw-5", title: "Engage Followers", description: "Balas komentar dan DM", icon: "Users" },
      { id: "bc-dw-6", title: "Riset Tren Beauty", description: "Cek tren makeup dan skincare terbaru", icon: "BookOpen" },
    ]},
    { category: "Belajar", emoji: "\uD83D\uDCD6", habits: [
      { id: "bc-dw-7", title: "Belajar Teknik Baru", description: "Tutorial dari MUA profesional", icon: "BookOpen" },
      { id: "bc-dw-8", title: "Color Theory Practice", description: "Latihan color matching dan color analysis", icon: "Palette" },
    ]},
  ],
  smallWins: [{
    category: "Beauty", emoji: "\uD83D\uDC84", skills: [
      { id: "bc-sw-1", name: "Makeup Application", description: "Teknik aplikasi makeup", levels: [
        { label: "Pemula", target: "Basic makeup", description: "Foundation, brows, lipstick sederhana" },
        { label: "Menengah", target: "Daily look", description: "Natural glam, contour ringan" },
        { label: "Mahir", target: "Advanced techniques", description: "Cut crease, smokey eye, color correction" },
        { label: "Pro", target: "Editorial & creative", description: "Special effects, avant-garde, bridal" },
      ]},
      { id: "bc-sw-2", name: "Skincare Knowledge", description: "Pengetahuan perawatan kulit", levels: [
        { label: "Pemula", target: "Basic skincare", description: "Cleanser, moisturizer, sunscreen" },
        { label: "Menengah", target: "Ingredient knowledge", description: "AHA/BHA, retinol, vitamin C" },
        { label: "Mahir", target: "Skin diagnosis", description: "Identifikasi jenis dan masalah kulit" },
        { label: "Pro", target: "Custom routine", description: "Rutin personalisasi untuk berbagai kondisi" },
      ]},
      { id: "bc-sw-3", name: "Content Creation Beauty", description: "Konten beauty yang engaging", levels: [
        { label: "Pemula", target: "Foto before-after", description: "Hasil makeup dokumentasi" },
        { label: "Menengah", target: "Video tutorial", description: "Step-by-step makeup tutorial" },
        { label: "Mahir", target: "Review edukatif", description: "Review produk dengan analisis ingredients" },
        { label: "Pro", target: "Brand campaign", description: "Konten profesional untuk brand collaboration" },
      ]},
    ],
  }],
  bigWins: [
    { id: "bc-bw-1", title: "Makeup Look Pertama", description: "Selesaikan full face makeup pertama", order: 1, isEssential: true, stage: "beginner" },
    { id: "bc-bw-2", title: "Portofolio 5 Look", description: "5 looks berbeda untuk portofolio", order: 2, isEssential: true, stage: "beginner" },
    { id: "bc-bw-3", title: "Konten Beauty Pertama", description: "Posting tutorial atau review pertama", order: 3, isEssential: true, stage: "beginner" },
    { id: "bc-bw-4", title: "1.000 Followers", description: "Komunitas beauty mulai terbentuk", order: 4, isEssential: true, stage: "intermediate" },
    { id: "bc-bw-5", title: "Client Pertama (MUA)", description: "Makeup untuk klien berbayar pertama", order: 5, isEssential: false, stage: "intermediate" },
    { id: "bc-bw-6", title: "Brand Kolaborasi Pertama", description: "Endorsement atau gifted produk", order: 6, isEssential: true, stage: "advanced" },
    { id: "bc-bw-7", title: "10.000+ Followers", description: "Beauty influencer established", order: 7, isEssential: false, stage: "advanced" },
    { id: "bc-bw-8", title: "Beauty Business", description: "Produk atau jasa beauty sendiri", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Makeup application untuk semua look", "Skincare knowledge & ingredient literacy", "Content creation & editing", "Personal branding", "Komunikasi dan public speaking"],
    habits: ["Practice makeup setiap hari", "Rutin skincare pagi dan malam", "Dokumentasi setiap look", "Update tren beauty mingguan", "Interaksi dengan komunitas beauty"],
    mindset: ["Authentic — jadi diri sendiri lebih menarik", "Kreatif — makeup adalah seni", "Edukatif — bagikan ilmu, bukan hanya produk", "Konsisten — beauty butuh latihan terus"],
    tools: ["Brush set lengkap", "Produk makeup basic (foundation, palette)", "Ring light dan tripod", "Skincare routine products", "Palette warna lengkap"],
    commonMistakes: ["Membandingkan dengan beauty creator lain", "Membeli produk terlalu banyak tanpa dipakai", "Abaikan skincare — makeup hanya cantik di kulit sehat", "Fokus ke tools, lupakan teknik"],
    successFactors: ["Teknik makeup benar dan terus berkembang", "Konsistensi konten dan interaksi", "Pengetahuan skincare yang mendalam", "Kolaborasi dengan sesama kreator", "Branding pribadi yang autentik"],
  },
  agePath: [
    { ageRange: "14-17", title: "Eksplorasi Makeup & Skincare", description: "Mulai dengan makeup dasar dan skincare rutin. Dokumentasikan progres.", milestones: ["Pelajari skincare routine dasar", "Coba 5-10 look makeup berbeda", "Buat akun beauty pribadi", "Pelajari alat dan brush"] },
    { ageRange: "18-21", title: "Skill Development & First Content", description: "Kuliah atau sambil kerja, bangun skill dan konten secara konsisten.", milestones: ["Kuasai 10+ teknik makeup", "Posting konten beauty 2-3x/minggu", "Capai 1.000 followers", "Mulai review produk"] },
    { ageRange: "22-25", title: "Growth & Monetization", description: "Dari hobi ke side income. Brand mulai melirik.", milestones: ["Brand kolaborasi pertama", "Capai 5.000-10.000 followers", "Kuasai editorial/advanced makeup", "Mulai layanan MUA"] },
    { ageRange: "26-30", title: "Professional Beauty Creator", description: "Full-time creator atau MUA profesional.", milestones: ["Pendapatan stabil dari beauty", "Brand ambassadorship", "Portofolio 100+ look", "Bangun produk atau kelas sendiri"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Skill Foundation", description: "Makeup dasar, skincare routine, alat.", keyActions: ["Pelajari base makeup", "Buat skincare routine pagi/malam", "Kenali alat dan brush"] },
    { period: "3-12 Bulan", title: "Content & Consistency", description: "Practice + posting. Konsistensi > kualitas di fase ini.", keyActions: ["Posting 4x/bulan minimal", "Coba 3 gaya makeup berbeda", "Interaksi dengan beauty komunitas"] },
    { period: "1-3 Tahun", title: "Advanced Skills & Audience", description: "Teknik meningkat, audiens mulai setia.", keyActions: ["Kuasai 3 look signature", "Capai 5.000 followers", "Review 10+ produk"] },
    { period: "3-5 Tahun", title: "Professional Level", description: "Beauty sebagai karir penuh waktu.", keyActions: ["Brand deal reguler", "Layanan MUA atau kelas", "Konten edukatif mendalam"] },
  ],
  realityCheck: {
    hardTruths: ["Industri beauty sangat jenuh — jutaan kreator berebut perhatian. Menonjol butuh sesuatu yang benar-benar unik.", "Produk gratis dari brand tidak selalu berarti — banyak yang hanya 'gifted' tanpa bayaran.", "Kulit tidak sempurna setiap hari. Jerawat, breakout, dan masalah kulit adalah realita yang harus kamu tunjukkan juga."],
    silverLinings: ["Indonesia adalah pasar beauty terbesar di Asia Tenggara — peluang sangat luas.", "Beauty creator bisa menjadi MUA, influencer, hingga founder produk sendiri.", "Skincare dan makeup adalah kebutuhan — orang akan selalu tertarik."],
    transferableSkills: ["Color theory dan visual aesthetics — berlaku di desain grafis, fashion, dan seni.", "Public speaking dan presentasi — dari tutorial ke komunikasi profesional.", "Kewirausahaan — sebagai beauty creator kamu juga menjalankan bisnis."],
  },
  alternativePaths: [
    { scenario: "Tidak bisa tembus 10.000 followers", steps: [
      { transition: "Fokus ke MUA (offline service)", role: "Makeup Artist (MUA)", description: "Layanan langsung untuk bridal, event, atau photoshoot." },
      { transition: "Jadi beauty writer atau editor", role: "Beauty Editor", description: "Menulis tentang beauty untuk media atau brand." },
      { transition: "Kerja di brand beauty", role: "Brand Representative", description: "Brand beauty butuh orang yang paham produk dan tren." },
    ]},
    { scenario: "Produk review tidak menghasilkan pendapatan", steps: [
      { transition: "Buat kelas atau tutorial berbayar", role: "Beauty Educator", description: "Kelas online makeup untuk pemula atau intermediate." },
      { transition: "Affiliate marketing fokus", role: "Beauty Affiliate", description: "Komisi dari penjualan produk via link afiliasi." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tasya Farasya", role: "Beauty Influencer Indonesia — 5M+ Followers", lesson: "Konsistensi dan autentisitas lebih berharga dari teknik makeup sempurna.", story: "Tasya memulai dari nol, posting konten makeup setiap hari selama bertahun-tahun. Ia tidak selalu punya teknik terbaik, tapi ia konsisten dan autentik. Audiens percaya padanya karena ia jujur — termasuk saat produk tidak bagus.", keyInsight: "Teknik makeup bisa dipelajari. Kepercayaan audiens harus dibangun — dan itu butuh kejujuran.", actionItem: "Buat satu konten 'honest review' tentang produk yang benar-benar tidak kamu suka minggu ini." },
    { person: "Sari Tilaar", role: "Founder PT Martina Berto — Pioneer Skincare Indonesia", lesson: "Kecantikan dimulai dari kesehatan kulit, bukan dari makeup.", story: "Sari Tilaar membangun Martina Berto dari nol, mempopulerkan konsep kecantikan berbasis bahan alami Indonesia. Ia tidak mengikuti tren Barat — ia menciptakan standar kecantikan Indonesia sendiri.", keyInsight: "Pahami kulit dan kebutuhan pasar lokal. Kecantikan Indonesia punya karakteristik sendiri.", actionItem: "Pelajari 3 bahan alami Indonesia yang baik untuk skincare minggu ini (lulur, temulawak, lidah buaya)." },
  ],
});

r("golfer", {
  slug: "golfer",
  title: "Pegolf Profesional",
  description: "Jalur menjadi pegolf dari pemula hingga turnamen profesional.",
  emoji: "\u26F3",
  color: "from-emerald-600 to-green-500",
  duration: "2-5 tahun",
  category: "sports",
  dream: {
    title: "Pegolf Profesional",
    description: "Menguasai teknik golf, strategi lapangan, dan berkompetisi di turnamen profesional.",
    whyMatters: "Golf mengajarkan fokus, kesabaran, dan integritas. Sebagai olahraga yang bisa dimainkan seumur hidup, golf membuka jaringan dan peluang global.",
    estimatedJourney: "2-5 tahun untuk handicap rendah, 5-10 tahun untuk level turnamen pro.",
    careerPossibilities: ["Pegolf Profesional", "Instruktur Golf", "Club Pro", "Golf Course Designer", "Sports Manager Golf", "Golf Content Creator"],
    successExamples: ["Rory Hidayat — pegolf pro Indonesia, juara nasional", "Kawirakorn Boonchu — pegolf Asia Tenggara", "Tiger Woods — pegolf legendaris dunia"],
  },
  dailyWins: [
    { category: "Latihan", emoji: "\u26F3", habits: [
      { id: "gf-dw-1", title: "Driving Range (50 Balls)", description: "Latihan pukulan jarak jauh", icon: "Target" },
      { id: "gf-dw-2", title: "Putting Practice (30 Min)", description: "Latihan putting di green", icon: "Zap" },
      { id: "gf-dw-3", title: "Short Game (30 Min)", description: "Chipping dan pitching", icon: "Clock" },
    ]},
    { category: "Fisik", emoji: "\uD83D\uDCAA", habits: [
      { id: "gf-dw-4", title: "Core & Flexibility", description: "30 menit latihan core dan fleksibilitas", icon: "Flame" },
      { id: "gf-dw-5", title: "Cardio 20 Menit", description: "Jogging atau cycling", icon: "Heart" },
      { id: "gf-dw-6", title: "Stretching", description: "Peregangan untuk mobilitas golf", icon: "Zap" },
    ]},
    { category: "Mental", emoji: "\uD83E\uDDE0", habits: [
      { id: "gf-dw-7", title: "Visualisasi 10 Menit", description: "Bayangkan pukulan sempurna", icon: "Brain" },
      { id: "gf-dw-8", title: "Journal Latihan", description: "Catat progres dan evaluasi", icon: "BookOpen" },
    ]},
  ],
  smallWins: [{
    category: "Golf", emoji: "\u26F3", skills: [
      { id: "gf-sw-1", name: "Full Swing", description: "Pukulan jarak jauh (driver, irons)", levels: [
        { label: "Pemula", target: "Kontak bola konsisten", description: "Pukul bola dengan irons 7" },
        { label: "Menengah", target: "Arah terkontrol", description: "Fairway hit 50%+" },
        { label: "Mahir", target: "Distansi optimal", description: "Jarak sesuai kemampuan fisik" },
        { label: "Pro", target: "Shape pukulan", description: "Draw/fade sesuai kebutuhan" },
      ]},
      { id: "gf-sw-2", name: "Short Game", description: "Putting, chipping, pitching", levels: [
        { label: "Pemula", target: "Putting 3-putt max", description: "Kontrol kecepatan putting dasar" },
        { label: "Menengah", target: "Up & down 30%", description: "Saving par dari sekitar green" },
        { label: "Mahir", target: "Putting 1.8 avg", description: "3-foot putt hampir 100%" },
        { label: "Pro", target: "Scrambling 60%+", description: "Save par dari berbagai situasi" },
      ]},
      { id: "gf-sw-3", name: "Course Management", description: "Strategi bermain lapangan", levels: [
        { label: "Pemula", target: "Kenali aturan golf", description: "Etika dan peraturan dasar" },
        { label: "Menengah", target: "Pilih klub tepat", description: "Keputusan klub berdasarkan jarak" },
        { label: "Mahir", target: "Strategi risiko-reward", description: "Kapan agresif, kapan aman" },
        { label: "Pro", target: "Baca lapangan", description: "Angin, slope, kondisi rumput" },
      ]},
    ],
  }],
  bigWins: [
    { id: "gf-bw-1", title: "Main 9 Lubang", description: "Round golf 9 lubang pertama", order: 1, isEssential: true, stage: "beginner" },
    { id: "gf-bw-2", title: "Break 100", description: "Skor di bawah 100 untuk 18 lubang", order: 2, isEssential: true, stage: "beginner" },
    { id: "gf-bw-3", title: "Break 90", description: "Skor konsisten di bawah 90", order: 3, isEssential: true, stage: "beginner" },
    { id: "gf-bw-4", title: "Handcap Resmi (10-20)", description: "Dapat handicap resmi dari klub", order: 4, isEssential: true, stage: "intermediate" },
    { id: "gf-bw-5", title: "Break 80", description: "Skor konsisten di bawah 80", order: 5, isEssential: true, stage: "intermediate" },
    { id: "gf-bw-6", title: "Turnamen Pertama", description: "Ikut turnamen amatir resmi", order: 6, isEssential: true, stage: "advanced" },
    { id: "gf-bw-7", title: "Handcap < 5", description: "Level amatir kompetitif", order: 7, isEssential: false, stage: "advanced" },
    { id: "gf-bw-8", title: "Scratch / Pro", description: "Handcap 0 atau lolos kualifikasi pro", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Full swing mechanics konsisten", "Short game presisi (putting, chipping)", "Course management dan strategi", "Kondisi fisik dan fleksibilitas", "Mental game dan fokus"],
    habits: ["Latihan 5-6 hari seminggu", "Bermain 1-2 round per minggu", "Analisis statistik round", "Jurnal latihan harian", "Review video swing"],
    mindset: ["Sabar — golf tidak bisa dikejar", "Fokus — satu pukulan pada satu waktu", "Integritas — patuhi aturan walau tanpa pengawas", "Resilien — bounce back setelah bogey"],
    tools: ["Set klub golf sesuai ukuran tubuh", "Bola golf (minimal 12)", "Glove golf", "Range finder/GPS golf", "Aplikasi analisis golf (18Birdies, GolfPad)"],
    commonMistakes: ["Ganti swing terus karena frustrasi", "Latihan driving range doang, lupakan short game", "Pilih klub terlalu advance", "Abaikan fisik — golf butuh mobilitas"],
    successFactors: ["Instruktur golf yang baik", "Konsistensi latihan jangka panjang", "Permainan short game solid", "Kondisi fisik prima", "Mental kuat di turnamen"],
  },
  agePath: [
    { ageRange: "10-14", title: "Fundamentals & Fun", description: "Kenali golf. Fokus ke dasar ayunan dan etika bermain.", milestones: ["Les golf dengan instruktur", "Pukul 50 bola di driving range", "Main 3-6 lubang di lapangan", "Kenali peralatan golf dasar"] },
    { ageRange: "15-18", title: "Development & Junior Competition", description: "Mulai kompetisi junior. Bangun konsistensi.", milestones: ["Main 18 lubang reguler", "Ikut turnamen junior", "Target handicap < 20", "Bangun fisik dasar golf"] },
    { ageRange: "19-25", title: "Amatir Kompetitif atau Kuliah", description: "Dua jalur: golf serius atau kuliah sambil golf.", milestones: ["Target handicap < 10", "Ikut turnamen amatir nasional", "Beasiswa golf ke universitas (opsional)", "Short game presisi"] },
    { ageRange: "26-35", title: "Amatir Tingkat Tinggi atau Pro", description: "Menuju scratch handicap atau kualifikasi pro.", milestones: ["Target handicap < 5", "Ikut turnamen pro-am", "Kualifikasi pro (jika serius)", "Bangun jaringan di industri golf"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "First Swing", description: "Dasar ayunan, grip, stance, dan postur.", keyActions: ["Les dengan pro 1x/minggu", "Driving range 2x/minggu", "Etika dan peraturan golf"] },
    { period: "3-12 Bulan", title: "Course Ready", description: "Dari range ke lapangan. Skor belum penting.", keyActions: ["Main 9 lubang 2x/bulan", "Konsistensi kontak bola", "Pusingan putting dan chipping"] },
    { period: "1-3 Tahun", title: "Break 100 → Break 90", description: "Skor mulai konsisten. Short game kunci utama.", keyActions: ["Break 100", "Short game 60% waktu latihan", "Handcap resmi 15-20"] },
    { period: "3-5 Tahun", title: "Competitive Amateur", description: "Turnamen, handicap rendah, target break 80.", keyActions: ["Break 80", "Turnamen reguler", "Kondisi fisik golf-specific"] },
  ],
  realityCheck: {
    hardTruths: ["Golf adalah olahraga termahal di Indonesia — green fee, bola, glove, klub bisa menghabiskan jutaan per bulan.", "Progres golf tidak linear. Minggu lalu main bagus, minggu ini bisa hancur total. Ini normal.", "Menjadi pegolf pro di Indonesia hampir tidak mungkin dari segi finansial tanpa sponsor.", "Waktu: satu round 18 lubang butuh 4-5 jam. Ini komitmen waktu yang besar."],
    silverLinings: ["Golf dimainkan sampai usia 70-80 tahun — ini olahraga seumur hidup yang tidak merusak sendi.", "Jaringan di lapangan golf sangat berharga — banyak deal bisnis terjadi di lapangan golf.", "Indonesia memiliki beberapa lapangan golf terindah di dunia."],
    transferableSkills: ["Fokus dan konsentrasi — satu ayunan butuh perhatian penuh. Berlaku di pekerjaan presisi.", "Manajemen emosi — golf mengajarkan mengendalikan frustrasi. Berlaku di leadership.", "Perencanaan dan strategi — setiap lubang butuh rencana. Berlaku di manajemen proyek."],
  },
  alternativePaths: [
    { scenario: "Tidak mampu secara finansial untuk golf reguler", steps: [
      { transition: "Gunakan driving range publik", role: "Range Player", description: "Range lebih murah. Fokus ke teknik, bukan skor." },
      { transition: "Cari sponsor atau komunitas", role: "Sponsored Amateur", description: "Beberapa klub punya program junior atau sponsorship." },
      { transition: "Kerja di industri golf", role: "Golf Industry Professional", description: "Caddy, shop assistant, atau event organizer golf." },
    ]},
    { scenario: "Tidak mencapai handicap rendah setelah 3 tahun", steps: [
      { transition: "Evaluasi instruktur dan metode latihan", role: "Restart Golfer", description: "Kadang butuh instruktur baru untuk melihat kesalahan." },
      { transition: "Fokus ke social golf", role: "Social Golfer", description: "Nikmati golf tanpa tekanan skor — tetap sehat dan senang." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tiger Woods", role: "Legenda Golf Dunia — 15 Major Championships", lesson: "Mental adalah 90% permainan — skill hanya 10%.", story: "Tiger Woods memenangkan US Open 2008 dengan satu kaki cedera. Fisiknya hancur, tapi mentalnya tidak. Ia telah berlatih meditasi dan visualisasi sejak kecil. Ayahnya mengajarkan: 'Kamu bisa kalah fisik, tapi jangan pernah kalah mental.'", keyInsight: "Saat semua orang fokus ke teknik ayunan, Tiger fokus ke kontrol pikiran. Mental yang kuat membuat skill yang ada bekerja di tekanan tertinggi.", actionItem: "Sebelum setiap pukulan, ambil 5 detik untuk visualisasi. Bayangkan bola terbang ke target. Lalu pukul." },
    { person: "Ernie Els", role: "Pegolf Pro — 4 Major Championships", lesson: "Sabar adalah skill yang paling underrated dalam golf.", story: "Ernie Els dijuluki 'The Big Easy' karena sikapnya yang tenang di lapangan. Dalam kariernya yang panjang, ia selalu sabar — tidak panik setelah bogey, tidak euforia setelah birdie. Konsistensi emosi ini membuatnya juara major di usia 20-an dan 40-an.", keyInsight: "Golf tidak dihitung dari satu pukulan, tapi dari 72 lubang. Kesabaran dalam jangka panjang mengalahkan ledakan sesaat.", actionItem: "Buat ritual 10 detik setelah setiap pukulan: apapun hasilnya, terima, pelajari, lalu lanjutkan." },
  ],
});

/* ─── HELPERS ─── */

const REFLECTIONS_KEY = "beautifio_roadmap_reflections";
const VAULT_KEY = "beautifio_roadmap_vault";
const DAILY_WINS_KEY = "beautifio_roadmap_dailywins";

export function getRoadmapV3(slug: string): RoadmapV3 | undefined {
  return ROADMAP_V3_SEED[slug];
}

export function getStoredReflections(roadmapSlug: string): DailyReflection[] {
  try {
    const raw = localStorage.getItem(REFLECTIONS_KEY);
    if (!raw) return [];
    const all: DailyReflection[] = JSON.parse(raw);
    return all.filter((r) => r.roadmapSlug === roadmapSlug);
  } catch { return []; }
}

export function saveReflection(r: DailyReflection) {
  try {
    const raw = localStorage.getItem(REFLECTIONS_KEY);
    const all: DailyReflection[] = raw ? JSON.parse(raw) : [];
    all.unshift(r);
    localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function getVaultItems(roadmapSlug: string): LearningVaultItem[] {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return [];
    const all: LearningVaultItem[] = JSON.parse(raw);
    return all.filter((i) => i.roadmapSlug === roadmapSlug);
  } catch { return []; }
}

export function saveVaultItem(item: LearningVaultItem) {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    const all: LearningVaultItem[] = raw ? JSON.parse(raw) : [];
    all.unshift(item);
    localStorage.setItem(VAULT_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function removeVaultItem(id: string) {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return;
    const all: LearningVaultItem[] = JSON.parse(raw);
    localStorage.setItem(VAULT_KEY, JSON.stringify(all.filter((i) => i.id !== id)));
  } catch { /* ignore */ }
}

export function toggleDailyHabit(slug: string, habitId: string): boolean {
  try {
    const key = `${DAILY_WINS_KEY}_${slug}`;
    const raw = localStorage.getItem(key);
    const done: string[] = raw ? JSON.parse(raw) : [];
    const idx = done.indexOf(habitId);
    if (idx >= 0) {
      done.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(done));
      return false;
    }
    done.push(habitId);
    localStorage.setItem(key, JSON.stringify(done));
    return true;
  } catch { return false; }
}

export function getDoneHabits(slug: string): string[] {
  try {
    const key = `${DAILY_WINS_KEY}_${slug}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getStreak(slug: string): number {
  try {
    const key = `${DAILY_WINS_KEY}_${slug}_streak`;
    const raw = localStorage.getItem(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch { return 0; }
}

export function updateStreak(slug: string, doneCount: number) {
  try {
    const key = `${DAILY_WINS_KEY}_${slug}_streak`;
    const keyDate = `${DAILY_WINS_KEY}_${slug}_lastdate`;
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem(keyDate);
    const streak = parseInt(localStorage.getItem(key) || "0", 10);

    if (lastDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastDate === yesterday ? streak + 1 : doneCount > 0 ? 1 : 0;

    localStorage.setItem(key, String(newStreak));
    localStorage.setItem(keyDate, today);
  } catch { /* ignore */ }
}
