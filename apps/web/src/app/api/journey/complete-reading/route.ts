import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { completeActivity } from "@/lib/journey-queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { activity_id } = body;

    if (!activity_id) {
      return NextResponse.json(
        { error: "Missing activity_id" },
        { status: 400 }
      );
    }

    const { data: activity } = await supabase
      .from("daily_activities")
      .select("id, title, user_id")
      .eq("id", activity_id)
      .single();

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (activity.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await completeActivity(activity_id);

    return NextResponse.json({
      success: true,
      activity_title: activity.title,
    });
  } catch (error) {
    console.error("Error marking activity complete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
