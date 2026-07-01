import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || admin.role !== "superadmin") return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET /api/admin/opportunities:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.title || !body.category || !body.organization || !body.deadline) {
      return NextResponse.json({ error: "title, category, organization, deadline required" }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        title: body.title, category: body.category, organization: body.organization,
        deadline: body.deadline, slug,
        description: body.description || null,
        url: body.url || null,
        location: body.location || null,
        type: body.type || "full-time",
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("POST /api/admin/opportunities:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, title, category, organization, deadline, description, url, location, type, is_active, is_featured } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update: Record<string, any> = {};
    if (title !== undefined) {
      update.title = title;
      // Regenerate slug when title changes
      update.slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now().toString(36);
    }
    if (category !== undefined) update.category = category;
    if (organization !== undefined) update.organization = organization;
    if (deadline !== undefined) update.deadline = deadline;
    if (description !== undefined) update.description = description;
    if (url !== undefined) update.url = url;
    if (location !== undefined) update.location = location;
    if (type !== undefined) update.type = type;
    if (is_active !== undefined) update.is_active = is_active;
    if (is_featured !== undefined) update.is_featured = is_featured;

    const { data, error } = await supabase
      .from("opportunities")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("PATCH /api/admin/opportunities:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/opportunities:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
