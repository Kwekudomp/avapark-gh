import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, escalations, messages, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const venueId = request.nextUrl.searchParams.get("venueId");
    if (!venueId) {
      return NextResponse.json({ error: "Missing venueId" }, { status: 400 });
    }
    const after = request.nextUrl.searchParams.get("after");

    const db = getDb();

    const [staffRecord] = await db
      .select({ venue_id: staffWhatsapp.venue_id })
      .from(staffWhatsapp)
      .where(
        and(
          eq(staffWhatsapp.user_id, session.userId),
          eq(staffWhatsapp.venue_id, venueId)
        )
      )
      .limit(1);

    if (!staffRecord) return NextResponse.json({ error: "No venue" }, { status: 403 });

    const conditions = [
      eq(escalations.venue_id, venueId),
      eq(escalations.status, "pending"),
    ];
    if (after) conditions.push(gt(escalations.created_at, after));

    const rows = await db
      .select({
        escalation: escalations,
        message: messages,
        conversation: conversations,
      })
      .from(escalations)
      .innerJoin(messages, eq(escalations.message_id, messages.id))
      .innerJoin(conversations, eq(messages.conversation_id, conversations.id))
      .where(and(...conditions))
      .orderBy(desc(escalations.created_at))
      .limit(50);

    const result = rows.map((r) => ({
      ...r.escalation,
      message: r.message,
      conversation: r.conversation,
    }));

    return NextResponse.json({ escalations: result });
  } catch (err) {
    console.error("WhatsApp escalations GET error:", err);
    return NextResponse.json({ error: "Failed to load escalations" }, { status: 500 });
  }
}
