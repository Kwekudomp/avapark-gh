import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { closures, staffWhatsapp } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import ClosuresCMSClient from "@/components/admin/whatsapp/ClosuresCMSClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppClosuresPage() {
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

  const closureRows = await db
    .select()
    .from(closures)
    .where(eq(closures.venue_id, staffRecord.venue_id))
    .orderBy(asc(closures.closure_date));

  return <ClosuresCMSClient initialClosures={(closureRows as any) ?? []} />;
}
