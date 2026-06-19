import type {
  DailyActivity,
  DailyActivityDimension,
  DreamJourney,
  DreamTemplate,
  SpiritualPreferences,
  ActionType,
} from "@beautifio/types";
import { SPIRITUAL_PRACTICES } from "./life-engine-seed";
import { getDreamTemplate } from "./dream-templates";

export interface ActivityDetail {
  description: string;
  tips: string[];
  warnings: string | null;
  video_url: string | null;
  video_label: string | null;
  article_id?: string | null;
  article_slug?: string | null;
}

export const ACTIVITY_DETAILS: Record<string, ActivityDetail> = {};

function addDetails(dimension: string, title: string, detail: ActivityDetail) {
  const key = `${dimension}::${title.toLowerCase().trim()}`;
  ACTIVITY_DETAILS[key] = detail;
}

// ─── Pemain Sepak Bola — dimension activities (DIMENSION_ACTIVITIES_BY_CATEGORY olahraga) ───

addDetails("physical", "Lari 20 menit", {
  description: "Lari ringan untuk membangun stamina dan kebugaran dasar. Fokus pada konsistensi, bukan kecepatan.",
  tips: [
    "Jaga average pace di rentang 6–8 menit/km untuk lari ringan",
    "Mulai dengan 5 menit jalan kaki sebagai pemanasan",
    "Atur napas — tarik lewat hidung, buang lewat mulut",
    "Gunakan sepatu lari yang sesuai, bukan sepatu casual",
  ],
  warnings: "Jangan lari jika tubuh sedang sakit, demam, atau ada cedera. Istirahat lebih baik daripada memaksakan.",
  video_url: null,
  video_label: null,
});

addDetails("physical", "Stretching 10 menit", {
  description: "Peregangan setelah latihan untuk meningkatkan fleksibilitas dan mempercepat pemulihan otot.",
  tips: [
    "Fokus pada otot yang banyak dipakai: hamstring, quad, betis, dan pinggul",
    "Tahan setiap regangan minimal 20–30 detik tanpa menggoyang",
    "Jangan meregang sampai sakit — rasa tertarik ringan sudah cukup",
  ],
  warnings: "Lakukan stretching saat otot sudah hangat (setelah latihan), bukan sebelum. Stretching otot dingin bisa menyebabkan cedera.",
  video_url: null,
  video_label: null,
});

addDetails("physical", "Latihan fisik inti", {
  description: "Latihan kekuatan core untuk stabilitas dan mencegah cedera. Otot inti yang kuat membantu keseimbangan dan power saat bermain.",
  tips: [
    "Plank 3 set × 30 detik — jaga posisi tubuh lurus",
    "Russian twist 3 set × 15 repetisi per sisi — gunakan bola atau beban ringan",
    "Jangan tahan napas — buang napas saat kontraksi, tarik saat relaksasi",
  ],
  warnings: "Hentikan jika ada nyeri punggung bawah. Perbaiki form dulu sebelum menambah durasi.",
  video_url: null,
  video_label: null,
});

