import { redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, messages, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import ConversationsClient from "@/components/admin/whatsapp/ConversationsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppConversationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const db = getDb();

  const [staffRecord] = await db
    .select({ venue_id: staffWhatsapp.venue_id })
    .from(staffWhatsapp)
    .where(eq(staffWhatsapp.user_id, session.userId))
    .limit(1);

  if (!staffRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">You are not assigned to any WhatsApp venue.</p>
      </div>
    );
  }

  const conversationRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.venue_id, staffRecord.venue_id))
    .orderBy(desc(conversations.last_message_at))
    .limit(100);

  const ids = conversationRows.map((c) => c.id);
  const messageRows = ids.length
    ? await db
        .select()
        .from(messages)
        .where(inArray(messages.conversation_id, ids))
        .orderBy(asc(messages.sent_at))
    : [];

  const byConversation = new Map<string, typeof messageRows>();
  for (const msg of messageRows) {
    const list = byConversation.get(msg.conversation_id) ?? [];
    list.push(msg);
    byConversation.set(msg.conversation_id, list);
  }

  const conversationsWithMessages = conversationRows.map((c) => ({
    ...c,
    messages: byConversation.get(c.id) ?? [],
  }));

  return <ConversationsClient conversations={(conversationsWithMessages as any) ?? []} />;
}
