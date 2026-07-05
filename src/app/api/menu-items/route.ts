import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

interface MenuItemCreate {
  id: string;
  name: string;
  subnote?: string | null;
  category: string;
  meal: "breakfast" | "lunch" | "supper" | "all-day";
  price?: number | null;
  tags?: ("spicy" | "seafood")[];
  available?: boolean;
  sort_order?: number;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: MenuItemCreate;
  try {
    body = (await req.json()) as MenuItemCreate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id?.trim() || !body.name?.trim() || !body.category?.trim() || !body.meal) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const [row] = await getDb()
      .insert(menuItems)
      .values({
        id: body.id.trim(),
        name: body.name.trim(),
        subnote: body.subnote?.trim() || null,
        category: body.category.trim(),
        meal: body.meal,
        price: body.price ?? null,
        tags: body.tags ?? [],
        available: body.available ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("[POST /api/menu-items] DB error:", err);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
