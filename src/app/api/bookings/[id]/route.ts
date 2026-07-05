import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
import { assertStaff } from "@/lib/auth/roles";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await assertStaff();
    if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const { id } = await params;
    const body = await req.json();
    const { status, admin_notes } = body;

    const updates: Partial<typeof bookings.$inferInsert> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const [booking] = await getDb()
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Update booking error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
