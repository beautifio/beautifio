import type { DreamTemplate } from "@beautifio/types";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";
import { ADDITIONAL_TEMPLATES } from "./templates-additional";

const CATEGORY_AGES: Record<string, { min: number; max: number }> = {
  sports: { min: 8, max: 99 },
  business: { min: 14, max: 99 },
  tech: { min: 12, max: 99 },
  creative: { min: 8, max: 99 },
  health: { min: 14, max: 99 },
  education: { min: 17, max: 99 },
  lifestyle: { min: 14, max: 99 },
};

function guessAgeRange(category: string): { min: number; max: number } {
  const cat = category.toLowerCase();
  for (const [key, range] of Object.entries(CATEGORY_AGES)) {
    if (cat.includes(key)) return range;
  }
  return { min: 10, max: 99 };
}

function buildAgeDescription(
  roadmap: (typeof ROADMAP_V3_SEED)[string],
  ageRange: { min: number; max: number }
): string {
  if (ageRange.min >= 18) {
    return roadmap.dream.description + " Perjalanan ini cocok untuk usia 18+.";
  }
  if (ageRange.min >= 14) {
    return roadmap.dream.description + " Perjalanan ini cocok untuk usia 14+.";
  }
  return roadmap.dream.description;
}

function buildDailySpiritual(title: string): string[] {
  return [
    "Luangkan waktu refleksi diri 10 menit",
    "Bersyukur atas perjalanan menjadi " + title,
    "Doa sebelum memulai aktivitas",
  ];
}

function buildDailyPhysical(title: string, category: string): string[] {
  const byCategory: Record<string, string[]> = {
    sports: ["Latihan fisik 20 menit", "Stretching 10 menit", "Istirahat cukup"],
    tech: ["Jalan 10 menit jauhkan layar", "Tegakkan postur duduk", "Minum air putih"],
    business: ["Jalan kaki 10 menit", "Minum air putih cukup", "Tidur cukup"],
    creative: ["Regangkan tangan dan jari", "Jalan sebentar cari inspirasi", "Minum air putih"],
    health: ["Jalan santai 15 menit", "Latihan pernapasan", "Istirahat cukup"],
    education: ["Jalan-jalan di kelas", "Tegakkan postur mengajar", "Minum air putih"],
    lifestyle: ["Jalan kaki 10 menit", "Minum air putih cukup", "Tidur cukup"],
  };
  for (const [key, acts] of Object.entries(byCategory)) {
    if (category.toLowerCase().includes(key)) return acts;
  }
  return ["Jalan 10 menit", "Minum air putih", "Stretching"];
}

function buildDailyKnowledge(title: string): string[] {
  return [
    "Baca artikel tentang " + title,
    "Tonton video edukasi terkait " + title,
    "Pelajari satu hal baru tentang " + title,
  ];
}

function buildDailySocial(title: string): string[] {
  return [
    "Sapa teman yang juga tertarik " + title,
    "Bagikan progres " + title + " hari ini",
    "Tanya pendapat orang tentang " + title,
  ];
}

function buildDailyCharacter(title: string): string[] {
  return [
    "Selesaikan satu tugas kecil terkait " + title,
    "Catat satu kemajuan hari ini",
    "Tulis satu hal yang disyukuri",
  ];
}

export function buildDreamTemplates(): Record<string, DreamTemplate> {
  const templates: Record<string, DreamTemplate> = {};

  for (const [slug, roadmap] of Object.entries(ROADMAP_V3_SEED)) {
    if (!roadmap) continue;
    if (["runner", "athlete", "golfer"].includes(slug)) continue;

    const bigWins = roadmap.bigWins.map((bw) => ({
      title: bw.title,
      description: bw.description,
      why_it_matters: roadmap.blueprint?.successFactors?.join(", ") || "",
      alternative_path: "",
      order: bw.order,
    }));

    const smallWins: DreamTemplate["small_wins"] = [];
    for (const bw of roadmap.bigWins) {
      const skills = roadmap.smallWins.flatMap((c) => c.skills);
      skills.forEach((s, i) => {
        smallWins.push({
          big_win_title: bw.title,
          title: s.name,
          description: s.description,
          order: i + 1,
        });
      });
    }

    const habits = roadmap.dailyWins.flatMap((c) => c.habits);
    const dreamSkillActivities = habits.map((h) => h.title);

    const ageRange = guessAgeRange(roadmap.category);

    templates[slug] = {
      slug,
      title: roadmap.title,
      emoji: roadmap.emoji,
      color: roadmap.color,
      category: roadmap.category,
      duration: roadmap.duration,
      description: buildAgeDescription(roadmap, ageRange),
      why_matters: roadmap.dream.whyMatters,
      career_options: roadmap.dream.careerPossibilities,
      success_examples: roadmap.dream.successExamples.map((ex) => {
        if (typeof ex === "string") return { name: ex, role: "", story: "" };
        return ex as { name: string; role: string; story: string };
      }),
      big_wins: bigWins,
      small_wins: smallWins,
      daily_activities: {
        spiritual: buildDailySpiritual(roadmap.title),
        physical: buildDailyPhysical(roadmap.title, roadmap.category),
        knowledge: buildDailyKnowledge(roadmap.title),
        social: buildDailySocial(roadmap.title),
        character: buildDailyCharacter(roadmap.title),
        dream_skill: dreamSkillActivities,
      },
      alternative_futures: roadmap.alternativeFutures.map((af) => ({
        title: af.title,
        description: af.description,
        skills: af.skills,
      })),
      min_age: ageRange.min,
      max_age: ageRange.max,
    };
  }

  for (const t of ADDITIONAL_TEMPLATES) {
    templates[t.slug] = t;
  }

  return templates;
}

export const DREAM_TEMPLATES = buildDreamTemplates();

export function getDreamTemplate(slug: string): DreamTemplate | undefined {
  return DREAM_TEMPLATES[slug];
}

export function getAllDreamTemplates(): DreamTemplate[] {
  return Object.values(DREAM_TEMPLATES);
}

export function getTemplatesForAge(age: number): DreamTemplate[] {
  return Object.values(DREAM_TEMPLATES).filter(
    (t) => (t.min_age ?? 0) <= age && (t.max_age ?? 99) >= age
  );
}
