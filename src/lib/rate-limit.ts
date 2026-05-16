// Minimal in-memory fixed-window rate limiter for the /api/sys password gate.
// State lives per warm serverless instance — enough to blunt brute-force on a
// low-traffic admin endpoint; it is not a distributed limiter.

const WINDOW_MS = 60_000;
const MAX_FAILURES = 5;

type Entry = { failures: number; windowStart: number };

const buckets = new Map<string, Entry>();

/** Test-only: clears all rate-limit buckets. */
export function _resetRateLimit(): void {
  buckets.clear();
}

/** True if this key has used up its failed-attempt budget for the current window. */
export function isRateLimited(key: string): boolean {
  const entry = buckets.get(key);
  if (!entry) return false;
  if (Date.now() - entry.windowStart >= WINDOW_MS) return false;
  return entry.failures >= MAX_FAILURES;
}

/** Records one failed attempt for this key, opening a new window if needed. */
export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    buckets.set(key, { failures: 1, windowStart: now });
  } else {
    entry.failures += 1;
  }
}

/** Clears the failure count for this key — call after a successful auth. */
export function clearFailures(key: string): void {
  buckets.delete(key);
}
