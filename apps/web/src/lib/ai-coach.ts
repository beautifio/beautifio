import { supabase } from "@/lib/supabase/client";
import { getJourneyProgress } from "@/lib/journey-queries";

/* ─── Fungsi 1: Pivot Coaching ─── */

export async function getPivotCoachMessage(
  oldTemplateSlug: string
): Promise<{ message: string; transferableSkills: string[] }> {
  if (!supabase) return { message: "Setiap langkah yang sudah kamu ambil tetap berharga.", transferableSkills: [] };
  const { data: template } = await supabase
    .from("dream_templates")
    .select("title, alternative_futures")
    .eq("slug", oldTemplateSlug)
    .single();

  if (!template) {
    return {
      message: "Setiap langkah yang sudah kamu ambil tetap berharga.",
      transferableSkills: [],
    };
  }

  const futures = (template.alternative_futures || []) as Array<{
    title: string;
    skills: string[];
  }>;

  const allSkills = futures.flatMap((f) => f.skills || []);
  const uniqueSkills = [...new Set(allSkills)].slice(0, 4);

  return {
    message: `Kamu sudah membangun fondasi penting selama perjalanan ${template.title}. Skill ini nggak hilang — tetap berguna di jalur manapun yang kamu pilih selanjutnya.`,
    transferableSkills: uniqueSkills,
  };
}

/* ─── Fungsi 2: Failure Reframe ─── */

const REFRAME_MESSAGES = [
  "Ini bukan akhir, ini data baru untuk langkah berikutnya.",
  "Setiap orang yang berhasil pernah reschedule rencananya. Kamu nggak sendirian.",
  "Progress nggak harus lurus. Yang penting kamu tetap di jalur, meski pelan.",
  "Gagal di satu percobaan bukan berarti gagal di perjalanan keseluruhan.",
];

export function getFailureReframeMessage(): {
  message: string;
  articleSlug: string;
} {
  const message = REFRAME_MESSAGES[Math.floor(Math.random() * REFRAME_MESSAGES.length)];

  const articleSlugs = [
    "kegagalan-adalah-bagian-dari-proses-pivot",
    "mindset-entrepreneur-dari-gagal-ke-sukses",
  ];
  const articleSlug = articleSlugs[Math.floor(Math.random() * articleSlugs.length)];

  return { message, articleSlug };
}

/* ─── Fungsi 3: Status di Jalur (Benchmark Comparison) ─── */

export async function getBenchmarkStatusMessage(
  userId: string,
  journeyId: string
): Promise<{
  status: "ahead" | "on_track" | "behind" | "unknown";
  message: string;
} | null> {
  if (!supabase) return null;

  const { data: journey } = await supabase
    .from("dream_journeys")
    .select("template_slug, current_phase_number")
    .eq("id", journeyId)
    .single();

  if (!journey) return null;

  const { data: phase } = await supabase
    .from("dream_phases")
    .select("industry_benchmark, over_achievement, behind_schedule_signal")
    .eq("dream_template_slug", journey.template_slug)
    .eq("phase_number", journey.current_phase_number)
    .single();

  if (!phase) return null;

  try {
    const progress = await getJourneyProgress(userId, journeyId);
    const total = progress.small_wins_total;
    const completed = progress.small_wins_completed;
    const percentage = total > 0 ? (completed / total) * 100 : undefined;

    if (percentage === undefined) {
      return {
        status: "unknown",
        message: phase.industry_benchmark || "Terus lanjutkan progresmu!",
      };
    }

    if (percentage > 70) {
      return {
        status: "ahead",
        message:
          phase.over_achievement ||
          "Kamu di atas rata-rata! Keren banget.",
      };
    }

    if (percentage < 30) {
      return {
        status: "behind",
        message:
          phase.behind_schedule_signal ||
          "Yuk tingkatkan sedikit lagi konsistensimu.",
      };
    }

    return {
      status: "on_track",
      message: phase.industry_benchmark || "Kamu di jalur yang baik.",
    };
  } catch {
    return {
      status: "unknown",
      message: phase.industry_benchmark || "Terus lanjutkan progresmu!",
    };
  }
}
