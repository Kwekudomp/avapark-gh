import { redirect } from "next/navigation";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { bookings, escalations, galleryItems, inquiries, orders, reviews, users } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { getCurrentRole } from "@/lib/auth/roles";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import MarketingDashboardClient from "@/components/admin/MarketingDashboardClient";
import type { Booking, GalleryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin"); // user without a profile row

  const db = getDb();

  // Both views need bookings
  const bookingRows = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.created_at));

  if (role === "marketing_sales") {
    const [unreadRow] = await db
      .select({ value: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "unread"));

    // Last-7-days uploads by this user
    // eslint-disable-next-line react-hooks/purity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentUploads = await db
      .select()
      .from(galleryItems)
      .where(
        and(
          eq(galleryItems.uploaded_by, session.userId),
          eq(galleryItems.is_active, true),
          gte(galleryItems.created_at, sevenDaysAgo),
        ),
      )
      .orderBy(desc(galleryItems.created_at))
      .limit(8);

    // Get profile name/email
    const [profile] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return (
      <MarketingDashboardClient
        initialBookings={(bookingRows ?? []) as Booking[]}
        unreadInquiries={unreadRow?.value ?? 0}
        recentUploads={(recentUploads ?? []) as GalleryItem[]}
        userName={profile?.name ?? session.email ?? ""}
        userEmail={profile?.email ?? session.email ?? ""}
      />
    );
  }

  // Admin path — operational metrics for the dashboard
  // eslint-disable-next-line react-hooks/purity
  const startOfToday = new Date(new Date().toISOString().slice(0, 10)).toISOString();

  const [
    [pendingReviewsRow],
    [pendingEscalationsRow],
    [unreadInquiriesRow],
    [inquiriesTodayRow],
    [newOrdersRow],
    [ordersTodayRow],
  ] = await Promise.all([
    db.select({ value: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ value: count() }).from(escalations).where(eq(escalations.status, "pending")),
    db.select({ value: count() }).from(inquiries).where(eq(inquiries.status, "unread")),
    db.select({ value: count() }).from(inquiries).where(gte(inquiries.created_at, startOfToday)),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "new")),
    db.select({ value: count() }).from(orders).where(gte(orders.created_at, startOfToday)),
  ]);

  return (
    <AdminDashboardClient
      initialBookings={(bookingRows ?? []) as Booking[]}
      userEmail={session.email ?? ""}
      pendingReviews={pendingReviewsRow?.value ?? 0}
      pendingEscalations={pendingEscalationsRow?.value ?? 0}
      unreadInquiries={unreadInquiriesRow?.value ?? 0}
      inquiriesToday={inquiriesTodayRow?.value ?? 0}
      newOrders={newOrdersRow?.value ?? 0}
      ordersToday={ordersTodayRow?.value ?? 0}
    />
  );
}
