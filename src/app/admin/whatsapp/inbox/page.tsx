import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, escalations, messages, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import InboxClient from "@/components/admin/whatsapp/InboxClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppInboxPage() {
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

  const rows = await db
    .select({
      escalation: escalations,
      message: messages,
      conversation: conversations,
    })
    .from(escalations)
    .innerJoin(messages, eq(escalations.message_id, messages.id))
    .innerJoin(conversations, eq(messages.conversation_id, conversations.id))
    .where(eq(escalations.venue_id, staffRecord.venue_id))
    .orderBy(desc(escalations.created_at))
    .limit(50);

  const escalationsList = rows.map((r) => ({
    ...r.escalation,
    message: r.message,
    conversation: r.conversation,
  }));

  return (
    <InboxClient
      initialEscalations={(escalationsList as any) ?? []}
      venueId={staffRecord.venue_id}
    />
  );
}
