import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["admin", "superadmin", "redaksi"].includes(admin.role)) return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [postsRes, commentsRes] = await Promise.all([
      supabase.from("curhat_posts").select("status, flag_reason"),
      supabase.from("curhat_comments").select("status"),
    ]);

    const posts = postsRes.data || [];
    const comments = commentsRes.data || [];

    const stats = {
      total_posts: posts.length,
      total_comments: comments.length,
      posts_by_status: { visible: 0, flagged: 0, hidden: 0, removed: 0 },
      comments_by_status: { visible: 0, flagged: 0, hidden: 0, removed: 0 },
    };

    for (const p of posts) {
      const s = p.status as keyof typeof stats.posts_by_status;
      if (s in stats.posts_by_status) stats.posts_by_status[s]++;
    }
    for (const c of comments) {
      const s = c.status as keyof typeof stats.comments_by_status;
      if (s in stats.comments_by_status) stats.comments_by_status[s]++;
    }

    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error("GET /api/admin/curhat/stats:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
