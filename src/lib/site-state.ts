// Resolves the current site lock state for the middleware gate.
// Resolution order: env override -> fresh cache -> DB read -> stale cache -> 'off'.

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");

  const res = await fetch(
    `${url}/rest/v1/site_state?id=eq.singleton&select=state`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`site_state read failed: ${res.status}`);

  const rows = (await res.json()) as Array<{ state?: string }>;
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
