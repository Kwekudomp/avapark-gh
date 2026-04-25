import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import MarketingDashboardClient from "@/components/admin/MarketingDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin"); // user without a profile row

  const admin = createAdminSupabase();

  // Both views need bookings
  const { data: bookings } = await admin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "marketing_sales") {
    const { count: unreadInquiries } = await admin
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");

    // Last-7-days uploads by this user
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUploads } = await admin
      .from("gallery_items")
      .select("*")
      .eq("uploaded_by", user.id)
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(8);

    // Get profile name/email
    const { data: profile } = await admin
      .from("profiles").select("name, email").eq("id", user.id).maybeSingle();

    return (
      <MarketingDashboardClient
        initialBookings={bookings ?? []}
        unreadInquiries={unreadInquiries ?? 0}
        recentUploads={recentUploads ?? []}
        userName={profile?.name ?? user.email ?? ""}
        userEmail={profile?.email ?? user.email ?? ""}
      />
    );
  }

  // Admin path — unchanged from before
  const { count: pendingReviews } = await admin
    .from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: pendingEscalations } = await admin
    .from("escalations").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: unreadInquiries } = await admin
    .from("inquiries").select("*", { count: "exact", head: true }).eq("status", "unread");

  return (
    <AdminDashboardClient
      initialBookings={bookings ?? []}
      userEmail={user.email ?? ""}
      pendingReviews={pendingReviews ?? 0}
      pendingEscalations={pendingEscalations ?? 0}
      unreadInquiries={unreadInquiries ?? 0}
    />
  );
}
