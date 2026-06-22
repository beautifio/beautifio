import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createRouteClient>;

async function checkRole(supabase: Supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["redaksi", "superadmin"].includes(admin.role)) return null;
  return user;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createRouteClient(request);
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
    if (body.author_name !== undefined) updateData.author = body.author_name;
    if (body.initials !== undefined) updateData.initials = body.initials;
    if (body.read_time_minutes !== undefined) updateData.read_time_minutes = body.read_time_minutes;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description;
    if (body.og_image !== undefined) updateData.og_image = body.og_image;
    if (body.status !== undefined) {
      updateData.is_published = body.status === "published";
    }

    const { data, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("PATCH /api/admin/konten/posts/[id]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createRouteClient(request);
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/konten/posts/[id]:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
