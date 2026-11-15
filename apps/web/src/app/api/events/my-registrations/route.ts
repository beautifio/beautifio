import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/server-auth";

export async function GET() {
  const supabase = await createClient();
  const user = await getServerUser();
  if (!user) return NextResponse.json({ data: [] });

  const { data, error } = await supabase.from("event_registrations")
    .select("*, event:familia_event_benefits(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: data || [] });
}
