import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import InboxClient from "@/components/admin/whatsapp/InboxClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppInboxPage() {
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

  const { data: escalations } = await supabase
    .from("escalations")
    .select(`
      *,
      message:messages(*),
      conversation:messages(conversation:conversations(*))
    `)
    .eq("venue_id", staffRecord.venue_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <InboxClient
      initialEscalations={(escalations as any) ?? []}
      venueId={staffRecord.venue_id}
    />
  );
}
