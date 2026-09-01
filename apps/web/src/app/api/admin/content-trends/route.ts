import { NextRequest, NextResponse } from "next/server";
import { runBeautifioTrendEngine } from "@/lib/content/trend-engine";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Cek otorisasi admin (opsional sesuai kebutuhan)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic } = await req.json();
  try {
    const result = await runBeautifioTrendEngine(topic);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
