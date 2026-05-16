import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase-server", () => ({ createAdminSupabase: vi.fn() }));

import { createAdminSupabase } from "@/lib/supabase-server";
import { POST } from "@/app/api/sys/route";

// Builds a mock admin client whose select returns `state` and whose update succeeds.
const makeAdmin = (
  state: string | null,
  opts: { updateError?: { message: string }; selectError?: { message: string } } = {}
) => {
  const updateEq = vi.fn().mockResolvedValue({ error: opts.updateError ?? null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const maybeSingle = vi.fn().mockResolvedValue({
    data: state ? { state } : null,
    error: opts.selectError ?? null,
  });
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
  return { client: { from: vi.fn(() => ({ update, select })) }, update, updateEq };
};

const post = (body: unknown) =>
  POST(new Request("https://example.com/api/sys", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never);

describe("POST /api/sys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("MAINTENANCE_SECRET", "s3cret");
  });

  it("returns 503 when MAINTENANCE_SECRET is not configured", async () => {
    vi.stubEnv("MAINTENANCE_SECRET", "");
    const res = await post({ password: "s3cret" });
    expect(res.status).toBe(503);
  });

  it("returns 401 for a wrong password", async () => {
    const res = await post({ password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns the current state for a correct password with no state change", async () => {
    const { client } = makeAdmin("maintenance");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: "maintenance" });
  });

  it("updates the row and returns the new state", async () => {
    const { client, update } = makeAdmin("lockdown");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "lockdown" });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ state: "lockdown" });
    expect(await res.json()).toEqual({ state: "lockdown" });
  });

  it("returns 400 for an invalid state value", async () => {
    const { client } = makeAdmin("off");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "banana" });
    expect(res.status).toBe(400);
  });

  it("returns 500 when the update fails", async () => {
    const { client } = makeAdmin("off", { updateError: { message: "db down" } });
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "off" });
    expect(res.status).toBe(500);
  });
});
