import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("familia_event_benefits")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("GET /api/familia/events:", error);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
