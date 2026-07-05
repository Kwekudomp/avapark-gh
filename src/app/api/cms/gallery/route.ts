import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { galleryItems } from "@/db/schema";
import { assertStaff } from "@/lib/auth/roles";

export async function GET() {
  try {
    const data = await getDb()
      .select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.sort_order));
    return NextResponse.json({ items: data });
  } catch (err) {
    console.error("Fetch gallery items error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  try {
    const body = await req.json();
    const [item] = await getDb()
      .insert(galleryItems)
      .values({ ...body, uploaded_by: auth.userId })
      .returning();
    return NextResponse.json({ item });
  } catch (err) {
    console.error("Create gallery item error:", err);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}

/**
 * Soft-delete (sets is_active = false). Allowed for admin OR the item's uploader.
 * Marketing_sales who try to delete someone else's item get 403.
 */
export async function DELETE(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const db = getDb();

    // Ownership check (admin can override)
    if (auth.role !== "admin") {
      const rows = await db
        .select({ uploaded_by: galleryItems.uploaded_by })
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);
      const item = rows[0];
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (item.uploaded_by !== auth.userId) {
        return NextResponse.json({ error: "Cannot delete items uploaded by others" }, { status: 403 });
      }
    }

    await db.update(galleryItems).set({ is_active: false }).where(eq(galleryItems.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete gallery item error:", err);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
