import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public pricing. Prisma-backed (migration off Supabase).
export async function GET() {
  const plans = await prisma.subscription_plans.findMany({
    where: { is_active: true },
    orderBy: { display_order: "asc" },
  });

  const parsed = plans.map((p: any) => ({
    ...p,
    features:
      typeof p.features === "string" ? JSON.parse(p.features || "[]") : p.features || [],
  }));

  return NextResponse.json({ plans: parsed });
}
