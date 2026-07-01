import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: plans } = await supabase.from("subscription_plans")
    .select("*").eq("is_active", true).order("display_order");

  const parsed = (plans || []).map((p: any) => ({
    ...p,
    features: typeof p.features === "string" ? JSON.parse(p.features || "[]") : (p.features || []),
  }));

  return NextResponse.json({ plans: parsed });
}
