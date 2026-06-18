import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("GET /api/auth/me:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
