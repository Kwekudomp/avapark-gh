import { redirect, notFound } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import ExperienceEditorClient from "@/components/admin/ExperienceEditorClient";

export default async function ExperienceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const { id } = await params;

  if (id === "new") {
    return <ExperienceEditorClient experience={null} />;
  }

  const admin = createAdminSupabase();
  const { data: experience } = await admin
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!experience) notFound();
  return <ExperienceEditorClient experience={experience} />;
}
