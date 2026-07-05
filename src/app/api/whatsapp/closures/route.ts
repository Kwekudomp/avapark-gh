import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { closures, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

async function getStaffVenueId(userId: string): Promise<string | null> {
  const [staffRecord] = await getDb()
    .select({ venue_id: staffWhatsapp.venue_id })
    .from(staffWhatsapp)
    .where(eq(staffWhatsapp.user_id, userId))
    .limit(1);
  return staffRecord?.venue_id ?? null;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venueId = await getStaffVenueId(session.userId);
    if (!venueId) return NextResponse.json({ error: "No venue" }, { status: 403 });

    const rows = await getDb()
      .select()
      .from(closures)
      .where(eq(closures.venue_id, venueId))
      .orderBy(asc(closures.closure_date));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("WhatsApp closures GET error:", err);
    return NextResponse.json({ error: "Failed to load closures" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venueId = await getStaffVenueId(session.userId);
    if (!venueId) return NextResponse.json({ error: "No venue" }, { status: 403 });

    const body = await request.json();

    const [created] = await getDb()
      .insert(closures)
      .values({
        venue_id: venueId,
        closure_date: body.closure_date,
        reason: body.reason,
      })
      .returning();

    if (!created) return NextResponse.json({ error: "Failed to create closure" }, { status: 500 });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("WhatsApp closures POST error:", err);
    return NextResponse.json({ error: "Failed to save closure" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    await getDb().delete(closures).where(eq(closures.id, id));

    return NextResponse.json({ status: "deleted" });
  } catch (err) {
    console.error("WhatsApp closures DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete closure" }, { status: 500 });
  }
}
