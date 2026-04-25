import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { AdminRoleProvider } from "@/components/admin/AdminRoleContext";
import type { UserRole } from "@/lib/supabase";

const MSO_ALLOWED_PREFIXES = [
  "/admin/dashboard",
  "/admin/inquiries",
  "/admin/gallery",
];

function isMsoAllowed(pathname: string): boolean {
  return MSO_ALLOWED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read pathname so we can gate routes. The /admin login page must remain
  // accessible without a session — so we only gate when path !== /admin.
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  // Login page (/admin) — let the page render without checks.
  if (pathname === "/admin" || pathname === "") {
    return <>{children}</>;
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const adminClient = createAdminSupabase();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Auth user with no profile row — fail closed.
    redirect("/admin");
  }

  const role = profile.role as UserRole;

  // Route gating for marketing_sales
  if (role === "marketing_sales" && !isMsoAllowed(pathname)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminRoleProvider
      value={{
        userId: user.id,
        email: profile.email,
        name: profile.name,
        role,
      }}
    >
      {children}
    </AdminRoleProvider>
  );
}
