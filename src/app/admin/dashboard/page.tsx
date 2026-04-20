import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  const { createAdminSupabase } = await import("@/lib/supabase-server");
  const admin = createAdminSupabase();
  const { count: pendingReviews } = await admin
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingEscalations } = await admin
    .from("escalations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: unreadInquiries } = await admin
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "unread");

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
