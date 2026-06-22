import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: posts, error: fetchError } = await supabase
      .from("articles")
      .select("id")
      .is("deleted_at", null)
      .eq("is_published", false)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) throw fetchError;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ published: 0 });
    }

    const ids = posts.map((p: any) => p.id);
    const { error: updateError } = await supabase
      .from("articles")
      .update({ is_published: true, scheduled_at: null })
      .in("id", ids);

    if (updateError) throw updateError;
    return NextResponse.json({ published: ids.length });
  } catch (error: any) {
    console.error("publish-scheduled:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
