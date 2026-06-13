import type {
  DailyActivity,
  DailyActivityDimension,
  DreamJourney,
  DreamTemplate,
  SpiritualPreferences,
} from "@beautifio/types";
import { SPIRITUAL_PRACTICES } from "./life-engine-seed";
import { getDreamTemplate } from "./dream-templates";

export interface GenerateDailyOptions {
  journey: DreamJourney;
  spiritualPref?: SpiritualPreferences | null;
  date?: string;
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

export function generateDailyActivities(
  options: GenerateDailyOptions
): Omit<DailyActivity, "id" | "created_at">[] {
  const { journey, spiritualPref, date } = options;
  const dateStr = date || new Date().toISOString().split("T")[0];
  const template = getDreamTemplate(journey.template_slug);
  const activities: Omit<DailyActivity, "id" | "created_at">[] = [];

  const dimensions: DailyActivityDimension[] = [
    "spiritual",
    "physical",
    "knowledge",
    "social",
    "character",
    "dream_skill",
  ];

  for (const dimension of dimensions) {
    const titles = getActivitiesForDimension(
      dimension,
      template,
      spiritualPref,
      journey.category
    );
    const title = titles[Math.floor(Math.random() * titles.length)];

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
