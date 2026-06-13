import { createClient } from "@supabase/supabase-js";

const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdmx0cXZxa2JheWt1YXp3ZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAyMzcxOSwiZXhwIjoyMDk2NTk5NzE5fQ.pUsTll51zIxiOvWknQHc-GzY_88AQDBtWcbbA6gnCAI";
const URL = "https://sivltqvqkbaykuazwdja.supabase.co";

const supabase = createClient(URL, SERVICE_ROLE_KEY);

async function seed() {
  const { count } = await supabase
    .from("dream_templates")
    .select("*", { count: "exact", head: true });

  console.log(`Current dream_templates count: ${count}`);

  if (count && count > 0) {
    console.log("Templates already seeded, skipping.");
    return;
  }

  const { buildDreamTemplates } = await import("./packages/utils/src/dream-templates");
  const templates = buildDreamTemplates();
  const entries = Object.values(templates);

  for (const t of entries) {
    const { error } = await supabase.from("dream_templates").insert({
      slug: t.slug,
      title: t.title,
      emoji: t.emoji,
      color: t.color,
      category: t.category,
      duration: t.duration,
      description: t.description,
      why_matters: t.why_matters,
      career_options: t.career_options,
      success_examples: t.success_examples as any,
      big_wins: t.big_wins as any,
      small_wins: t.small_wins as any,
      daily_activities: t.daily_activities as any,
      alternative_futures: t.alternative_futures as any,
      min_age: t.min_age ?? 0,
      max_age: t.max_age ?? 99,
    });

    if (error) {
      console.error(`Failed to insert ${t.slug}:`, error.message);
    } else {
      console.log(`✓ Inserted ${t.slug} (${t.title})`);
    }
  }

  const { count: final } = await supabase
    .from("dream_templates")
    .select("*", { count: "exact", head: true });
  console.log(`\nTotal templates seeded: ${final}`);
}

seed().catch(console.error);
