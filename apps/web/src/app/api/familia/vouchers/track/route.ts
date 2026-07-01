import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { merchant_id, event } = await request.json();
  if (!merchant_id || !event) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Record tracking event — view or click
  if (event === "view" || event === "click") {
    // Simple approach: insert into a tracking log
    // Falls back silently if table doesn't exist yet
    try {
      await supabase.from("familia_merchant_events").insert({
        merchant_id,
        user_id: user.id,
        event,
      });
    } catch {
      // Table may not exist yet — ignore
    }
  }

  return NextResponse.json({ success: true });
}
