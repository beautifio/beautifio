import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DOKU_RATE = 0.029; const DOKU_FIXED = 2000;
const PPN_RATE = 0.11; const PPH_UMKM = 0.005; const PPH_JASA = 0.02;
const PLATFORM_RATE = 0.15;

function calc(nett: number): { ppn: number; bruto: number; doku: number; pph: number; platformFee: number; nettFinal: number } {
  const ppn = Math.round(nett * PPN_RATE);
  const bruto = nett + ppn;
  const doku = Math.round(bruto * DOKU_RATE + DOKU_FIXED);
  const platformFee = Math.round(nett * PLATFORM_RATE);
  const pph = Math.round(platformFee * PPH_JASA); // special for consultation
  const nettFinal = bruto - doku - ppn;
  return { ppn, bruto, doku, pph: Math.round(bruto * PPH_UMKM), platformFee, nettFinal };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "superadmin", "redaksi"].includes(profile.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const year = parseInt(params.get("tahun") || "") || new Date().getFullYear();
  const month = params.get("bulan") ? parseInt(params.get("bulan")!) : null;

  // Build date filter
  let startDate = new Date(year, 0, 1).toISOString();
  let endDate = new Date(year + 1, 0, 1).toISOString();
  if (month) { startDate = new Date(year, month - 1, 1).toISOString(); endDate = new Date(year, month, 1).toISOString(); }


  // Fetch data
  const [subsRes, eventsRes, consRes] = await Promise.all([
    supabase.from("user_subscriptions").select("id, plan:subscription_plans(price_idr,name), payment_ref, created_at").eq("status", "active").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("event_registrations").select("id, invoice_id, event:familia_event_benefits(price), created_at").eq("status", "confirmed").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("consultation_sessions").select("id, psychologist_id, psychologist:psychologists(full_name), net_price, status, created_at").in("status", ["paid","scheduled","active","completed"]).gte("created_at", startDate).lte("created_at", endDate),
  ]);

  let totalBruto = 0, totalDoku = 0, totalPpn = 0, totalPph = 0, totalPlatformFee = 0, totalNett = 0, totalPiutang = 0;
  const monthly: any[] = [];
  const bySource: any = {};
  const allTransactions: any[] = [];
  const mitraMap: Record<string, any> = {};

  // Process subscriptions
  const subs = subsRes.data || [];
  let subBruto = 0, subDoku = 0, subPpn = 0, subPph = 0, subNett = 0;
  subs.forEach((s: any) => {
    const nett = s.plan?.price_idr || 0;
    if (!nett) return;
    const c = calc(nett);
    subBruto += c.bruto; subDoku += c.doku; subPpn += c.ppn; subPph += c.pph; subNett += c.nettFinal;
    allTransactions.push({ date: s.created_at, type: "Subscription", invoice: s.payment_ref, ref: s.plan?.name, nett, ...c });
  });
  bySource.subscription = { count: subs.length, bruto: subBruto, doku: subDoku, ppn: subPpn, pph: subPph, nett: subNett };

  // Process events
  const events = eventsRes.data || [];
  let evtBruto = 0, evtDoku = 0, evtPpn = 0, evtPph = 0, evtNett = 0;
  events.forEach((e: any) => {
    const nett = e.event?.price || 0;
    if (!nett) return;
    const c = calc(nett);
    evtBruto += c.bruto; evtDoku += c.doku; evtPpn += c.ppn; evtPph += c.pph; evtNett += c.nettFinal;
    allTransactions.push({ date: e.created_at, type: "Event", invoice: e.invoice_id, nett, ...c });
  });
  bySource.event = { count: events.length, bruto: evtBruto, doku: evtDoku, ppn: evtPpn, pph: evtPph, nett: evtNett };

  // Process consultations
  const cons = consRes.data || [];
  let conBruto = 0, conDoku = 0, conPpn = 0, conPph = 0, conPlat = 0, conNett = 0;
  cons.forEach((cItem: any) => {
    const nett = cItem.net_price || 0;
    if (!nett) return;
    const c = calc(nett);
    c.pph = Math.round(c.platformFee * PPH_JASA);
    c.nettFinal = c.bruto - c.doku - c.ppn;
    conBruto += c.bruto; conDoku += c.doku; conPpn += c.ppn; conPph += c.pph; conPlat += c.platformFee; conNett += c.nettFinal;
    allTransactions.push({ date: cItem.created_at, type: "Konsultasi", invoice: cItem.id?.slice(0, 8), nett, ...c });

    const psyId = cItem.psychologist_id;
    const psyName = (cItem.psychologist as any)?.full_name || "Unknown";
    if (!mitraMap[psyId]) mitraMap[psyId] = { name: psyName, sessions: 0, bruto: 0, doku: 0, platFee: 0, bagian: 0, status: "Belum Dibayar" };
    mitraMap[psyId].sessions++;
    mitraMap[psyId].bruto += c.bruto; mitraMap[psyId].doku += c.doku; mitraMap[psyId].platFee += c.platformFee;
    mitraMap[psyId].bagian += nett + c.ppn - c.doku - c.platformFee;
    totalPiutang += nett + c.ppn - c.doku - c.platformFee;
  });
  bySource.consultation = { count: cons.length, bruto: conBruto, doku: conDoku, ppn: conPpn, pph: conPph, platformFee: conPlat, nett: conNett };

  totalBruto = subBruto + evtBruto + conBruto;
  totalDoku = subDoku + evtDoku + conDoku;
  totalPpn = subPpn + evtPpn + conPpn;
  totalPph = subPph + evtPph + conPph;
  totalPlatformFee = conPlat;
  totalNett = subNett + evtNett + conNett;

  // Build monthly data
  for (let m = 0; m < 12; m++) {
    const mStart = new Date(year, m, 1).toISOString().slice(0, 7);
    const mSubs = subs.filter((s: any) => s.created_at?.startsWith(mStart));
    const mEvts = events.filter((e: any) => e.created_at?.startsWith(mStart));
    const mCons = cons.filter((c: any) => c.created_at?.startsWith(mStart));
    let mBruto = 0;
    mSubs.forEach((s: any) => { if (s.plan?.price_idr) mBruto += calc(s.plan.price_idr).bruto; });
    mEvts.forEach((e: any) => { if (e.event?.price) mBruto += calc(e.event.price).bruto; });
    mCons.forEach((c: any) => { if (c.net_price) mBruto += calc(c.net_price).bruto; });
    monthly.push({ month: mStart, bruto: mBruto, subs: mSubs.length, events: mEvts.length, cons: mCons.length });
  }

  return NextResponse.json({
    summary: { bruto: totalBruto, doku: totalDoku, ppn: totalPpn, pph: totalPph, platformFee: totalPlatformFee, nett: totalNett, piutang: totalPiutang },
    monthly,
    bySource,
    piutang: Object.entries(mitraMap).map(([id, data]) => ({ id, ...data })),
    transactions: allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50),
  });
}
