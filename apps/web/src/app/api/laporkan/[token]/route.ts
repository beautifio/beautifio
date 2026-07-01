import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { token } = await params;

  const { data: merchant } = await supabase
    .from("familia_merchants")
    .select("id, name, category, daily_pin")
    .eq("report_token", token)
    .single();

  if (!merchant) return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });

  return NextResponse.json({ name: merchant.name, category: merchant.category });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { token } = await params;
  const { pin } = await request.json();

  if (!pin || pin.length !== 4) return NextResponse.json({ error: "PIN 4 digit" }, { status: 400 });

  const { data: merchant } = await supabase
    .from("familia_merchants")
    .select("id, name, category, daily_pin")
    .eq("report_token", token)
    .single();

  if (!merchant) return NextResponse.json({ error: "Token tidak valid" }, { status: 404 });
  if (merchant.daily_pin !== pin) return NextResponse.json({ error: "PIN salah" }, { status: 401 });

  // Fetch stats
  const [viewRes, clickRes, sessionsRes] = await Promise.allSettled([
    supabase.from("familia_merchant_events").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id).eq("event", "view"),
    supabase.from("familia_merchant_events").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id).eq("event", "click"),
    supabase.from("familia_voucher_sessions")
      .select("id, voucher_code, status, activated_at")
      .eq("merchant_id", merchant.id)
      .order("activated_at", { ascending: false })
      .limit(50),
  ]);

  const totalViews = viewRes.status === "fulfilled" ? (viewRes.value.count ?? 0) : 0;
  const totalClicks = clickRes.status === "fulfilled" ? (clickRes.value.count ?? 0) : 0;
  const sessions = sessionsRes.status === "fulfilled" ? (sessionsRes.value.data ?? []) : [];
  const totalClaims = sessions.filter((s: any) => s.status !== "expired").length;
  const totalRedeemed = sessions.filter((s: any) => s.status === "redeemed").length;
  const totalExpired = sessions.filter((s: any) => s.status === "expired").length;

  return NextResponse.json({
    name: merchant.name,
    category: merchant.category,
    stats: {
      total_views: totalViews,
      total_clicks: totalClicks,
      total_claims: totalClaims,
      total_redeemed: totalRedeemed,
      total_expired: totalExpired,
    },
    claims: sessions.map((s: any) => ({
      voucher_code: s.voucher_code,
      status: s.status,
      activated_at: s.activated_at,
    })),
  });
}
