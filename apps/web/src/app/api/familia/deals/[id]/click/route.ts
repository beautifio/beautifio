import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: deal, error } = await supabase
      .from("familia_affiliate_deals")
      .select("partner_url")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    void supabase.rpc("increment_deal_click", { p_deal_id: id });

    return NextResponse.redirect(deal.partner_url, { status: 302 });
  } catch (error) {
    console.error("GET /api/familia/deals/[id]/click:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
