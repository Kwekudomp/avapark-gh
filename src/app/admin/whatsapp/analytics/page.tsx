import { redirect } from "next/navigation";
import { and, count, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, escalations, messages, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import AnalyticsClient from "@/components/admin/whatsapp/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppAnalyticsPage() {
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-text-secondary">You are not assigned to any WhatsApp venue.</p>
      </div>
    );
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const conversationIds = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.venue_id, staffRecord.venue_id));

  const ids = conversationIds.map((c) => c.id);

  const allMessages = ids.length > 0
    ? await db
        .select({
          direction: messages.direction,
          sent_by: messages.sent_by,
          intent: messages.intent,
          language: messages.language,
          category: messages.category,
          sent_at: messages.sent_at,
        })
        .from(messages)
        .where(
          and(
            gte(messages.sent_at, thirtyDaysAgo),
            inArray(messages.conversation_id, ids)
          )
        )
    : [];

  const inbound = allMessages.filter((m) => m.direction === "inbound");
  const autoReplies = allMessages.filter((m) => m.sent_by === "ai");

  const [escalatedRow] = await db
    .select({ value: count() })
    .from(escalations)
    .where(
      and(
        eq(escalations.venue_id, staffRecord.venue_id),
        gte(escalations.created_at, thirtyDaysAgo)
      )
    );
  const escalatedCount = escalatedRow?.value ?? 0;

  const categoryCounts = new Map<string, number>();
  for (const msg of inbound) {
    if (msg.category) {
      categoryCounts.set(msg.category, (categoryCounts.get(msg.category) ?? 0) + 1);
    }
  }
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const langCounts = new Map<string, number>();
  for (const msg of inbound) {
    if (msg.language) {
      langCounts.set(msg.language, (langCounts.get(msg.language) ?? 0) + 1);
    }
  }
  const languageBreakdown = Array.from(langCounts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <AnalyticsClient
      data={{
        totalMessages: inbound.length,
        autoHandled: autoReplies.length,
        escalated: escalatedCount,
        avgResponseTime: 2,
        topCategories,
        languageBreakdown,
        dailyCounts: [],
      }}
    />
  );
}
