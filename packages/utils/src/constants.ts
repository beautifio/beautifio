export const GOAL_CATEGORIES = [
  { value: "karir", label: "Karir" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "skill", label: "Skill" },
  { value: "bisnis", label: "Bisnis" },
] as const;

export const OPP_CATEGORIES = [
  { value: "beasiswa", label: "Beasiswa" },
  { value: "magang", label: "Magang" },
  { value: "pekerjaan", label: "Pekerjaan" },
  { value: "turnamen", label: "Turnamen" },
  { value: "kompetisi", label: "Kompetisi" },
  { value: "relawan", label: "Relawan" },
  { value: "pendanaan", label: "Pendanaan" },
  { value: "program-kreator", label: "Program Kreator" },
] as const;

export const CIRCLE_STATUS = { active: "Aktif", full: "Penuh", inactive: "Tidak Aktif" } as const;

export const CIRCLE_CATEGORIES = [
  { value: "sports", label: "Olahraga", emoji: "🏃" },
  { value: "music", label: "Musik", emoji: "🎵" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "beauty", label: "Kecantikan", emoji: "💄" },
  { value: "business", label: "Bisnis", emoji: "💼" },
  { value: "creator", label: "Kreator", emoji: "📹" },
  { value: "technology", label: "Teknologi", emoji: "💻" },
  { value: "education", label: "Pendidikan", emoji: "📚" },
  { value: "career", label: "Karir", emoji: "📈" },
] as const;
export const MILESTONE_STATUS_LABEL = { locked: "Terkunci", available: "Tersedia", in_progress: "Sedang Dikerjakan", completed: "Selesai" } as const;

export interface StoryCategoryConstant { id: string; name: string; slug: string; icon: string; label: string; }
export const STORY_CATEGORIES: StoryCategoryConstant[] = [
  { id: "cat-edu", name: "Education", slug: "education", icon: "BookOpen", label: "Edukasi" },
  { id: "cat-career", name: "Career", slug: "career", icon: "Briefcase", label: "Karir" },
  { id: "cat-biz", name: "Business", slug: "business", icon: "TrendingUp", label: "Bisnis" },
  { id: "cat-sports", name: "Sports", slug: "sports", icon: "Dumbbell", label: "Olahraga" },
  { id: "cat-music", name: "Music", slug: "music", icon: "Music", label: "Musik" },
  { id: "cat-gaming", name: "Gaming", slug: "gaming", icon: "Gamepad2", label: "Gaming" },
  { id: "cat-creator", name: "Creator", slug: "creator", icon: "Camera", label: "Kreator" },
  { id: "cat-beauty", name: "Beauty", slug: "beauty", icon: "Sparkles", label: "Kecantikan" },
  { id: "cat-tech", name: "Technology", slug: "technology", icon: "Monitor", label: "Teknologi" },
];

export interface RoadmapTemplateConstant { slug: string; title: string; description: string; icon: string; color: string; label: string; duration: string; category: string; }
export interface DiscoveryQuestionConstant {
  id: string;
  question: string;
  subtitle: string;
  icon: string;
  options: { value: string; label: string; emoji: string }[];
  multi?: boolean;
  max?: number;
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestionConstant[] = [
  {
    id: "inspiration",
    question: "Apa yang menginspirasimu?",
    subtitle: "Pilih satu yang paling mewakili dirimu",
    icon: "Sparkles",
    options: [
      { value: "tech", label: "Teknologi & Inovasi", emoji: "💻" },
      { value: "creative", label: "Seni & Kreativitas", emoji: "🎨" },
      { value: "sports", label: "Olahraga & Kebugaran", emoji: "🏃" },
      { value: "business", label: "Bisnis & Kewirausahaan", emoji: "💼" },
      { value: "education", label: "Pendidikan & Pengetahuan", emoji: "📚" },
      { value: "entertainment", label: "Musik & Hiburan", emoji: "🎵" },
    ],
  },
  {
    id: "aspiration",
    question: "Apa yang ingin kamu capai?",
    subtitle: "Apa versi terbaik dari dirimu di masa depan?",
    icon: "Target",
    options: [
      { value: "expert", label: "Jadi Expert di Bidangku", emoji: "🏆" },
      { value: "entrepreneur", label: "Bangun Bisnis Sendiri", emoji: "🚀" },
      { value: "professional", label: "Berkarir di Perusahaan Top", emoji: "💼" },
      { value: "creator", label: "Jadi Kreator Konten", emoji: "📹" },
      { value: "athlete", label: "Berprestasi di Olahraga", emoji: "🥇" },
    ],
  },
  {
    id: "interests",
    question: "Apa yang paling kamu minati?",
    subtitle: "Pilih maksimal 2",
    icon: "Heart",
    multi: true,
    max: 2,
    options: [
      { value: "programming", label: "Programming & Coding", emoji: "⌨️" },
      { value: "design", label: "Desain & Visual", emoji: "🎨" },
      { value: "writing", label: "Menulis & Konten", emoji: "✍️" },
      { value: "marketing", label: "Marketing & Branding", emoji: "📊" },
      { value: "fitness", label: "Kebugaran & Olahraga", emoji: "💪" },
      { value: "music", label: "Musik & Pertunjukan", emoji: "🎵" },
      { value: "gaming", label: "Gaming & E-sports", emoji: "🎮" },
      { value: "beauty", label: "Kecantikan & Fashion", emoji: "💄" },
    ],
  },
  {
    id: "goals",
    question: "Apa tujuan terbesarmu?",
    subtitle: "Apa yang paling ingin kamu wujudkan?",
    icon: "Star",
    options: [
      { value: "dreamCareer", label: "Membangun Karir Impian", emoji: "💼" },
      { value: "socialImpact", label: "Menciptakan Dampak Sosial", emoji: "🌍" },
      { value: "financialFreedom", label: "Meraih Kebebasan Finansial", emoji: "💰" },
      { value: "skillMastery", label: "Mengembangkan Skill Terbaik", emoji: "📈" },
      { value: "bestSelf", label: "Menjadi Versi Terbaik Diri", emoji: "⭐" },
    ],
  },
];

export const DISCOVERY_GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
  expert: { label: "Menjadi Expert yang Diakui", emoji: "🏆" },
  entrepreneur: { label: "Membangun Bisnis Sendiri", emoji: "🚀" },
  professional: { label: "Berkarir Profesional", emoji: "💼" },
  creator: { label: "Menjadi Kreator Konten", emoji: "📹" },
  athlete: { label: "Berprestasi di Olahraga", emoji: "🥇" },
};

