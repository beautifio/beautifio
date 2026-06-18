import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin";
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

    const { data, error } = await supabase
      .from("familia_achievement_rewards")
      .update({
        title: body.title,
        description: body.description,
        trigger_type: body.trigger_type,
        trigger_value: body.trigger_value,
        reward_type: body.reward_type,
        reward_description: body.reward_description,
        icon: body.icon,
        color: body.color,
        is_active: body.is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/familia/rewards/[id]:", error);
      return NextResponse.json({ error: "Failed to update reward" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT /api/familia/rewards/[id]:", error);
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
    const { error } = await supabase.from("familia_achievement_rewards").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/familia/rewards/[id]:", error);
      return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/familia/rewards/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
