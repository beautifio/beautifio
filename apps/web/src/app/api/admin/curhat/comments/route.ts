import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["admin", "superadmin", "redaksi"].includes(admin.role)) return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("curhat_comments")
      .select("*, users:user_id(full_name, email), curhat_posts!inner(content)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET /api/admin/curhat/comments:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const { error } = await supabase
      .from("curhat_comments")
      .update({ status, moderated_by: user.id, moderated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/curhat/comments:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
