import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the session + DB module boundaries before importing the helper.
vi.mock("@/lib/admin-auth", () => ({ getAdminSession: vi.fn() }));
vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { getCurrentRole, assertAdmin, assertStaff } from "@/lib/auth/roles";

const session = (userId: string | null) =>
  vi.mocked(getAdminSession).mockResolvedValue(
    userId ? { userId, email: `${userId}@test.dev` } : null
  );

// Drizzle chain used by roles.ts: select().from().where().limit() -> rows
const makeDb = (role: string | null) => {
  const limit = vi.fn().mockResolvedValue(role ? [{ role }] : []);
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { select } as never;
};

describe("auth/roles", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getCurrentRole", () => {
    it("returns null when no user is signed in", async () => {
      session(null);
      vi.mocked(getDb).mockReturnValue(makeDb(null));
      expect(await getCurrentRole()).toBeNull();
    });

    it("returns 'admin' when the user has an admin profile", async () => {
      session("user-1");
      vi.mocked(getDb).mockReturnValue(makeDb("admin"));
      expect(await getCurrentRole()).toBe("admin");
    });

    it("returns 'marketing_sales' when the user has that profile", async () => {
      session("user-2");
      vi.mocked(getDb).mockReturnValue(makeDb("marketing_sales"));
      expect(await getCurrentRole()).toBe("marketing_sales");
    });

    it("returns null when the user has no profile row yet", async () => {
      session("user-3");
      vi.mocked(getDb).mockReturnValue(makeDb(null));
      expect(await getCurrentRole()).toBeNull();
    });
  });

  describe("assertAdmin", () => {
    it("returns the user when role is admin", async () => {
      session("user-1");
      vi.mocked(getDb).mockReturnValue(makeDb("admin"));
      const result = await assertAdmin();
      expect(result).toEqual({ ok: true, userId: "user-1" });
    });

    it("returns ok:false 403 for marketing_sales", async () => {
      session("user-2");
      vi.mocked(getDb).mockReturnValue(makeDb("marketing_sales"));
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 403 });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      session(null);
      vi.mocked(getDb).mockReturnValue(makeDb(null));
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });

  describe("assertStaff", () => {
    it("returns ok:true with role 'admin'", async () => {
      session("user-1");
      vi.mocked(getDb).mockReturnValue(makeDb("admin"));
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-1", role: "admin" });
    });

    it("returns ok:true with role 'marketing_sales'", async () => {
      session("user-2");
      vi.mocked(getDb).mockReturnValue(makeDb("marketing_sales"));
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-2", role: "marketing_sales" });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      session(null);
      vi.mocked(getDb).mockReturnValue(makeDb(null));
      const result = await assertStaff();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });
});
