import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminDashboardClient initialBookings={bookings ?? []} userEmail={user.email ?? ""} />;
}
