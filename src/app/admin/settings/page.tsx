import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import SettingsCMSClient from "@/components/admin/SettingsCMSClient";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: settings } = await admin.from("site_settings").select("*");

  return <SettingsCMSClient initialSettings={settings ?? []} />;
}
