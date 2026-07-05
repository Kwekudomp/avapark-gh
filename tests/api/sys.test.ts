import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({ getDb: vi.fn() }));

import { getDb } from "@/db";
import { POST } from "@/app/api/sys/route";
import { _resetRateLimit } from "@/lib/rate-limit";

// Builds a mock Drizzle db whose select returns `state` and whose upsert succeeds.
// Chains used by the route:
//   select().from().where().limit() -> rows
//   insert().values().onConflictDoUpdate() -> void
const makeDb = (
  state: string | null,
  opts: { writeError?: boolean; readError?: boolean } = {}
) => {
  const onConflictDoUpdate = vi.fn(() =>
    opts.writeError ? Promise.reject(new Error("db down")) : Promise.resolve()
  );
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));

  const limit = vi.fn(() =>
    opts.readError
      ? Promise.reject(new Error("db down"))
      : Promise.resolve(state ? [{ state }] : [])
  );
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));

  return { db: { insert, select } as never, insert, values };
};

const post = (body: unknown) =>
  POST(new Request("https://example.com/api/sys", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never);

describe("POST /api/sys", () => {
  beforeEach(() => {
    _resetRateLimit();
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
    const { db, insert } = makeDb("maintenance");
    vi.mocked(getDb).mockReturnValue(db);
    const res = await post({ password: "s3cret" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: "maintenance" });
    expect(insert).not.toHaveBeenCalled();
  });

  it("updates the row and returns the new state", async () => {
    const { db, values } = makeDb("lockdown");
    vi.mocked(getDb).mockReturnValue(db);
    const res = await post({ password: "s3cret", state: "lockdown" });
    expect(res.status).toBe(200);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ id: "singleton", state: "lockdown" })
    );
    expect(await res.json()).toEqual({ state: "lockdown" });
  });

  it("returns 400 for an invalid state value", async () => {
    const { db } = makeDb("off");
    vi.mocked(getDb).mockReturnValue(db);
    const res = await post({ password: "s3cret", state: "banana" });
    expect(res.status).toBe(400);
  });

  it("returns 500 when the update fails", async () => {
    const { db } = makeDb("off", { writeError: true });
    vi.mocked(getDb).mockReturnValue(db);
    const res = await post({ password: "s3cret", state: "off" });
    expect(res.status).toBe(500);
  });

  it("returns 429 after too many wrong-password attempts", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await post({ password: "wrong" })).status).toBe(401);
    }
    const res = await post({ password: "wrong" });
    expect(res.status).toBe(429);
  });

  it("a correct password resets the failure counter", async () => {
    const { db } = makeDb("off");
    vi.mocked(getDb).mockReturnValue(db);
    for (let i = 0; i < 4; i++) {
      expect((await post({ password: "wrong" })).status).toBe(401);
    }
    expect((await post({ password: "s3cret" })).status).toBe(200);
    for (let i = 0; i < 5; i++) {
      expect((await post({ password: "wrong" })).status).toBe(401);
    }
    expect((await post({ password: "wrong" })).status).toBe(429);
  });
});
