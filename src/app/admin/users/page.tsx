import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import UsersAdminClient, { type StaffRow } from "@/components/admin/UsersAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (role !== "admin") redirect("/admin/dashboard");

  const admin = createAdminSupabase();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
  const lastSignInById = new Map(authUsers.map(u => [u.id, u.last_sign_in_at]));

  const rows: StaffRow[] = (profiles ?? []).map(p => ({
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
    created_at: p.created_at,
    last_sign_in_at: lastSignInById.get(p.id) ?? null,
  }));

  return <UsersAdminClient initialUsers={rows} currentAdminId={user.id} />;
}
