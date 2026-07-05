"use client";

import { useState } from "react";
import { useToast } from "./ui/Toast";

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
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [saving, setSaving] = useState(false);

  function handleChange(key: string, value: string) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: settings.map(({ key, value }) => ({ key, value })),
        }),
      });
      if (res.ok) {
        toast("success", "Settings saved — changes will reflect on the site after the next deploy or page refresh.");
      } else {
        toast("error", `Could not save settings (${res.status}).`);
      }
    } catch {
      toast("error", "Could not save settings — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Site Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Contact info, hours, social links and branding.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {groups.map(group => (
          <div key={group.title} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-primary">{group.title}</h2>
            {group.keys.map(key => {
              const setting = getSetting(key);
              if (!setting) return null;
              return (
                <div key={key}>
                  <label htmlFor={`setting-${key}`} className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                    {setting.label}
                  </label>
                  <input
                    id={`setting-${key}`}
                    value={setting.value}
                    onChange={e => handleChange(key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              );
            })}
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-11 bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
