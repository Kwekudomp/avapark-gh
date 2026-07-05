import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { faqs, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import FaqsCMSClient from "@/components/admin/whatsapp/FaqsCMSClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppFaqsPage() {
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

  const faqRows = await db
    .select()
    .from(faqs)
    .where(and(eq(faqs.venue_id, staffRecord.venue_id), eq(faqs.is_active, true)))
    .orderBy(desc(faqs.created_at));

  return <FaqsCMSClient initialFaqs={(faqRows as any) ?? []} />;
}
