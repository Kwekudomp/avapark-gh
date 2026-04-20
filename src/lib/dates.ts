// Parse a "YYYY-MM-DD" string as a local Date so new Date("2026-05-30")
// doesn't silently shift back to May 29 in timezones west of UTC.
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Format a local Date back to "YYYY-MM-DD" without the UTC shift
// that date.toISOString() introduces.
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
