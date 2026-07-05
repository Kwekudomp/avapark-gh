import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences as experiencesTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { CMSExperience } from "@/lib/types";
import ExperienceEditorClient from "@/components/admin/ExperienceEditorClient";

export default async function ExperienceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;

  if (id === "new") {
    return <ExperienceEditorClient experience={null} />;
  }

  const rows = await getDb()
    .select()
    .from(experiencesTable)
    .where(eq(experiencesTable.id, id))
    .limit(1);
  const experience = rows[0] as unknown as CMSExperience | undefined;

  if (!experience) notFound();
  return <ExperienceEditorClient experience={experience} />;
}
