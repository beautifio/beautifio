import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    await destroySession();
  } catch {
    // Ignore — still report success so the client clears its local state.
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
