import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin" || admin?.role === "redaksi";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const action = request.nextUrl.searchParams.get("action");
  const q = request.nextUrl.searchParams.get("q");

  if (action === "searchUsers" && q) {
    const { data: users } = await supabase.from("users")
      .select("id, email, full_name")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(10);
    return NextResponse.json({ users: users || [] });
  }

  if (action === "listVouchers") {
    const { data: vouchers } = await supabase.from("subscription_vouchers").select("*").order("created_at", { ascending: false });
    return NextResponse.json({ vouchers: vouchers || [] });
  }

  if (action === "stats") {
    const [activeRes, allRes, voucherRes, trialRes, topVoucherRes] = await Promise.all([
      supabase.from("user_subscriptions").select("plan:subscription_plans(tier,price_idr,duration_type)").eq("status", "active"),
      supabase.from("user_subscriptions").select("plan:subscription_plans(tier,price_idr,duration_type,original_price_idr)"),
      supabase.from("subscription_vouchers").select("code, used_count"),
      supabase.from("users").select("id").not("trial_expires_at", "is", null),
      supabase.from("subscription_vouchers").select("code, used_count").order("used_count", { ascending: false }).limit(5),
    ]);

    const active = activeRes.data || [];
    const byTier: Record<string, number> = { pro: 0, ultimate: 0 };
    let mrr = 0;
    active.forEach((s: any) => {
      const plan = s.plan as any;
      if (!plan) return;
      const tier = plan.tier || "pro";
      byTier[tier] = (byTier[tier] || 0) + 1;
      if (plan.duration_type === "yearly") mrr += (plan.price_idr || 0) / 12;
      else mrr += plan.price_idr || 0;
    });

    const all = allRes.data || [];
    let totalRevenue = 0;
    all.forEach((s: any) => {
      const plan = s.plan as any;
      totalRevenue += plan?.original_price_idr || plan?.price_idr || 0;
    });

    return NextResponse.json({
      activeTotal: active.length,
      byPro: byTier.pro || 0,
      byUltimate: byTier.ultimate || 0,
      mrr: Math.round(mrr),
      totalRevenue,
      trialUsers: (trialRes.data || []).length,
      totalSubs: all.length,
      topVouchers: (topVoucherRes.data || []).map((v: any) => ({ code: v.code, used: v.used_count || 0 })),
    });
  }

  // listAll
  const [plansRes, subsRes, settingsRes] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("display_order"),
    supabase.from("user_subscriptions").select("*, plan:subscription_plans(name), user:users(email, full_name)").order("created_at", { ascending: false }),
    supabase.from("app_settings").select("key, value").in("key", ["payment_bank_account", "payment_wa_link"]),
  ]);

  const settings: Record<string, string> = {};
  (settingsRes.data || []).forEach((s: any) => { settings[s.key] = s.value; });

  return NextResponse.json({
    plans: plansRes.data || [],
    subs: subsRes.data || [],
    settings,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "createPlan": {
        const { name, price_idr, original_price_idr, max_active_chats, duration_type, tier, features, is_active } = body;
        if (!name) return NextResponse.json({ error: "Nama wajib" }, { status: 400 });
        const { error } = await supabase.from("subscription_plans").insert({
          name, price_idr: price_idr || 0, original_price_idr: original_price_idr || null,
          max_active_chats: max_active_chats || 20,
          duration_type: duration_type || "monthly", tier: tier || "pro",
          features: JSON.stringify(features || []), is_active: is_active ?? true,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "updatePlan": {
        const { plan_id, name, price_idr, original_price_idr, max_active_chats, duration_type, tier, features, is_active } = body;
        if (!plan_id) return NextResponse.json({ error: "plan_id wajib" }, { status: 400 });
        const update: any = {};
        if (name !== undefined) update.name = name;
        if (price_idr !== undefined) update.price_idr = price_idr;
        if (original_price_idr !== undefined) update.original_price_idr = original_price_idr;
        if (max_active_chats !== undefined) update.max_active_chats = max_active_chats;
        if (duration_type !== undefined) update.duration_type = duration_type;
        if (tier !== undefined) update.tier = tier;
        if (features !== undefined) update.features = JSON.stringify(features);
        if (is_active !== undefined) update.is_active = is_active;
        const { error } = await supabase.from("subscription_plans").update(update).eq("id", plan_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "deletePlan": {
        const { plan_id } = body;
        if (!plan_id) return NextResponse.json({ error: "plan_id wajib" }, { status: 400 });
        const { error } = await supabase.from("subscription_plans").delete().eq("id", plan_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "createSub": {
        const { user_id, plan_id, duration_days, payment_ref } = body;
        if (!user_id || !plan_id) return NextResponse.json({ error: "User dan plan wajib" }, { status: 400 });
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (duration_days || 30) * 24 * 60 * 60 * 1000);
        const { error } = await supabase.from("user_subscriptions").insert({
          user_id, plan_id, status: "active",
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_ref: payment_ref || null,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "cancelSub": {
        const { sub_id } = body;
        if (!sub_id) return NextResponse.json({ error: "sub_id wajib" }, { status: 400 });
        const { error } = await supabase.from("user_subscriptions").update({ status: "cancelled" }).eq("id", sub_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "extendSub": {
        const { sub_id, days } = body;
        if (!sub_id || !days) return NextResponse.json({ error: "sub_id dan days wajib" }, { status: 400 });
        const { data: sub } = await supabase.from("user_subscriptions").select("expires_at, status").eq("id", sub_id).single();
        if (!sub) return NextResponse.json({ error: "Subscription tidak ditemukan" }, { status: 404 });
        const newExpiry = new Date(Math.max(new Date(sub.expires_at || Date.now()).getTime(), Date.now()) + days * 24 * 60 * 60 * 1000);
        const { error } = await supabase.from("user_subscriptions").update({
          expires_at: newExpiry.toISOString(),
          status: sub.status === "expired" ? "active" : sub.status,
        }).eq("id", sub_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "saveSetting": {
        const { key, value } = body;
        if (!key) return NextResponse.json({ error: "key wajib" }, { status: 400 });
        const { error } = await supabase.from("app_settings").upsert({ key, value }, { onConflict: "key" });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "createVoucher": {
        const { code, discount_type, discount_value, min_tier, max_uses, valid_from, valid_until, is_active } = body;
        if (!code || !discount_type || !discount_value) return NextResponse.json({ error: "Kode, tipe, dan nilai wajib" }, { status: 400 });
        const { error } = await supabase.from("subscription_vouchers").insert({
          code: code.trim().toUpperCase(), discount_type, discount_value: Number(discount_value),
          min_tier: min_tier || null, max_uses: max_uses || null,
          valid_from: valid_from || new Date().toISOString(), valid_until: valid_until || null,
          is_active: is_active ?? true,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "updateVoucher": {
        const { voucher_id, code, discount_type, discount_value, min_tier, max_uses, valid_from, valid_until, is_active } = body;
        if (!voucher_id) return NextResponse.json({ error: "voucher_id wajib" }, { status: 400 });
        const up: any = {};
        if (code !== undefined) up.code = code.trim().toUpperCase();
        if (discount_type !== undefined) up.discount_type = discount_type;
        if (discount_value !== undefined) up.discount_value = Number(discount_value);
        if (min_tier !== undefined) up.min_tier = min_tier || null;
        if (max_uses !== undefined) up.max_uses = max_uses || null;
        if (valid_from !== undefined) up.valid_from = valid_from;
        if (valid_until !== undefined) up.valid_until = valid_until || null;
        if (is_active !== undefined) up.is_active = is_active;
        const { error } = await supabase.from("subscription_vouchers").update(up).eq("id", voucher_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case "deleteVoucher": {
        const { voucher_id } = body;
        if (!voucher_id) return NextResponse.json({ error: "voucher_id wajib" }, { status: 400 });
        const { error } = await supabase.from("subscription_vouchers").delete().eq("id", voucher_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
