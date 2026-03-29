import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import VideosCMSClient from "@/components/admin/VideosCMSClient";

export default async function AdminVideosPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: videos } = await admin
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true });

  return <VideosCMSClient initialVideos={videos ?? []} />;
}
