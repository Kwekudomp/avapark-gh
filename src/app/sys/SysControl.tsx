"use client";

import { useState } from "react";
import { Power, Wrench, Lock, ShieldAlert } from "lucide-react";

type SiteState = "off" | "maintenance" | "lockdown";

const STATES: { value: SiteState; label: string; icon: typeof Power; hint: string }[] = [
  { value: "off", label: "Off", icon: Power, hint: "Site fully live" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, hint: "Public down, admin stays open" },
  { value: "lockdown", label: "Lockdown", icon: Lock, hint: "Everyone locked out, incl. admin" },
];

export default function SysControl() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [state, setState] = useState<SiteState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(nextState?: SiteState) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/sys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState ? { password, state: nextState } : { password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setState(data.state as SiteState);
      setUnlocked(true);
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 text-primary mb-6">
          <ShieldAlert className="w-6 h-6" strokeWidth={2} />
          <h1 className="font-display text-2xl font-semibold">Site Control</h1>
        </div>

        {!unlocked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) call();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Control password"
              autoFocus
              className="w-full rounded-lg border border-black/10 px-4 py-3 bg-white text-text-primary outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full rounded-lg bg-primary text-white px-4 py-3 font-medium disabled:opacity-50"
            >
              {busy ? "Checking…" : "Unlock"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Current state:{" "}
              <span className="font-semibold text-text-primary">{state}</span>
            </p>
            {STATES.map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                onClick={() => call(value)}
                disabled={busy || state === value}
                className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition disabled:opacity-50 ${
                  state === value
                    ? "border-primary bg-primary/5"
                    : "border-black/10 bg-white hover:border-primary"
                }`}
              >
                <Icon className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
                <span>
                  <span className="block font-medium text-text-primary">{label}</span>
                  <span className="block text-xs text-text-secondary">{hint}</span>
                </span>
              </button>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-text-secondary/70 pt-2">
              Changes take effect within ~15 seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
