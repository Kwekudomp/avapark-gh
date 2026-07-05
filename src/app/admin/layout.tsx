import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
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

  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const [account] = await getDb()
    .select({ role: users.role, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!account) {
    // Session for a deleted user — fail closed.
    redirect("/admin");
  }

  const role = account.role as UserRole;

  // Route gating for marketing_sales
  if (role === "marketing_sales" && !isMsoAllowed(pathname)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminRoleProvider
      value={{
        userId: session.userId,
        email: account.email,
        name: account.name ?? "",
        role,
      }}
    >
      {children}
    </AdminRoleProvider>
  );
}
