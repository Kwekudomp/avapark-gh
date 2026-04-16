import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import AnalyticsClient from "@/components/admin/whatsapp/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppAnalyticsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const { data: staffRecord } = await supabase
    .from("staff_whatsapp")
    .select("venue_id")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">You are not assigned to any WhatsApp venue.</p>
      </div>
    );
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: conversationIds } = await supabase
    .from("conversations")
    .select("id")
    .eq("venue_id", staffRecord.venue_id);

  const ids = conversationIds?.map((c) => c.id) ?? [];

  const { data: messages } = ids.length > 0
    ? await supabase
        .from("messages")
        .select("direction, sent_by, intent, language, category, sent_at")
        .gte("sent_at", thirtyDaysAgo)
        .in("conversation_id", ids)
    : { data: [] };

  const allMessages = messages ?? [];
  const inbound = allMessages.filter((m) => m.direction === "inbound");
  const autoReplies = allMessages.filter((m) => m.sent_by === "ai");

  const { count: escalatedCount } = await supabase
    .from("escalations")
    .select("*", { count: "exact", head: true })
    .eq("venue_id", staffRecord.venue_id)
    .gte("created_at", thirtyDaysAgo);

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
        escalated: escalatedCount ?? 0,
        avgResponseTime: 2,
        topCategories,
        languageBreakdown,
        dailyCounts: [],
      }}
    />
  );
}
