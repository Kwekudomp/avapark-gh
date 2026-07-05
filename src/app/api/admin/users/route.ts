import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { assertAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase";

const VALID_ROLES: UserRole[] = ["admin", "marketing_sales"];

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  try {
    const rows = await getDb()
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
    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error("List users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await req.json() as { email?: string; name?: string; role?: string; password?: string };
  const { email, name, role, password } = body;

  if (!email || !name || !role || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  try {
    const [created] = await getDb()
      .insert(users)
      .values({
        email: email.trim().toLowerCase(),
        name,
        role,
        password_hash: await bcrypt.hash(password, 10),
      })
      .returning({ id: users.id, email: users.email, name: users.name, role: users.role });
    return NextResponse.json({ user: created });
  } catch (err) {
    const message = err instanceof Error && /unique|duplicate/i.test(err.message)
      ? "A user with that email already exists"
      : "Failed to create user";
    console.error("Create user error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
