import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { accommodationPartners } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { AccommodationPartner } from "@/lib/supabase";
import AccommodationCMSClient from "@/components/admin/AccommodationCMSClient";

export default async function AdminAccommodationPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let partners: AccommodationPartner[] = [];
  try {
    partners = (await getDb()
      .select()
      .from(accommodationPartners)
      .orderBy(asc(accommodationPartners.sort_order))) as unknown as AccommodationPartner[];
  } catch (err) {
    console.error("Load accommodation partners error:", err);
  }

  return <AccommodationCMSClient initialPartners={partners} />;
}
