import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("familia_achievement_rewards")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (error) {
      console.error("GET /api/familia/rewards:", error);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/rewards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { data, error } = await supabase.from("familia_achievement_rewards").insert({
      title: body.title,
      description: body.description || "",
      trigger_type: body.trigger_type,
      trigger_value: body.trigger_value || 1,
      reward_type: body.reward_type || "voucher",
      reward_description: body.reward_description || "",
      icon: body.icon || "Trophy",
      color: body.color || "from-emerald-500 to-teal-500",
      is_active: body.is_active ?? true,
    }).select().single();

    if (error) {
      console.error("POST /api/familia/rewards:", error);
      return NextResponse.json({ error: "Failed to create reward" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/familia/rewards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
