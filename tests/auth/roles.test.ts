import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase-server module before importing the helper
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabase: vi.fn(),
  createAdminSupabase: vi.fn(),
}));

import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole, assertAdmin, assertStaff } from "@/lib/auth/roles";

const makeUserClient = (userId: string | null) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }) },
});

const makeAdminClient = (role: string | null) => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: role ? { role } : null,
          error: null,
        }),
      })),
    })),
  })),
});

describe("auth/roles", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getCurrentRole", () => {
    it("returns null when no user is signed in", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      expect(await getCurrentRole()).toBeNull();
    });

    it("returns 'admin' when the user has an admin profile", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      expect(await getCurrentRole()).toBe("admin");
    });

    it("returns 'marketing_sales' when the user has that profile", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      expect(await getCurrentRole()).toBe("marketing_sales");
    });

    it("returns null when the user has no profile row yet", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-3") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      expect(await getCurrentRole()).toBeNull();
    });
  });

  describe("assertAdmin", () => {
    it("returns the user when role is admin", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: true, userId: "user-1" });
    });

    it("returns ok:false 403 for marketing_sales", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 403 });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });

  describe("assertStaff", () => {
    it("returns ok:true with role 'admin'", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-1", role: "admin" });
    });

    it("returns ok:true with role 'marketing_sales'", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-2", role: "marketing_sales" });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });
});
