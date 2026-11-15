import { NextRequest, NextResponse } from "next/server";
import { runBeautifioTrendEngine } from "@/lib/content/trend-engine";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/server-auth";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getServerUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Role read from the DB (not the JWT) so a role change takes effect immediately.
  if (!user.role || !["admin", "superadmin", "redaksi"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { topic } = await req.json();
  try {
    const result = await runBeautifioTrendEngine(topic);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
