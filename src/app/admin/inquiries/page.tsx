import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import InquiriesCMSClient from "@/components/admin/InquiriesCMSClient";
import type { Inquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const rows = await getDb()
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.created_at));

  return <InquiriesCMSClient initialInquiries={(rows ?? []) as Inquiry[]} />;
}
