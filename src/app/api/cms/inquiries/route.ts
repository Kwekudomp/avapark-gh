import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { assertStaff, assertAdmin } from "@/lib/auth/roles";

export async function GET() {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  try {
    const data = await getDb()
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.created_at));
    return NextResponse.json({ inquiries: data });
  } catch (err) {
    console.error("[GET /api/cms/inquiries] DB error:", err);
    return NextResponse.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id, status, admin_note } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (status && !["unread", "read", "archived"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const updates: { status?: string; admin_note?: string | null } = {};
  if (status !== undefined) updates.status = status;
  if (admin_note !== undefined) updates.admin_note = admin_note;

  try {
    const [row] = await getDb()
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();
    if (!row) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    return NextResponse.json({ inquiry: row });
  } catch (err) {
    console.error("[PATCH /api/cms/inquiries] DB error:", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await getDb().delete(inquiries).where(eq(inquiries.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/cms/inquiries] DB error:", err);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
