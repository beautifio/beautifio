import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  const { data: phases, error } = await supabase
    .from("dream_phases")
    .select("*, small_win_templates(*)")
    .eq("dream_template_slug", slug)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ phases: [] });
  }

  return NextResponse.json({ phases: phases || [] });
}
