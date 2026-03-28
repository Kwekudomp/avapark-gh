import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import GalleryCMSClient from "@/components/admin/GalleryCMSClient";

export default async function AdminGalleryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: items } = await admin
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  return <GalleryCMSClient initialItems={items ?? []} />;
}
