import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // fetch all active achievement definitions
    const { data: allRewards, error: rewError } = await supabase
      .from("familia_achievement_rewards")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (rewError) {
      console.error("GET /api/familia/achievements/progress:", rewError);
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }

    // fetch user's progress for these achievements
    const { data: userProgress } = await supabase
      .from("familia_user_achievements")
      .select("*")
      .eq("user_id", user.id);

    const progressMap = new Map(
      (userProgress || []).map((up) => [up.achievement_id, up])
    );

    // merge: each reward gets its progress (default to 0)
    const merged = (allRewards || []).map((reward) => {
      const prog = progressMap.get(reward.id);
      return {
        ...reward,
        progress: prog?.progress ?? 0,
        is_completed: prog?.is_completed ?? false,
        completed_at: prog?.completed_at ?? null,
        user_achievement_id: prog?.id ?? null,
      };
    });

    return NextResponse.json({ data: merged });
  } catch (error) {
    console.error("GET /api/familia/achievements/progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { trigger_type } = body;

    if (!trigger_type) {
      return NextResponse.json({ error: "Missing trigger_type" }, { status: 400 });
    }

    const validTriggers = ["discovery_complete", "mentor_program"];
    if (!validTriggers.includes(trigger_type)) {
      return NextResponse.json({ error: "Invalid trigger_type" }, { status: 400 });
    }

    const { error: rpcError } = await supabase.rpc("update_familia_achievement", {
      p_user_id: user.id,
      p_trigger_type: trigger_type,
      p_increment: 1,
    });

    if (rpcError) {
      console.error("POST /api/familia/achievements/progress:", rpcError);
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/familia/achievements/progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
