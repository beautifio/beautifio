import type { DreamTemplate } from "@beautifio/types";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";

export function buildDreamTemplates(): Record<string, DreamTemplate> {
  const templates: Record<string, DreamTemplate> = {};

  for (const [slug, roadmap] of Object.entries(ROADMAP_V3_SEED)) {
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

    templates[slug] = {
      slug,
      title: roadmap.title,
      emoji: roadmap.emoji,
      color: roadmap.color,
      category: roadmap.category,
      duration: roadmap.duration,
      description: roadmap.dream.description,
      why_matters: roadmap.dream.whyMatters,
      career_options: roadmap.dream.careerPossibilities,
      success_examples: roadmap.dream.successExamples.map((ex) => {
        if (typeof ex === "string") return { name: ex, role: "", story: "" };
        return ex as { name: string; role: string; story: string };
      }),
      big_wins: bigWins,
      small_wins: smallWins,
      daily_activities: {
        spiritual: [],
        physical: ["Jalan 10 menit", "Minum air putih", "Stretching"],
        knowledge: ["Baca artikel tentang " + roadmap.title, "Tonton video edukasi"],
        social: ["Sapa teman", "Chat di komunitas"],
        character: ["Selesaikan satu tugas hari ini", "Tulis satu hal yang disyukuri"],
        dream_skill: dreamSkillActivities,
      },
      alternative_futures: roadmap.alternativeFutures.map((af) => ({
        title: af.title,
        description: af.description,
        skills: af.skills,
      })),
    };
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
