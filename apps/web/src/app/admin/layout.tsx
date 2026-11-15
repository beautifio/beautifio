import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server-auth";
import AdminShell from "./AdminShell";

// Server-side authorization: always read the role from the DB, not from the
// bf_session JWT. The JWT embeds the role at login time and can be stale for up
// to 30 days if an admin changes a user's role; middleware only gates on the
// presence of a session, this layout is the authoritative role check.
const ADMIN_ROLES = ["admin", "superadmin", "redaksi"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.role || !ADMIN_ROLES.includes(user.role)) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
