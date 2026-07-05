import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// site-state.ts queries Neon via a tagged-template `sql` function created by
// neon(DATABASE_URL). Mock the package so every query hits mockSql instead.
const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => mockSql }));

import { getSiteState, _resetSiteStateCache } from "@/lib/site-state";

describe("getSiteState", () => {
  beforeEach(() => {
    _resetSiteStateCache();
    mockSql.mockReset();
    // Neutralize the MAINTENANCE_MODE override and re-apply the DATABASE_URL
    // stub in case afterEach of a prior test called vi.unstubAllEnvs().
    vi.stubEnv("MAINTENANCE_MODE", "");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const queueRows = (rows: Array<{ state: string }>) =>
    mockSql.mockResolvedValue(rows);

  it("returns the env override when MAINTENANCE_MODE=lockdown, without querying", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "lockdown");
    expect(await getSiteState()).toBe("lockdown");
    expect(mockSql).not.toHaveBeenCalled();
  });

  it("returns the env override when MAINTENANCE_MODE=maintenance", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "maintenance");
    expect(await getSiteState()).toBe("maintenance");
  });

  it("ignores an invalid env override value and reads the DB", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "true");
    queueRows([{ state: "off" }]);
    expect(await getSiteState()).toBe("off");
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it("reads the state from the database", async () => {
    queueRows([{ state: "lockdown" }]);
    expect(await getSiteState()).toBe("lockdown");
  });

  it("caches the value — a second call within TTL does not query again", async () => {
    queueRows([{ state: "maintenance" }]);
    await getSiteState();
    await getSiteState();
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it("fails open to 'off' when the query throws and there is no cache", async () => {
    mockSql.mockRejectedValue(new Error("network down"));
    expect(await getSiteState()).toBe("off");
  });

  it("fails open to 'off' when DATABASE_URL is not configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(await getSiteState()).toBe("off");
    expect(mockSql).not.toHaveBeenCalled();
  });

  it("returns 'off' when the row holds an unrecognized state", async () => {
    queueRows([{ state: "banana" }]);
    expect(await getSiteState()).toBe("off");
  });
});
