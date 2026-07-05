// Resolves the current site lock state for the middleware gate.
// Resolution order: env override -> fresh cache -> DB read -> stale cache -> 'off'.

import { neon } from "@neondatabase/serverless";

export type SiteState = "off" | "maintenance" | "lockdown";

const VALID: readonly SiteState[] = ["off", "maintenance", "lockdown"];
const CACHE_TTL_MS = 15_000;

let cache: { value: SiteState; at: number } | null = null;

/** Test-only: clears the module-scope cache so tests start clean. */
export function _resetSiteStateCache(): void {
  cache = null;
}

function envOverride(): SiteState | null {
  const env = process.env.MAINTENANCE_MODE;
  if (env === "maintenance" || env === "lockdown") return env;
  return null;
}

async function fetchState(): Promise<SiteState> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");

  // Raw neon-http query (Edge-compatible) — middleware runs on the Edge
  // runtime, and this avoids pulling the full Drizzle schema into it.
  const sql = neon(url);
  const rows = (await sql`select state from site_state where id = 'singleton'`) as Array<{ state?: string }>;
  const state = rows[0]?.state;
  if (state && VALID.includes(state as SiteState)) return state as SiteState;
  return "off";
}

export async function getSiteState(): Promise<SiteState> {
  const override = envOverride();
  if (override) return override;

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }

  try {
    const value = await fetchState();
    cache = { value, at: Date.now() };
    return value;
  } catch {
    // Fail-open: never let a flag-read failure take the site down.
    return cache?.value ?? "off";
  }
}
