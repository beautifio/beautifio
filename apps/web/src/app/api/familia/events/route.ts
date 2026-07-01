import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const { data, error } = await supabase
        .from("familia_event_benefits")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("familia_event_benefits")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true });

    if (error) return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
