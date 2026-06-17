import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sivltqvqkbaykuazwdja.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdmx0cXZxa2JheWt1YXp3ZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjM3MTksImV4cCI6MjA5NjU5OTcxOX0.EQHzjHuaFRL6JcDuM4H8O0qxXemtJxVWoG_Y3FZ9ZLc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const slugsToDelete = ["runner", "athlete", "golfer"];
  const { data, error } = await supabase
    .from("dream_templates")
    .delete()
    .in("slug", slugsToDelete);

  if (error) {
    console.error("Delete error:", error.message);
    process.exit(1);
  }

  const { count, error: countError } = await supabase
    .from("dream_templates")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count error:", countError.message);
    process.exit(1);
  }

  console.log(`Remaining templates: ${count}`);
}

main();
