import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkSuperadmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "superadmin";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status } = body;

    const update: Record<string, any> = {};
    if (role) {
      const validRoles = ["user", "mentor", "admin", "redaksi", "superadmin"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      update.role = role;
    }
    if (status) {
      const validStatuses = ["active", "suspended", "banned"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
    }

    const { error } = await supabase.from("users").update(update).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ data: { id, ...update } });
  } catch (error: any) {
    console.error("PATCH /api/admin/users/[id]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
