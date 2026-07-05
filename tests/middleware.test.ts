import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/site-state", () => ({ getSiteState: vi.fn() }));

import { middleware } from "@/middleware";
import { getSiteState } from "@/lib/site-state";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const req = (path: string, sessionToken?: string) =>
  new NextRequest(`https://example.com${path}`, {
    headers: sessionToken ? { cookie: `${SESSION_COOKIE}=${sessionToken}` } : {},
  });
const rewriteTarget = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("middleware maintenance gate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("off: lets public traffic through (no rewrite)", async () => {
    vi.mocked(getSiteState).mockResolvedValue("off");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toBeNull();
    expect(res.headers.get("x-pathname")).toBe("/experiences");
  });

  it("maintenance: rewrites public traffic to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("maintenance: leaves /admin reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/admin"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("maintenance: leaves /sys reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("lockdown: rewrites public traffic to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: rewrites /admin to /maintenance (client locked out)", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/admin"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: rewrites /api/admin to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/api/admin/bookings"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: leaves /sys reachable so the lock can be lifted", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("lockdown: leaves /api/sys reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/api/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });
});

describe("middleware admin session gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSiteState).mockResolvedValue("off");
  });

  it("redirects /admin/* to /admin when no session cookie is present", async () => {
    const res = await middleware(req("/admin/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin");
  });

  it("redirects /admin/* to /admin when the session cookie is invalid", async () => {
    const res = await middleware(req("/admin/dashboard", "not-a-real-jwt"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/admin");
  });

  it("lets /admin/* through with a valid hp_admin_session cookie", async () => {
    const token = await createSessionToken({ id: "user-1", email: "admin@test.dev" });
    const res = await middleware(req("/admin/dashboard", token));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-pathname")).toBe("/admin/dashboard");
  });

  it("leaves /admin (the login page) reachable without a session", async () => {
    const res = await middleware(req("/admin"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-pathname")).toBe("/admin");
  });
});
