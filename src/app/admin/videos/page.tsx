import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { videos as videosTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { CMSVideo } from "@/lib/supabase";
import VideosCMSClient from "@/components/admin/VideosCMSClient";

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let videos: CMSVideo[] = [];
  try {
    videos = (await getDb()
      .select()
      .from(videosTable)
      .orderBy(asc(videosTable.sort_order))) as unknown as CMSVideo[];
  } catch (err) {
    console.error("Load videos error:", err);
  }

  return <VideosCMSClient initialVideos={videos} />;
}
