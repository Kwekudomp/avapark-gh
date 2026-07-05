import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences as experiencesTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { CMSExperience } from "@/lib/supabase";
import ExperiencesCMSClient from "@/components/admin/ExperiencesCMSClient";

export default async function AdminExperiencesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let experiences: CMSExperience[] = [];
  try {
    experiences = (await getDb()
      .select()
      .from(experiencesTable)
      .orderBy(asc(experiencesTable.sort_order))) as unknown as CMSExperience[];
  } catch (err) {
    console.error("Load experiences error:", err);
  }

  return <ExperiencesCMSClient initialExperiences={experiences} />;
}
