import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import SettingsCMSClient from "@/components/admin/SettingsCMSClient";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let settings: { key: string; value: string; label: string }[] = [];
  try {
    settings = await getDb()
      .select({ key: siteSettings.key, value: siteSettings.value, label: siteSettings.label })
      .from(siteSettings);
  } catch (err) {
    console.error("Load settings error:", err);
  }

  return <SettingsCMSClient initialSettings={settings} />;
}
