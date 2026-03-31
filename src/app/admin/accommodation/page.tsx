import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import AccommodationCMSClient from "@/components/admin/AccommodationCMSClient";

export default async function AdminAccommodationPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: partners } = await admin
    .from("accommodation_partners")
    .select("*")
    .order("sort_order", { ascending: true });

  return <AccommodationCMSClient initialPartners={partners ?? []} />;
}
