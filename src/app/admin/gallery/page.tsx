import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import GalleryCMSClient from "@/components/admin/GalleryCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: items } = await admin
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  // Build a map of uploader id → display name for ownership tooltips
  const uploaderIds = Array.from(new Set((items ?? []).map(i => i.uploaded_by).filter(Boolean) as string[]));
  let uploaderMap: Record<string, string> = {};
  if (uploaderIds.length > 0) {
    const { data: uploaders } = await admin
      .from("profiles")
      .select("id, name")
      .in("id", uploaderIds);
    uploaderMap = Object.fromEntries((uploaders ?? []).map(u => [u.id, u.name]));
  }

  return (
    <GalleryCMSClient
      initialItems={items ?? []}
      currentUserId={user.id}
      isAdmin={role === "admin"}
      uploaderMap={uploaderMap}
    />
  );
}
