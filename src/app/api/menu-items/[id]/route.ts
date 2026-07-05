import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

interface MenuItemUpdate {
  name?: string;
  subnote?: string | null;
  category?: string;
  meal?: "breakfast" | "lunch" | "supper" | "all-day";
  price?: number | null;
  tags?: ("spicy" | "seafood")[];
  available?: boolean;
  sort_order?: number;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: MenuItemUpdate;
  try {
    body = (await req.json()) as MenuItemUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const [row] = await getDb()
      .update(menuItems)
      .set({ ...body, updated_at: new Date().toISOString() })
      .where(eq(menuItems.id, id))
      .returning();

    if (!row) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("[PATCH /api/menu-items/[id]] DB error:", err);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await getDb().delete(menuItems).where(eq(menuItems.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/menu-items/[id]] DB error:", err);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
