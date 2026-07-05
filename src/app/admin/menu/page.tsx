import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { menuItems } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getOrderingEnabled } from "@/lib/cms";
import MenuCMSClient from "@/components/admin/MenuCMSClient";
import type { MenuItemRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const [data, orderingEnabled] = await Promise.all([
    getDb().select().from(menuItems).orderBy(asc(menuItems.sort_order)),
    getOrderingEnabled(),
  ]);

  const items = (data ?? []) as MenuItemRow[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Kitchen Menu</h1>
        <p className="text-text-secondary text-sm mt-1">
          Set prices and availability for every menu item. Items without a price show as &ldquo;Price
          on request&rdquo; on the public page and cannot be ordered online until a price is set.
        </p>
      </div>
      <MenuCMSClient initialItems={items} orderingEnabled={orderingEnabled} />
    </div>
  );
}
