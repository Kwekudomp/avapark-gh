import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { accommodationPartners } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const includeAll = req.nextUrl.searchParams.get("all") === "1";
    const base = db.select().from(accommodationPartners);
    const data = includeAll
      ? await base.orderBy(asc(accommodationPartners.sort_order))
      : await base
          .where(eq(accommodationPartners.is_active, true))
          .orderBy(asc(accommodationPartners.sort_order));
    return NextResponse.json({ partners: data });
  } catch (err) {
    console.error("Fetch accommodation partners error:", err);
    return NextResponse.json({ error: "Failed to fetch accommodation partners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [partner] = await getDb().insert(accommodationPartners).values(body).returning();
    return NextResponse.json({ partner });
  } catch (err) {
    console.error("Create accommodation partner error:", err);
    return NextResponse.json({ error: "Failed to create accommodation partner" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    const [partner] = await getDb()
      .update(accommodationPartners)
      .set(updates)
      .where(eq(accommodationPartners.id, id))
      .returning();
    if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ partner });
  } catch (err) {
    console.error("Update accommodation partner error:", err);
    return NextResponse.json({ error: "Failed to update accommodation partner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await getDb()
      .update(accommodationPartners)
      .set({ is_active: false })
      .where(eq(accommodationPartners.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete accommodation partner error:", err);
    return NextResponse.json({ error: "Failed to delete accommodation partner" }, { status: 500 });
  }
}
