import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/supabase";

/**
 * Returns the calling user's role from the profiles table, or null if
 * the user is not signed in or has no profile row yet.
 *
 * Reads via the service-role client so it bypasses profiles RLS without
 * needing to grant SELECT to authenticated.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminSupabase();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (data?.role as UserRole | undefined) ?? null;
}

export type AuthOk = { ok: true; userId: string; role: UserRole };
export type AuthFail = { ok: false; status: 401 | 403 };

/**
 * For API routes — verifies the caller is an admin.
 * Returns { ok: true, userId } or { ok: false, status } on failure.
 */
export async function assertAdmin(): Promise<{ ok: true; userId: string } | AuthFail> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401 };

  const role = await getCurrentRole();
  if (role !== "admin") return { ok: false, status: 403 };
  return { ok: true, userId: user.id };
}

/**
 * For API routes — verifies the caller is staff (admin OR marketing_sales).
 */
export async function assertStaff(): Promise<AuthOk | AuthFail> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401 };

  const role = await getCurrentRole();
  if (role !== "admin" && role !== "marketing_sales") return { ok: false, status: 403 };
  return { ok: true, userId: user.id, role };
}
