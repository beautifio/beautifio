import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("familia_redemption_log")
      .select("*, merchant:familia_merchants(id, name)")
      .order("redeemed_at", { ascending: false })
      .limit(limit);

    if (status && ["success", "invalid_pin", "expired", "duplicate"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/admin/familia/redemption-log:", error);
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("GET /api/admin/familia/redemption-log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
