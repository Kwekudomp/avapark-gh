import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-server";
import ExperiencesCMSClient from "@/components/admin/ExperiencesCMSClient";

export default async function AdminExperiencesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: experiences } = await admin
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ExperiencesCMSClient initialExperiences={experiences ?? []} />;
}
