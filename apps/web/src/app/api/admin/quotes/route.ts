import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRedaksiOrSuperadmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "redaksi" || admin?.role === "superadmin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    if (includeInactive && !(await checkRedaksiOrSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let query = supabase.from("quotes").select("*").order("created_at", { ascending: false });
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("GET /api/admin/quotes:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await checkRedaksiOrSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();
    const { content, author, category } = body;

    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        content,
        author: author || "",
        category: category || "umum",
        created_by: user!.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("POST /api/admin/quotes:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await checkRedaksiOrSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, content, author, category, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const update: Record<string, any> = {};
    if (content !== undefined) update.content = content;
    if (author !== undefined) update.author = author;
    if (category !== undefined) update.category = category;
    if (is_active !== undefined) update.is_active = is_active;

    const { error } = await supabase.from("quotes").update(update).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ data: { id, ...update } });
  } catch (error: any) {
    console.error("PATCH /api/admin/quotes:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await checkRedaksiOrSuperadmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error: any) {
    console.error("DELETE /api/admin/quotes:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
