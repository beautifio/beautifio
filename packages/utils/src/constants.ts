export const GOAL_CATEGORIES = [
  { value: "karir", label: "Karir" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "skill", label: "Skill" },
  { value: "bisnis", label: "Bisnis" },
] as const;

export const OPP_CATEGORIES = [
  { value: "beasiswa", label: "Beasiswa" },
  { value: "magang", label: "Magang" },
  { value: "kompetisi", label: "Kompetisi" },
  { value: "workshop", label: "Workshop" },
] as const;

export const CIRCLE_STATUS = { active: "Aktif", full: "Penuh", inactive: "Tidak Aktif" } as const;
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

export interface RoadmapTemplateConstant { slug: string; title: string; description: string; icon: string; color: string; label: string; duration: string; }
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

export const ROADMAP_TEMPLATES: RoadmapTemplateConstant[] = [
  { slug: "doctor", title: "Dokter", description: "Jalur lengkap menjadi dokter profesional", icon: "Stethoscope", color: "from-blue-600 to-cyan-500", label: "Dokter", duration: "8-12 tahun" },
  { slug: "football-player", title: "Pemain Sepak Bola", description: "Roadmap menjadi pemain sepak bola profesional", icon: "Trophy", color: "from-green-600 to-emerald-500", label: "Sepak Bola", duration: "8-15 tahun" },
  { slug: "runner", title: "Pelari", description: "Program latihan lari dari pemula hingga maraton", icon: "Zap", color: "from-orange-500 to-red-500", label: "Lari", duration: "6-12 bulan" },
  { slug: "golfer", title: "Pegolf", description: "Panduan menjadi pegolf dari dasar hingga turnamen", icon: "Target", color: "from-teal-600 to-green-500", label: "Golf", duration: "1-3 tahun" },
  { slug: "musician", title: "Musisi", description: "Jalur menjadi musisi dari belajar hingga performa", icon: "Music", color: "from-purple-600 to-pink-500", label: "Musik", duration: "2-5 tahun" },
  { slug: "content-creator", title: "Content Creator", description: "Dari nol hingga monetisasi dan scaling konten", icon: "Camera", color: "from-pink-500 to-orange-400", label: "Kreator", duration: "6-18 bulan" },
  { slug: "entrepreneur", title: "Entrepreneur", description: "Membangun bisnis dari ide hingga pertumbuhan", icon: "TrendingUp", color: "from-amber-600 to-yellow-500", label: "Bisnis", duration: "1-3 tahun" },
  { slug: "digital-marketer", title: "Digital Marketer", description: "Karir marketing digital dari dasar hingga strategi", icon: "Monitor", color: "from-indigo-600 to-purple-500", label: "Marketing", duration: "1-2 tahun" },
  { slug: "programmer", title: "Programmer", description: "Jalur menjadi programmer dari coding hingga full-stack", icon: "Code", color: "from-primary to-secondary", label: "Programming", duration: "6-12 bulan" },
  { slug: "beauty-creator", title: "Beauty Creator", description: "Panduan beauty creator dari skincare hingga brand", icon: "Sparkles", color: "from-rose-500 to-pink-400", label: "Kecantikan", duration: "6-18 bulan" },
];
