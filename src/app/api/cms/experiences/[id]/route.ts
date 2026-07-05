import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const [experience] = await getDb()
      .update(experiences)
      .set({ ...body, updated_at: new Date().toISOString() })
      .where(eq(experiences.id, id))
      .returning();
    if (!experience) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ experience });
  } catch (err) {
    console.error("Update experience error:", err);
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await getDb()
      .update(experiences)
      .set({ is_active: false })
      .where(eq(experiences.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete experience error:", err);
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
