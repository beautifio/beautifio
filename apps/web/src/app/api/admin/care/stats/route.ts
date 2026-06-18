import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["admin", "superadmin"].includes(admin.role)) return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("beautifio_care_tickets")
      .select("status, category, partner_type");

    if (error) throw error;

    const tickets = data || [];
    const stats = {
      total: tickets.length,
      by_status: { pending: 0, in_progress: 0, resolved: 0, closed: 0 },
      by_category: {} as Record<string, number>,
    };

    for (const t of tickets) {
      const s = t.status as keyof typeof stats.by_status;
      if (s in stats.by_status) stats.by_status[s]++;
      stats.by_category[t.category] = (stats.by_category[t.category] || 0) + 1;
    }

    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error("GET /api/admin/care/stats:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
