import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { staffWhatsapp, venues } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import SettingsClient from "@/components/admin/whatsapp/SettingsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage() {
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

  const [venue] = await db
    .select()
    .from(venues)
    .where(eq(venues.id, staffRecord.venue_id))
    .limit(1);

  if (!venue) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-text-secondary">Venue not found.</p>
      </div>
    );
  }

  return <SettingsClient venue={venue as any} />;
}
