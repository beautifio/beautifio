import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkSuperadmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "superadmin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await checkSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("users")
      .select("id, email, full_name, role, status, is_verified, created_at, last_active_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("GET /api/admin/users:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await checkSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "email, password, full_name required" }, { status: 400 });
    }

    const validRoles = ["user", "mentor", "admin", "redaksi", "superadmin"];
    const userRole = validRoles.includes(role) ? role : "user";

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (authError) throw authError;

    const { error: updateError } = await supabase
      .from("users")
      .update({ role: userRole, is_verified: true, is_anonymous: false })
      .eq("id", authData.user.id);
    if (updateError) throw updateError;

    return NextResponse.json({ data: { id: authData.user.id, email, full_name, role: userRole } });
  } catch (error: any) {
    console.error("POST /api/admin/users:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
