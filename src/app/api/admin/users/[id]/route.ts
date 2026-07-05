import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { assertAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase";

const VALID_ROLES: UserRole[] = ["admin", "marketing_sales"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await params;
  const body = await req.json() as { name?: string; role?: string; password?: string };
  const { name, role, password } = body;

  if (role !== undefined && !VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password !== undefined && password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const updates: Partial<typeof users.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (password !== undefined) updates.password_hash = await bcrypt.hash(password, 10);

  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
    try {
      await getDb().update(users).set(updates).where(eq(users.id, id));
    } catch (err) {
      console.error("Update user error:", err);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await params;

  // Don't allow self-deletion (admins can lock themselves out otherwise)
  if (id === auth.userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  try {
    await getDb().delete(users).where(eq(users.id, id));
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
