import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { code, tier, base_price } = await request.json();

  if (!code?.trim()) return NextResponse.json({ error: "Masukkan kode voucher" }, { status: 400 });
  if (!base_price || base_price <= 0) return NextResponse.json({ error: "Harga tidak valid" }, { status: 400 });

  const { data: voucher } = await supabase.from("subscription_vouchers")
    .select("*").eq("code", code.trim().toUpperCase()).eq("is_active", true).single();

  if (!voucher) return NextResponse.json({ error: "Kode voucher tidak ditemukan" }, { status: 404 });

  // Check expiry
  if (voucher.valid_until && new Date(voucher.valid_until + "T23:59:59.999Z") < new Date()) {
    return NextResponse.json({ error: "Voucher sudah kadaluarsa" }, { status: 400 });
  }
  if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
    return NextResponse.json({ error: "Voucher belum berlaku" }, { status: 400 });
  }

  // Check quota
  if (voucher.max_uses && voucher.used_count >= voucher.max_uses) {
    return NextResponse.json({ error: "Kuota voucher sudah habis" }, { status: 400 });
  }

  // Check min tier
  if (voucher.min_tier && tier && voucher.min_tier !== tier) {
    return NextResponse.json({ error: `Voucher ini hanya untuk ${voucher.min_tier === "ultimate" ? "Ultimate" : "Pro"}` }, { status: 400 });
  }

  // Calculate discount
  let discountAmount = 0;
  if (voucher.discount_type === "percentage") {
    discountAmount = Math.round(base_price * (Number(voucher.discount_value) / 100));
  } else {
    discountAmount = Number(voucher.discount_value);
  }
  const finalPrice = Math.max(0, base_price - discountAmount);

  return NextResponse.json({
    valid: true,
    code: voucher.code,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value,
    discount_amount: discountAmount,
    base_price,
    final_price: finalPrice,
  });
}