export const INTEREST_TO_ROADMAP: Record<string, string[]> = {
  programming: ["programmer", "digital-marketer"],
  design: ["content-creator", "beauty-creator"],
  writing: ["content-creator", "digital-marketer"],
  marketing: ["digital-marketer", "entrepreneur"],
  fitness: ["runner", "football-player", "golfer"],
  music: ["musician", "content-creator"],
  gaming: ["programmer", "content-creator"],
  beauty: ["beauty-creator", "content-creator"],
};

export const INSPIRATION_TO_ROADMAP: Record<string, string[]> = {
  tech: ["programmer", "digital-marketer"],
  creative: ["content-creator", "musician", "beauty-creator"],
  sports: ["runner", "football-player", "golfer"],
  business: ["entrepreneur", "digital-marketer"],
  education: ["programmer", "digital-marketer"],
  entertainment: ["musician", "content-creator"],
};

export const INSPIRATION_TO_CIRCLES: Record<string, string[]> = {
  tech: ["5", "1"],
  creative: ["2", "6"],
  sports: ["4"],
  business: ["1", "3"],
  education: ["5"],
  entertainment: ["6", "2"],
};

export const INTEREST_TO_CIRCLES: Record<string, string[]> = {
  programming: ["5", "1"],
  design: ["2", "6"],
  writing: ["2", "6"],
  marketing: ["1", "3"],
  fitness: ["4"],
  music: ["2", "6"],
  gaming: ["5"],
  beauty: ["2", "6"],
};

export interface MentorConstant {
  id: string; slug: string; name: string; initials: string; expertise: string;
  bio: string; company?: string; position?: string; yearsExperience: number;
  badges: { type: "education" | "certification" | "experience" | "achievement"; label: string; icon?: string }[];
  circleIds: string[]; storySlugs: string[]; roadmapSlugs: string[];
  isAvailable: boolean; sessionCount: number; menteeCount: number; rating: number;
}

