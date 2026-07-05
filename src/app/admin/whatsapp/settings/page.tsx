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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">You are not assigned to any WhatsApp venue.</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Venue not found.</p>
      </div>
    );
  }

  return <SettingsClient venue={venue as any} />;
}