addDetails("spiritual", "Doa sebelum berolahraga", {
  description: "Memanjatkan doa atau afirmasi positif sebelum latihan sebagai bentuk syukur dan persiapan mental.",
  tips: [
    "Luangkan 1-2 menit hening atau baca doa sesuai keyakinan",
    "Fokuskan niat: latihan hari ini untuk apa?",
    "Ucapkan satu afirmasi: 'Hari ini aku akan memberikan yang terbaik'",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("spiritual", "Syukur karena tubuh sehat", {
  description: "Luangkan waktu untuk menyadari dan bersyukur atas kesehatan yang dimiliki. Ini membangun mindset positif.",
  tips: [
    "Tulis satu hal tentang tubuhmu yang kamu syukuri hari ini",
    "Bisa dilakukan selesai mandi atau sebelum tidur",
    "Bersyukur bukan hanya soal hasil, tapi juga proses",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("knowledge", "Baca artikel teknik olahraga", {
  description: "Tambah pengetahuan taktis dan teknis dengan membaca 1 artikel atau menonton 1 video analisis per hari.",
  tips: [
    "Mulai dari sumber terpercaya: fourfourtwo.com, tifoball.com, atau UEFA.com",
    "Tulis 1 hal yang kamu pelajari di kolom catatan setelah selesai",
    "Pilih topik yang relevan dengan posisimu atau tim favoritmu",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
  article_id: null,
  article_slug: "panduan-olahraga-pemula-tanpa-cedera",
});

addDetails("knowledge", "Pelajari nutrisi atlet", {
  description: "Baca atau tonton materi tentang nutrisi yang tepat untuk atlet. Apa yang kamu makan memengaruhi performa.",
  tips: [
    "Pahami makronutrien: protein untuk otot, karbohidrat untuk energi",
    "Cari info tentang makanan khas Indonesia yang mendukung performa atlet",
    "Catat 1 perubahan pola makan yang bisa kamu mulai minggu ini",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
  article_id: null,
  article_slug: null,
});

addDetails("social", "Sapa teman latihan", {
  description: "Bangun koneksi sosial dengan menyapa rekan latihan. Tim yang solid dibangun dari hubungan interpersonal yang baik.",
  tips: [
    "Sapa minimal satu orang sebelum latihan dimulai",
    "Tanya kabar atau bagaimana latihannya hari ini",
    "Tawarkan bantuan jika ada teman yang kesulitan",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("social", "Bagikan progres latihan", {
  description: "Ceritakan progres atau pencapaian kecil hari ini ke teman atau keluarga. Sharing meningkatkan akuntabilitas.",
  tips: [
    "Bisa lewat chat, story IG, atau obrolan santai",
    "Fokus pada proses (mis: 'hari ini aku berhasil lari 5km nonstop')",
    "Jangan takut terlihat sombong — progresmu bisa menginspirasi orang lain",
  ],
  warnings: "Hindari membandingkan progresmu dengan orang lain. Setiap orang punya timeline-nya sendiri.",
  video_url: null,
  video_label: null,
});

addDetails("character", "Catat waktu latihan hari ini", {
  description: "Log durasi dan isi latihan hari ini. Tracking konsisten membantu kamu melihat pola dan kemajuan.",
  tips: [
    "Catat minimal: jam mulai, jam selesai, dan apa yang dilatih",
    "Bisa pakai kolom catatan di bawah aktivitas ini",
    "Tambahkan rating kondisi tubuh: 1–5 — berguna untuk deteksi kelelahan",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("character", "Tidak menunda jadwal latihan", {
  description: "Latihan yang dijadwalkan harus dilakukan hari ini, bukan ditunda. Disiplin adalah fondasi segala prestasi.",
  tips: [
    "Ingatkan dirimu: alasan 'malas' adalah pilihan, bukan halangan",
    "Kalau benar-benar tidak bisa, reschedule bukan skip — tentukan waktu pengganti SEKARANG juga",
    "Disiplin selama 21 hari berturut-turut akan mengubahnya jadi kebiasaan",
  ],
  warnings: "Jangan menyalahkan diri sendiri kalau pernah skip. Yang penting adalah kembali ke jalur, bukan sempurna.",
  video_url: null,
  video_label: null,
});

// ─── Pemain Sepak Bola — dream_skill activities (from template daily_activities) ───

addDetails("dream_skill", "Bangun Pagi (05:00)", {
  description: "Bangun sebelum subuh untuk memulai hari lebih awal. Memberimu waktu ekstra untuk persiapan dan tidak terburu-buru.",
  tips: [
    "Letakkan alarm di seberang kamar supaya kamu harus bangun untuk mematikannya",
    "Minum segelas air putih begitu bangun untuk mengaktifkan metabolisme",
    "Konsistenlah selama 7 hari — setelah itu tubuh akan terbiasa bangun jam 5",
  ],
  warnings: "Pastikan tidur malam tidak kurang dari 7 jam. Bangun pagi tidak sehat jika tidur larut malam terus-menerus.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Doa & Refleksi", {
  description: "Berdoa dan bersyukur untuk hari yang baru. Momentum spiritual yang menguatkan mental dan memberi ketenangan.",
  tips: [
    "Gunakan 3-5 menit pertama setelah bangun untuk doa atau meditasi",
    "Ucapkan rasa syukur untuk 3 hal kecil sebelum memikirkan target latihan",
    "Jika tidak terbiasa, mulai dengan menarik napas dalam 5 kali sambil fokus",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Stretching Dinamis", {
  description: "Peregangan 10 menit untuk menyiapkan tubuh sebelum latihan. Meningkatkan aliran darah dan mengurangi risiko cedera.",
  tips: [
    "Lakukan leg swings, arm circles, dan trunk rotations — bukan static hold",
    "Mulai dari gerakan kecil, tingkatkan amplitudo perlahan",
    "Jangan lompat-lompat saat stretching — fokus pada kontrol gerakan",
  ],
  warnings: "Stretching dinamis dilakukan SEBELUM latihan. Stretching statis dilakukan SETELAH latihan. Jangan tertukar.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Sarapan Sehat", {
  description: "Karbohidrat kompleks + protein + buah untuk bahan bakar tubuh. Sarapan atlet tidak boleh sembarangan.",
  tips: [
    "Kombinasi ideal: nasi merah/oatmeal + telur + pisang",
    "Hindari gula berlebihan dan makanan olahan di pagi hari",
    "Minum air putih 1 gelas sebelum sarapan untuk rehidrasi",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Ball Mastery (30 menit)", {
  description: "Latihan kontrol bola untuk meningkatkan teknik dasar. Fokus pada touch, koordinasi kaki, dan kelincahan.",
  tips: [
    "Mulai dengan inside-outside touches — kaki kanan 5 menit, kiri 5 menit",
    "Latihan dribble zig-zag dengan cone atau botol air sebagai penanda",
    "Fokus pada kontrol, bukan kecepatan — kecepatan datang sendiri setelah teknik bagus",
    "Rekam dirimu sendiri tiap minggu untuk melihat perkembangan",
  ],
  warnings: "Lakukan di permukaan yang rata. Istirahat jika lutut atau pergelangan kaki terasa nyeri.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Passing & Receiving", {
  description: "Latihan operan pendek, panjang, dan one-touch. Kemampuan passing dan receiving yang akurat adalah fondasi permainan tim.",
  tips: [
    "Latih passing dengan kedua kaki — dominan dan non-dominan",
    "Gunakan tembok sebagai partner: passing ke tembok, kontrol, passing lagi",
    "Fokus pada first touch yang mengarah ke ruang kosong, bukan diam di tempat",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Physical Training", {
  description: "Sprint, agility ladder, dan kekuatan tubuh untuk meningkatkan kebugaran atletik secara menyeluruh.",
  tips: [
    "Mulai dengan dynamic warm-up 5 menit sebelum latihan fisik",
    "Interval training: sprint 20 detik, jog 40 detik — ulang 6 kali",
    "Agility ladder: lakukan 3-4 variasi gerakan, masing-masing 3 repetisi",
  ],
  warnings: "Jangan memaksakan sprint jika otot masih pegal dari latihan kemarin. Recovery sama pentingnya dengan latihan.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Small Sided Game", {
  description: "Game 4v4 atau 5v5 untuk aplikasi teknik dalam situasi pertandingan. Melatih pengambilan keputusan cepat.",
  tips: [
    "Fokus pada satu aspek per game: hari ini hanya passing, besok hanya dribbling",
    "Gerak tanpa bola sama penting dengan kontrol bola — jangan diam",
    "Komunikasi dengan rekan setim: panggil nama, arahkan dengan tangan",
  ],
  warnings: "Jaga intensitas — small sided game sering lebih berat dari latihan biasa karena ruang terbatas. Minum air di setiap jeda.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Recovery Session", {
  description: "Stretching statis, foam roller, atau ice bath untuk pemulihan otot setelah latihan intens.",
  tips: [
    "Lakukan stretching statis: tiap posisi 30 detik, tanpa menggoyang",
    "Foam roller: gulung perlahan pada area yang terasa kencang — berhenti di titik nyeri",
    "Minum protein shake atau susu coklat dalam 30 menit setelah latihan untuk pemulihan otot maksimal",
  ],
  warnings: "Jangan gunakan foam roller langsung pada tulang atau sendi — hanya pada jaringan otot. Jika sakit berlebih, hentikan.",
  video_url: null,
  video_label: null,
});

addDetails("dream_skill", "Tidur Sebelum 22:00", {
  description: "Tidur cukup 8 jam untuk pemulihan optimal. tidur adalah bagian paling penting dari jadwal latihan — bukan opsional.",
  tips: [
    "Matikan layar gadget 30 menit sebelum tidur — cahaya biru mengganggu kualitas tidur",
    "Baca buku atau lakukan teknik pernapasan 4-7-8 untuk mempercepat tidur",
    "Konsisten: tidur dan bangun di jam yang sama setiap hari, termasuk akhir pekan",
  ],
  warnings: "Kafein setelah jam 3 sore bisa mengganggu kualitas tidur. Hindari kopi, teh, dan minuman bersoda di sore-malam hari.",
  video_url: null,
  video_label: null,
});

  addDetails("dream_skill", "Refleksi Harian", {
  description: "Catat progres latihan dan perasaan hari ini. Jurnal membantu melacak pola dan menjaga motivasi jangka panjang.",
  tips: [
    "Tulis 3 hal: apa yang dilatih, bagaimana rasanya, satu hal yang dipelajari",
    "Jangan hanya menulis yang buruk — catat juga kemajuan kecil",
    "Kalau tidak sempat, cukup tulis 1 kalimat. Konsistensi lebih penting daripada panjang",
  ],
  warnings: null,
  video_url: null,
  video_label: null,
});

export interface GenerateDailyOptions {
  journey: DreamJourney;
  spiritualPref?: SpiritualPreferences | null;
  date?: string;
}

export { getActivitiesForDimension };

// ─── Journey Engine: map dimension → action_type ───
const DIMENSION_ACTION_MAP: Record<DailyActivityDimension, ActionType> = {
  knowledge: "read_article",
  spiritual: "manual",
  physical: "manual",
  social: "comment_curhat",
  character: "manual",
  dream_skill: "read_article",
};

// ─── Extract search keywords from activity title ───
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    "dan", "di", "ke", "dari", "yang", "ini", "itu", "dengan",
    "untuk", "pada", "adalah", "akan", "telah", "bisa", "dapat",
    "hari", "baru", "satu", "dalam", "setiap", "atau", "dan",
    "luangkan", "waktu", "tulis", "buat", "catat", "baca", "lihat",
    "pelajari", "lakukan", "jangan", "tidak", "minum", "makan",
    "sapa", "bagikan", "bantu", "selesaikan", "tunda",
  ]);

  // Remove leading numbers/times like "05:00", "10" etc
  const cleaned = title.replace(/^[\d\s:,-]+/, "").trim();
  const words = cleaned.toLowerCase().split(/[\s,()]+/);

  const keywords = words
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 4);

  return keywords.length > 0 ? keywords : [cleaned.toLowerCase().slice(0, 20)];
}

const DIMENSION_ACTIVITIES_BY_CATEGORY: Record<
  string,
  Partial<Record<DailyActivityDimension, string[]>>
> = {
  olahraga: {
    spiritual: ["Doa sebelum berolahraga", "Syukur karena tubuh sehat"],
    physical: ["Lari 20 menit", "Stretching 10 menit", "Latihan fisik inti"],
    knowledge: ["Baca artikel teknik olahraga", "Pelajari nutrisi atlet"],
    social: ["Sapa teman latihan", "Bagikan progres latihan"],
    character: ["Catat waktu latihan hari ini", "Tidak menunda jadwal latihan"],
  },
  teknologi: {
    spiritual: ["Luangkan waktu refleksi tanpa gadget", "Bersyukur atas kesempatan belajar"],
    physical: ["Jalan 10 menit jauhkan layar", "Tegakkan postur duduk"],
    knowledge: ["Baca dokumentasi teknologi terbaru", "Selesaikan tutorial coding"],
    social: ["Diskusi kode dengan teman", "Bagikan ilmu di forum"],
    character: ["Selesaikan satu bug/error", "Tulis progress belajar hari ini"],
  },
  seni: {
    spiritual: ["Meditasi sebelum berkarya", "Syukur bisa berekspresi"],
    physical: ["Regangkan tangan dan jari", "Jalan sebentar cari inspirasi"],
    knowledge: ["Pelajari teknik seni baru", "Amati karya seniman lain"],
    social: ["Tunjukkan karya pada teman", "Minta feedback atas hasil karya"],
    character: ["Selesaikan satu sketsa/tulisan", "Keluar dari zona nyaman berkarya"],
  },
  akademik: {
    spiritual: ["Berdoa sebelum belajar", "Syukur atas ilmu baru"],
    physical: ["Istirahat mata 5 menit setiap jam", "Minum air putih saat belajar"],
    knowledge: ["Review materi hari ini", "Buat catatan dari yang dipelajari"],
    social: ["Diskusikan materi dengan teman", "Ajar teman satu konsep"],
    character: ["Selesaikan tugas tepat waktu", "Fokus 25 menit tanpa distraksi"],
  },
  bisnis: {
    spiritual: ["Refleksi tujuan bisnismu", "Bersyukur atas pelanggan/klien"],
    physical: ["Jalan kaki 10 menit sambil brainstorming", "Minum air putih cukup"],
    knowledge: ["Baca tren pasar terbaru", "Pelajari strategi kompetitor"],
    social: ["Network dengan satu orang baru", "Follow up dengan klien"],
    character: ["Selesaikan satu tugas administratif", "Evaluasi pengeluaran hari ini"],
  },
  kesehatan: {
    spiritual: ["Doa kesembuhan dan kekuatan", "Syukur atas proses penyembuhan"],
    physical: ["Jalan santai 15 menit", "Latihan pernapasan dalam"],
    knowledge: ["Baca artikel kesehatan terpercaya", "Pelajari nutrisi harian"],
    social: ["Sapa keluarga/sahabat", "Ceritakan progres kesehatan"],
    character: ["Patuhi jadwal pengobatan", "Tulis satu hal positif hari ini"],
  },
  sosial: {
    spiritual: ["Doa untuk orang-orang yang dibantu", "Syukur bisa bermanfaat"],
    physical: ["Jalan kaki jemput kegiatan sosial", "Minum air cukup seharian"],
    knowledge: ["Baca isu sosial terkini", "Pelajari teknik pemberdayaan masyarakat"],
    social: ["Sapa anggota komunitas", "Dengar curhat satu orang"],
    character: ["Selesaikan janji yang sudah dibuat", "Evaluasi dampak hari ini"],
  },
};

const GENERIC_ACTIVITIES: Record<DailyActivityDimension, string[]> = {
  spiritual: ["Luangkan waktu refleksi diri 10 menit", "Bersyukur pada hal-hal baik hari ini"],
  physical: ["Jalan 10 menit", "Minum air putih 8 gelas"],
  knowledge: ["Baca artikel inspiratif", "Belajar hal baru selama 15 menit"],
  social: ["Sapa teman atau keluarga", "Bantu seseorang hari ini"],
  character: ["Selesaikan satu tugas yang ditunda", "Tulis satu hal yang disyukuri"],
  dream_skill: ["Latihan keterampilan mimpimu 20 menit"],
};

function guessCategory(category: string, template: DreamTemplate | undefined): string {
  const cat = category.toLowerCase();
  const keywordMap: [string, string[]][] = [
    ["olahraga", ["sport", "lari", "sepak", "bola", "renang", "atlet", "gym", "fitness"]],
    ["teknologi", ["tech", "coding", "program", "developer", "software", "ai", "data"]],
    ["seni", ["musik", "lukis", "desain", "art", "kreatif", "menulis", "film"]],
    ["akademik", ["akademik", "ilmu", "penelitian", "skripsi", "kuliah", "sekolah"]],
    ["bisnis", ["bisnis", "usaha", "startup", "wirausaha", "investasi"]],
    ["kesehatan", ["sehat", "dokter", "psikolog", "nutrisi", "medis"]],
    ["sosial", ["sosial", "komunitas", "relawan", "ngo", "pendamping"]],
  ];
  for (const [group, keywords] of keywordMap) {
    if (keywords.some((k) => cat.includes(k))) return group;
  }
  if (template?.category) {
    const tCat = template.category.toLowerCase();
    for (const [group, keywords] of keywordMap) {
      if (keywords.some((k) => tCat.includes(k))) return group;
    }
  }
  return "";
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffleArray<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateDailyActivities(
  options: GenerateDailyOptions
): Omit<DailyActivity, "id" | "created_at">[] {
  const { journey, spiritualPref, date } = options;
  const dateStr = date || new Date().toISOString().split("T")[0];
  const template = getDreamTemplate(journey.template_slug);
  if (!template && journey.template_slug) {
    console.warn(`generateDailyActivities: template not found for slug "${journey.template_slug}" — using fallback`);
  }
  const activities: Omit<DailyActivity, "id" | "created_at">[] = [];

  // Seeded random so the same day always gets the same activities
  const seed = `${journey.id}-${dateStr}`;
  const rand = seededRandom(seed);

  const dimensions: DailyActivityDimension[] = [
    "character",
    "dream_skill",
    "knowledge",
    "physical",
    "social",
    "spiritual",
  ];

  const usedTitles = new Set<string>();

  for (const dimension of dimensions) {
    const titlePool = getActivitiesForDimension(
      dimension,
      template,
      spiritualPref,
      journey.category
    );

    // Pick a title not already used (deduplicate across dimensions)
    const available = titlePool.filter((t) => !usedTitles.has(t.toLowerCase()));
    const pool = available.length > 0 ? available : titlePool;
    const title = pick(pool, rand);
    usedTitles.add(title.toLowerCase());

    const detailKey = `${dimension}::${title.toLowerCase().trim()}`;
    const detail = (ACTIVITY_DETAILS as Record<string, any>)[detailKey];
    const activityType = dimension === "knowledge" ? "knowledge" : dimension;
    const actionType = DIMENSION_ACTION_MAP[dimension];

    activities.push({
      journey_id: journey.id,
      user_id: journey.user_id,
      title,
      description: "",
      dimension,
      is_completed: false,
      completed_at: null,
      activity_date: dateStr,
      is_custom: false,
      is_journey_activity: true,
      notes: null,
      article_id: detail?.article_id ?? null,
      activity_type: activityType,
      estimated_minutes: null,
      action_type: actionType,
      match_keywords: extractKeywords(title),
      matched_content_id: null,
      matched_content_type: null,
      matched_slug: null,
      matched_title: null,
    });
  }

  return activities;
}

function getActivitiesForDimension(
  dimension: DailyActivityDimension,
  template: ReturnType<typeof getDreamTemplate> | undefined,
  spiritualPref: SpiritualPreferences | null | undefined,
  journeyCategory: string
): string[] {
  if (dimension === "spiritual" && spiritualPref?.belief) {
    const practices = SPIRITUAL_PRACTICES[spiritualPref.belief];
    if (practices) {
      return practices.examples.slice(0, 4);
    }
  }

  if (dimension === "dream_skill" && template?.daily_activities?.dream_skill) {
    return template.daily_activities.dream_skill;
  }

  const category = guessCategory(journeyCategory, template);
  const categoryActivities = category ? DIMENSION_ACTIVITIES_BY_CATEGORY[category]?.[dimension] : undefined;
  if (categoryActivities && categoryActivities.length > 0) {
    return categoryActivities;
  }

  if (template?.daily_activities) {
    const templateActivities = template.daily_activities[dimension];
    if (templateActivities && templateActivities.length > 0) {
      return templateActivities;
    }
  }

  return GENERIC_ACTIVITIES[dimension];
}
