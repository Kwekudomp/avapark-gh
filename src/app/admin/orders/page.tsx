import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import OrdersAdminClient from "@/components/admin/OrdersAdminClient";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let rows: Order[] = [];
  try {
    rows = (await getDb().select().from(orders).orderBy(desc(orders.created_at))) as unknown as Order[];
  } catch {
    rows = [];
  }

  return <OrdersAdminClient initialOrders={rows} />;
}
