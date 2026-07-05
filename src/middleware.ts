import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getSiteState } from "@/lib/site-state";

// Paths reachable while state = 'maintenance' (real maintenance — admin keeps working).
const MAINTENANCE_ALLOWED_PREFIXES = [
  "/admin",
  "/api/admin",
  "/api/auth",
  "/sys",
  "/api/sys",
  "/maintenance",
  "/_next",
];

// Paths reachable while state = 'lockdown' (hard lock — admin is locked out too).
// Only the control surface and the maintenance page survive, so the lock can be lifted.
const LOCKDOWN_ALLOWED_PREFIXES = [
  "/sys",
  "/api/sys",
  "/maintenance",
  "/_next",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Site lock gate — rewrite gated traffic to /maintenance.
  const siteState = await getSiteState();

  if (
    siteState === "maintenance" &&
    !MAINTENANCE_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  if (
    siteState === "lockdown" &&
    !LOCKDOWN_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 2) Always expose pathname via header so the admin layout server component
  // can read it (Next.js App Router does not expose pathname to layouts).
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.headers.set("x-pathname", pathname);

  // 3) Admin session gate — only for /admin/* (not /admin itself which is the login page)
  if (!pathname.startsWith("/admin/")) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
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
