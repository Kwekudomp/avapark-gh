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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">You are not assigned to any WhatsApp venue.</p>
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
