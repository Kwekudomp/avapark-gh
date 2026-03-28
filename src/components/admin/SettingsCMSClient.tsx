"use client";

import { useState } from "react";
import Link from "next/link";

interface Setting {
  key: string;
  value: string;
  label: string;
}

export default function SettingsCMSClient({
  initialSettings,
}: {
  initialSettings: Setting[];
}) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(key: string, value: string) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    await fetch("/api/cms/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: settings.map(({ key, value }) => ({ key, value })),
      }),
    });
    setSaving(false);
    setSuccess(true);
  }

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

  // Group settings for cleaner UI
  const groups = [
    {
      title: "Contact Information",
      keys: ["phone_primary", "phone_picnic", "email", "whatsapp_number"],
    },
    {
      title: "Social & Web",
      keys: ["instagram_handle"],
    },
    {
      title: "Location",
      keys: ["location_address", "location_description"],
    },
    {
      title: "Operating Hours",
      keys: ["hours_weekday", "hours_weekend"],
    },
    {
      title: "Branding",
      keys: ["tagline"],
    },
  ];

  function getSetting(key: string) {
    return settings.find(s => s.key === key);
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">
          ← Dashboard
        </Link>
        <h1 className="font-semibold">Site Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {groups.map(group => (
            <div key={group.title} className="bg-white rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-primary">{group.title}</h2>
              {group.keys.map(key => {
                const setting = getSetting(key);
                if (!setting) return null;
                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                      {setting.label}
                    </label>
                    <input
                      value={setting.value}
                      onChange={e => handleChange(key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              ✓ Settings saved — changes will reflect on the site after the next deploy or page refresh.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-light transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
