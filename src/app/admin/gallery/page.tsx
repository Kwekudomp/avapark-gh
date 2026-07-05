import { redirect } from "next/navigation";
import { asc, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { galleryItems, users } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getCurrentRole } from "@/lib/auth/roles";
import type { GalleryItem } from "@/lib/types";
import GalleryCMSClient from "@/components/admin/GalleryCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin");

  const db = getDb();
  let items: GalleryItem[] = [];
  let uploaderMap: Record<string, string> = {};
  try {
    items = (await db
      .select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.sort_order))) as unknown as GalleryItem[];

    // Build a map of uploader id → display name for ownership tooltips
    const uploaderIds = Array.from(new Set(items.map(i => i.uploaded_by).filter(Boolean) as string[]));
    if (uploaderIds.length > 0) {
      const uploaders = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(inArray(users.id, uploaderIds));
      uploaderMap = Object.fromEntries(uploaders.map(u => [u.id, u.name ?? u.email]));
    }
  } catch (err) {
    console.error("Load gallery items error:", err);
  }

  return (
    <GalleryCMSClient
      initialItems={items}
      currentUserId={session.userId}
      isAdmin={role === "admin"}
      uploaderMap={uploaderMap}
    />
  );
}
