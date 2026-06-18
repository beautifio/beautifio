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
      .eq("status", "active")
      .order("activated_at", { ascending: false });

    if (error) {
      console.error("GET /api/familia/vouchers/active:", error);
      return NextResponse.json({ error: "Failed to fetch active vouchers" }, { status: 500 });
    }

    // auto-expire any that are past expiry
    const now = new Date();
    const expiredIds = (data || [])
      .filter((s) => new Date(s.expires_at) < now)
      .map((s) => s.id);

    if (expiredIds.length > 0) {
      await supabase
        .from("familia_voucher_sessions")
        .update({ status: "expired" })
        .in("id", expiredIds);
    }

    const active = (data || []).filter((s) => new Date(s.expires_at) >= now);

    return NextResponse.json({ data: active });
  } catch (error) {
    console.error("GET /api/familia/vouchers/active:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
