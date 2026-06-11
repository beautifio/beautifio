import type {
  DailyActivity,
  DailyActivityDimension,
  DreamJourney,
  SpiritualPreferences,
} from "@beautifio/types";
import { SPIRITUAL_PRACTICES } from "./life-engine-seed";
import { getDreamTemplate } from "./dream-templates";

export interface GenerateDailyOptions {
  journey: DreamJourney;
  spiritualPref?: SpiritualPreferences | null;
  date?: string;
}

const GENERIC_ACTIVITIES: Record<DailyActivityDimension, string[]> = {
  spiritual: ["Luangkan waktu refleksi diri 10 menit", "Bersyukur pada hal-hal baik hari ini"],
  physical: ["Jalan 10 menit", "Minum air putih 8 gelas"],
  knowledge: ["Baca artikel inspiratif", "Belajar hal baru selama 15 menit"],
  social: ["Sapa teman atau keluarga", "Bantu seseorang hari ini"],
  character: ["Selesaikan satu tugas yang ditunda", "Tulis satu hal yang disyukuri"],
  dream_skill: ["Latihan keterampilan mimpimu 20 menit"],
};

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
      spiritualPref
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
    });
  }

  return activities;
}

function getActivitiesForDimension(
  dimension: DailyActivityDimension,
  template: ReturnType<typeof getDreamTemplate> | undefined,
  spiritualPref: SpiritualPreferences | null | undefined
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

  if (template?.daily_activities) {
    const templateActivities = template.daily_activities[dimension];
    if (templateActivities && templateActivities.length > 0) {
      return templateActivities;
    }
  }

  return GENERIC_ACTIVITIES[dimension];
}
