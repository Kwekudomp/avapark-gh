import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Paths that stay reachable even when MAINTENANCE_MODE=true.
// Admin can still log in and operate; /api/admin keeps the admin panel functional.
const MAINTENANCE_ALLOWED_PREFIXES = [
  "/admin",
  "/api/admin",
  "/api/auth",
  "/maintenance",
  "/_next",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Maintenance gate — redirect public traffic to /maintenance when toggled on.
  if (
    process.env.MAINTENANCE_MODE === "true" &&
    !MAINTENANCE_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 2) Always expose pathname via header so the admin layout server component
  // can read it (Next.js App Router does not expose pathname to layouts).
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.headers.set("x-pathname", pathname);

  // 3) Admin auth refresh — only for /admin/* (not /admin itself which is the login page)
  if (!pathname.startsWith("/admin/")) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  // Match all routes except static assets and Next internals. We still need this
  // to be broad enough for the maintenance gate AND narrow enough that static
  // images / fonts / favicons aren't rewritten.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|hp-logo|images/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf)$).*)",
  ],
};
