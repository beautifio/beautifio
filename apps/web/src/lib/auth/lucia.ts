import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import postgres from "postgres";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("auth_users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = pgTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

const sql = postgres(process.env.DATABASE_URL!);
const adapter = new PostgresJsAdapter(sql, {
  user: "auth_users",
  session: "auth_sessions"
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production"
    }
  }
});
