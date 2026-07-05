import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, escalations, messages, venues } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sender";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { escalationId, reply } = await request.json();
    if (!escalationId || !reply) {
      return NextResponse.json({ error: "Missing escalationId or reply" }, { status: 400 });
    }

    const db = getDb();

    const [row] = await db
      .select({
        escalation: escalations,
        message: messages,
        conversation: conversations,
      })
      .from(escalations)
      .innerJoin(messages, eq(escalations.message_id, messages.id))
      .innerJoin(conversations, eq(messages.conversation_id, conversations.id))
      .where(eq(escalations.id, escalationId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
    }

    const { escalation, conversation } = row;

    const [venue] = await db
      .select({ phone_number_id: venues.phone_number_id })
      .from(venues)
      .where(eq(venues.id, escalation.venue_id))
      .limit(1);

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const sent = await sendWhatsAppMessage(
      conversation.customer_phone,
      reply,
      venue.phone_number_id,
      process.env.WHATSAPP_ACCESS_TOKEN!
    );

    await db.insert(messages).values({
      conversation_id: conversation.id,
      direction: "outbound",
      body: reply,
      sent_by: "staff",
      wa_message_id: sent.messageId,
    });

    await db
      .update(escalations)
      .set({ status: "resolved", resolved_at: new Date().toISOString() })
      .where(eq(escalations.id, escalationId));

    return NextResponse.json({ status: "sent" });
  } catch (err) {
    console.error("WhatsApp reply error:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
