import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

// PATCH — approve or reject a review (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, admin_note } = await req.json();
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await getDb()
      .update(reviews)
      .set({ status, admin_note: admin_note ?? null })
      .where(eq(reviews.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update review error:", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
