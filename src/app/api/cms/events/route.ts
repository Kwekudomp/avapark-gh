import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const data = await getDb()
      .select()
      .from(events)
      .orderBy(asc(events.event_date));
    return NextResponse.json({ events: data });
  } catch (err) {
    console.error("Fetch events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [event] = await getDb().insert(events).values(body).returning();
    return NextResponse.json({ event });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    const [event] = await getDb()
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    console.error("Update event error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await getDb().update(events).set({ is_active: false }).where(eq(events.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete event error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
