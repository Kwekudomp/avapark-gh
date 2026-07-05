import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { UserRole } from "@/lib/types";

/**
 * Returns the calling user's role from the users table, or null if the
 * user is not signed in or no longer exists.
 *
 * The role is read fresh from the DB (not trusted from the session token)
 * so role changes take effect immediately.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const session = await getAdminSession();
  if (!session) return null;
  return roleFor(session.userId);
}

async function roleFor(userId: string): Promise<UserRole | null> {
  try {
    const [row] = await getDb()
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return (row?.role as UserRole | undefined) ?? null;
  } catch {
    return null;
  }
}

export type AuthOk = { ok: true; userId: string; role: UserRole };
export type AuthFail = { ok: false; status: 401 | 403 };

/**
 * For API routes — verifies the caller is an admin.
 * Returns { ok: true, userId } or { ok: false, status } on failure.
 */
export async function assertAdmin(): Promise<{ ok: true; userId: string } | AuthFail> {
  const session = await getAdminSession();
  if (!session) return { ok: false, status: 401 };

  const role = await roleFor(session.userId);
  if (role !== "admin") return { ok: false, status: 403 };
  return { ok: true, userId: session.userId };
}

/**
 * For API routes — verifies the caller is staff (admin OR marketing_sales).
 */
export async function assertStaff(): Promise<AuthOk | AuthFail> {
  const session = await getAdminSession();
  if (!session) return { ok: false, status: 401 };

  const role = await roleFor(session.userId);
  if (role !== "admin" && role !== "marketing_sales") return { ok: false, status: 403 };
  return { ok: true, userId: session.userId, role };
}
