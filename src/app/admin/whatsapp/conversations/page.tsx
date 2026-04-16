import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import ConversationsClient from "@/components/admin/whatsapp/ConversationsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppConversationsPage() {
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

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, messages(*)")
    .eq("venue_id", staffRecord.venue_id)
    .order("last_message_at", { ascending: false })
    .limit(100);

  return <ConversationsClient conversations={(conversations as any) ?? []} />;
}
