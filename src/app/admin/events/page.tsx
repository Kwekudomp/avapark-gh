import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { CMSEvent } from "@/lib/supabase";
import EventsCMSClient from "@/components/admin/EventsCMSClient";

export default async function AdminEventsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let events: CMSEvent[] = [];
  try {
    events = (await getDb()
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.is_active, true))
      .orderBy(asc(eventsTable.event_date))) as unknown as CMSEvent[];
  } catch (err) {
    console.error("Load events error:", err);
  }

  return <EventsCMSClient initialEvents={events} />;
}
