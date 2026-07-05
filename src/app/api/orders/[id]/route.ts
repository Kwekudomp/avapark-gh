import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { assertStaff } from "@/lib/auth/roles";

const VALID_STATUS = ["new", "confirmed", "preparing", "ready", "delivered", "cancelled"];

// PATCH — advance an order's kitchen status (staff only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await params;
  const { status } = await req.json();
  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const [order] = await getDb()
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    console.error("[PATCH /api/orders/:id] DB error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
