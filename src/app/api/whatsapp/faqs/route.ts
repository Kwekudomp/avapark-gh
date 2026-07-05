import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { faqs, staffWhatsapp } from "@/db/schema";
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
      .from(faqs)
      .where(eq(faqs.venue_id, venueId))
      .orderBy(desc(faqs.created_at));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("WhatsApp faqs GET error:", err);
    return NextResponse.json({ error: "Failed to load FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venueId = await getStaffVenueId(session.userId);
    if (!venueId) return NextResponse.json({ error: "No venue" }, { status: 403 });

    const body = await request.json();
    const db = getDb();

    if (body.id) {
      const [updated] = await db
        .update(faqs)
        .set({
          question: body.question,
          answer: body.answer,
          category: body.category,
          is_active: body.is_active,
          updated_at: new Date().toISOString(),
        })
        .where(and(eq(faqs.id, body.id), eq(faqs.venue_id, venueId)))
        .returning();

      if (!updated) return NextResponse.json({ error: "FAQ not found" }, { status: 500 });
      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(faqs)
      .values({
        venue_id: venueId,
        question: body.question,
        answer: body.answer,
        category: body.category ?? "general",
      })
      .returning();

    if (!created) return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("WhatsApp faqs POST error:", err);
    return NextResponse.json({ error: "Failed to save FAQ" }, { status: 500 });
  }
}
