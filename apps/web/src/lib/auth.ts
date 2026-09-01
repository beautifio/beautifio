import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import postgres from "postgres";

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
