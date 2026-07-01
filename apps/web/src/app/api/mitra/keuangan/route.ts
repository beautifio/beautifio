import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DOKU_RATE = 0.029; const DOKU_FIXED = 2000;
const PPN_RATE = 0.11; const PLATFORM_RATE = 0.15;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "psychologist") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const year = parseInt(request.nextUrl.searchParams.get("tahun") || "") || new Date().getFullYear();

  const { data: sessions } = await supabase.from("consultation_sessions")
    .select("id, net_price, status, created_at")
    .eq("psychologist_id", user.id)
    .in("status", ["paid", "scheduled", "active", "completed"])
    .gte("created_at", `${year}-01-01`)
    .lte("created_at", `${year + 1}-01-01`)
    .order("created_at", { ascending: true });

  const completed = (sessions || []).filter(s => s.status !== "scheduled");
  let totalBruto = 0, totalDoku = 0, totalPPN = 0, totalPlatform = 0, totalNett = 0;

  completed.forEach(s => {
    const nett = s.net_price || 0;
    if (!nett) return;
    const ppn = Math.round(nett * PPN_RATE);
    const bruto = nett + ppn;
    const doku = Math.round(bruto * DOKU_RATE + DOKU_FIXED);
    const platform = Math.round(nett * PLATFORM_RATE);
    totalBruto += bruto; totalDoku += doku; totalPPN += ppn;
    totalPlatform += platform; totalNett += nett + ppn - doku - platform;
  });

  const monthly: any[] = [];
  for (let m = 0; m < 12; m++) {
    const prefix = `${year}-${String(m + 1).padStart(2, "0")}`;
    const ms = completed.filter(s => s.created_at?.startsWith(prefix));
    let mBruto = 0; ms.forEach(s => { const n = s.net_price || 0; if (n) mBruto += n + Math.round(n * PPN_RATE); });
    monthly.push({ month: prefix, bruto: mBruto, count: ms.length });
  }

  return NextResponse.json({
    summary: { bruto: totalBruto, doku: totalDoku, ppn: totalPPN, platformFee: totalPlatform, nett: totalNett, totalSessions: completed.length },
    monthly,
  });
}
