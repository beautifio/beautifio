import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { hashPassword } from "@/lib/auth/password";

async function checkSuperadmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const user = await getServerUser();
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

    // Custom JWT auth: create user directly in users table with hashed password.
    const passwordHash = await hashPassword(password);
    const { data: created, error: createError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        full_name,
        password_hash: passwordHash,
        role: userRole,
        is_verified: true,
      })
      .select("id")
      .single();
    if (createError) throw createError;

    return NextResponse.json({ data: { id: created.id, email, full_name, role: userRole } });
  } catch (error: any) {
    console.error("POST /api/admin/users:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
