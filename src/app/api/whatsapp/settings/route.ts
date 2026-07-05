import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { staffWhatsapp, venues } from "@/db/schema";
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

    const [venue] = await getDb()
      .select()
      .from(venues)
      .where(eq(venues.id, venueId))
      .limit(1);

    return NextResponse.json(venue ?? null);
  } catch (err) {
    console.error("WhatsApp settings GET error:", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venueId = await getStaffVenueId(session.userId);
    if (!venueId) return NextResponse.json({ error: "No venue" }, { status: 403 });

    const body = await request.json();

    const [venue] = await getDb()
      .update(venues)
      .set({
        supported_languages: body.supported_languages,
        brand_voice: body.brand_voice,
        updated_at: new Date().toISOString(),
      })
      .where(eq(venues.id, venueId))
      .returning();

    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 500 });
    return NextResponse.json(venue);
  } catch (err) {
    console.error("WhatsApp settings PATCH error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
