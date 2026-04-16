import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import FaqsCMSClient from "@/components/admin/whatsapp/FaqsCMSClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppFaqsPage() {
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

  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("venue_id", staffRecord.venue_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <FaqsCMSClient initialFaqs={(faqs as any) ?? []} />;
}
