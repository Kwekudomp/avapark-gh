import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { videos } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const data = await getDb()
      .select()
      .from(videos)
      .where(eq(videos.is_active, true))
      .orderBy(asc(videos.sort_order));
    return NextResponse.json({ videos: data });
  } catch (err) {
    console.error("Fetch videos error:", err);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [video] = await getDb().insert(videos).values(body).returning();
    return NextResponse.json({ video });
  } catch (err) {
    console.error("Create video error:", err);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    const [video] = await getDb()
      .update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (err) {
    console.error("Update video error:", err);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await getDb().update(videos).set({ is_active: false }).where(eq(videos.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete video error:", err);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
