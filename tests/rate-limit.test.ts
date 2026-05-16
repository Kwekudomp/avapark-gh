import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isRateLimited,
  recordFailure,
  clearFailures,
  _resetRateLimit,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => _resetRateLimit());

  it("a fresh key is not rate limited", () => {
    expect(isRateLimited("1.2.3.4")).toBe(false);
  });

  it("is not limited below the failure threshold", () => {
    for (let i = 0; i < 4; i++) recordFailure("ip");
    expect(isRateLimited("ip")).toBe(false);
  });

  it("is limited once the failure threshold is reached", () => {
    for (let i = 0; i < 5; i++) recordFailure("ip");
    expect(isRateLimited("ip")).toBe(true);
  });

  it("clearFailures resets the counter", () => {
    for (let i = 0; i < 5; i++) recordFailure("ip");
    clearFailures("ip");
    expect(isRateLimited("ip")).toBe(false);
  });

  it("the limit expires after the window passes", () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 5; i++) recordFailure("ip");
      expect(isRateLimited("ip")).toBe(true);
      vi.advanceTimersByTime(60_001);
      expect(isRateLimited("ip")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 5; i++) recordFailure("ip-a");
    expect(isRateLimited("ip-a")).toBe(true);
    expect(isRateLimited("ip-b")).toBe(false);
  });
});