export const MOCK_MENTORS: MentorConstant[] = [
  {
    id: "m1", slug: "pak-rudi", name: "Pak Rudi", initials: "RR",
    expertise: "Tech Entrepreneur, 10+ years",
    bio: "Tech entrepreneur dengan pengalaman 10+ tahun membangun startup teknologi. Pendiri 2 startup yang sukses diakuisisi. Saat ini aktif sebagai mentor dan angel investor.",
    company: "TechStart Indonesia", position: "CEO & Founder", yearsExperience: 12,
    badges: [
      { type: "experience", label: "10+ Tahun Pengalaman", icon: "Briefcase" },
      { type: "achievement", label: "2x Startup Exit", icon: "Trophy" },
      { type: "education", label: "S2 Computer Science, ITB", icon: "GraduationCap" },
      { type: "certification", label: "Certified Mentor, Kemendikbud", icon: "Award" },
    ],
    circleIds: ["1"], storySlugs: ["ide-bisnis-online-modal-kecil"], roadmapSlugs: ["entrepreneur"],
    isAvailable: true, sessionCount: 12, menteeCount: 8, rating: 4.9,
  },
  {
    id: "m2", slug: "bu-sari", name: "Bu Sari", initials: "SS",
    expertise: "Leadership Coach, HR Director",
    bio: "Leadership coach dan HR Director dengan pengalaman 15 tahun di corporate dan pendidikan. Spesialis dalam pengembangan kepemimpinan muda dan perencanaan karir.",
    company: "Human Capital Consulting", position: "Senior HR Director", yearsExperience: 15,
    badges: [
      { type: "experience", label: "15+ Tahun Pengalaman", icon: "Briefcase" },
      { type: "certification", label: "Certified Leadership Coach, ICF", icon: "Award" },
      { type: "achievement", label: "HR Director of the Year 2024", icon: "Trophy" },
    ],
    circleIds: ["3", "11"], storySlugs: [], roadmapSlugs: ["digital-marketer"],
    isAvailable: true, sessionCount: 20, menteeCount: 15, rating: 4.8,
  },
  {
    id: "m3", slug: "pak-anton", name: "Pak Anton", initials: "AA",
    expertise: "Data Scientist, PhD candidate",
    bio: "Data scientist dan peneliti AI dengan pengalaman di FAANG. PhD candidate di bidang Natural Language Processing. Aktif mengajar dan membimbing data scientist baru.",
    company: "TechCorp AI", position: "Lead Data Scientist", yearsExperience: 8,
    badges: [
      { type: "education", label: "PhD Computer Science (candidate)", icon: "GraduationCap" },
      { type: "experience", label: "8+ Tahun di AI/ML", icon: "Briefcase" },
      { type: "achievement", label: "Publikasi 12 Paper Internasional", icon: "Trophy" },
    ],
    circleIds: ["5"], storySlugs: ["pengenalan-ai-untuk-pemula"], roadmapSlugs: ["programmer"],
    isAvailable: true, sessionCount: 8, menteeCount: 6, rating: 4.9,
  },
  {
    id: "m4", slug: "fajar-hidayat", name: "Fajar Hidayat", initials: "FH",
    expertise: "Personal Trainer & Atlet Nasional",
    bio: "Atlet nasional cabang olahraga lari dan fitness. Pelatih pribadi bersertifikasi internasional. Sudah melatih lebih dari 500 klien dari berbagai tingkat kebugaran.",
    position: "Personal Trainer & Atlet", yearsExperience: 10,
    badges: [
      { type: "certification", label: "Certified Personal Trainer, ACE", icon: "Award" },
      { type: "achievement", label: "Medali Emas PON 2024", icon: "Trophy" },
      { type: "experience", label: "10+ Tahun Atlet Profesional", icon: "Briefcase" },
    ],
    circleIds: ["7"], storySlugs: ["panduan-olahraga-pemula-tanpa-cedera"], roadmapSlugs: ["runner", "football-player"],
    isAvailable: true, sessionCount: 30, menteeCount: 20, rating: 4.7,
  },
  {
    id: "m5", slug: "kevin-alexander", name: "Kevin Alexander", initials: "KA",
    expertise: "Produser Musik & Gitaris Profesional",
    bio: "Produser musik dan gitaris profesional dengan pengalaman 12 tahun. Bekerja dengan berbagai artis nasional dan internasional. Founder dari independent music label.",
    company: "Nada Records", position: "Founder & Produser", yearsExperience: 12,
    badges: [
      { type: "achievement", label: "Nominasi AMI Awards 2025", icon: "Trophy" },
      { type: "experience", label: "12+ Tahun Industri Musik", icon: "Briefcase" },
      { type: "education", label: "S1 Musik, ISI Yogyakarta", icon: "GraduationCap" },
    ],
    circleIds: ["8"], storySlugs: ["belajar-gitar-otodidak-30-hari"], roadmapSlugs: ["musician"],
    isAvailable: true, sessionCount: 15, menteeCount: 10, rating: 4.6,
  },
  {
    id: "m6", slug: "pak-budi", name: "Pak Budi", initials: "BB",
    expertise: "HR Director 15+ tahun",
    bio: "HR Director dengan pengalaman 15+ tahun di perusahaan multinasional dan startup. Spesialis dalam talent acquisition, pengembangan karir, dan HR strategy.",
    company: "Global HR Solutions", position: "HR Director", yearsExperience: 16,
    badges: [
      { type: "experience", label: "15+ Tahun HR", icon: "Briefcase" },
      { type: "certification", label: "Certified HR Professional, CHRP", icon: "Award" },
      { type: "achievement", label: "Best HR Leader 2023", icon: "Trophy" },
    ],
    circleIds: ["12"], storySlugs: [], roadmapSlugs: ["digital-marketer", "programmer"],
    isAvailable: true, sessionCount: 10, menteeCount: 7, rating: 4.8,
  },
  {
    id: "m7", slug: "dr-rudi-hartono", name: "Dr. Rudi Hartono", initials: "RH",
    expertise: "Dokter Spesialis Bedah, 15 tahun",
    bio: "Dokter spesialis bedah dengan pengalaman 15 tahun di rumah sakit pusat. Aktif dalam edukasi dan pembinaan calon dokter baru. Praktik di RSUD dan rumah sakit swasta.",
    company: "RS Pusat Nasional", position: "Dokter Spesialis Bedah", yearsExperience: 15,
    badges: [
      { type: "education", label: "Spesialis Bedah, FK UI", icon: "GraduationCap" },
      { type: "experience", label: "15+ Tahun Praktik", icon: "Briefcase" },
      { type: "certification", label: "Fellowship Bedah Minimal Invasif", icon: "Award" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["doctor"],
    isAvailable: true, sessionCount: 5, menteeCount: 3, rating: 5.0,
  },
  {
    id: "m8", slug: "bambang-pamungkas", name: "Bambang Pamungkas", initials: "BP",
    expertise: "Eks Pemain Timnas & Manajer",
    bio: "Legenda sepak bola Indonesia dengan caps 85+ di tim nasional. Setelah pensiun, aktif sebagai manajer klub dan pembina atlet muda.",
    company: "Persija Junior Academy", position: "Manajer Tim & Pembina", yearsExperience: 20,
    badges: [
      { type: "achievement", label: "85+ Caps Timnas", icon: "Trophy" },
      { type: "experience", label: "20+ Tahun Sepak Bola", icon: "Briefcase" },
      { type: "certification", label: "Lisensi Kepelatihan AFC A", icon: "Award" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["football-player"],
    isAvailable: false, sessionCount: 8, menteeCount: 12, rating: 4.7,
  },
  {
    id: "m9", slug: "agus-prayogo", name: "Agus Prayogo", initials: "AP",
    expertise: "Pelari Maraton Nasional",
    bio: "Pelari maraton nasional dengan pengalaman internasional. Peraih medali emas SEA Games 2023. Pelatih lari bersertifikasi dan founder komunitas lari nasional.",
    company: "Lari Indonesia Community", position: "Founder & Head Coach", yearsExperience: 8,
    badges: [
      { type: "achievement", label: "Medali Emas SEA Games 2023", icon: "Trophy" },
      { type: "experience", label: "8+ Tahun Atlet Profesional", icon: "Briefcase" },
      { type: "certification", label: "Certified Running Coach, UESCA", icon: "Award" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["runner"],
    isAvailable: true, sessionCount: 25, menteeCount: 18, rating: 4.8,
  },
  {
    id: "m10", slug: "rory-mulyadi", name: "Rory Mulyadi", initials: "RM",
    expertise: "Instruktur Golf Profesional",
    bio: "Instruktur golf profesional bersertifikasi internasional. Bergabung dengan PGA dan aktif mengajar di berbagai padang golf nasional.",
    company: "PGA Indonesia", position: "Instruktur Golf Senior", yearsExperience: 10,
    badges: [
      { type: "certification", label: "PGA Certified Instructor", icon: "Award" },
      { type: "achievement", label: "Juara Golf Amatir Nasional 2019", icon: "Trophy" },
      { type: "experience", label: "10+ Tahun Golf Profesional", icon: "Briefcase" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["golfer"],
    isAvailable: true, sessionCount: 15, menteeCount: 8, rating: 4.9,
  },
  {
    id: "m11", slug: "tohpati", name: "Tohpati", initials: "TP",
    expertise: "Gitaris & Produser Musik",
    bio: "Gitaris dan produser musik profesional dengan pengalaman 20+ tahun. Telah memproduksi album untuk berbagai artis nasional dan internasional.",
    company: "Tohpati Production", position: "Produser & Arranger", yearsExperience: 22,
    badges: [
      { type: "achievement", label: "AMI Awards Winner", icon: "Trophy" },
      { type: "experience", label: "22+ Tahun Musik", icon: "Briefcase" },
      { type: "education", label: "S1 Musik, Universitas Pelita Harapan", icon: "GraduationCap" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["musician"],
    isAvailable: false, sessionCount: 5, menteeCount: 4, rating: 5.0,
  },
  {
    id: "m12", slug: "ria-sw", name: "Ria SW", initials: "RS",
    expertise: "Content Creator 500K+ Followers",
    bio: "Content creator dengan 500K+ followers di TikTok dan 200K+ di YouTube. Spesialis konten edukatif dan lifestyle. Berpengalaman dalam strategi konten viral.",
    position: "Full-time Creator", yearsExperience: 5,
    badges: [
      { type: "achievement", label: "500K+ TikTok Followers", icon: "Trophy" },
      { type: "experience", label: "5+ Tahun Content Creation", icon: "Briefcase" },
      { type: "certification", label: "Google Digital Marketing Certificate", icon: "Award" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["content-creator"],
    isAvailable: true, sessionCount: 10, menteeCount: 6, rating: 4.6,
  },
  {
    id: "m13", slug: "william-tanuwijaya", name: "William Tanuwijaya", initials: "WT",
    expertise: "Founder Tokopedia",
    bio: "Founder Tokopedia dengan pengalaman membangun unicorn teknologi. Aktif sebagai angel investor dan mentor di berbagai program akselerator startup.",
    company: "Tokopedia", position: "Founder & Advisor", yearsExperience: 15,
    badges: [
      { type: "achievement", label: "Founder Unicorn Pertama RI", icon: "Trophy" },
      { type: "experience", label: "15+ Tahun Startup", icon: "Briefcase" },
      { type: "education", label: "S1 Teknik Informatika, Binus", icon: "GraduationCap" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["entrepreneur"],
    isAvailable: false, sessionCount: 3, menteeCount: 5, rating: 5.0,
  },
  {
    id: "m14", slug: "dina-maulana", name: "Dina Maulana", initials: "DM",
    expertise: "Digital Marketing Lead",
    bio: "Digital marketing lead di e-commerce terkemuka. Berpengalaman dalam strategi pemasaran digital, growth marketing, dan brand building.",
    company: "ShopEase Indonesia", position: "Digital Marketing Lead", yearsExperience: 8,
    badges: [
      { type: "certification", label: "Google Ads Certified", icon: "Award" },
      { type: "certification", label: "Meta Certified Digital Marketing", icon: "Award" },
      { type: "experience", label: "8+ Tahun Digital Marketing", icon: "Briefcase" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["digital-marketer"],
    isAvailable: true, sessionCount: 7, menteeCount: 5, rating: 4.7,
  },
  {
    id: "m15", slug: "tasya-farasya", name: "Tasya Farasya", initials: "TF",
    expertise: "Beauty Influencer & Founder",
    bio: "Beauty influencer dengan jutaan followers. Founder brand kecantikan lokal yang berkembang pesat. Berpengalaman dalam beauty content dan product development.",
    company: "Farasya Beauty", position: "Founder & Creative Director", yearsExperience: 7,
    badges: [
      { type: "achievement", label: "Beauty Influencer of the Year 2024", icon: "Trophy" },
      { type: "experience", label: "7+ Tahun Beauty Industry", icon: "Briefcase" },
      { type: "achievement", label: "Brand Kecantikan Lokal Terlaris", icon: "Trophy" },
    ],
    circleIds: [], storySlugs: [], roadmapSlugs: ["beauty-creator"],
    isAvailable: true, sessionCount: 6, menteeCount: 4, rating: 4.8,
  },
];

type OppC = "beasiswa" | "magang" | "pekerjaan" | "turnamen" | "kompetisi" | "relawan" | "pendanaan" | "program-kreator";

export interface OpportunityConstant {
  id: string; slug: string; title: string; category: OppC;
  organization: string; description: string; location?: string;
  deadline: string; benefit?: string; eligibility?: string;
  url?: string; isFeatured: boolean; tags?: string[];
}

export const MOCK_OPPORTUNITIES: OpportunityConstant[] = [
  // --- BEASISWA ---
  { id: "o1", slug: "beasiswa-prestasi-nusantara", title: "Beasiswa Prestasi Nusantara 2026", category: "beasiswa", organization: "Yayasan Nusantara Cerdas", description: "Beasiswa penuh untuk mahasiswa S1 berprestasi di seluruh Indonesia. Mencakup biaya kuliah, biaya hidup, dan laptop.", location: "Seluruh Indonesia", deadline: "15 Agu 2026", benefit: "Biaya kuliah penuh + biaya hidup Rp1.5jt/bln + laptop", eligibility: "IPK min 3.5, usia max 22, aktif organisasi", isFeatured: true, tags: ["S1", "Full", "Aktif Organisasi"] },
  { id: "o2", slug: "beasiswa-afirmasi-pendidikan", title: "Beasiswa Afirmasi Pendidikan Tinggi", category: "beasiswa", organization: "Kemendikbudristek", description: "Program afirmasi bagi siswa dari daerah tertinggal untuk melanjutkan studi ke perguruan tinggi negeri ternama.", location: "34 Provinsi", deadline: "30 Jul 2026", benefit: "SPP gratis + biaya hidup + asrama", eligibility: "Siswa SMA/sederajat dari daerah 3T", isFeatured: false, tags: ["SMA", "3T", "PTN"] },
  { id: "o3", slug: "beasiswa-luar-negeri-s2", title: "LPDP Beasiswa S2 Luar Negeri", category: "beasiswa", organization: "LPDP Kemenkeu", description: "Beasiswa S2 di universitas top dunia untuk bidang STEM, sosial, dan seni.", location: "Universitas mitra di 30+ negara", deadline: "30 Sep 2026", benefit: "Biaya pendidikan penuh + living allowance + tiket pp", eligibility: "IPK min 3.0, TOEFL 80+/IELTS 6.5, max 35 tahun", isFeatured: true, tags: ["S2", "Luar Negeri", "STEM"] },
  { id: "o4", slug: "beasiswa-santri-berprestasi", title: "Beasiswa Santri Berprestasi 2026", category: "beasiswa", organization: "Kementerian Agama", description: "Program beasiswa untuk santri berprestasi yang ingin melanjutkan ke PTN/PTS.", location: "Perguruan tinggi mitra", deadline: "20 Agu 2026", benefit: "UKT gratis + biaya hidup", eligibility: "Santri aktif pesantren, min hafalan 5 juz", isFeatured: false, tags: ["Santri", "Pesantren", "PTN"] },
  { id: "o5", slug: "beasiswa-data-science", title: "Beasiswa Data Science & AI", category: "beasiswa", organization: "TechStart Foundation", description: "Program beasiswa bootcamp data science dan AI untuk 100 perempuan Indonesia.", location: "Online", deadline: "10 Jul 2026", benefit: "Bootcamp gratis + sertifikasi + placement", eligibility: "Perempuan 18-28, min D3/sederajat", isFeatured: false, tags: ["Perempuan", "Data", "Bootcamp"] },

  // --- MAGANG ---
  { id: "o6", slug: "magang-frontend-techstart", title: "Program Magang Frontend Engineer", category: "magang", organization: "TechStart Indonesia", description: "Magang 6 bulan sebagai Frontend Engineer. Bekerja dengan tim produk mengembangkan dashboard dan landing page menggunakan React/Next.js.", location: "Jakarta (Hybrid)", deadline: "15 Jul 2026", benefit: "Rp3-5jt/bln + BPJS + Sertifikat", eligibility: "Mahasiswa aktif S1/D4 min semester 5, familiar React", isFeatured: true, tags: ["Frontend", "React", "Hybrid"] },
  { id: "o7", slug: "magang-ui-ux-design", title: "Magang UI/UX Designer", category: "magang", organization: "DesignLab Studio", description: "Bergabung dengan tim design untuk mengerjakan proyek desain produk digital untuk klien startup dan enterprise.", location: "Bandung (On-site)", deadline: "20 Jul 2026", benefit: "Rp2-4jt/bln + makan siang + transport", eligibility: "Mahasiswa D3/S1 Design, portofolio Figma", isFeatured: false, tags: ["Design", "Figma", "On-site"] },
  { id: "o8", slug: "magang-social-media", title: "Magang Social Media Specialist", category: "magang", organization: "Kreator Agency", description: "Mengelola akun media sosial klien, membuat konten, menganalisis engagement, dan menyusun strategi konten.", location: "Remote", deadline: "5 Jul 2026", benefit: "Rp1.5-3jt/bln + komisi", eligibility: "Mahasiswa aktif, pengalaman manage akun sosial media", isFeatured: false, tags: ["Remote", "Socmed", "Content"] },
  { id: "o9", slug: "magang-data-analyst", title: "Magang Data Analyst", category: "magang", organization: "Bank Digital Nusantara", description: "Membantu tim data dalam menganalisis data transaksi, membuat report bulanan, dan dashboard visualisasi.", location: "Jakarta (On-site)", deadline: "25 Jul 2026", benefit: "Rp4-6jt/bln + BPJS + THR proporsional", eligibility: "Mahasiswa S1 Statistika/Informatika, menguasai SQL & Python", isFeatured: true, tags: ["Data", "SQL", "Finance"] },

  // --- PEKERJAAN ---
  { id: "o10", slug: "lowongan-frontend-senior", title: "Frontend Developer Senior", category: "pekerjaan", organization: "Unicorn Digital", description: "Mengembangkan dan memelihara platform SaaS dengan Next.js, TypeScript, dan Tailwind. Memimpin tim frontend 3-5 orang.", location: "Jakarta", deadline: "30 Jul 2026", benefit: "Rp15-25jt/bln + ESOP", eligibility: "Min 3 tahun pengalaman frontend, Next.js, TypeScript", isFeatured: true, tags: ["Senior", "SaaS", "Leadership"] },
  { id: "o11", slug: "lowongan-product-manager", title: "Product Manager", category: "pekerjaan", organization: "EdTech Startup", description: "Memimpin roadmap produk, bekerja sama dengan engineering, design, dan bisnis untuk membangun produk edukasi.", location: "Jakarta (Hybrid)", deadline: "20 Jul 2026", benefit: "Rp12-18jt/bln + bonus", eligibility: "Min 2 tahun PM, pengalaman edtech/saas", isFeatured: false, tags: ["PM", "EdTech", "Mid"] },
  { id: "o12", slug: "lowongan-graphic-designer", title: "Graphic Designer", category: "pekerjaan", organization: "Creative House", description: "Membuat desain visual untuk brand, marketing material, dan konten sosial media.", location: "Yogyakarta", deadline: "10 Jul 2026", benefit: "Rp5-8jt/bln + freelance opportunity", eligibility: "Portofolio kuat, menguasai Adobe Suite", isFeatured: false, tags: ["Design", "Creative", "Yogya"] },
  { id: "o13", slug: "lowongan-backend-go", title: "Backend Developer (Go)", category: "pekerjaan", organization: "Fintech Unicorn", description: "Membangun microservices dengan Go, Kafka, dan PostgreSQL untuk platform pembayaran.", location: "Jakarta", deadline: "15 Agu 2026", benefit: "Rp18-30jt/bln + BPJS + Asuransi", eligibility: "Min 2 tahun Go, pengalaman microservices, SQL", isFeatured: true, tags: ["Backend", "Go", "Fintech"] },

  // --- TURNAMEN ---
  { id: "o14", slug: "turnamen-futsal-antar-kampus", title: "Futsal Cup Antar Kampus 2026", category: "turnamen", organization: "Kemenpora & BEM Se-Indonesia", description: "Turnamen futsal antar universitas se-Jabodetabek dengan total hadiah ratusan juta dan scouting atlet.", location: "GOR Jakarta", deadline: "1 Agu 2026", benefit: "Hadiah total Rp150jt + peralatan olahraga", eligibility: "Tim futsal resmi universitas, max 12 pemain", isFeatured: true, tags: ["Olahraga", "Tim", "Universitas"] },
  { id: "o15", slug: "turnamen-coding-hackathon", title: "Hackathon Inovasi Digital 2026", category: "turnamen", organization: "Kemkominfo", description: "Hackathon 48 jam mengembangkan solusi digital untuk masalah sosial. Final offline di Jakarta.", location: "Jakarta (Final)", deadline: "25 Jul 2026", benefit: "Rp75jt hadiah + inkubasi 3 bulan", eligibility: "Tim 3-5 orang, mahasiswa/profesional max 30 tahun", isFeatured: false, tags: ["Tech", "Hackathon", "Sosial"] },
  { id: "o16", slug: "turnamen-badminton", title: "Kejuaraan Badminton Nasional", category: "turnamen", organization: "PBSI", description: "Kejuaraan nasional badminton kategori usia 18-25 tahun sebagai ajang pencarian bibit atlet nasional.", location: "Istora Senayan", deadline: "15 Agu 2026", benefit: "Hadiah Rp50jt + pelatnas", eligibility: "Usia 18-25, memiliki NIK PBSI", isFeatured: false, tags: ["Olahraga", "Individu", "Nasional"] },

  // --- KOMPETISI ---
  { id: "o17", slug: "kompetisi-business-plan", title: "National Business Plan Competition", category: "kompetisi", organization: "Universitas Indonesia", description: "Kompetisi rencana bisnis tingkat nasional untuk mahasiswa. Presentasikan ide startup di depan investor dan mentor.", location: "Depok (Final)", deadline: "10 Agu 2026", benefit: "Rp50jt + pendanaan seed + mentoring", eligibility: "Tim 2-4 mahasiswa aktif D3/S1", isFeatured: true, tags: ["Bisnis", "Startup", "Mahasiswa"] },
  { id: "o18", slug: "kompetisi-debat-bahasa-inggris", title: "Debat Bahasa Inggris Nasional", category: "kompetisi", organization: "Kemendikbudristek", description: "Kompetisi debat bahasa Inggris antar mahasiswa se-Indonesia. Babak penyisihan online, final offline.", location: "Online & Jakarta", deadline: "5 Jul 2026", benefit: "Trofi + sertifikat + beasiswa kursus IELTS", eligibility: "Mahasiswa aktif D3/S1, skor TOEFL min 500", isFeatured: false, tags: ["Debat", "English", "Nasional"] },
  { id: "o19", slug: "kompetisi-fotografi-nusantara", title: "Fotografi Nusantara 2026", category: "kompetisi", organization: "Galeri Nasional", description: "Kompetisi fotografi dengan tema 'Keindahan Indonesia'. Pameran finalis di Galeri Nasional.", location: "Seluruh Indonesia", deadline: "20 Sep 2026", benefit: "Rp25jt + pameran + kamera profesional", eligibility: "Umum, max 5 foto per peserta", isFeatured: false, tags: ["Fotografi", "Seni", "Budaya"] },

  // --- RELAWAN ---
  { id: "o20", slug: "relawan-mengajar-3t", title: "Program Mengajar ke Daerah 3T", category: "relawan", organization: "Indonesia Mengajar", description: "Program relawan mengajar selama 1 semester di daerah tertinggal, terdepan, dan terluar Indonesia.", location: "Papua, NTT, Maluku", deadline: "15 Agu 2026", benefit: "Biaya hidup + asuransi + sertifikat", eligibility: "Min D3, 21-35 tahun, sehat jasmani/rohani", isFeatured: true, tags: ["Pendidikan", "3T", "Sosial"] },
  { id: "o21", slug: "relawan-bencana-alam", title: "Relawan Tanggap Bencana", category: "relawan", organization: "BPBD & PMI", description: "Pelatihan dan penugasan relawan untuk respon bencana alam di berbagai wilayah Indonesia.", location: "Zona bencana nasional", deadline: "1 Jul 2026", benefit: "Pelatihan gratis + sertifikat + asuransi", eligibility: "18-40 tahun, fisik prima, siap mobile", isFeatured: false, tags: ["Bencana", "Kemanusiaan", "Lapangan"] },
  { id: "o22", slug: "relawan-konservasi-laut", title: "Relawan Konservasi Laut", category: "relawan", organization: "WWF Indonesia", description: "Program konservasi laut di Wakatobi. Bersih-bersih pantai, transplantasi terumbu karang, edukasi nelayan.", location: "Wakatobi, Sulawesi Tenggara", deadline: "20 Jul 2026", benefit: "Akomodasi + makan + diving certification", eligibility: "18-30 tahun, bisa berenang, cinta lingkungan", isFeatured: false, tags: ["Lingkungan", "Laut", "Konservasi"] },

  // --- PENDANAAN ---
  { id: "o23", slug: "pendanaan-startup-awal", title: "Hibah Pendanaan Startup Tahap Awal", category: "pendanaan", organization: "Baparekraf", description: "Program pendanaan hibah untuk startup tahap awal (pre-seed) di bidang ekonomi kreatif.", location: "Seluruh Indonesia", deadline: "30 Agu 2026", benefit: "Hibah max Rp200jt", eligibility: "Startup max 2 tahun, minimal MVP, tim min 2 orang", isFeatured: true, tags: ["Pre-seed", "Kreatif", "Hibah"] },
  { id: "o24", slug: "pendanaan-beasiswa-riset", title: "Pendanaan Riset Mahasiswa", category: "pendanaan", organization: "Kemendikbudristek", description: "Program pendanaan riset untuk mahasiswa S1/S2 dengan proposal penelitian inovatif.", location: "Perguruan tinggi di Indonesia", deadline: "15 Jul 2026", benefit: "Rp10-25jt per proposal", eligibility: "Mahasiswa aktif S1/S2, memiliki dosen pembimbing", isFeatured: false, tags: ["Riset", "Mahasiswa", "Akademik"] },
  { id: "o25", slug: "pendanaan-bisnis-sosial", title: "Social Enterprise Grant 2026", category: "pendanaan", organization: "Yayasan Peduli Negeri", description: "Hibah untuk bisnis sosial yang berdampak pada pendidikan, lingkungan, atau pemberdayaan masyarakat.", location: "Seluruh Indonesia", deadline: "10 Sep 2026", benefit: "Hibah Rp50-150jt + mentoring", eligibility: "Bisnis sosial berjalan min 6 bulan", isFeatured: false, tags: ["Sosial", "Dampak", "Hibah"] },

  // --- PROGRAM KREATOR ---
  { id: "o26", slug: "program-kreator-youtube", title: "YouTube Creator Accelerator", category: "program-kreator", organization: "YouTube Indonesia", description: "Program akselerasi untuk konten kreator YouTube dengan potensi tinggi. Dapatkan akses equipment, workshop, dan pendanaan.", location: "Online & Jakarta", deadline: "20 Jul 2026", benefit: "Equipment grant Rp30jt + workshop eksklusif", eligibility: "Min 10K subscribers, konten orisinal, aktif 6 bulan", isFeatured: true, tags: ["YouTube", "Video", "Monetisasi"] },
  { id: "o27", slug: "program-kreator-tiktok", title: "TikTok Creator Fund Program", category: "program-kreator", organization: "TikTok Indonesia", description: "Program pendanaan dan dukungan kreator TikTok untuk mengembangkan konten edukatif dan inspiratif.", location: "Online", deadline: "5 Agu 2026", benefit: "Dana kreator Rp5-20jt/bln + official badge", eligibility: "Min 50K followers, konten edukatif/inspiratif, orisinal", isFeatured: false, tags: ["TikTok", "Konten", "Edukasi"] },
  { id: "o28", slug: "program-kreator-podcast", title: "Podcast Incubator 2026", category: "program-kreator", organization: "Noice & Kemkominfo", description: "Program inkubasi podcast untuk kreator baru. Fasilitas studio, distribusi, dan monetisasi.", location: "Jakarta, Bandung, Yogyakarta", deadline: "15 Agu 2026", benefit: "Studio gratis 3 bulan + distribusi ke 5 platform", eligibility: "Pemula, komitmen 1 episode/minggu, punya konsep", isFeatured: false, tags: ["Podcast", "Audio", "Incubator"] },
  { id: "o29", slug: "program-kreator-writing", title: "Program Kreator Konten Tulisan", category: "program-kreator", organization: "Medium Indonesia & IDN Times", description: "Program bagi penulis dan jurnalis muda untuk mengembangkan konten tulisan berkualitas dengan platform nasional.", location: "Remote", deadline: "30 Jul 2026", benefit: "Revenue share 80% + editorial support", eligibility: "Portofolio 3 artikel, menguasai SEO dasar", isFeatured: false, tags: ["Menulis", "Jurnalistik", "SEO"] },
  { id: "o30", slug: "program-kreator-gaming", title: "Gaming Creator Partnership", category: "program-kreator", organization: "GameDev ID & Moonton", description: "Program partnership untuk kreator game mobile dan PC. Dapatkan early access, skin eksklusif, dan revenue share.", location: "Online", deadline: "10 Agu 2026", benefit: "Revenue share + item eksklusif + akses turnamen", eligibility: "Min 5K followers di platform streaming", isFeatured: false, tags: ["Gaming", "Streaming", "Partnership"] },
];

export interface ProductConstant {
  id: string; name: string; description: string; price: string;
  image?: string; category: string; tags: string[];
}

export const MOCK_PRODUCTS: ProductConstant[] = [
  { id: "p1", name: "Running Shoes", description: "Sepatu lari dengan bantalan responsif untuk performa maksimal.", price: "Rp850.000", category: "sports", tags: ["olahraga", "lari"] },
  { id: "p2", name: "Smartwatch", description: "Jam tangan pintar dengan GPS, heart rate monitor, dan pelacak kebugaran.", price: "Rp2.500.000", category: "tech", tags: ["teknologi", "kebugaran"] },
  { id: "p3", name: "Running Jersey", description: "Jersey olahraga berbahan dry-fit untuk kenyamanan saat berlari.", price: "Rp250.000", category: "sports", tags: ["olahraga", "lari"] },
  { id: "p4", name: "Microphone", description: "Mikrofon kondensor USB untuk podcast dan content creation.", price: "Rp1.200.000", category: "creator", tags: ["kreator", "audio"] },
  { id: "p5", name: "Ring Light", description: "Cahaya cincin LED dengan tripod untuk pencahayaan konten.", price: "Rp350.000", category: "creator", tags: ["kreator", "cahaya"] },
  { id: "p6", name: "Camera", description: "Kamera mirrorless untuk fotografi dan videografi berkualitas tinggi.", price: "Rp8.500.000", category: "creator", tags: ["kreator", "fotografi"] },
  { id: "p7", name: "Sunscreen SPF 50", description: "Tabir surya dengan SPF 50 untuk perlindungan maksimal dari sinar UV.", price: "Rp85.000", category: "beauty", tags: ["kecantikan", "skincare"] },
  { id: "p8", name: "Skincare Set", description: "Paket perawatan kulit lengkap: cleanser, toner, serum, dan moisturizer.", price: "Rp450.000", category: "beauty", tags: ["kecantikan", "skincare"] },
  { id: "p9", name: "Makeup Kit", description: "Set makeup lengkap untuk sehari-hari: foundation, blush, eyeshadow, lipstick.", price: "Rp380.000", category: "beauty", tags: ["kecantikan", "makeup"] },
  { id: "p10", name: "Skill Academy Subscription", description: "Platform kursus online dengan ribuan materi dan sertifikat resmi.", price: "Rp299.000/bln", category: "education", tags: ["edukasi", "online"] },
  { id: "p11", name: "Laptop", description: "Laptop ringan dan bertenaga untuk coding dan produktivitas.", price: "Rp12.000.000", category: "tech", tags: ["teknologi", "laptop"] },
  { id: "p12", name: "Mechanical Keyboard", description: "Keyboard mekanikal dengan switch yang nyaman untuk mengetik dan coding.", price: "Rp1.800.000", category: "tech", tags: ["teknologi", "keyboard"] },
  { id: "p13", name: "Gaming Mouse", description: "Mouse gaming dengan sensor presisi tinggi dan tombol programmable.", price: "Rp650.000", category: "gaming", tags: ["gaming", "mouse"] },
  { id: "p14", name: "Headphones", description: "Headphone studio dengan kualitas suara jernih dan noise cancellation.", price: "Rp2.200.000", category: "music", tags: ["musik", "audio"] },
  { id: "p15", name: "DAW Software", description: "Digital Audio Workstation untuk produksi musik dan recording.", price: "Rp3.500.000", category: "music", tags: ["musik", "software"] },
  { id: "p16", name: "Notion Plus", description: "All-in-one workspace untuk organisasi belajar dan bisnis.", price: "Rp120.000/bln", category: "education", tags: ["produktivitas", "organisasi"] },
  { id: "p17", name: "Canva Pro", description: "Tools desain grafis premium dengan template tak terbatas dan fitur AI.", price: "Rp150.000/bln", category: "creator", tags: ["desain", "kreator"] },
  { id: "p18", name: "LinkedIn Premium", description: "Fitur premium LinkedIn untuk networking dan pencarian kerja.", price: "Rp250.000/bln", category: "career", tags: ["karir", "profesional"] },
  { id: "p19", name: "Guitar Pickup", description: "Pickup gitar elektrik untuk koneksi ke amplifier dan audio interface.", price: "Rp750.000", category: "music", tags: ["musik", "gitar"] },
  { id: "p20", name: "Ergonomic Chair", description: "Kursi ergonomis untuk kenyamanan bekerja dan belajar dalam waktu lama.", price: "Rp3.800.000", category: "tech", tags: ["teknologi", "produktivitas"] },
];

export const ROADMAP_TEMPLATES: RoadmapTemplateConstant[] = [
  { slug: "doctor", title: "Dokter", description: "Jalur lengkap menjadi dokter profesional", icon: "Stethoscope", color: "from-blue-600 to-cyan-500", label: "Dokter", duration: "8-12 tahun", category: "health" },
  { slug: "football-player", title: "Pemain Sepak Bola", description: "Roadmap menjadi pemain sepak bola profesional", icon: "Trophy", color: "from-green-600 to-emerald-500", label: "Sepak Bola", duration: "8-15 tahun", category: "sports" },
  { slug: "runner", title: "Pelari", description: "Program latihan lari dari pemula hingga maraton", icon: "Zap", color: "from-orange-500 to-red-500", label: "Lari", duration: "6-12 bulan", category: "sports" },
  { slug: "golfer", title: "Pegolf", description: "Panduan menjadi pegolf dari dasar hingga turnamen", icon: "Target", color: "from-teal-600 to-green-500", label: "Golf", duration: "1-3 tahun", category: "sports" },
  { slug: "musician", title: "Musisi", description: "Jalur menjadi musisi dari belajar hingga performa", icon: "Music", color: "from-purple-600 to-pink-500", label: "Musik", duration: "2-5 tahun", category: "creative" },
  { slug: "content-creator", title: "Content Creator", description: "Dari nol hingga monetisasi dan scaling konten", icon: "Camera", color: "from-pink-500 to-orange-400", label: "Kreator", duration: "6-18 bulan", category: "creative" },
  { slug: "entrepreneur", title: "Entrepreneur", description: "Membangun bisnis dari ide hingga pertumbuhan", icon: "TrendingUp", color: "from-amber-600 to-yellow-500", label: "Bisnis", duration: "3-5 tahun", category: "business" },
  { slug: "digital-marketer", title: "Digital Marketer", description: "Karir marketing digital dari dasar hingga strategi", icon: "Monitor", color: "from-indigo-600 to-purple-500", label: "Marketing", duration: "1-2 tahun", category: "business" },
  { slug: "programmer", title: "Programmer", description: "Jalur menjadi programmer dari coding hingga full-stack", icon: "Code", color: "from-primary to-secondary", label: "Programming", duration: "6-12 bulan", category: "tech" },
  { slug: "beauty-creator", title: "Beauty Creator", description: "Panduan beauty creator dari skincare hingga brand", icon: "Sparkles", color: "from-rose-500 to-pink-400", label: "Kecantikan", duration: "6-18 bulan", category: "creative" },
];
