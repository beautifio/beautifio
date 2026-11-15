import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/server-auth";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const user = await getServerUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin" || admin?.role === "redaksi";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // An invalid UUID must not reach Postgres: PostgREST would raise
  // `invalid input syntax for type uuid`, which surfaced as a 5xx.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "ID event tidak valid" }, { status: 400 });
  }

  const { data: regs, error } = await supabase.from("event_registrations")
    .select("*, user:users(full_name, email)")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: regs || [] });
}
