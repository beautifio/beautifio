export type SafeCategory =
  | "bullying"
  | "violence"
  | "harassment"
  | "family-issues"
  | "career-crisis"
  | "financial-crisis";

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: SafeCategory;
  url?: string;
}

export interface SupportGuide {
  id: string;
  title: string;
  steps: string[];
  category: SafeCategory;
}

export const SAFE_CATEGORIES: { key: SafeCategory; label: string; emoji: string; keywords: string[] }[] = [
  { key: "bullying", label: "Bullying", emoji: "🛡️", keywords: ["Bullying", "perundungan", "intimidasi"] },
  { key: "violence", label: "Kekerasan", emoji: "🚨", keywords: ["Kekerasan", "violence", "kdr"] },
  { key: "harassment", label: "Pelecehan", emoji: "⚠️", keywords: ["Pelecehan", "harassment", "kekerasan seksual"] },
  { key: "family-issues", label: "Masalah Keluarga", emoji: "🏠", keywords: ["Keluarga", "family", "orang tua"] },
  { key: "career-crisis", label: "Krisis Karir", emoji: "💼", keywords: ["Karir", "Karier", "pekerjaan", "career"] },
  { key: "financial-crisis", label: "Krisis Keuangan", emoji: "💰", keywords: ["Keuangan", "financial", "hutang"] },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: "Konseling Kesehatan Mental", phone: "119", description: "Hotline darurat Kementerian Kesehatan (ekstensi 8)" },
  { name: "LBH APIK", phone: "021-87797289", description: "Pendampingan hukum untuk perempuan dan korban kekerasan" },
  { name: "Yayasan Pulih", phone: "021-78842580", description: "Pendampingan psikologis dan rehabilitasi trauma" },
  { name: "Hotline KPAI", phone: "021-87797289", description: "Perlindungan anak dan pengaduan kekerasan anak" },
  { name: "SAPA (Sahabat Perempuan)", phone: "129", description: "Hotline Kementerian Pemberdayaan Perempuan" },
  { name: "Into The Light", phone: "https://intothelight.id", description: "Platform kesehatan mental & pencegahan bunuh diri" },
];

export const RESOURCES: ResourceItem[] = [
  { id: "r1", title: "Apa Itu Bullying dan Cara Menghadapinya", description: "Panduan mengenali bullying dan langkah yang bisa kamu ambil", category: "bullying" },
  { id: "r2", title: "Kekerasan dalam Pacaran: Tanda dan Cara Keluar", description: "Kenali tanda-tanda hubungan tidak sehat dan cara menyelamatkan diri", category: "violence" },
  { id: "r3", title: "Pelecehan di Tempat Umum: Yang Harus Kamu Lakukan", description: "Langkah-langkah yang bisa diambil jika mengalami pelecehan di tempat umum", category: "harassment" },
  { id: "r4", title: "Komunikasi Efektif dengan Orang Tua", description: "Tips membangun komunikasi sehat dengan keluarga", category: "family-issues" },
  { id: "r5", title: "Bingung Pilih Karir? Ini Cara Menemukan Jalurmu", description: "Panduan eksplorasi karir untuk usia 17-24 tahun", category: "career-crisis" },
  { id: "r6", title: "Mengelola Keuangan di Usia Muda", description: "Dasar-dasar literasi keuangan dan cara keluar dari hutang", category: "financial-crisis" },
  { id: "r7", title: "Pertolongan Pertama untuk Kesehatan Mental", description: "Langkah awal saat merasa kewalahan secara emosional", category: "bullying" },
  { id: "r8", title: "Cara Melaporkan Kekerasan", description: "Panduan melaporkan kekerasan ke pihak berwajib", category: "violence" },
  { id: "r9", title: "Mengatasi Stres Finansial", description: "Strategi mengurangi stres akibat masalah keuangan", category: "financial-crisis" },
  { id: "r10", title: "Mencari Bantuan Profesional", description: "Kapan dan bagaimana mencari bantuan psikolog atau konselor", category: "harassment" },
];

