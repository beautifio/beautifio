import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin" || admin?.role === "redaksi";
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        category: body.category,
        partner_name: body.partner_name,
        partner_url: body.partner_url,
        platform: body.platform,
        goal_category: body.goal_category,
        is_featured: body.is_featured,
        is_active: body.is_active,
        hot_deal_order: body.hot_deal_order ?? null,
        hot_deal_expires: body.hot_deal_expires ?? null,
        partners: body.partners ?? undefined,
      };
      if (body.slug) updateData.slug = body.slug;

    const { data, error } = await supabase
      .from("familia_affiliate_deals")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("PUT /api/familia/deals/[id]:", error);
      return NextResponse.json({ error: error.message || "Failed to update deal" }, { status: 500 });
    }
    return NextResponse.json({ data: data?.[0] ?? data });
  } catch (error) {
    console.error("PUT /api/familia/deals/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await supabase.from("familia_affiliate_deals").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/familia/deals/[id]:", error);
      return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/familia/deals/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
