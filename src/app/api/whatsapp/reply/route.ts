import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sender";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { escalationId, reply } = await request.json();
  if (!escalationId || !reply) {
    return NextResponse.json({ error: "Missing escalationId or reply" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  const { data: escalation } = await admin
    .from("escalations")
    .select("*, message:messages(*, conversation:conversations(*))")
    .eq("id", escalationId)
    .single();

  if (!escalation) {
    return NextResponse.json({ error: "Escalation not found" }, { status: 404 });
  }

  const message = escalation.message as any;
  const conversation = message.conversation as any;

  const { data: venue } = await admin
    .from("venues")
    .select("phone_number_id")
    .eq("id", escalation.venue_id)
    .single();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const sent = await sendWhatsAppMessage(
    conversation.customer_phone,
    reply,
    venue.phone_number_id,
    process.env.WHATSAPP_ACCESS_TOKEN!
  );

  await admin.from("messages").insert({
    conversation_id: conversation.id,
    direction: "outbound",
    body: reply,
    sent_by: "staff",
    wa_message_id: sent.messageId,
  });

  await admin
    .from("escalations")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", escalationId);

  return NextResponse.json({ status: "sent" });
}
