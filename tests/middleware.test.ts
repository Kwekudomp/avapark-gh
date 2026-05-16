import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/site-state", () => ({ getSiteState: vi.fn() }));
// Middleware imports createServerClient; no test path below reaches it,
// but mock it so the import is inert.
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

import { middleware } from "@/middleware";
import { getSiteState } from "@/lib/site-state";

const req = (path: string) => new NextRequest(`https://example.com${path}`);
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
