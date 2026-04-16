import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import SettingsClient from "@/components/admin/whatsapp/SettingsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage() {
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

  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("id", staffRecord.venue_id)
    .single();

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Venue not found.</p>
      </div>
    );
  }

  return <SettingsClient venue={venue as any} />;
}
