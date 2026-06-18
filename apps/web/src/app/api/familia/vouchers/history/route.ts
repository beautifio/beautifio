import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("familia_voucher_sessions")
      .select("*, merchant:familia_merchants(id, name, category, logo_url)")
      .eq("user_id", user.id)
      .in("status", ["redeemed", "expired"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("GET /api/familia/vouchers/history:", error);
      return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("GET /api/familia/vouchers/history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
