import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const regId = request.nextUrl.searchParams.get("reg");
  if (!regId) return NextResponse.json({ error: "Missing reg id" }, { status: 400 });

  const { data: reg } = await supabase.from("event_registrations")
    .select("*, event:familia_event_benefits(title, event_date, location, price, image_url)")
    .eq("id", regId)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .single();

  if (!reg) return NextResponse.json({ error: "Not found or not confirmed" }, { status: 404 });

  return NextResponse.json({ data: reg });
}