export const SUPPORT_GUIDES: SupportGuide[] = [
  {
    id: "g1",
    title: "Langkah Saat Mengalami Bullying",
    category: "bullying",
    steps: [
      "Yakinlah bahwa kamu tidak sendiri dan bullying bukan salahmu",
      "Catat setiap kejadian bullying (waktu, tempat, pelaku)",
      "Bicarakan dengan orang dewasa yang kamu percaya",
      "Laporkan ke pihak sekolah atau tempat kerja",
      "Hubungi hotline konseling untuk dukungan psikologis",
      "Jangan ragu untuk mencari lingkungan yang lebih aman",
    ],
  },
  {
    id: "g2",
    title: "Langkah Saat Mengalami Kekerasan",
    category: "violence",
    steps: [
      "Cari tempat yang aman segera mungkin",
      "Hubungi hotline darurat atau orang terpercaya",
      "Jangan mandi atau membersihkan diri jika terjadi kekerasan fisik - ini penting untuk bukti medis",
      "Segera ke rumah sakit untuk visum et repertum",
      "Laporkan ke pihak berwajib (Polisi)",
      "Hubungi pendamping hukum seperti LBH APIK",
      "Dapatkan dukungan psikologis untuk pemulihan trauma",
    ],
  },
  {
    id: "g3",
    title: "Langkah Saat Mengalami Pelecehan",
    category: "harassment",
    steps: [
      "Tegaskan dengan jelas bahwa perilaku tersebut tidak diterima",
      "Kumpulkan bukti (screenshot, rekaman, saksi)",
      "Laporkan ke pihak berwenang di lingkungan tersebut",
      "Jangan menyalahkan diri sendiri - pelecehan bukan kesalahanmu",
      "Cari dukungan dari teman atau konselor",
      "Jika diperlukan, buat laporan resmi ke polisi",
    ],
  },
  {
    id: "g4",
    title: "Langkah Menghadapi Masalah Keluarga",
    category: "family-issues",
    steps: [
      "Identifikasi sumber masalah dengan jujur pada diri sendiri",
      "Coba komunikasikan perasaanmu dengan anggota keluarga",
      "Gunakan teknik komunikasi non-konfrontatif",
      "Libatkan pihak ketiga netral jika perlu (konselor keluarga)",
      "Tetapkan batasan yang sehat untuk kesejahteraan mentalmu",
      "Ingat bahwa mencari bantuan bukan tanda kelemahan",
    ],
  },
  {
    id: "g5",
    title: "Langkah Menghadapi Krisis Karir",
    category: "career-crisis",
    steps: [
      "Evaluasi apa yang membuatmu tidak puas dengan karir saat ini",
      "Lakukan riset tentang jalur karir alternatif",
      "Ikuti tes minat bakat atau konseling karir",
      "Bangun skill baru melalui kursus atau pelatihan",
      "Network dengan profesional di bidang yang kamu minati",
      "Jangan takut untuk memulai dari awal - usia bukan penghalang",
    ],
  },
  {
    id: "g6",
    title: "Langkah Menghadapi Krisis Keuangan",
    category: "financial-crisis",
    steps: [
      "Evaluasi pemasukan dan pengeluaran secara jujur",
      "Buat prioritas: kebutuhan pokok > cicilan > tabungan",
      "Cari sumber pendapatan tambahan (freelance, part-time)",
      "Konsultasi dengan perencana keuangan jika perlu",
      "Jangan mengambil pinjaman online ilegal",
      "Gabung komunitas literasi keuangan untuk dukungan",
    ],
  },
];

export const SAFE_STORIES = [
  {
    slug: "curhat-merasa-terjebak-di-pekerjaan-yang-tidak-disukai",
    title: "Merasa Terjebak di Pekerjaan yang Tidak Disukai",
    category: "Karir",
    content: "Setiap pagi saya bangun dengan rasa malas yang luar biasa...",
  },
  {
    slug: "curhat-takut-gagal-sebelum-memulai",
    title: "Takut Gagal Sebelum Memulai: Bagaimana Mengatasinya?",
    category: "Kesehatan Mental",
    content: "Rasa takut ini menghantui setiap langkah yang saya ambil...",
  },
];

export const SAFE_MENTORS = [
  {
    slug: "bu-sari",
    name: "Bu Sari",
    initials: "SS",
    expertise: "Leadership Coach & Konselor Karir",
    bio: "Berpengalaman 15 tahun sebagai konselor karir dan pengembangan diri. Spesialis dalam membantu anak muda menemukan arah hidup.",
  },
  {
    slug: "dr-rudi-hartono",
    name: "Dr. Rudi Hartono",
    initials: "RH",
    expertise: "Spesialis Kesehatan Mental & Konselor",
    bio: "Dokter spesialis yang aktif dalam edukasi kesehatan mental dan pembinaan generasi muda.",
  },
  {
    slug: "pak-budi",
    name: "Pak Budi",
    initials: "BB",
    expertise: "HR Director & Konselor Karir",
    bio: "HR Director dengan pengalaman 15+ tahun. Membantu fresh graduate menemukan jalur karir yang tepat.",
  },
];

export const SAFE_CIRCLES = [
  {
    id: "3",
    name: "Creative Lab Circle",
    memberCount: 12,
    description: "Ruang aman untuk berbagi dan berkarya",
  },
  {
    id: "11",
    name: "Konseling & Dukungan Circle",
    memberCount: 8,
    description: "Dukungan sebaya untuk kesehatan mental",
  },
  {
    id: "12",
    name: "Karir Muda Indonesia Circle",
    memberCount: 15,
    description: "Diskusi karir dan pengembangan diri",
  },
];

export function detectSafeCategories(category: string): SafeCategory[] {
  const matched: SafeCategory[] = [];
  const lower = category.toLowerCase();
  for (const sc of SAFE_CATEGORIES) {
    if (sc.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      matched.push(sc.key);
    }
  }
  return matched;
}

export function isSensitiveCategory(category: string): boolean {
  const sensitive = ["bullying", "kekerasan", "pelecehan", "keluarga", "kesehatan mental"];
  return sensitive.some((s) => category.toLowerCase().includes(s));
}

export function getResourcesForCategory(category: SafeCategory): ResourceItem[] {
  return RESOURCES.filter((r) => r.category === category);
}

export function getGuideForCategory(category: SafeCategory): SupportGuide | undefined {
  return SUPPORT_GUIDES.find((g) => g.category === category);
}
