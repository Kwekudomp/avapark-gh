import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import InquiriesCMSClient from "@/components/admin/InquiriesCMSClient";
import type { Inquiry } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: inquiries } = await admin
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <InquiriesCMSClient initialInquiries={(inquiries ?? []) as Inquiry[]} />;
}
