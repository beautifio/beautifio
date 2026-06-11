import type {
  RoadmapV3, DailyReflection, LearningVaultItem,
  RoadmapDailyWinCategory, RoadmapSmallWinCategory, RoadmapBigWin,
  RoadmapBlueprint, RoadmapDream,
} from "@beautifio/types";
import { getLifePillars, getAlternativeFutures } from "./roadmap-life-pillars-seed";

export const ROADMAP_V3_SEED: Record<string, RoadmapV3> = {};

function r(slug: string, data: Omit<RoadmapV3, "lifePillars" | "alternativeFutures">) {
  ROADMAP_V3_SEED[slug] = {
    ...data,
    lifePillars: getLifePillars(),
    alternativeFutures: getAlternativeFutures(slug),
  };
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
    { id: "fb-bw-11", title: "Comeback dari Cedera Besar", description: "Pulih dan kembali bermain setelah cedera serius (ACL, patah tulang)", order: 11, isEssential: false, stage: "advanced" },
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
  duration: "3-5 tahun",
  category: "business",
  dream: {
    title: "Entrepreneur Sukses",
    description: "Membangun bisnis yang scalable, berdampak, dan menguntungkan.",
    whyMatters: "Entrepreneurship adalah jalan untuk menciptakan solusi nyata bagi masalah masyarakat, menciptakan lapangan kerja, dan membangun kemandirian finansial.",
    estimatedJourney: "3-5 tahun untuk mencapai tahap stabil dan menguntungkan.",
    careerPossibilities: [
      "CEO & Founder (Tech / F&B / Fashion / Social)",
      "Serial Entrepreneur",
      "Angel Investor",
      "Business Consultant",
      "Corporate Innovator",
      "Social Entrepreneur",
    ],
    successExamples: [
      "Nadiem Makarim — Gojek, unicorn pertama Indonesia (ride-hailing)",
      "Sari Tilaar — founder PT Martina Berto, beauty pioneer (manufacturing)",
      "Susanti Lim — Bittersweet by Najla, F&B sukses nasional",
      "Bob Sadino — entrepreneur legendaris, dari telur hingga multi-sektor",
      "William Tanuwijaya — Tokopedia, e-commerce raksasa",
    ],
  },
  dailyWins: [
    {
      category: "Pagi", emoji: "\u2600\uFE0F",
      habits: [
        { id: "en-dw-1", title: "First Revenue Task (Sebelum sosial media)", description: "Satu tindakan yang langsung menghasilkan atau mendekatkan pada revenue", icon: "Target" },
        { id: "en-dw-2", title: "Review 3 Prioritas Harian", description: "Tulis 3 prioritas yang benar-benar menggerakkan bisnis", icon: "Zap" },
        { id: "en-dw-3", title: "Baca/Belajar 30 Menit", description: "Buku, artikel, atau podcast — spesifik tentang industri atau skill bisnis", icon: "BookOpen" },
      ],
    },
    {
      category: "Kerja", emoji: "\uD83D\uDCBB",
      habits: [
        { id: "en-dw-4", title: "Deep Work Session (2 jam)", description: "Fokus tanpa distraksi pada prioritas #1 — lock door, airplane mode", icon: "Zap" },
        { id: "en-dw-5", title: "Customer Development", description: "Ngobrol dengan customer atau prospek — minimal 1 percakapan", icon: "Users" },
        { id: "en-dw-6", title: "Review Metrik Bisnis", description: "Cek revenue, cash flow, conversion atau KPI utama hari ini", icon: "TrendingUp" },
      ],
    },
    {
      category: "Malam", emoji: "\uD83C\uDF19",
      habits: [
        { id: "en-dw-7", title: "Review & Refleksi", description: "Apa yang berhasil? Apa yang bisa lebih baik? Satu insight untuk besok", icon: "BookOpen" },
        { id: "en-dw-8", title: "Digital Detox 1 Jam", description: "Jauhkan HP, baca buku non-bisnis, atau ngobrol dengan keluarga", icon: "Moon" },
        { id: "en-dw-9", title: "Tidur Sebelum 23:00", description: "Tidur cukup = performa founder besok lebih baik", icon: "Clock" },
      ],
    },
  ],
  smallWins: [
    {
      category: "Bisnis & Produk", emoji: "\uD83D\uDCCA",
      skills: [
        { id: "en-sw-1", name: "Product & Service Development", description: "Kemampuan mengembangkan produk/jasa dari ide ke market", levels: [
          { label: "Pemula", target: "Validasi masalah", description: "Problem validation, riset pasar, wawancara customer" },
          { label: "Menengah", target: "MVP / produk pertama", description: "Produk minimal viable atau jasa pertama siap dijual" },
          { label: "Mahir", target: "Product-market fit", description: "Retensi tinggi, repeat order, organic growth mulai" },
          { label: "Pro", target: "Scale & systemize", description: "Produk melayani ribuan pelanggan, operations terstandardisasi" },
        ]},
        { id: "en-sw-2", name: "Sales & Marketing", description: "Kemampuan menjual dan memasarkan produk/jasa", levels: [
          { label: "Pemula", target: "5 customer pertama", description: "Penjualan langsung, referral, mulut ke mulut" },
          { label: "Menengah", target: "Revenue Rp10jt/bln", description: "Sales funnel, digital marketing, branding" },
          { label: "Mahir", target: "Revenue Rp100jt/bln", description: "Sales team, marketing automation, channel distribution" },
          { label: "Pro", target: "Revenue Rp1M+/bln", description: "Sales engine independen dari founder, multi-channel" },
        ]},
      ],
    },
    {
      category: "Finansial & Legal", emoji: "\uD83D\uDCB0",
      skills: [
        { id: "en-sw-3", name: "Financial Management", description: "Mengelola arus kas, unit ekonomi, dan keuangan bisnis", levels: [
          { label: "Pemula", target: "Catat pemasukan & pengeluaran", description: "Pembukuan sederhana, pisahkan rekening pribadi dan bisnis" },
          { label: "Menengah", target: "Break even & cash flow sehat", description: "Bisnis tidak rugi, cash flow positif tiap bulan" },
          { label: "Mahir", target: "Profit konsisten + unit ekonomi baik", description: "Gross margin, CAC, LTV, unit economics dipahami dan dikelola" },
          { label: "Pro", target: "Scale: bootstrap atau funding", description: "Ekspansi dari profit (bootstrap) atau pendanaan eksternal" },
        ]},
        { id: "en-sw-4", name: "Legal & Compliance", description: "Legalitas bisnis dari pendirian hingga kepatuhan", levels: [
          { label: "Pemula", target: "Pilih badan usaha", description: "PT, CV, atau UMKM — pahami perbedaan dan konsekuensinya" },
          { label: "Menengah", target: "Daftarkan legalitas dasar", description: "Akta pendirian, NIB, NPWP, izin usaha" },
          { label: "Mahir", target: "Kontrak & IP protection", description: "Kontrak customer, vendor, karyawan. Merek/HKI jika relevan" },
          { label: "Pro", target: "Full compliance", description: "Pajak bulanan/tahunan, BPJS, laporan keuangan audit-ready" },
        ]},
      ],
    },
    {
      category: "Tim & Organisasi", emoji: "\uD83D\uDC65",
      skills: [
        { id: "en-sw-5", name: "People & Culture", description: "Membangun tim, hiring, dan budaya perusahaan", levels: [
          { label: "Pemula", target: "Hire orang pertama", description: "Tulis job description, wawancara, cari yang cocok" },
          { label: "Menengah", target: "Kelola tim kecil (2-5 orang)", description: "Delegasi, feedback, 1-on-1 rutin" },
          { label: "Mahir", target: "Bangun budaya & sistem", description: "Values perusahaan, SOP, performance review" },
          { label: "Pro", target: "Scale organisasi", description: "Multi-department, leaders di setiap divisi, culture scale" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "en-bw-1", title: "Validasi Ide & Masalah", description: "Konfirmasi bahwa masalah nyata dan orang mau bayar untuk solusinya", order: 1, isEssential: true, stage: "beginner" },
    { id: "en-bw-2", title: "Produk/Jasa Pertama Diluncurkan", description: "MVP atau jasa pertama siap untuk customer", order: 2, isEssential: true, stage: "beginner" },
    { id: "en-bw-3", title: "First Revenue", description: "Pendapatan pertama dari pelanggan nyata — milestone paling jujur", order: 3, isEssential: true, stage: "beginner" },
    { id: "en-bw-4", title: "Badan Usaha & Legalitas Terdaftar", description: "PT/CV/UMKM terdaftar, NIB, NPWP — bisnis resmi", order: 4, isEssential: false, stage: "beginner" },
    { id: "en-bw-5", title: "First Employee", description: "Mempekerjakan orang pertama — dari solopreneur ke employer", order: 5, isEssential: false, stage: "intermediate" },
    { id: "en-bw-6", title: "Product-Market Fit", description: "Retensi tinggi, repeat order, pertumbuhan organik mulai terlihat", order: 6, isEssential: true, stage: "intermediate" },
    { id: "en-bw-7", title: "First Profitable Month", description: "Pendapatan > pengeluaran — bisnis hidup tanpa injeksi modal", order: 7, isEssential: true, stage: "advanced" },
    { id: "en-bw-8", title: "Revenue Milyar Pertama (Annual Run Rate)", description: "Revenue tahunan mencapai Rp1M — validasi skala", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Problem solving — temukan masalah nyata, bukan solusi cari masalah",
      "Sales — kemampuan menjual visi, produk, dan diri sendiri — skill #1 founder",
      "Leadership — bangun tim yang lebih hebat dari dirimu",
      "Financial literacy — pahami unit ekonomi, cash flow, margin, pricing",
      "Adaptability — pivot cepat saat data bilang berubah arah",
      "Legal & compliance dasar — badan usaha, kontrak, pajak, HKI",
    ],
    habits: [
      "Customer obsession — ngobrol dengan customer setiap minggu (bukan setahun sekali)",
      "Data-driven — semua keputusan berdasarkan data, bukan feeling atau ego",
      "Continuous learning — baca buku, ikut industri, belajar dari competitor",
      "Network aggressively — bangun relasi, cari mentor, hadiri event industri",
      "Fail fast — uji ide dengan cepat dan murah sebelum investasi besar",
      "Systemize — dokumetasikan SOP, jangan andalkan ingatan founder",
    ],
    mindset: [
      "Abundance mindset — cukup untuk semua, kolaborasi bukan kompetisi",
      "Resilience — kegagalan adalah batu loncatan, bukan akhir",
      "Long-term thinking — bangun untuk 10 tahun ke depan, bukan exit cepat",
      "Customer-first — customer bahagia = bisnis tumbuh tanpa effort ekstra",
      "Bersyukur — nikmati perjalanan wirausaha, bukan hanya destination",
      "Bootstrap mentality — profit > funding. Revenue menyelesaikan banyak masalah.",
    ],
    tools: [
      "Notion / Linear / Asana untuk manajemen proyek",
      "Stripe, Xendit, Midtrans untuk payment gateway",
      "Google Analytics, Mixpanel, atau Metabase untuk data",
      "HubSpot, Mailchimp, atau ActiveCampaign untuk CRM/email",
      "Legal: konsultan hukum untuk pendirian PT, kontrak, HKI",
      "Accounting: Jurnal, Accurate, atau BukuWarung untuk UKM",
    ],
    commonMistakes: [
      "Membangun produk sebelum validasi masalah = solusi cari masalah",
      "Hire terlalu cepat (beban gaji) atau terlalu lambat (single point of failure)",
      "Pricing terlalu rendah karena takut — sulit naik setelah turun",
      "Mengabaikan cash flow — fokus cuma ke revenue, lupa tagihan bulanan",
      "Co-founder conflict tanpa pembagian peran, saham, dan vesting jelas",
      "Skalasi sebelum product-market fit — bakar uang untuk growth tanpa retensi",
    ],
    successFactors: [
      "Founder-market fit — pahami industri yang kamu masuki dengan dalam",
      "Co-founder komplementer — skill set saling melengkapi (bisnis + teknis)",
      "Mentor dan advisory board yang tepat — bukan yang bilang iya terus",
      "Tim yang solid dan punya misi sama — culture fit > resume mentereng",
      "Modal cukup untuk 18-24 bulan atau path to profit jelas",
      "Market timing — masuk pasar di waktu yang tepat (tidak terlalu cepat atau terlambat)",
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
        { id: "pr-dw-5", title: "Build or Study 1 Hour", description: "Code project, algorithms, atau arsitektur — fokus ke skill, bukan hiburan", icon: "Trophy" },
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
      category: "Backend & Database", emoji: "\uD83D\uDD17",
      skills: [
        { id: "pr-sw-4", name: "Backend Development", description: "API, server-side logic, dan arsitektur backend", levels: [
          { label: "Pemula", target: "Buat API sederhana", description: "Express/Fastify/Flask, CRUD endpoints, HTTP methods" },
          { label: "Menengah", target: "Auth & middleware", description: "JWT/OAuth, middleware, error handling, validation" },
          { label: "Mahir", target: "Arsitektur backend solid", description: "Clean architecture, testing, caching (Redis), message queues" },
          { label: "Pro", target: "Production backend", description: "Microservices, event-driven, observability, horizontal scaling" },
        ]},
        { id: "pr-sw-10", name: "Database & Data Modeling", description: "Desain dan optimasi database", levels: [
          { label: "Pemula", target: "SQL dasar", description: "SELECT, JOIN, GROUP BY, CREATE TABLE" },
          { label: "Menengah", target: "Schema design & indexing", description: "Normalization, indexing strategy, query optimization" },
          { label: "Mahir", target: "Advanced SQL & NoSQL", description: "Subqueries, CTE, window functions, MongoDB/Firebase" },
          { label: "Pro", target: "Data architecture", description: "Sharding, replication, migration strategies, data warehousing" },
        ]},
      ],
    },
    {
      category: "Infrastructure & Tools", emoji: "\u2699\uFE0F",
      skills: [
        { id: "pr-sw-11", name: "DevOps & Cloud", description: "Deployment, infrastructure, dan CI/CD", levels: [
          { label: "Pemula", target: "Deploy manual", description: "Vercel, Netlify, atau SSH ke VPS dasar" },
          { label: "Menengah", target: "Docker & CI/CD", description: "Dockerfile, docker-compose, GitHub Actions dasar" },
          { label: "Mahir", target: "Cloud services", description: "AWS/GCP/Azure dasar (EC2, S3, Lambda, RDS)" },
          { label: "Pro", target: "Infrastructure as Code", description: "Terraform/K8s, monitoring, auto-scaling, security" },
        ]},
        { id: "pr-sw-12", name: "Testing & Quality", description: "Menjamin kualitas kode melalui automated testing", levels: [
          { label: "Pemula", target: "Manual testing", description: "Test API dengan Postman/Bruno, console.log debugging" },
          { label: "Menengah", target: "Unit & integration tests", description: "Jest/Vitest, test coverage, mocking" },
          { label: "Mahir", target: "E2E & CI testing", description: "Cypress/Playwright, testing di CI pipeline" },
          { label: "Pro", target: "Quality culture", description: "Test-driven development, property-based testing, performance testing" },
        ]},
        { id: "pr-sw-13", name: "System Design", description: "Merancang arsitektur sistem yang scalable", levels: [
          { label: "Pemula", target: "Single server design", description: "Client-server, REST API, database per aplikasi" },
          { label: "Menengah", target: "Microservices basics", description: "Service decomposition, API gateway, message queue" },
          { label: "Mahir", target: "Distributed systems", description: "Caching, CDN, load balancing, database replication" },
          { label: "Pro", target: "Large-scale systems", description: "Event sourcing, CQRS, consensus algorithms, global infrastructure" },
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
  description: "Jalur menjadi pelari dari pemula hingga atlet — dari 5km pertama hingga maraton dan podium.",
  emoji: "\uD83C\uDFC3",
  color: "from-sky-600 to-cyan-500",
  duration: "1-5 tahun",
  category: "sports",
  dream: {
    title: "Atlet Lari Profesional",
    description: "Mencapai performa puncak sebagai pelari yang mampu bersaing di level nasional dan internasional — baik di sprint, jarak menengah, maraton, atau trail.",
    whyMatters: "Lari mengajarkan disiplin, ketekunan, dan kekuatan mental yang tak tergantikan. Menjadi pelari profesional berarti menginspirasi gaya hidup sehat dan aktif.",
    estimatedJourney: "1-3 tahun untuk race pertama, 5+ tahun untuk level kompetitif.",
    careerPossibilities: ["Atlet Lari Profesional", "Pelatih Lari", "Fisioterapis Olahraga", "Event Organizer Race", "Content Creator Fitness", "Running Store Owner"],
    successExamples: ["Agus Prayogo — pelari maraton nasional, perak SEA Games", "Robi Syianturi — pelari jarak jauh Indonesia, emas SEA Games 2023", "Lalu Muhammad Zohri — sprinter, emas Kejuaraan Dunia U20"],
  },
  dailyWins: [
    { category: "Pagi (Sesi 1)", emoji: "\u2600\uFE0F", habits: [
      { id: "rn-dw-1", title: "Cek HRV & Kesiapan Tubuh", description: "HRV, resting heart rate, dan kualitas tidur sebelum latihan", icon: "Heart" },
      { id: "rn-dw-2", title: "Warm-up Dinamis 15 Menit", description: "Leg swings, lunges, high knees, butt kicks, hip circles", icon: "Zap" },
      { id: "rn-dw-3", title: "Sesi Lari Pagi", description: "Sesi utama: easy run, interval, tempo, atau long run sesuai jadwal", icon: "Target" },
    ]},
    { category: "Sore (Sesi 2)", emoji: "\uD83C\uDFC3", habits: [
      { id: "rn-dw-4", title: "Strength & Plyometrics", description: "Single-leg work, squats, deadlifts, calf raises, box jumps", icon: "Flame" },
      { id: "rn-dw-5", title: "Drills & Teknik Lari", description: "A-skips, B-skips, high knees, form drills untuk efisiensi", icon: "Zap" },
      { id: "rn-dw-6", title: "Cool Down & Stretching", description: "10-15 menit peregangan statis + foam rolling", icon: "Clock" },
    ]},
    { category: "Malam — Recovery & Evaluasi", emoji: "\uD83C\uDF19", habits: [
      { id: "rn-dw-7", title: "Catat Jurnal Lari", description: "Jarak, pace, HR, RPE, perasaan, dan catatan cedera", icon: "BookOpen" },
      { id: "rn-dw-8", title: "Mobility & Hip Work", description: "Hip mobility, ankle mobility, dan latihan pencegahan cedera", icon: "Zap" },
      { id: "rn-dw-9", title: "Tidur 8-9 Jam", description: "Recovery optimal — ini adalah bagian dari latihan", icon: "Moon" },
    ]},
  ],
  smallWins: [
    {
      category: "Daya Tahan & Jarak", emoji: "\uD83D\uDEB6", skills: [
        { id: "rn-sw-1", name: "Endurance", description: "Daya tahan lari dari 3km hingga maraton", levels: [
          { label: "Pemula", target: "Lari 3km nonstop", description: "Jogging 3km — mulailah dengan Couch to 5K" },
          { label: "Menengah", target: "Lari 10km nonstop", description: "Base mileage — mingguan 20-30km" },
          { label: "Mahir", target: "Half marathon (21km)", description: "Half marathon dengan pace konsisten 5:30-6:00/km" },
          { label: "Pro", target: "Full marathon (42km)", description: "Maraton finish dengan pace kompetitif" },
        ]},
        { id: "rn-sw-2", name: "Speed & Pace", description: "Kecepatan lari untuk interval hingga race pace", levels: [
          { label: "Pemula", target: "Pace 7-8 min/km", description: "Zona 2 easy run — conversational pace" },
          { label: "Menengah", target: "Pace 5:30-6:00 min/km", description: "Tempo run dan interval dasar" },
          { label: "Mahir", target: "Pace 4:30-5:00 min/km", description: "Threshold pace dan race pace half marathon" },
          { label: "Pro", target: "Pace < 4:00 min/km", description: "Kecepatan kompetitif sub-3 marathon" },
        ]},
        { id: "rn-sw-3", name: "Heart Rate Zone Training", description: "Latihan berdasarkan zona detak jantung", levels: [
          { label: "Pemula", target: "Kenali HR max & Z2", description: "Hitung HR max (220-usia), lari di Z2 (60-70%)" },
          { label: "Menengah", target: "Z2 base building", description: "80% latihan di Z2, 20% intensitas tinggi" },
          { label: "Mahir", target: "Z3-Z4 interval", description: "Threshold dan VO2max intervals dalam zona target" },
          { label: "Pro", target: "Periodisasi HR", description: "Periodisasi zona berdasarkan siklus latihan" },
        ]},
      ],
    },
    {
      category: "Kekuatan & Pencegahan Cedera", emoji: "\uD83D\uDCAA", skills: [
        { id: "rn-sw-4", name: "Running-Specific Strength", description: "Kekuatan yang mendukung efisiensi lari", levels: [
          { label: "Pemula", target: "Bodyweight basic", description: "Squat, lunge, calf raise, plank — 3x10" },
          { label: "Menengah", target: "Weight + plyometrics", description: "Goblet squat, RDL, box jumps, single-leg work" },
          { label: "Mahir", target: "Sport-specific strength", description: "Deadlift 1.5x BW, single-leg squat, explosive work" },
          { label: "Pro", target: "Strength maintenance", description: "Maintenance di musim kompetisi, build di off-season" },
        ]},
        { id: "rn-sw-5", name: "Injury Prevention & Mobility", description: "Pencegahan cedera umum pelari: shin splints, ITBS, PF", levels: [
          { label: "Pemula", target: "Kenali cedera umum", description: "Beda nyeri otot, tendinitis, dan stress fracture" },
          { label: "Menengah", target: "Rutin prehab", description: "Kuatkan hip, glutes, ankle — penyebab utama cedera" },
          { label: "Mahir", target: "Mobility routine", description: "Self-massage, stretching, mobility work harian" },
          { label: "Pro", target: "Body management total", description: "Periodisasi recovery, konsultasi fisio, rotasi sepatu" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "rn-bw-1", title: "Lari 5km Nonstop", description: "Pertama kali lari 5km tanpa berhenti", order: 1, isEssential: true, stage: "beginner" },
    { id: "rn-bw-2", title: "Race Pertama (5km/10km)", description: "Ikut event lari resmi pertama", order: 2, isEssential: true, stage: "beginner" },
    { id: "rn-bw-3", title: "Sub-30 Menit 5km", description: "Finish 5km di bawah 30 menit", order: 3, isEssential: false, stage: "beginner" },
    { id: "rn-bw-4", title: "Half Marathon Finish", description: "Selesaikan 21km dalam event resmi", order: 4, isEssential: true, stage: "intermediate" },
    { id: "rn-bw-5", title: "Sub-2 Jam Half Marathon", description: "Half marathon di bawah 2 jam", order: 5, isEssential: false, stage: "intermediate" },
    { id: "rn-bw-6", title: "Full Marathon Finish", description: "Selesaikan 42km dalam event resmi", order: 6, isEssential: true, stage: "advanced" },
    { id: "rn-bw-7", title: "Podium Race Lokal", description: "Top 3 di event lari lokal", order: 7, isEssential: false, stage: "advanced" },
    { id: "rn-bw-8", title: "Qualify Event Nasional", description: "Memenuhi syarat untuk event nasional", order: 8, isEssential: true, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Teknik lari efisien (postur, cadence, foot strike)",
      "Heart rate zone training — 80/20 rule",
      "Running-specific strength (single-leg, plyometrics, core)",
      "Pencegahan dan rehabilitasi cedera pelari",
      "Nutrisi periodisasi: training vs race day vs recovery",
      "Strategi race: pacing, hidrasi, mental, nutrition",
    ],
    habits: [
      "Lari 5-6 kali seminggu dengan periodisasi (easy, interval, long run, recovery)",
      "Strength & plyometrics 2-3x/minggu",
      "Mobility & prehab setiap hari (15 menit)",
      "Sleep hygiene 8-9 jam — non-negotiable",
      "Catat progres di Strava/Garmin: jarak, pace, HR, RPE, cedera",
      "Cross-training (renang, sepeda, elliptical) untuk recovery aktif",
    ],
    mindset: [
      "Konsisten adalah kunci — kecepatan datang dari volume yang dibangun bertahun-tahun",
      "80/20 rule — 80% latihan mudah, 20% latihan keras",
      "Dengarkan tubuhmu — istirahat adalah bagian dari latihan, bukan lawan",
      "Nikmati proses — progres lari diukur dalam bulan dan tahun, bukan hari",
      "Setiap lari adalah kemenangan — bahkan lari yang terasa 'buruk' membangunmu",
    ],
    tools: [
      "Sepatu lari: 2-3 pasang rotasi (easy day, speed day, long run)",
      "GPS watch (Garmin, Polar, Coros) dengan HR monitor",
      "Strava untuk tracking dan komunitas",
      "Foam roller, massage gun, lacrosse ball untuk self-myofascial release",
      "Running belt atau hydration vest untuk long run",
      "Nutrition: gel, chews, elektrolit untuk long run & race",
    ],
    commonMistakes: [
      "Terlalu cepat menambah jarak (10% rule dilanggar) — #1 penyebab cedera",
      "Abaikan strength training — lari doang tidak cukup",
      "Pace terlalu cepat di semua lari — lupa bahwa 80% lari harus terasa 'mudah'",
      "Malas pemanasan dan pendinginan — membangun cedera dalam diam",
      "Lari di sepatu yang sudah usang (500-800km max)",
      "Membandingkan progres dengan pelari lain — perjalanan setiap orang berbeda",
    ],
    successFactors: [
      "Konsistensi latihan bertahun-tahun — bukan latihan keras 3 bulan lalu berhenti",
      "Periodisasi latihan yang terstruktur: base → build → peak → race → recovery",
      "Dukungan komunitas lari (running club, group run, teman latihan)",
      "Nutrisi dan hidrasi optimal — dipraktikkan setiap hari, bukan hanya race day",
      "Variasi: jalan (trail, road, track) dan jarak preventif cedera monoton",
    ],
  },
  agePath: [
    { ageRange: "14-20", title: "Discovery & Base Building", description: "Temukan jenis lari yang cocok — sprint, middle-distance, marathon, trail.", milestones: ["Lari rutin 3x seminggu", "Finish 5km nonstop", "Ikut fun run 5km/10km", "Cek postur dan dapatkan sepatu yang tepat", "Gabung klub lari atau ekstrakurikuler atletik"] },
    { ageRange: "21-25", title: "Racing & Community", description: "Mulai ikut race reguler. Komunitas lari menjadi support system.", milestones: ["Finish half marathon", "Gabung running club (Jakarta Runners, Bandung Runners, dll)", "Ikut 3-4 race per tahun", "Track progres dengan GPS watch", "Mulai belajar periodisasi latihan"] },
    { ageRange: "26-35", title: "Competitive Peak", description: "Potensi fisik puncak untuk pelari jarak jauh.", milestones: ["Finish marathon (target sub-4 jam)", "Konsisten latihan 5-6x seminggu", "Ikut race nasional (Borobudur Marathon, Jakarta Marathon)", "Mulai coaching atau personal training"] },
    { ageRange: "35-45", title: "Master Athlete & Coaching", description: "Pelari veteran dengan kebijaksanaan dan konsistensi — buktikan usia bukan batasan.", milestones: ["Kompetisi master division", "Mulai coaching atau mentoring pelari pemula", "Explore trail/ultra running sebagai tantangan baru", "Periodisasi latihan untuk meminimalisir cedera"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "Mulai Lari — Couch to 5K", description: "Dari jalan cepat ke jogging konsisten 3x seminggu.", keyActions: ["Couch to 5K program (9 minggu)", "Peregangan setelah setiap lari", "Cari sepatu yang sesuai tipe kaki (gait analysis)", "Bangun kebiasaan, bukan kecepatan"] },
    { period: "3-12 Bulan", title: "Base Mileage & First Race", description: "Bangun volume dengan aman. Ikut fun run pertama.", keyActions: ["Lari 15-25km/minggu", "Cross-training 1x/minggu", "Ikut event 5km atau 10km pertama", "Mulai strength training 1x/minggu"] },
    { period: "1-3 Tahun", title: "Racing Regular & Half Marathon", description: "Kompetisi rutin untuk mengukur progres. Target half marathon.", keyActions: ["Half marathon finish", "Latihan interval & tempo 2x/minggu", "Strength training 2x/minggu", "Periodisasi latihan 12-16 minggu per siklus"] },
    { period: "3-5 Tahun", title: "Marathon & Competitive Level", description: "Full marathon adalah milestone utama.", keyActions: ["Full marathon finish", "Periodisasi penuh (base, build, peak, taper, race)", "Nutrisi race day teruji", "Kompetisi di level nasional"] },
  ],
  realityCheck: {
    hardTruths: [
      "Cedera adalah bagian dari lari — ITBS, shin splints, plantar fasciitis hampir pasti akan kamu alami. Bukan 'apakah' tapi 'kapan'.",
      "Progres tidak linear. Ada minggu terasa mundur — itu normal. Ada bulan di mana semua lari terasa berat.",
      "Race day tidak selalu sesuai rencana — cuaca, pencernaan, sepatu baru, mental — banyak faktor di luar kendali.",
    ],
    silverLinings: [
      "Lari mengajarkan bahwa tujuan besar dicapai langkah demi langkah — pelajaran hidup yang berharga.",
      "Komunitas lari Indonesia sangat solid dan suportif — dari komunitas lokal hingga PASI.",
      "Manfaat kesehatan lari (jantung, mental, imun) terasa bahkan saat kamu tidak lagi kompetitif — ini investasi kesehatan seumur hidup.",
    ],
    transferableSkills: [
      "Goal setting dan periodisasi — berlaku di manajemen proyek dan karir.",
      "Resilience — kemampuan terus maju saat tubuh dan pikiran ingin berhenti.",
      "Data analysis — memahami pace, heart rate, splits bisa diterapkan di analitik bisnis dan operasional.",
    ],
  },
  alternativePaths: [
    { scenario: "Cedera kronis tidak bisa lari jarak jauh", steps: [
      { transition: "Ganti ke low-impact cardio", role: "Swimmer / Cyclist", description: "Renang dan sepeda memberi kardio tanpa impact pada sendi." },
      { transition: "Fokus ke coaching daripada lari", role: "Running Coach", description: "Pengalaman lari berharga untuk melatih dan menginspirasi orang lain." },
      { transition: "Jadi fisioterapis spesialis lari", role: "Running Physio", description: "Gabung fisioterapi dengan spesialisasi cedera pelari." },
    ]},
    { scenario: "Tidak ada waktu untuk latihan marathon/intensif", steps: [
      { transition: "Fokus ke 5km/10km dengan kualitas", role: "Speed Runner", description: "Jarak pendek tapi intensitas tinggi — lebih efisien waktu." },
      { transition: "Parkrun atau social run", role: "Social Runner", description: "Lari tanpa target waktu, fokus ke kebersamaan dan kesehatan." },
    ]},
    { scenario: "Tidak ada event lari di daerah", steps: [
      { transition: "Buat komunitas lari lokal atau virtual run", role: "Run Organizer", description: "Gunakan Strava atau WhatsApp group untuk virtual challenge." },
      { transition: "Travel untuk race", role: "Race Tourist", description: "Jadikan race sebagai alasan jalan-jalan — Borobudur Marathon, Jakarta, Bandung." },
    ]},
  ],
  masterclassLessons: [
    { person: "Eliud Kipchoge", role: "Pelari Marathon — Rekor Dunia (1:59:40)", lesson: "No human is limited — batasan ada di pikiran, bukan di tubuh.", story: "Kipchoge berlari marathon di bawah 2 jam — sesuatu yang dianggap mustahil oleh ilmuwan olahraga. Rahasianya: ia percaya tubuh mampu, pikiran yang harus dilatih. Ia bermeditasi, visualisasi finish line, dan tidak pernah mengeluh tentang kondisi. Ia mengatakan: 'Only the disciplined ones in life are free.'", keyInsight: "Kebanyakan pelari berhenti karena pikirannya menyerah duluan, bukan tubuhnya. Latih mental sama keras seperti fisik.", actionItem: "Di race atau long run berikutnya, saat ingin berhenti, ulangi dalam hati: 'This is where the real race begins.' lalu lanjutkan." },
    { person: "Agus Prayogo", role: "Pelari Marathon Nasional Indonesia — Perak SEA Games", lesson: "Konsistensi di hari-hari biasa menentukan hasil di hari race. Motivasi sifatnya sementara, disiplin permanen.", story: "Agus dikenal dengan latihan disiplinnya — lari setiap pagi jam 5, tidak peduli hujan atau panas. Ia tidak menunggu 'mood lari' — ia membuat lari sebagai rutinitas seperti gosok gigi. Inilah yang membawanya ke SEA Games.", keyInsight: "Motivasi bersifat sementara. Disiplin bersifat permanen. Bangun sistem, jangan andalkan motivasi.", actionItem: "Buat jadwal lari mingguan dan tempel di dinding. Ceklis setiap selesai. Target: streak 30 hari tanpa bolos." },
  ],
});

r("musician", {
  slug: "musician",
  title: "Musisi Profesional",
  description: "Jalur menjadi musisi dari belajar alat musik hingga tampil dan berkarya profesional — dari gitar, piano, vokal, hingga produksi musik.",
  emoji: "\uD83C\uDFB5",
  color: "from-purple-600 to-pink-500",
  duration: "2-5 tahun",
  category: "creative",
  dream: {
    title: "Musisi Profesional",
    description: "Menguasai alat musik, berkarya, dan tampil di panggung sebagai musisi profesional di era digital.",
    whyMatters: "Musik adalah bahasa universal. Menjadi musisi berarti bisa mengekspresikan perasaan, menginspirasi orang lain, dan menciptakan karya yang abadi. Di era digital, musisi punya lebih banyak jalur dari sebelumnya — performa, produksi, pengajaran, hingga konten.",
    estimatedJourney: "2-5 tahun untuk mahir, 5-10 tahun untuk profesional.",
    careerPossibilities: ["Pemain Musik Profesional", "Pengajar Musik", "Session Musician", "Komposer/Arranger", "Music Producer", "Music Content Creator", "Sound Engineer", "Orkestra/Ensemble Player"],
    successExamples: ["Tohpati — gitaris jazz fusion, perpaduan gamelan & jazz", "Rieka Roeslan — vokalis dan penulis lagu", "Ivana Santoso — violinis muda internasional", "Kenny G — pemain saksofon legendaris dunia", "Ariel Noah — vokalis dan penulis lagu ikonik Indonesia"],
  },
  dailyWins: [
    { category: "Pemanasan & Teknik", emoji: "\uD83C\uDFB5", habits: [
      { id: "mu-dw-1", title: "Warm-up Spesifik Instrumen (15 menit)", description: "Scales, finger exercises, vocal fry, atau bowing — sesuai alat musik", icon: "Zap" },
      { id: "mu-dw-2", title: "Teknik Terstruktur (30 menit)", description: "Fokus pada teknik spesifik sesuai level (chord, scale, rhythm, articulation)", icon: "Target" },
      { id: "mu-dw-3", title: "Repertoar Baru (30 menit)", description: "Pelajari lagu atau etude baru secara bertahap", icon: "BookOpen" },
    ]},
    { category: "Musikalitas & Teori", emoji: "\uD83C\uDFB6", habits: [
      { id: "mu-dw-4", title: "Sight Reading 10 Menit", description: "Baca notasi baru tanpa persiapan — latih kefasihan membaca", icon: "BookOpen" },
      { id: "mu-dw-5", title: "Ear Training 10 Menit", description: "Interval, chord progression, atau transcribe frase pendek", icon: "Headphones" },
      { id: "mu-dw-6", title: "Improvisasi Bebas 15 Menit", description: "Bermain tanpa struktur — latih kreativitas dan instinct musikal", icon: "Sparkles" },
    ]},
    { category: "Kreatif & Produksi", emoji: "\u2728", habits: [
      { id: "mu-dw-7", title: "Rekam Ide Musik", description: "Voice memo atau DAW — tangkap ide melodi, chord, atau rhythm", icon: "Music" },
      { id: "mu-dw-8", title: "Dengar 1 Lagu dengan Analisis", description: "Pilih satu lagu, analisis struktur, instrumentasi, mixing", icon: "Headphones" },
      { id: "mu-dw-9", title: "Eksplorasi Genre Baru 15 Menit", description: "Dengar genre yang tidak biasa kamu mainkan untuk perspektif baru", icon: "Compass" },
    ]},
  ],
  smallWins: [
    {
      category: "Alat Musik (String & Melody)", emoji: "\uD83C\uDFB8", skills: [
        { id: "mu-sw-1", name: "Gitar / Ukulele", description: "Teknik petikan, strumming, dan melodi untuk gitar akustik/electric", levels: [
          { label: "Pemula", target: "Chord dasar & strumming 1 lagu", description: "Buka chord (C, G, Am, F), strumming dasar" },
          { label: "Menengah", target: "Barre chord & fingerstyle", description: "Chord major/minor di seluruh fret, fingerpicking pola" },
          { label: "Mahir", target: "Solo & improvisasi", description: "Scale pentatonik, bending, vibrato, improvisasi blues" },
          { label: "Pro", target: "Teknik lanjutan & ekspresi", description: "Sweep picking, tapping, hybrid picking, dynamic control" },
        ]},
        { id: "mu-sw-2", name: "Piano / Keyboard", description: "Teknik tangan kiri-kanan, chord voicing, dan interpretasi", levels: [
          { label: "Pemula", target: "Posisi tangan & tangga nada", description: "Scale C mayor, chord dasar dengan inversi" },
          { label: "Menengah", target: "Dua tangan mandiri", description: "Melodi kanan + accompaniment kiri, berbagai key signature" },
          { label: "Mahir", target: "Voicing & improvisasi", description: "Jazz voicing, chord extension, improvisasi modal" },
          { label: "Pro", target: "Interpretasi & performa", description: "Dynamic shading, pedaling, ekspresi musikal penuh" },
        ]},
        { id: "mu-sw-3", name: "Vokal", description: "Teknik bernyanyi dari dasar hingga performa profesional", levels: [
          { label: "Pemula", target: "Pitch & pernapasan dasar", description: "Diaphragm breathing, pitch matching, vocal register" },
          { label: "Menengah", target: "Rentang vokal & resonance", description: "Head voice, chest voice, mix voice, vibrato" },
          { label: "Mahir", target: "Teknik & gaya", description: "Belting, riff & run, stylistic interpretation" },
          { label: "Pro", target: "Performa & ketahanan", description: "Tour-ready vocal stamina, genre versatility, stage presence" },
        ]},
        { id: "mu-sw-4", name: "Alat Musik Ritmis", description: "Drum, perkusi, atau alat rhythm section", levels: [
          { label: "Pemula", target: "Basic beat & timing", description: "Not seperempat, seperdelapan, basic rock beat" },
          { label: "Menengah", target: "Fill & dinamika", description: "Basic fills, ghost notes, dynamic control" },
          { label: "Mahir", target: "Syncopation & groove", description: "Polyrhythm, odd time signature, genre-specific groove" },
          { label: "Pro", target: "Kreativitas ritmis", description: "Linear drumming, advanced independence, studio recording" },
        ]},
      ],
    },
    {
      category: "Musicianship", emoji: "\uD83C\uDFB6", skills: [
        { id: "mu-sw-5", name: "Teori Musik", description: "Harmoni, skala, modal, dan struktur musik", levels: [
          { label: "Pemula", target: "Skala mayor & minor", description: "Interval, triad chord, circle of fifths" },
          { label: "Menengah", target: "Chord progression & harmonisasi", description: "Diatonic harmony, secondary dominants, modulasi" },
          { label: "Mahir", target: "Modal interchange & extended harmony", description: "Modal mixture, chord substitution, reharmonization" },
          { label: "Pro", target: "Advanced analysis & composition", description: "Counterpoint, chromatic harmony, orchestration" },
        ]},
        { id: "mu-sw-6", name: "Ear Training & Sight Reading", description: "Kemampuan mendengar dan membaca musik", levels: [
          { label: "Pemula", target: "Interval dasar", description: "Kenali beda major/minor third, perfect fifth" },
          { label: "Menengah", target: "Chord quality & progression", description: "Identifikasi major/minor/diminished/augmented chord" },
          { label: "Mahir", target: "Transcribe melodi sederhana", description: "Tulis notasi dari rekaman dalam 2-3 dengar" },
          { label: "Pro", target: "Transcribe kompleks & sight read", description: "Transcribe full arrangement, sight read grade 8+" },
        ]},
        { id: "mu-sw-7", name: "Songwriting & Komposisi", description: "Menciptakan karya musik orisinal", levels: [
          { label: "Pemula", target: "Struktur lagu dasar", description: "Verse-chorus-bridge, chord progression sederhana" },
          { label: "Menengah", target: "Lirik & melodi", description: "Rhyming scheme, melodic contour, hook writing" },
          { label: "Mahir", target: "Arrangement & dinamika", description: "Instrumentasi, build & release, texture variation" },
          { label: "Pro", target: "Genre fusion & identitas", description: "Ciptakan suara khas, arransemen kompleks, scoring" },
        ]},
      ],
    },
    {
      category: "Produksi & Teknologi", emoji: "\uD83C\uDFA7", skills: [
        { id: "mu-sw-8", name: "Music Production (DAW)", description: "Recording, editing, mixing menggunakan digital audio workstation", levels: [
          { label: "Pemula", target: "Rekam audio dasar", description: "Setup audio interface, record 1 track, export" },
          { label: "Menengah", target: "Editing & MIDI", description: "Quantize, comping, MIDI programming, virtual instruments" },
          { label: "Mahir", target: "Mixing & efek", description: "EQ, compression, reverb, delay, automation" },
          { label: "Pro", target: "Mastering & sound design", description: "Loudness standards, stereo field, synthesis & sampling" },
        ]},
        { id: "mu-sw-9", name: "Performa & Stagecraft", description: "Kemampuan tampil di panggung dan menghubungi audiens", levels: [
          { label: "Pemula", target: "Tampil 1 lagu di depan 5 orang", description: "Atasi grogi, postur panggung dasar" },
          { label: "Menengah", target: "Set 30 menit", description: "Transisi antar lagu, komunikasi audiens, stage movement" },
          { label: "Mahir", target: "Full set & engagement", description: "Bangun energi, baca audiens, improvisasi di panggung" },
          { label: "Pro", target: "Headliner presence", description: "Command stage, crowd interaction, professional branding" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "mu-bw-1", title: "Main Satu Lagu Lengkap", description: "Main lagu dari intro sampai outro dengan tempo konsisten", order: 1, isEssential: true, stage: "beginner" },
    { id: "mu-bw-2", title: "Selesaikan Buku Metode Level 1", description: "Buku metode atau kurikulum terstruktur tingkat pemula", order: 2, isEssential: true, stage: "beginner" },
    { id: "mu-bw-3", title: "Tampil di Depan Publik Pertama Kali", description: "Open mic, pentas sekolah, atau acara keluarga", order: 3, isEssential: true, stage: "beginner" },
    { id: "mu-bw-4", title: "Ikut Ujian/Examination Musik", description: "ABRSM, Yamaha, atau Music School grade exam resmi", order: 4, isEssential: false, stage: "intermediate" },
    { id: "mu-bw-5", title: "Gabung Band/Ensemble/Grup", description: "Bermain dengan musisi lain secara rutin dan terjadwal", order: 5, isEssential: true, stage: "intermediate" },
    { id: "mu-bw-6", title: "Produksi Rekaman Pertama", description: "Cover atau demo berkualitas studio", order: 6, isEssential: true, stage: "intermediate" },
    { id: "mu-bw-7", title: "Tampil di Event Berbayar", description: "Pertunjukan dengan kompensasi finansial", order: 7, isEssential: true, stage: "advanced" },
    { id: "mu-bw-8", title: "Rilis Karya Orisinil", description: "Single atau EP lagu ciptaan sendiri di platform digital", order: 8, isEssential: true, stage: "advanced" },
    { id: "mu-bw-9", title: "Menang Kompetisi Musik", description: "Juara 1-3 di kompetisi musik lokal atau nasional", order: 9, isEssential: false, stage: "advanced" },
    { id: "mu-bw-10", title: "Tur atau Residensi Reguler", description: "Serangkaian pertunjukan terjadwal secara profesional", order: 10, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: ["Teknik alat musik solid sesuai instrumen pilihan", "Teori musik (harmoni, rhythm, melodi, analisis)", "Ear training dan sight reading", "Music production dasar (recording, editing, mixing)", "Stage presence dan koneksi dengan audiens", "Kolaborasi dengan musisi lain"],
    habits: ["Latihan harian terstruktur dengan target spesifik", "Rekam dan evaluasi permainan sendiri setiap minggu", "Dengar lintas genre untuk referensi musikal", "Ikut jam session minimal 1x seminggu", "Jaga kesehatan (telinga, tangan, vokal, postur)", "Catat ide musik langsung — jangan tunggu 'nanti'"],
    mindset: ["Disiplin — teknik dibangun dari konsistensi latihan, bukan intensitas", "Kreatif — berani bereksperimen di luar zona nyaman", "Rendah hati — musisi hebat selalu terus belajar", "Kolaboratif — musik terbaik lahir dari interaksi", "Adaptif — industri musik berubah cepat, ikuti arus"],
    tools: ["Instrumen berkualitas sesuai standar profesional", "Tuner & metronome (digital atau aplikasi)", "Audio interface + mikrofon untuk rekaman dasar", "DAW (Ableton Live / Logic Pro / Reaper / FL Studio)", "Headphone studio monitor + monitor speaker", "Notasi musik (MuseScore, Sibelius, atau buku not balok)"],
    commonMistakes: ["Latihan tanpa struktur — asal main tanpa target", "Abaikan teori musik karena 'membosankan' — justru yang membedakan level", "Terlalu perfeksionis sampai tidak produktif atau tidak rilis karya", "Membandingkan diri dengan musisi lain secara tidak sehat", "Cuma latihan lagu favorit — tidak explore genre lain", "Abaikan produksi musik — di era digital, musisi harus paham teknologi"],
    successFactors: ["Guru atau mentor yang tepat untuk instrumen dan genre", "Latihan terstruktur dengan target mingguan yang jelas", "Jaringan dan kolaborasi sesama musisi", "Konsistensi jangka panjang — 10.000 jam itu nyata", "Kemampuan adaptasi berbagai genre dan situasi", "Brand pribadi dan portofolio digital (YouTube, Spotify, Instagram)"],
  },
  agePath: [
    { ageRange: "6-12", title: "Eksplorasi & Cinta Musik", description: "Golden age untuk membangun fondasi musikal tanpa tekanan performa. Coba berbagai instrumen.", milestones: ["Coba 2-3 alat musik (piano, gitar, vokal, drum)", "Main lagu anak-anak sederhana", "Ikut paduan suara atau ekstrakurikuler musik", "Les musik mingguan dengan guru"] },
    { ageRange: "13-17", title: "Fundamentals & Disiplin", description: "Teknik dasar dibangun di usia ini. Teori musik & sight reading mulai penting.", milestones: ["Pilih instrumen utama dan tekuni", "Les rutin dengan guru minimal 1x/minggu", "Main 10 lagu lengkap dari berbagai genre", "Belajar baca notasi balok dan/atau tab", "Tampil minimal 2x setahun (sekolah/gereja/komunitas)"] },
    { ageRange: "18-22", title: "Performa, Kreasi & Jaringan", description: "Transisi dari murid ke musisi. Membangun portofolio dan koneksi industri.", milestones: ["Tampil reguler di event kampus/komunitas/kafe", "Produksi rekaman (cover atau original)", "Bergabung dengan band/grup/orkestra", "Eksplorasi genre spesifik dan cari niche", "Mulai eksplorasi produksi musik (DAW)"] },
    { ageRange: "23-30", title: "Jalur Profesional", description: "Karir di industri musik atau industri kreatif terkait.", milestones: ["Penghasilan dari musik (mengajar/performa/produksi)", "Rilis karya orisinal di platform digital", "Bangun personal brand dan portofolio", "Pilih spesialisasi: performa, produksi, pengajaran, atau konten"] },
  ],
  timeline: [
    { period: "0-3 Bulan", title: "First Notes & Bunyi Pertama", description: "Kenali alat musikmu. Bunyi yang baik, postur yang benar, kebiasaan rutin.", keyActions: ["Latihan 15-20 menit setiap hari — konsistensi > durasi", "Hafal chord/kunci dasar atau scale pertama", "Main 1 lagu sederhana dari awal ke akhir", "Setup alat dengan postur dan posisi tangan benar"] },
    { period: "3-12 Bulan", title: "Building Foundation", description: "Teknik mulai terbentuk. Ritme mulai stabil. Repertoar bertambah.", keyActions: ["Latihan 30-45 menit/hari dengan struktur", "Main 10 lagu dengan genre variasi", "Belajar teori dasar (skala mayor/minor, interval, akor)", "Mulai rekam diri sendiri untuk evaluasi"] },
    { period: "1-3 Tahun", title: "Intermediate Musician", description: "Improvisasi mulai mungkin. Genre mulai terbentuk. Komunitas mulai terbangun.", keyActions: ["Main dengan metronome dan backing track", "Coba 3+ genre berbeda", "Tampil di depan publik (open mic, event)", "Mulai produksi musik sederhana (DAW)"] },
    { period: "3-5 Tahun", title: "Advanced & Professional Path", description: "Teknik matang. Mulai menghasilkan dari musik. Personal brand terbentuk.", keyActions: ["Produksi dan rilis karya orisinal", "Session work atau pengajaran", "Kolaborasi dengan musisi lain secara profesional", "Bangun kehadiran digital (YouTube, Spotify, Instagram)"] },
  ],
  realityCheck: {
    hardTruths: ["Penghasilan musisi tidak stabil — terutama di awal. Banyak musisi hebat yang tetap punya side job.", "Bakat hanya 10%. 90% sisanya adalah latihan membosankan — ratusan jam scale dan teknik dasar.", "Industri musik Indonesia kecil dan sulit ditembus tanpa koneksi — jaringan sama penting (atau lebih) dengan skill.", "Era digital membuat distribusi mudah, tapi standar produksi lebih tinggi — setiap karya harus siap didengar global.", "Cedera musisi nyata: tendinitis, carpal tunnel, vocal nodule. Pemanasan benar itu wajib, bukan opsional."],
    silverLinings: ["Era digital memungkinkan musisi independen merilis karya tanpa label — distribusi gratis ke seluruh dunia.", "Musik membuka pintu ke industri kreatif lebih luas — konten, game, film, advertising, all butuh musik.", "Skill musik adalah investasi seumur hidup — semakin tua semakin dalam pengalaman bermusik.", "Indonesia kaya akan warisan musik tradisional — gamelan, angklung, sasando — referensi unik yang tidak dimiliki musisi negara lain."],
    transferableSkills: ["Performa di depan umum — berlaku di public speaking, presentasi, dan pitching.", "Kolaborasi dan dinamika tim — berlaku di manajemen proyek dan organisasi.", "Disiplin latihan jangka panjang — praktik yang berharga di bidang apapun yang butuh mastery.", "Creative problem solving — musik mengajarkan solusi kreatif di bawah tekanan."],
  },
  alternativePaths: [
    { scenario: "Tidak bisa memonetisasi sebagai performer", steps: [
      { transition: "Jadi pengajar musik", role: "Guru Musik", description: "Les privat atau di sekolah musik — stabil dan tetap bermain musik." },
      { transition: "Produksi musik untuk konten & media", role: "Music Producer", description: "Buat beat, jingle, scoring untuk film, podcast, game, atau iklan." },
      { transition: "Sound engineer / audio post-production", role: "Audio Engineer", description: "Mix, master, recording engineer untuk musisi dan studio lain." },
    ]},
    { scenario: "Gagal masuk konservatori atau sekolah musik formal", steps: [
      { transition: "Belajar online + komunitas", role: "Self-Taught Musician", description: "YouTube, Masterclass, dan komunitas lokal bisa menggantikan — atau bahkan melampaui — pendidikan formal." },
      { transition: "Gabung scene musik lokal", role: "Live Musician", description: "Kafe, bar, hotel, dan event lokal selalu cari musisi — ijazah tidak penting, skill dan attitude yang dinilai." },
    ]},
    { scenario: "Instrumen utama dirasa 'salah pilih' atau bosan", steps: [
      { transition: "Switch instrumen — bekal teori tetap berlaku", role: "Multi-Instrumentalis", description: "Pengetahuan musik (teori, harmoni, rhythm) bisa dipindahkan ke instrumen lain." },
      { transition: "Fokus ke produksi daripada performa", role: "Producer/Beatmaker", description: "Tidak perlu jago instrumen — pemahaman teori cukup untuk membuat musik dengan DAW." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tohpati", role: "Gitaris Jazz Fusion Indonesia", lesson: "Mastery bukan tentang menjadi yang terbaik — tentang menjadi yang paling autentik.", story: "Tohpati dikenal dengan gaya bermain yang khas Indonesia — memadukan jazz dengan gamelan dan musik tradisional. Ia tidak mencoba menjadi gitaris jazz ala Amerika, ia menciptakan suara yang hanya bisa dimainkan oleh orang Indonesia. Album-albumnya seperti 'Tribal Dance' dan 'Tohpati Ethno Percussion' adalah bukti bahwa akar budaya justru menjadi kekuatan global.", keyInsight: "Keunikanmu adalah kekuatanmu. Jangan tiru — transformasi. Ciptakan suara yang tidak bisa ditiru orang lain.", actionItem: "Cari satu elemen budaya atau musik tradisional daerahmu yang bisa kamu padukan dengan alat musikmu minggu ini." },
    { person: "Andre Dinuth", role: "Gitaris Session & Pengajar", lesson: "Fondasi yang kuat membuat teknik apapun bisa dimainkan. Tidak ada jalan pintas.", story: "Andre dikenal sebagai gitaris yang teknisnya sangat presisi. Rahasianya: ia menghabiskan ribuan jam latihan skala dan teknik dasar sebelum memainkan lagu kompleks. Ia percaya fundamental yang kuat membuat teknik apapun bisa dimainkan — dan inilah yang membedakan pemain biasa dari pemain hebat.", keyInsight: "Jangan terburu-buru ke lagu favoritmu. Bangun fondasi yang kuat. Skill tingkat lanjut hanyalah variasi dari dasar yang solid.", actionItem: "Luangkan 15 menit SETIAP latihan hanya untuk teknik dasar — scale, chord, atau rhythm — bukan lagu. Buat ini non-negotiable." },
    { person: "Rieka Roeslan", role: "Vokalis & Penulis Lagu — Legenda Musik Indonesia", lesson: "Suara yang unik lebih berharga dari suara yang sempurna.", story: "Rieka Roeslan tidak memiliki suara 'pop sempurna' — suaranya serak, berkarakter, dan tidak bisa ditiru. Ia memelopori genre jazz-pop Indonesia dengan album 'Mata Ketiga' dan lagu-lagu seperti 'Limun' yang hingga kini masih dinikmati. Ia membuktikan bahwa keunikan vokal adalah aset terbesar seorang penyanyi.", keyInsight: "Jangan berusaha terdengar seperti penyanyi lain. Temukan warna suaramu sendiri — itu yang akan membuatmu diingat.", actionItem: "Rekam diri menyanyikan lagu dengan gaya naturalmu sendiri. Jangan tiru gaya aslinya. Dengar kembali dan evaluasi kekuatan unik suaramu." },
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
    careerPossibilities: ["YouTuber", "TikTok Creator", "Instagram Content Creator", "Podcaster", "Brand Consultant", "Digital Strategist", "Creative Director", "Content Strategist"],
    successExamples: ["Raditya Dika — kreator konten pertama Indonesia, multi-platform", "Nessie Judge — YouTuber edukasi 2M+ subscribers", "Jerome Polin — edukator matematika, 8M+ subscribers", "Nadhira Nuraini — content creator gaya hidup halal"],
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
  smallWins: [
    {
      category: "Produksi & Teknis", emoji: "\uD83C\uDFA5", skills: [
        { id: "cc-sw-1", name: "Video Production", description: "Kemampuan produksi video berkualitas", levels: [
          { label: "Pemula", target: "Rekam HP + natural lighting", description: "Smartphone camera, jendela untuk cahaya" },
          { label: "Menengah", target: "Entry setup + editing", description: "Mirrorless/DSLR, ring light, mic eksternal, CapCut/Premiere" },
          { label: "Mahir", target: "Sinematografi & grading", description: "Komposisi, color grading, LUTs, motion graphics sederhana" },
          { label: "Pro", target: "Full studio production", description: "Multi-cam, sound design, studio lighting, crew management" },
        ]},
        { id: "cc-sw-2", name: "Thumbnail & Visual Branding", description: "Desain thumbnail dan identitas visual channel", levels: [
          { label: "Pemula", target: "Thumbnail dasar Canva", description: "Template sederhana, text overlay" },
          { label: "Menengah", target: "Photoshop dasar", description: "Compositing, color theory, facial expression focus" },
          { label: "Mahir", target: "Brand identity", description: "Konsistensi visual channel, style guide" },
          { label: "Pro", target: "Thumbnail conversion optimization", description: "A/B testing thumbnail, CTR optimization" },
        ]},
      ],
    },
    {
      category: "Strategi & Platform", emoji: "\uD83D\uDCC8", skills: [
        { id: "cc-sw-3", name: "Platform-Specific Strategy", description: "Strategi konten per platform (YT, TikTok, IG, LinkedIn)", levels: [
          { label: "Pemula", target: "Pilih 1 platform utama", description: "Pelajari algoritma, format konten, best practices platform" },
          { label: "Menengah", target: "Cross-platform posting", description: "Adaptasi konten untuk 2-3 platform berbeda" },
          { label: "Mahir", target: "Platform mastery", description: "Pahami growth loop, SEO platform, traffic source per platform" },
          { label: "Pro", target: "Multi-platform growth engine", description: "Platform synergy, traffic funnel antar platform" },
        ]},
        { id: "cc-sw-4", name: "Audience Growth & Community", description: "Membangun audiens setia, bukan hanya followers", levels: [
          { label: "Pemula", target: "100 followers organik", description: "Konsisten posting 3x/minggu" },
          { label: "Menengah", target: "1.000 followers + engagement", description: "Balas komentar, bangun komunitas" },
          { label: "Mahir", target: "10.000 followers + loyal audience", description: "Kolaborasi, content series, komunitas aktif (Discord/Telegram)" },
          { label: "Pro", target: "100.000+ engaged followers", description: "Brand deals, superfans, membership" },
        ]},
        { id: "cc-sw-5", name: "Scriptwriting & Storytelling", description: "Menulis naskah konten yang engaging", levels: [
          { label: "Pemula", target: "Outline sederhana", description: "Hook → isi → CTA" },
          { label: "Menengah", target: "Storytelling structure", description: "Conflict, resolution, emotional arc" },
          { label: "Mahir", target: "Retention-focused scripting", description: "Pattern interrupts, cliffhangers, value density" },
          { label: "Pro", target: "Scriptwriting pro", description: "Brand integration natural, viral loops" },
        ]},
      ],
    },
    {
      category: "Monetisasi & Bisnis", emoji: "\uD83D\uDCB0", skills: [
        { id: "cc-sw-6", name: "Revenue Diversification", description: "Multi-stream income sebagai kreator", levels: [
          { label: "Pemula", target: "AdSense / Creator Fund", description: "Monetisasi platform dasar" },
          { label: "Menengah", target: "Brand deal pertama", description: "Endorsement, sponsored content, affiliate marketing" },
          { label: "Mahir", target: "Digital products", description: "Ebook, template, course, preset, presets" },
          { label: "Pro", target: "Full creator business", description: "Membership, merchandise, agency, licensing" },
        ]},
      ],
    },
  ],
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
    successExamples: ["Hermawan Kertajaya — Founder MarkPlus, marketing thought leader", "Dion Haryadi — Founder SIRCLO, e-commerce enabler", "Rhenald Kasali — Guru Besar Pemasaran UI, penulis buku marketing"],
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
  smallWins: [
    {
      category: "Channel Marketing", emoji: "\uD83D\uDCC8", skills: [
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
        { id: "dm-sw-3", name: "Email Marketing", description: "List building, segmentation, automation, deliverability", levels: [
          { label: "Pemula", target: "Buat newsletter sederhana", description: "Pilih platform (Mailchimp/SendGrid), kirim broadcast" },
          { label: "Menengah", target: "Segmentation & automation", description: "Segmentasi list, drip campaign, welcome series" },
          { label: "Mahir", target: "Deliverability & optimization", description: "A/B testing subject line, open rate > 30%" },
          { label: "Pro", target: "Full email strategy", description: "Lead nurturing, lifecycle campaigns, revenue attribution" },
        ]},
      ],
    },
    {
      category: "Optimization & Analytics", emoji: "\uD83D\uDCCA", skills: [
        { id: "dm-sw-4", name: "Conversion Rate Optimization (CRO)", description: "Optimasi landing page, funnel, dan user experience untuk konversi", levels: [
          { label: "Pemula", target: "Kenali funnel marketing", description: "Awareness → Interest → Decision → Action" },
          { label: "Menengah", target: "A/B testing dasar", description: "Buat variasi landing page, ukur signifikansi" },
          { label: "Mahir", target: "User research & heatmaps", description: "Hotjar/Clarity, session recording, user testing" },
          { label: "Pro", target: "Full funnel optimization", description: "Multivariate testing, personalization, behavioral targeting" },
        ]},
        { id: "dm-sw-5", name: "Marketing Analytics", description: "Analisis data marketing untuk pengambilan keputusan", levels: [
          { label: "Pemula", target: "Baca dashboard", description: "Kenali metrics dasar (impressions, clicks, conversions)" },
          { label: "Menengah", target: "Google Analytics & GTM", description: "Setup goals, event tracking, conversion tracking" },
          { label: "Mahir", target: "Data-driven decisions", description: "A/B testing, cohort analysis, customer lifetime value" },
          { label: "Pro", target: "Marketing attribution", description: "Multi-touch attribution, ROAS optimization, incrementality testing" },
        ]},
        { id: "dm-sw-6", name: "Marketing Automation", description: "Automatisasi campaign marketing menggunakan tools", levels: [
          { label: "Pemula", target: "Kenali tools automation", description: "HubSpot, ActiveCampaign, Zapier basics" },
          { label: "Menengah", target: "Workflow automation", description: "Lead scoring, behavioral triggers, multi-channel campaign" },
          { label: "Mahir", target: "CRM integration", description: "Integrasi automation dengan sales CRM, pipeline management" },
          { label: "Pro", target: "Full stack marketing tech", description: "Marketing stack design, API integrations, data synchronization" },
        ]},
      ],
    },
  ],
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
  description: "Jalur menjadi dokter dari persiapan masuk kedokteran, pendidikan pre-klinik, koas, UKMPPD, internship, hingga praktik atau spesialisasi.",
  emoji: "\uD83E\uDDCD",
  color: "from-teal-600 to-emerald-500",
  duration: "5-7 tahun",
  category: "health",
  dream: {
    title: "Dokter Profesional",
    description: "Lulus pendidikan kedokteran, lulus ujian profesi, dan menjadi dokter yang melayani masyarakat — baik sebagai dokter umum, spesialis, peneliti, atau pengambil kebijakan kesehatan.",
    whyMatters: "Menjadi dokter adalah panggilan jiwa untuk membantu sesama. Setiap hari menyelamatkan nyawa, mengurangi penderitaan, dan memberikan harapan bagi pasien dan keluarga.",
    estimatedJourney: "5-7 tahun pendidikan + 1 tahun internship + 4-6 tahun PPDS (jika spesialis).",
    careerPossibilities: ["Dokter Umum Praktik", "Dokter Spesialis", "Dosen/ Akademisi Kedokteran", "Peneliti Medis & Epidemiologi", "Dokter Militer", "Konsultan Kesehatan", "Dokter Industri/Perusahaan", "Kebijakan Kesehatan Publik"],
    successExamples: ["dr. Tirta — dokter influencer edukasi kesehatan", "dr. Gamal Albinsaid — dokter sosial pendiri GESINDO", "Prof. dr. Nila Moeloek — mantan Menteri Kesehatan", "dr. Terawan — mantan Menteri Kesehatan, radiolog"],
  },
  dailyWins: [
    { category: "Pre-Klinik (Belajar)", emoji: "\uD83D\uDCDA", habits: [
      { id: "dc-dw-1", title: "Belajar Sistem (2 jam)", description: "Satu sistem tubuh per hari — baca textbook + catat", icon: "BookOpen" },
      { id: "dc-dw-2", title: "Flashcard Farmakologi", description: "Review 10 obat baru: indikasi, dosis, efek samping", icon: "Zap" },
      { id: "dc-dw-3", title: "Review Jurnal/Artikel", description: "Baca 1 jurnal atau artikel medis terkini", icon: "Target" },
    ]},
    { category: "Koas (Klinik)", emoji: "\uD83C\uDFE5", habits: [
      { id: "dc-dw-4", title: "Ikut Visite/Operan", description: "Ikut visite dan catat kasus menarik setiap hari", icon: "Users" },
      { id: "dc-dw-5", title: "Tulis 1 SOAP Note", description: "Subjective-Objective-Assessment-Plan untuk 1 pasien", icon: "BookOpen" },
      { id: "dc-dw-6", title: "Presentasi Kasus", description: "Presentasi 1 kasus ke residen atau dokter jaga", icon: "Target" },
    ]},
    { category: "Kesehatan Mental & Fisik", emoji: "\uD83D\uDCAA", habits: [
      { id: "dc-dw-7", title: "Makan Tepat Waktu", description: "Jangan skip makan meskipun sibuk — tubuh butuh energi", icon: "Heart" },
      { id: "dc-dw-8", title: "Me Time 30 Menit", description: "Baca non-medis, meditasi, atau ngobrol dengan teman", icon: "Sparkles" },
      { id: "dc-dw-9", title: "Tidur Prioritas (7 jam)", description: "Tidur cukup adalah bagian dari tugas, bukan pilihan", icon: "Moon" },
    ]},
  ],
  smallWins: [
    {
      category: "Ilmu Kedokteran", emoji: "\uD83E\uDDCD", skills: [
        { id: "dc-sw-1", name: "Ilmu Dasar Kedokteran", description: "Anatomi, fisiologi, patologi, biokimia — fondasi segalanya", levels: [
          { label: "Pemula", target: "Kenali anatomi sistem organ", description: "Identifikasi organ utama dan posisinya" },
          { label: "Menengah", target: "Pahami fisiologi & patologi", description: "Mekanisme normal tubuh + kelainan" },
          { label: "Mahir", target: "Integrasi sistem", description: "Hubungkan antar sistem dalam kasus penyakit" },
          { label: "Pro", target: "Aplikasi klinis", description: "Dasar kedokteran otomatis dalam diagnosis" },
        ]},
        { id: "dc-sw-2", name: "Farmakologi & Terapi", description: "Pengetahuan obat, interaksi, dan prescribing", levels: [
          { label: "Pemula", target: "50 obat & indikasi", description: "Nama generik, golongan, indikasi utama" },
          { label: "Menengah", target: "200 obat & dosis", description: "Dosis dewasa, anak, efek samping utama" },
          { label: "Mahir", target: "Interaksi obat", description: "Interaksi obat-obat, kontraindikasi, pemantauan" },
          { label: "Pro", target: "Prescribing rasional", description: "Pilih terapi berdasarkan evidence, cost, patient preference" },
        ]},
        { id: "dc-sw-3", name: "Keterampilan Klinis", description: "Anamnesis, pemeriksaan fisik, diagnosis, tatalaksana", levels: [
          { label: "Pemula", target: "Anamnesis terstruktur", description: "Autoanamnesis, heteroanamnesis, riwayat penyakit" },
          { label: "Menengah", target: "Pemeriksaan fisik", description: "Head-to-toe, pemeriksaan sistem per sistem" },
          { label: "Mahir", target: "Diagnosis banding", description: "3+ diagnosis dari anamnesis & pemeriksaan" },
          { label: "Pro", target: "Manajemen komprehensif", description: "Rencana diagnosis, terapi, edukasi, follow-up" },
        ]},
        { id: "dc-sw-4", name: "Komunikasi & Etika", description: "Komunikasi dengan pasien, keluarga, dan sejawat", levels: [
          { label: "Pemula", target: "Sapa & perkenalan", description: "Perkenalan, informed consent sederhana" },
          { label: "Menengah", target: "Berita buruk", description: "SPIKES protocol untuk menyampaikan diagnosis sulit" },
          { label: "Mahir", target: "Edukasi pasien", description: "Jelaskan penyakit & terapi dengan bahasa awam" },
          { label: "Pro", target: "Mediasi & etik", description: "Tangani konflik, informed refusal, eticolegal issues" },
        ]},
      ],
    },
    {
      category: "Akademik & Penelitian", emoji: "\uD83D\uDCD0", skills: [
        { id: "dc-sw-5", name: "Evidence-Based Medicine", description: "Baca, interpretasi, dan aplikasi bukti ilmiah", levels: [
          { label: "Pemula", target: "Baca jurnal", description: "Pahami struktur artikel penelitian" },
          { label: "Menengah", target: "Kritisi metodologi", description: "Analisis kekuatan & kelemahan studi" },
          { label: "Mahir", target: "Aplikasi ke pasien", description: "Integrasi evidence dengan kondisi klinis" },
          { label: "Pro", target: "Produksi penelitian", description: "Publikasi case report atau penelitian asli" },
        ]},
        { id: "dc-sw-6", name: "Public Health & Epidemiology", description: "Kesehatan populasi, pencegahan, dan kebijakan", levels: [
          { label: "Pemula", target: "Basic epidemiology", description: "Insiden, prevalensi, risk factor" },
          { label: "Menengah", target: "Pencegahan penyakit", description: "Primer, sekunder, tersier" },
          { label: "Mahir", target: "Program kesehatan", description: "Perancangan & evaluasi program" },
          { label: "Pro", target: "Kebijakan kesehatan", description: "Advokasi, policy analysis, sistem kesehatan" },
        ]},
      ],
    },
  ],
  bigWins: [
    { id: "dc-bw-1", title: "Lulus Semester 1 Pre-Klinik", description: "Melewati tahun pertama pendidikan dokter yang paling selektif", order: 1, isEssential: true, stage: "beginner" },
    { id: "dc-bw-2", title: "Selesaikan Semua Blok Pre-Klinik", description: "Anatomi, fisiologi, patologi, farmakologi, dan lainnya", order: 2, isEssential: true, stage: "beginner" },
    { id: "dc-bw-3", title: "Publikasi Pertama (Case Report)", description: "Publikasi ilmiah pertama sebagai penulis", order: 3, isEssential: false, stage: "beginner" },
    { id: "dc-bw-4", title: "Mulai Kepaniteraan (Koas)", description: "Stase klinik di rumah sakit pendidikan", order: 4, isEssential: true, stage: "intermediate" },
    { id: "dc-bw-5", title: "Selesaikan Semua Stase", description: "16-20 stase termasuk jaga malam dan logbook", order: 5, isEssential: true, stage: "intermediate" },
    { id: "dc-bw-6", title: "Lulus UKMPPD", description: "Uji Kompetensi Mahasiswa Program Profesi Dokter", order: 6, isEssential: true, stage: "advanced" },
    { id: "dc-bw-7", title: "Sumpah Dokter & Dapatkan STR", description: "Wisuda, sumpah, dan Surat Tanda Registrasi", order: 7, isEssential: true, stage: "advanced" },
    { id: "dc-bw-8", title: "Selesaikan Internship", description: "Program internship 1 tahun di faskes", order: 8, isEssential: true, stage: "professional" },
    { id: "dc-bw-9", title: "Dapatkan SIP & Mulai Praktik", description: "Surat Izin Praktik — praktik sebagai dokter umum", order: 9, isEssential: false, stage: "professional" },
    { id: "dc-bw-10", title: "Lulus PPDS (Spesialis)", description: "Pendidikan spesialis 4-6 tahun di bidang pilihan", order: 10, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Ilmu dasar kedokteran solid (anatomi, fisiologi, patologi, farmakologi)",
      "Keterampilan klinis (anamnesis, pemeriksaan fisik, diagnosis, tatalaksana)",
      "Komunikasi efektif dengan pasien, keluarga, dan sejawat",
      "Evidence-based medicine — baca, kritis, dan aplikasi penelitian",
      "Empati, etika kedokteran, dan profesionalisme",
      "Manajemen waktu, stres, dan kesehatan mental",
    ],
    habits: [
      "Belajar sedikit setiap hari, bukan kebut semalam — spaced repetition",
      "Review jurnal dan kasus mingguan",
      "Latihan OSCE dan keterampilan klinis rutin",
      "Jaga kesehatan fisik dan mental — dokter yang sakit tidak bisa menyembuhkan",
      "Refleksi diri dan evaluasi performa setiap bulan",
      "Mentoring junior secepatnya — mengajar memperkuat pemahaman",
    ],
    mindset: [
      "Empati — dengarkan pasien dengan hati, bukan hanya telinga",
      "Teliti — detail kecil (riwayat obat, alergi, angka) bisa fatal jika terlewat",
      "Resilien — tekanan psikologis adalah bagian dari profesi, bukan kelemahan",
      "Belajar seumur hidup — ilmu kedokteran selalu berkembang, textbook kadaluarsa dalam 5 tahun",
      "Timwork — dokter tidak bekerja sendiri, perawat, farmasi, dan sejawat adalah mitra",
    ],
    tools: [
      "Buku referensi (Harrison, Schwartz's Principles of Surgery, Nelson)",
      "Aplikasi medis (UpToDate, Medscape, Epocrates)",
      "Alat diagnostik (stetoskop, otoskop, oftalmoskop, reflex hammer)",
      "OSCE kit dan skill lab untuk latihan",
      "Anki / Flashcard app untuk spaced repetition",
      "Mendeley / Zotero untuk manajemen referensi",
    ],
    commonMistakes: [
      "Sistem kebut semalam — belajar hanya saat ujian, tidak retensi jangka panjang",
      "Abaikan kesehatan mental — burnout doktek adalah epidemi diam-diam",
      "Kurang komunikasi dengan pasien — diagnosis benar tapi pasien tidak paham",
      "Terlalu perfeksionis sampai lambat bertindak — 'perfect is enemy of good' di klinis",
      "Tidak belajar dari kesalahan — setiap misdiagnosis adalah pelajaran berharga",
      "Lupa bahwa pasien adalah manusia, bukan 'kasus nomor 17'",
    ],
    successFactors: [
      "Konsistensi belajar: sedikit setiap hari > banyak seminggu sekali",
      "Mentor dan senior yang membimbing — jangan ragu bertanya",
      "Teman seangkatan yang supportif — med school adalah marathon tim",
      "Kesehatan fisik dan mental terjaga — prioritas #1",
      "Spiritualitas dan dukungan keluarga",
      "Keingintahuan (curiosity) — baca di luar kurikulum",
    ],
  },
  agePath: [
    { ageRange: "17-18", title: "Persiapan Masuk Kedokteran", description: "Persaingan paling ketat di pendidikan Indonesia. Persiapan UTBK dan seleksi.", milestones: ["Persiapan UTBK / SNBT intensif 6 bulan", "Relawan di PMI, rumah sakit, atau klinik", "Pastikan nilai biologi, kimia, fisika, dan matematika kuat", "Ikut tryout tiap bulan untuk ukur progres"] },
    { ageRange: "19-22", title: "Pendidikan Pre-Klinik", description: "Tahun-tahun paling berat secara akademis. Ilmu dasar kedokteran.", milestones: ["Lulus semua blok (anatomi, fisiologi, patologi, farmakologi)", "Latihan OSCE dan keterampilan klinis tiap semester", "Ikut organisasi (BEM, UKM penelitian, SCORA)", "Publikasi case report atau penelitian kecil", "Jaga IPK minimal 3.0 untuk peluang spesialis"] },
    { ageRange: "23-24", title: "Koas (Kepaniteraan Klinik)", description: "Tidur 4-5 jam adalah norma. Stase di rumah sakit pendidikan.", milestones: ["Selesaikan 16-20 stase dengan logbook lengkap", "Ikut jaga malam 3-4x per minggu", "Presentasi journal reading di setiap stase", "Lulus ujian stase tiap bagian (ilmu penyakit dalam, bedah, obgyn, anak, dll)"] },
    { ageRange: "25", title: "UKMPPD, Sumpah & STR", description: "Puncak pendidikan dokter. Ujian kompetensi + sumpah + registrasi.", milestones: ["Ikut tryout UKMPPD (CBT & OSCE) tiap bulan", "Lulus UKMPPD — ujian kompetensi dokter", "Wisuda dan pengambilan sumpah dokter", "Urus STR (Surat Tanda Registrasi) di KKI"] },
    { ageRange: "26-27", title: "Internship & SIP", description: "Tahun transisi dari mahasiswa ke dokter mandiri.", milestones: ["Selesaikan internship 1 tahun di Puskesmas / RS", "Kumpulkan pengalaman praktik mandiri dengan supervisi", "Ambil SIP (Surat Izin Praktik)", "Putuskan: praktik umum atau lanjut PPDS"] },
    { ageRange: "27+", title: "Praktik atau Spesialisasi", description: "Dua jalur utama dengan konsekuensi berbeda.", milestones: ["Jika praktik: cari faskes, buka praktik, atau join klinik", "Jika spesialis: ikut ujian masuk PPDS (4-6 tahun)", "Alternatif: S2 kesehatan masyarakat, epidemiologi, atau manajemen RS"] },
  ],
  timeline: [
    { period: "0-6 Bulan", title: "Persiapan Masuk Kedokteran", description: "UTBK, seleksi mandiri, atau jalur prestasi.", keyActions: ["Bimbel intensif 3-6 bulan", "Latihan soal UTBK setiap hari", "Ikut tryout tiap bulan"] },
    { period: "2-4 Tahun", title: "Pre-Klinik", description: "Ilmu dasar kedokteran — anatomi, fisiologi, biokimia, farmakologi, patologi.", keyActions: ["Belajar sistem per sistem (kardio, respirasi, GI, dll)", "Latihan OSCE tiap semester", "Ikut organisasi dan relawan", "Mulai eksplorasi publikasi atau case report"] },
    { period: "1.5-2 Tahun", title: "Koas (Kepaniteraan)", description: "Rotasi di semua bagian Ilmu Kedokteran di RS.", keyActions: ["Ikut jaga malam 3-4x/minggu", "Kumpulkan logbook & portfolio kasus", "Presentasi journal reading mingguan", "Lulus ujian di setiap bagian"] },
    { period: "6-12 Bulan", title: "UKMPPD & Sumpah", description: "Tryout, CBT, OSCE, sumpah, STR.", keyActions: ["Tryout UKMPPD tiap minggu", "Review soal 3-5 tahun terakhir", "Urus administrasi STR dan sumpah"] },
    { period: "1 Tahun", title: "Internship", description: "Praktik mandiri dengan supervisi di faskes.", keyActions: ["Tanganin pasien mandiri dengan supervisi", "Kelola administrasi faskes", "Persiapan PPDS (jika lanjut) atau SIP"] },
  ],
  realityCheck: {
    hardTruths: [
      "Kedokteran bukan tentang 'panggilan jiwa' setiap hari — banyak hari yang berat, melelahkan, dan tidak glamor.",
      "Tidur 4-5 jam per malam selama koas adalah normal — ini menguji batas fisik dan mentalmu.",
      "Gaji dokter umum di Indonesia tidak sebanding dengan biaya pendidikan dan pengorbanan — terutama di awal karir.",
      "Kesalahan medis, meskipun kecil (dosis, alergi, keterlambatan), bisa menghantui mentalmu selama bertahun-tahun.",
      "Persaingan masuk PPDS sangat ketat — IPK, publikasi, dan koneksi semua diperhitungkan.",
    ],
    silverLinings: [
      "Tidak ada profesi yang memberi kepuasan batin sebesar menyembuhkan pasien dan melihat mereka sembuh.",
      "Dokter dihormati di mana saja — secara sosial dan di komunitas.",
      "Ilmu kedokteran adalah bekal seumur hidup — kamu akan jadi 'paling sadar kesehatan' di keluargamu.",
      "Karir dokter fleksibel: klinik, non-klinik, penelitian, kebijakan, edukasi, industri.",
    ],
    transferableSkills: [
      "Komunikasi dan empati — dokter adalah komunikator ulung. Berlaku di konsultasi, coaching, dan leadership.",
      "Pengambilan keputusan di bawah tekanan — berlaku di krisis management, militer, dan emergency response.",
      "Manajemen waktu dan prioritas — berlaku di manajemen proyek dan operasional.",
      "Analisis kritis dan evidence-based thinking — berlaku di penelitian, konsultasi, dan kebijakan.",
    ],
  },
  alternativePaths: [
    { scenario: "Tidak lulus UTBK/SBMPTN kedokteran", steps: [
      { transition: "Coba jalur mandiri atau kedokteran swasta", role: "Mahasiswa Kedokteran Jalur Mandiri", description: "Biaya lebih tinggi, tapi tetap jadi dokter dengan gelar yang sama." },
      { transition: "Ambil S1 Ilmu Kesehatan lain, lalu S2 Kedokteran", role: "Lintas Jalur", description: "Farmasi, keperawatan, atau biologi — lalu lanjut pendidikan dokter." },
      { transition: "Kuliah di luar negeri", role: "Mahasiswa Kedokteran LN", description: "Rusia, China, Malaysia — biaya bervariasi, beberapa lebih murah dari PTS Indonesia." },
    ]},
    { scenario: "Gagal UKMPPD (tidak lulus ujian kompetensi)", steps: [
      { transition: "Ikut tryout intensif 3-6 bulan", role: "Koas Lulusan", description: "Fokus ke OSCE dan soal yang sering gagal." },
      { transition: "Ambil kursus persiapan UKMPPD", role: "Peserta Bimbingan UKMPPD", description: "Banyak lembaga bimbingan khusus UKMPPD." },
    ]},
    { scenario: "Tidak lanjut PPDS (spesialisasi)", steps: [
      { transition: "Praktik sebagai dokter umum", role: "Dokter Umum Praktik", description: "Buka praktik mandiri atau kerja di klinik/faskes." },
      { transition: "Dokter industri atau perusahaan", role: "Company Doctor", description: "Perusahaan besar butuh dokter untuk klinik karyawan." },
      { transition: "Dokter non-klinis / estetika", role: "Non-Klinis", description: "Pelatihan tambahan estetika, S2 kesehatan masyarakat, atau kebijakan kesehatan." },
    ]},
  ],
  masterclassLessons: [
    { person: "dr. Gamal Albinsaid", role: "Founder GESINDO — Dokter Sosial", lesson: "Dokter tidak harus di rumah sakit — solusi kesehatan bisa datang dari mana saja, bahkan dari kardus bekas.", story: "Gamal menciptakan asuransi kesehatan berbasis sampah: masyarakat membayar premi dengan sampah yang didaur ulang. Ide ini lahir dari keprihatinan melihat warga tidak mampu berobat. Ia membuktikan bahwa dokter bisa menjadi inovator sosial.", keyInsight: "Masalah kesehatan masyarakat sering bukan masalah medis, tapi masalah ekonomi dan akses. Dokter yang paham ini bisa menciptakan dampak jauh lebih besar.", actionItem: "Cari satu masalah kesehatan di lingkunganmu yang bukan masalah 'penyakit' — tapi masalah akses, biaya, atau edukasi. Lalu cari solusinya." },
    { person: "Prof. dr. Nila Moeloek", role: "Mantan Menteri Kesehatan RI — Dokter Mata", lesson: "Karir dokter tidak linear — dari operasi mata hingga kebijakan kesehatan nasional.", story: "Nila Moeloek adalah dokter spesialis mata yang kemudian menjadi Menteri Kesehatan. Ia tidak pernah membayangkan akan mengatur sistem kesehatan 250 juta orang. Tapi ia siap karena setiap peran sebelumnya — dosen, dekan, organisasi profesi — membangun perspektif yang diperlukan.", keyInsight: "Jangan tutup diri pada kesempatan di luar 'menjadi dokter'. Leadership, kebijakan, edukasi — semua butuh perspektif medis.", actionItem: "Setiap tahun, ambil satu peran non-klinis (organisasi, penulisan, pengajaran) untuk memperluas dampakmu." },
    { person: "dr. Tirta", role: "Dokter & Content Creator Edukasi Kesehatan", lesson: "Ilmu yang tidak dibagikan adalah ilmu yang hilang. Cara penyampaian sama pentingnya dengan isi.", story: "dr. Tirta menggunakan media sosial untuk edukasi kesehatan dengan cara yang tidak konvensional — bahasa gamblang, humor, kadang keras. Ia dikritik banyak senior, tapi ia menjangkau jutaan anak muda yang tidak pernah tertarik dengan edukasi kesehatan sebelumnya.", keyInsight: "Cara menyampaikan ilmu sama pentingnya dengan ilmu itu sendiri. Jangan takut menggunakan media non-tradisional untuk mencapai audiens yang tidak terjangkau.", actionItem: "Buat satu konten edukasi kesehatan (poster, video pendek, atau artikel) untuk audiens awam bulan ini — gunakan bahasa mereka, bukan bahasa medis." },
  ],
});

r("athlete", {
  slug: "athlete",
  title: "Atlet Profesional — Panduan Umum",
  description: "Framework menjadi atlet profesional dari berbagai cabang olahraga — dari latihan dasar hingga prestasi nasional dan internasional. Pilih cabang spesifik untuk detail skill dan daily wins yang sesuai.",
  emoji: "\uD83C\uDFC5",
  color: "from-red-600 to-rose-500",
  duration: "3-10 tahun",
  category: "sports",
  dream: {
    title: "Atlet Profesional",
    description: "Panduan umum yang berlaku untuk semua cabang olahraga. Roadmap ini berfokus pada jalur pembinaan atlet Indonesia (Pelatda → Pelatnas → medali). Untuk skill dan daily habits yang spesifik, lihat roadmap cabang olahraga yang sesuai.",
    whyMatters: "Olahraga bukan hanya fisik — ia membentuk karakter, disiplin, dan ketahanan mental yang berlaku seumur hidup. Atlet profesional menginspirasi jutaan orang.",
    estimatedJourney: "3-10 tahun tergantung cabang olahraga, bakat, dan konsistensi.",
    careerPossibilities: ["Atlet Nasional", "Atlet Internasional", "Pelatih Profesional", "Manajer Olahraga", "Komentator/Analis Olahraga", "Fisioterapis Olahraga", "Pengusaha Sport"],
    successExamples: [
      "Tontowi Ahmad — atlet bulutangkis, emas Olimpiade 2016",
      "Lalu Muhammad Zohri — sprinter, emas Kejuaraan Dunia U20 2018",
      "Windy Cantika Aisah — atlet angkat besi, medali Olimpiade 2020",
      "Greysia Polii — pebulutangkis, emas Olimpiade 2020",
    ],
  },
  dailyWins: [
    { category: "Pagi — Persiapan", emoji: "\u2600\uFE0F", habits: [
      { id: "at-dw-1", title: "Bangun & Body Check", description: "Cek kondisi tubuh dan energi sebelum latihan", icon: "Sunrise" },
      { id: "at-dw-2", title: "Warm-up Spesifik (15-20 menit)", description: "Pemanasan sesuai cabang olahraga — dinamis, sport-specific", icon: "Zap" },
      { id: "at-dw-3", title: "Sarapan Bernutrisi", description: "Protein + karbohidrat kompleks + hidrasi cukup", icon: "Heart" },
    ]},
    { category: "Latihan Inti", emoji: "\uD83C\uDFCB", habits: [
      { id: "at-dw-4", title: "Sesi Teknik (1.5-2 jam)", description: "Latihan fokus skill spesifik cabang olahraga", icon: "Target" },
      { id: "at-dw-5", title: "Sesi Fisik (45-60 menit)", description: "Strength, conditioning, atau agility sesuai periodisasi", icon: "Flame" },
      { id: "at-dw-6", title: "Recovery Aktif", description: "Stretching, foam roller, ice bath setelah latihan", icon: "Clock" },
    ]},
    { category: "Malam — Evaluasi", emoji: "\uD83C\uDF19", habits: [
      { id: "at-dw-7", title: "Review Teknik (Video)", description: "Analisis video latihan atau pertandingan hari ini", icon: "BookOpen" },
      { id: "at-dw-8", title: "Jurnal & Rencana Besok", description: "Catat progres, nyeri, target sesi berikutnya", icon: "Target" },
      { id: "at-dw-9", title: "Tidur 8-10 Jam", description: "Recovery optimal — ini adalah bagian dari latihan", icon: "Moon" },
    ]},
  ],
  smallWins: [{
    category: "Atletik Umum", emoji: "\uD83C\uDFC5", skills: [
      { id: "at-sw-1", name: "Teknik Olahraga", description: "Skill spesifik cabang — sesuaikan dengan sport pilihanmu", levels: [
        { label: "Pemula", target: "Gerakan dasar benar", description: "Fundamental skill dengan postur dan teknik yang aman" },
        { label: "Menengah", target: "Konsistensi 70%", description: "Eksekusi teknik dapat diandalkan dalam latihan" },
        { label: "Mahir", target: "Konsistensi 85%", description: "Teknik otomatis dalam tekanan kompetisi" },
        { label: "Pro", target: "Presisi level dunia", description: "Efisiensi gerak maksimal, teknik tahan tekanan" },
      ]},
      { id: "at-sw-2", name: "Kondisi Fisik", description: "Kebugaran atletik menyeluruh sesuai cabang", levels: [
        { label: "Pemula", target: "Basic fitness", description: "Push-up, sit-up, lari 2km, flexibility dasar" },
        { label: "Menengah", target: "Sport-specific fitness", description: "Tes fisik sesuai cabang olahraga pilihan" },
        { label: "Mahir", target: "Elite conditioning", description: "Kondisi prima sepanjang sesi latihan dan kompetisi" },
        { label: "Pro", target: "Peak performance periodisasi", description: "Fisik puncak di musim kompetisi, recovery cepat" },
      ]},
      { id: "at-sw-3", name: "Mental Game", description: "Ketahanan mental — skill paling membedakan atlet level tinggi", levels: [
        { label: "Pemula", target: "Kenali tekanan", description: "Sadar akan gejala kecemasan kompetisi" },
        { label: "Menengah", target: "Atasi kecemasan", description: "Teknik pernapasan, visualisasi, dan rutinitas pre-game" },
        { label: "Mahir", target: "Flow state", description: "Performa optimal di tekanan tinggi — 'in the zone'" },
        { label: "Pro", target: "Mental juara", description: "Bangkit setelah kekalahan, konsisten di puncak" },
      ]},
      { id: "at-sw-4", name: "Pencegahan Cedera", description: "Body awareness dan maintenance atletik", levels: [
        { label: "Pemula", target: "Kenali sinyal tubuh", description: "Beda 'nyeri latihan' dan 'nyeri cedera'" },
        { label: "Menengah", target: "Rutinitas maintenance", description: "Stretching, foam rolling, mobility work rutin" },
        { label: "Mahir", target: "Prehab & rehab dasar", description: "Latihan penguatan area rawan cedera" },
        { label: "Pro", target: "Body management komplet", description: "Periodisasi beban, recovery, dan konsultasi medis rutin" },
      ]},
    ],
  }],
  bigWins: [
    { id: "at-bw-1", title: "Gabung Klub/Akademi", description: "Latihan terstruktur di klub atau akademi resmi", order: 1, isEssential: true, stage: "beginner" },
    { id: "at-bw-2", title: "Kompetisi Resmi Pertama", description: "Event kompetitif pertama di cabang olahraga", order: 2, isEssential: true, stage: "beginner" },
    { id: "at-bw-3", title: "Juara Tingkat Kota/Kabupaten", description: "Podium di event level kota", order: 3, isEssential: false, stage: "beginner" },
    { id: "at-bw-4", title: "Masuk Pelatda", description: "Pusat latihan daerah — jalur menuju nasional", order: 4, isEssential: true, stage: "intermediate" },
    { id: "at-bw-5", title: "Juara Tingkat Provinsi", description: "Medali di event provinsi (Porprov, Kejurprov)", order: 5, isEssential: true, stage: "intermediate" },
    { id: "at-bw-6", title: "Masuk Pelatnas", description: "Pusat latihan nasional — atlet level Indonesia", order: 6, isEssential: true, stage: "advanced" },
    { id: "at-bw-7", title: "Medali Nasional (PON/Kejurnas)", description: "Podium di event olahraga nasional", order: 7, isEssential: true, stage: "advanced" },
    { id: "at-bw-8", title: "Medali Internasional", description: "Podium di SEA Games, Asian Games, atau level setara", order: 8, isEssential: false, stage: "professional" },
  ],
  blueprint: {
    skills: [
      "Teknik spesifik cabang olahraga — dalami detailnya",
      "Kebugaran fisik atletik sesuai tuntutan cabang",
      "Strategi dan taktik pertandingan & turnamen",
      "Nutrisi olahraga dan periodisasi hidrasi",
      "Pencegahan cedera dan rehabilitasi dasar",
      "Sport psychology — visualisasi, fokus, flow state",
    ],
    habits: [
      "Latihan 6 hari seminggu dengan periodisasi",
      "Analisis video pertandingan/latihan rutin",
      "Sleep hygiene minimal 8 jam — non-negotiable",
      "Jurnal latihan harian (fisik, mental, nyeri, nutrisi)",
      "Konsultasi rutin dengan pelatih, psikolog, fisio",
    ],
    mindset: [
      "Disiplin — tidak ada hari tanpa latihan (tapi bedakan latihan dan istirahat aktif)",
      "Resilien — kalah adalah guru terbaik, analisis bukan meratapi",
      "Profesional — jaga attitude di luar lapangan, representasi sport",
      "Growth mindset — selalu ada level di atas, terus belajar",
      "Bersyukur — nikmati proses, hargai setiap kesempatan bertanding",
    ],
    tools: [
      "Peralatan olahraga sesuai standar cabang",
      "GPS tracker dan heart rate monitor",
      "Foam roller, massage gun, ice pack, compression",
      "Aplikasi analisis video (Hudl, Coach's Eye, Kinovea)",
      "Sport psychologist dan nutritionist",
    ],
    commonMistakes: [
      "Overtraining — lupa istirahat sama penting dengan latihan",
      "Abaikan teknik dasar, fokus ke hasil instan",
      "Makan sembarangan — nutrisi periodisasi penting",
      "Bandingkan diri dengan atlet lain secara tidak sehat",
      "Tidak punya rencana karir pasca-atlet — pensiun datang cepat",
    ],
    successFactors: [
      "Konsistensi jangka panjang — 10+ tahun, bukan 10 bulan",
      "Pelatih yang tepat secara teknik dan mental",
      "Dukungan keluarga dan lingkungan positif",
      "Manajemen cedera preventif, bukan reaktif",
      "Mental kuat — kemampuan bangkit dari kegagalan",
      "Pendidikan dan skill non-olahraga sebagai jaring pengaman",
    ],
  },
  agePath: [
    { ageRange: "8-12", title: "Discovery & Multi-Sport", description: "Coba berbagai cabang olahraga. Yang penting adalah senang bergerak dan bangun koordinasi dasar.", milestones: ["Coba 3+ olahraga berbeda", "Gabung klub atau ekstrakurikuler", "Bangun koordinasi motorik dasar", "Jangan spesialisasi terlalu dini"] },
    { ageRange: "13-15", title: "Specialization & Foundation", description: "Pilih 1-2 cabang olahraga. Mulai latihan terstruktur dengan pelatih.", milestones: ["Pilih 1-2 cabang olahraga untuk fokus", "Latihan 4-5x seminggu dengan pelatih", "Mulai kompetisi level pelajar", "Jaga nilai akademik — pendidikan tetap prioritas"] },
    { ageRange: "16-18", title: "Competitive Pipeline", description: "Tahun kritis untuk masuk jalur pembinaan atlet nasional.", milestones: ["Masuk pelatda atau pusat latihan daerah", "Target juara tingkat provinsi", "Bangun fisik dan teknik spesifik", "Persiapan pendidikan tinggi (jalur prestasi)"] },
    { ageRange: "19-23", title: "National & International Level", description: "Puncak fisik untuk sebagian besar cabang olahraga.", milestones: ["Masuk pelatnas", "Target medali nasional (PON/Kejurnas)", "SEA Games atau setara", "Mulai bangun karir dan pendidikan pasca-atlet"] },
    { ageRange: "24+", title: "Peak Performance & Transition", description: "Beberapa cabang di puncak hingga 30+. Persiapan transisi karir.", milestones: ["Konsisten di level internasional", "Ambil lisensi pelatih atau sertifikasi", "Bangun portofolio non-atlet", "Siapkan pensiun atlet — sebelum cedera memaksa"] },
  ],
  timeline: [
    { period: "0-6 Bulan", title: "Fundamental Movement", description: "Gerakan dasar yang benar mencegah cedera. Find a coach.", keyActions: ["Latihan 3-4x seminggu", "Fokus ke teknik dasar yang benar", "Tes kebugaran awal sebagai baseline", "Cari pelatih yang tepat"] },
    { period: "6-18 Bulan", title: "Sport-Specific Training", description: "Latihan spesifik cabang olahraga mulai intensif.", keyActions: ["Latihan 5x seminggu", "Kompetisi internal atau klub", "Video analysis teknik rutin", "Mulai periodisasi latihan sederhana"] },
    { period: "1.5-3 Tahun", title: "Competitive Level", description: "Mulai bersaing di level provinsi.", keyActions: ["Latihan 6x seminggu", "Periodisasi latihan terstruktur", "Kompetisi rutin 1-2x/bulan", "Konsultasi sport psychology"] },
    { period: "3-5+ Tahun", title: "Elite Pipeline & National Team", description: "Pelatnas dan target internasional.", keyActions: ["Full-time training di pelatnas/puslat", "Psikolog olahraga dan nutrisi periodisasi", "Target medali nasional", "Persiapan karir ganda (pendidikan/bisnis)"] },
  ],
  realityCheck: {
    hardTruths: [
      "Dari ribuan atlet muda, hanya segelintir yang mencapai level nasional. Dari situ, hanya beberapa yang ke internasional.",
      "Cedera adalah bagian dari profesi — ACL, patah tulang, cedera otot bisa menghancurkan musim atau karir kapan saja.",
      "Kehidupan atlet tidak glamor — latihan 6 jam sehari, jauh dari keluarga, minim kehidupan sosial di luar tim.",
      "Pensiun atlet terjadi di usia 25-35. Kamu harus punya rencana untuk 40+ tahun setelahnya.",
    ],
    silverLinings: [
      "Olahraga membentuk disiplin dan mental baja yang berlaku di bidang apapun — skill yang tidak bisa diajarkan di kelas.",
      "Atlet dapat beasiswa pendidikan — S1 bahkan S2 gratis jika berprestasi di level nasional.",
      "Jaringan pertemanan dan mentor yang kamu dapat di olahraga sering bertahan seumur hidup.",
    ],
    transferableSkills: [
      "Disiplin dan konsistensi — atlet adalah pekerja keras alami di bidang apapun yang mereka tekuni.",
      "Teamwork dan leadership — kapten tim adalah calon pemimpin organisasi.",
      "Goal setting dan periodisasi — kemampuan membagi tujuan besar menjadi target harian yang terukur.",
    ],
  },
  alternativePaths: [
    { scenario: "Tidak masuk pelatnas setelah 3-4 tahun berusaha", steps: [
      { transition: "Tetap kompetisi di level provinsi sambil kuliah", role: "Mahasiswa-Atlet", description: "UKM olahraga di kampus + event provinsi. Banyak atlet nasional justru dari jalur ini." },
      { transition: "Fokus ke pendidikan dan coaching", role: "Pelatih Muda", description: "Ambil lisensi pelatih sambil S1 Ilmu Olahraga — bagikan pengalamanmu." },
    ]},
    { scenario: "Cedera mengakhiri karir atlet", steps: [
      { transition: "Rehabilitasi sambil cari peran baru", role: "Fisioterapis Olahraga", description: "Kuliah fisioterapi — pengalaman atlet adalah nilai jual besar." },
      { transition: "Content creation olahraga", role: "Sports Content Creator", description: "Review pertandingan, tips latihan, atau vlog atlet." },
      { transition: "Manajemen olahraga", role: "Sports Manager", description: "Atlet pensiun paham kebutuhan atlet — jadi manajer yang baik." },
    ]},
  ],
  masterclassLessons: [
    { person: "Tontowi Ahmad", role: "Atlet Bulutangkis — Emas Olimpiade 2016", lesson: "Konsistensi di latihan adalah ibadah. Tidak ada hari tanpa progres.", story: "Tontowi dikenal sebagai pemain yang tidak pernah bolos latihan. Bahkan saat libur lebaran, ia tetap latihan. Bakatnya biasa, tapi disiplinnya luar biasa. Olimpiade 2016 adalah puncak dari 15 tahun konsistensi tanpa kompromi.", keyInsight: "Bakat menentukan awal, tapi konsistensi menentukan akhir. Jadikan latihan sebagai rutinitas yang tidak bisa ditawar.", actionItem: "Buat 'non-negotiable rule': tidak ada hari tanpa latihan minimal 30 menit, bahkan saat libur nasional." },
    { person: "Lalu Muhammad Zohri", role: "Sprinter — Emas Kejuaraan Dunia U20 2018", lesson: "Latarbelakang bukan batasan. Dari Lombok, latihan di lapangan seadanya, ke podium dunia.", story: "Zohri berasal dari Lombok, latihan di lapangan seadanya tanpa fasilitas seperti atlet kota besar. Tapi ia punya mimpi dan kerja keras. Di Kejuaraan Dunia U20, ia menang dan mengharumkan Indonesia. Ia membuktikan bahwa fasilitas bukan segalanya.", keyInsight: "Fasilitas membantu, tapi mental juara lahir dari dalam. Jangan pernah menjadikan 'kondisi' sebagai alasan.", actionItem: "Visualisasikan keberhasilanmu setiap malam sebelum tidur. Zohri visualisasi lari 100m setiap malam — lihat dirimu finis pertama." },
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
    careerPossibilities: ["Makeup Artist (MUA)", "Beauty Influencer", "Skincare Educator", "Product Reviewer", "Brand Ambassador", "Beauty Entrepreneur", "Beauty Writer/Editor", "Brand Founder"],
    successExamples: ["Tasya Farasya — beauty influencer Indonesia 5M+", "Sari Tilaar — founder PT Martina Berto, pioneer skincare Indonesia", "Bubah Alfian — MUA internasional, bridal specialist", "Nadia Soekarno — beauty entrepreneur & founder"],
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
  smallWins: [
    {
      category: "Makeup & Skincare", emoji: "\uD83D\uDC84", skills: [
        { id: "bc-sw-1", name: "Makeup Application", description: "Teknik aplikasi makeup untuk semua skin tone dan occasion", levels: [
          { label: "Pemula", target: "Natural daily makeup", description: "Foundation matching, brows, lip — untuk warna kulit Indonesia" },
          { label: "Menengah", target: "Full glam & color theory", description: "Contour, highlight, color correction, smokey eye" },
          { label: "Mahir", target: "Advanced & editorial", description: "Cut crease, bridal makeup, special effects dasar" },
          { label: "Pro", target: "Professional MUA level", description: "Bridal, editorial, commercial — handle diverse skin tones" },
        ]},
        { id: "bc-sw-2", name: "Skincare Knowledge & Consultation", description: "Pengetahuan perawatan kulit untuk berbagai jenis dan masalah kulit", levels: [
          { label: "Pemula", target: "Basic skincare routine", description: "Cleanser, moisturizer, sunscreen — untuk kulit Indonesia" },
          { label: "Menengah", target: "Ingredient literacy", description: "AHA/BHA, retinol, vitamin C, niacinamide — fungsi dan cara pakai" },
          { label: "Mahir", target: "Skin diagnosis & analysis", description: "Identifikasi jenis kulit (oily, dry, combo, sensitive, acne-prone)" },
          { label: "Pro", target: "Customized routine & consultation", description: "Personalisasi routine untuk berbagai kondisi dan budget" },
        ]},
        { id: "bc-sw-3", name: "Hygiene & Professional Practice", description: "Standar kebersihan dan profesionalisme MUA", levels: [
          { label: "Pemula", target: "Brush hygiene dasar", description: "Cuci brush mingguan, sponge ganti rutin" },
          { label: "Menengah", target: "Product sanitation", description: "Sanitasi produk krim, lipstick, palet — cegah kontaminasi" },
          { label: "Mahir", target: "Client safety protocol", description: "Patch test, disposable tools, cross-contamination prevention" },
          { label: "Pro", target: "Professional hygiene standard", description: "Sterilisasi alat, client consent, SOP kebersihan untuk bridal/editorial" },
        ]},
      ],
    },
    {
      category: "Konten & Bisnis", emoji: "\uD83D\uDCF7", skills: [
        { id: "bc-sw-4", name: "Beauty Content Creation", description: "Konten beauty yang engaging untuk berbagai platform", levels: [
          { label: "Pemula", target: "Foto before-after", description: "Pencahayaan natural, angle konsisten" },
          { label: "Menengah", target: "Video tutorial & review", description: "Step-by-step tutorial, review produk jujur" },
          { label: "Mahir", target: "Edukasi & storytelling", description: "Konten informatif dengan analisis ingredients" },
          { label: "Pro", target: "Brand campaign & collaboration", description: "Professional brand collab, campaign brief, creative direction" },
        ]},
        { id: "bc-sw-5", name: "Beauty Photography & Lighting", description: "Fotografi dan lighting untuk beauty content", levels: [
          { label: "Pemula", target: "Natural light photography", description: "Posisi cahaya jendela, angle kamera HP" },
          { label: "Menengah", target: "Ring light & softbox", description: "Setup lighting dasar untuk foto/video" },
          { label: "Mahir", target: "Product flat lay & swatch", description: "Flat lay, color accurate swatch foto" },
          { label: "Pro", target: "Editorial beauty photography", description: "Creative lighting, color grading, professional portfolio" },
        ]},
        { id: "bc-sw-6", name: "MUA Business Operations", description: "Menjalankan bisnis sebagai MUA atau beauty creator", levels: [
          { label: "Pemula", target: "Pricing & packages", description: "Tentukan rate, buat paket layanan (bridal, event, daily)" },
          { label: "Menengah", target: "Booking & portfolio management", description: "Sistem booking, kontrak klien, portofolio profesional" },
          { label: "Mahir", target: "Client management & branding", description: "Client communication, brand guidelines, sosial media" },
          { label: "Pro", target: "Full beauty business", description: "Team management, tax & legal, scaling business" },
        ]},
      ],
    },
  ],
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
    successExamples: ["Jonathan Wijono — pegolf profesional Indonesia, turnamen internasional", "Firman Mochtar — pegolf senior Indonesia, pelatih nasional", "Tiger Woods — pegolf legendaris dunia, 15 major championships"],
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
