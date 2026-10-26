import { PrismaClient } from "@prisma/client";

// Single PrismaClient across hot reloads / serverless invocations.
// DATABASE_URL points at beautifio's own Postgres (see deploy/.env.production),
// not the shared Supabase instance — this is the data layer we are migrating to.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
