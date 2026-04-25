import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase";

const VALID_ROLES: UserRole[] = ["admin", "marketing_sales"];

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const admin = createAdminSupabase();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with last_sign_in_at from auth.admin
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
  const lastSignInById = new Map(authUsers.map(u => [u.id, u.last_sign_in_at]));

  const enriched = (profiles ?? []).map(p => ({
    ...p,
    last_sign_in_at: lastSignInById.get(p.id) ?? null,
  }));

  return NextResponse.json({ users: enriched });
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

  const admin = createAdminSupabase();

  // Step 1 — create the auth user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 500 });
  }

  // Step 2 — insert profile
  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    email,
    name,
    role,
  });

  if (profileErr) {
    // Rollback the auth user so we don't leave a half-created account
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: created.user.id, email, name, role },
  });
}
