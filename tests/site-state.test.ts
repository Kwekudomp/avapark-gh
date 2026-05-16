import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSiteState, _resetSiteStateCache } from "@/lib/site-state";

describe("getSiteState", () => {
  beforeEach(() => {
    _resetSiteStateCache();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const mockFetch = (rows: Array<{ state: string }>) =>
    vi.fn().mockResolvedValue({ ok: true, json: async () => rows });

  it("returns the env override when MAINTENANCE_MODE=lockdown, without fetching", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "lockdown");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await getSiteState()).toBe("lockdown");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the env override when MAINTENANCE_MODE=maintenance", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "maintenance");
    expect(await getSiteState()).toBe("maintenance");
  });

  it("ignores an invalid env override value and reads the DB", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "true");
    vi.stubGlobal("fetch", mockFetch([{ state: "off" }]));
    expect(await getSiteState()).toBe("off");
  });

  it("reads the state from the Supabase REST API", async () => {
    vi.stubGlobal("fetch", mockFetch([{ state: "lockdown" }]));
    expect(await getSiteState()).toBe("lockdown");
  });

  it("caches the value — a second call within TTL does not fetch again", async () => {
    const fetchSpy = mockFetch([{ state: "maintenance" }]);
    vi.stubGlobal("fetch", fetchSpy);
    await getSiteState();
    await getSiteState();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fails open to 'off' when the fetch throws and there is no cache", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await getSiteState()).toBe("off");
  });

  it("fails open to 'off' when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect(await getSiteState()).toBe("off");
  });

  it("returns 'off' when the row holds an unrecognized state", async () => {
    vi.stubGlobal("fetch", mockFetch([{ state: "banana" }]));
    expect(await getSiteState()).toBe("off");
  });
});
