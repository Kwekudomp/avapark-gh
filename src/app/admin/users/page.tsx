import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getCurrentRole } from "@/lib/auth/roles";
import UsersAdminClient, { type StaffRow } from "@/components/admin/UsersAdminClient";
import type { UserRole } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const role = await getCurrentRole();
  if (role !== "admin") redirect("/admin/dashboard");

  const staff = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
      last_sign_in_at: users.last_sign_in_at,
    })
    .from(users)
    .orderBy(desc(users.created_at));

  const rows: StaffRow[] = staff.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name ?? "",
    role: u.role as UserRole,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));

  return <UsersAdminClient initialUsers={rows} currentAdminId={session.userId} />;
}
