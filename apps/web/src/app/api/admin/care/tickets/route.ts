import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["admin", "superadmin"].includes(admin.role)) return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("beautifio_care_tickets")
      .select("*, users:user_id(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET /api/admin/care/tickets:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status, assigned_to, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, any> = {};

    if (status) {
      update.status = status;
      if (status === "in_progress") update.assigned_at = new Date().toISOString();
      if (status === "resolved" || status === "closed") update.resolved_at = new Date().toISOString();
    }
    if (assigned_to !== undefined) update.assigned_to = assigned_to || null;
    if (notes !== undefined) update.notes = notes;

    const { error } = await supabase
      .from("beautifio_care_tickets")
      .update(update)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/care/tickets:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
