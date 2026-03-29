import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import EventsCMSClient from "@/components/admin/EventsCMSClient";

export default async function AdminEventsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: events } = await admin
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("event_date", { ascending: true });

  return <EventsCMSClient initialEvents={events ?? []} />;
}
