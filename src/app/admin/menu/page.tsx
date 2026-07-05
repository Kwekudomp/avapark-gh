import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import MenuCMSClient from "@/components/admin/MenuCMSClient";
import type { MenuItemRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const data = await getDb()
    .select()
    .from(menuItems)
    .orderBy(asc(menuItems.sort_order));

  const items = (data ?? []) as MenuItemRow[];

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hp-logo.png" alt="" className="h-8 w-auto rounded" />
          <div>
            <h1 className="font-semibold text-sm">Hidden Paradise</h1>
            <p className="text-white/60 text-xs">Kitchen Menu</p>
          </div>
        </div>
        <a
          href="/admin/dashboard"
          className="text-xs text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-full transition"
        >
          ← Dashboard
        </a>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary">Kitchen Menu</h2>
          <p className="text-text-secondary text-sm mt-1">
            Set prices and availability for every menu item. Items without a price show as &ldquo;Price
            on request&rdquo; on the public page and cannot be ordered online until a price is set.
          </p>
        </div>
        <MenuCMSClient initialItems={items} />
      </div>
    </div>
  );
}
