import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile?.role || !["admin","superadmin","redaksi"].includes(profile.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch counts from various sources
  const [viewRes, clickRes, sessionsRes, claimsListRes] = await Promise.allSettled([
    supabase.from("familia_merchant_events").select("merchant_id, event").eq("event", "view"),
    supabase.from("familia_merchant_events").select("merchant_id, event").eq("event", "click"),
    supabase.from("familia_voucher_sessions").select("id, merchant_id, user_id, voucher_code, status, activated_at, redeemed_at, expires_at"),
    supabase.from("familia_voucher_sessions")
      .select("id, user_id, voucher_code, status, activated_at, merchant:familia_merchants(name)")
      .order("activated_at", { ascending: false })
      .limit(100),
  ]);

  const views = viewRes.status === "fulfilled" ? (viewRes.value.data ?? []) : [];
  const clicks = clickRes.status === "fulfilled" ? (clickRes.value.data ?? []) : [];
  const sessions = sessionsRes.status === "fulfilled" ? (sessionsRes.value.data ?? []) : [];
  const claimsList = claimsListRes.status === "fulfilled" ? (claimsListRes.value.data ?? []) : [];

  // Aggregate per merchant
  const merchantMap: Record<string, MerchantStats> = {};
  views.forEach((v: any) => {
    if (!merchantMap[v.merchant_id]) initMerchant(v.merchant_id);
    merchantMap[v.merchant_id].views++;
  });
  clicks.forEach((c: any) => {
    if (!merchantMap[c.merchant_id]) initMerchant(c.merchant_id);
    merchantMap[c.merchant_id].clicks++;
  });
  sessions.forEach((s: any) => {
    if (!merchantMap[s.merchant_id]) initMerchant(s.merchant_id);
    merchantMap[s.merchant_id].claims++;
    if (s.status === "redeemed") merchantMap[s.merchant_id].redeemed++;
    if (s.status === "expired") merchantMap[s.merchant_id].expired++;
  });

  function initMerchant(id: string) {
    merchantMap[id] = { id, name: "", category: "", views: 0, clicks: 0, claims: 0, redeemed: 0, expired: 0 };
  }

  // Fetch merchant names
  const merchantIds = Object.keys(merchantMap);
  if (merchantIds.length > 0) {
    const { data: merchants } = await supabase
      .from("familia_merchants")
      .select("id, name, category")
      .in("id", merchantIds);
    (merchants ?? []).forEach((m: any) => {
      if (merchantMap[m.id]) {
        merchantMap[m.id].name = m.name;
        merchantMap[m.id].category = m.category;
      }
    });
  }

  // Fetch user emails for claims list
  const userIds = [...new Set(claimsList.map((c: any) => c.user_id))];
  const emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    try {
      // Try loading users table
      const { data: usersData } = await supabase.from("users").select("id, email").in("id", userIds);
      (usersData ?? []).forEach((u: any) => { emailMap[u.id] = u.email || u.id; });
    } catch {}
  }

  const data = {
    total_views: views.length,
    total_clicks: clicks.length,
    total_claims: sessions.filter((s: any) => s.status !== "expired").length,
    total_redeemed: sessions.filter((s: any) => s.status === "redeemed").length,
    total_expired: sessions.filter((s: any) => s.status === "expired").length,
    merchants: Object.values(merchantMap).filter((m) => m.name),
    claims: claimsList.map((c: any) => ({
      user_email: emailMap[c.user_id] || c.user_id?.slice(0, 8) || "anon",
      voucher_code: c.voucher_code,
      merchant_name: (c.merchant as any)?.name || "-",
      claimed_at: c.activated_at,
      status: c.status,
    })),
  };

  return NextResponse.json({ data });
}

interface Stats {
  total_views: number;
  total_clicks: number;
  total_claims: number;
  total_redeemed: number;
  total_expired: number;
  merchants: MerchantStats[];
  claims: any[];
}

interface MerchantStats {
  id: string;
  name: string;
  category: string;
  views: number;
  clicks: number;
  claims: number;
  redeemed: number;
  expired: number;
}
