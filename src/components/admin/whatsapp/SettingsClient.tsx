"use client";

import { useState } from "react";
import { ArrowLeft, Settings, Save, Check } from "lucide-react";
import type { Venue, Language } from "@/lib/whatsapp/types";

const ALL_LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "tw", label: "Twi" },
  { code: "ee", label: "Ewe" },
  { code: "ga", label: "Ga" },
  { code: "fr", label: "French" },
  { code: "pid", label: "Pidgin" },
];

export default function SettingsClient({ venue }: { venue: Venue }) {
  const [languages, setLanguages] = useState<Language[]>(venue.supported_languages);
  const [brandVoice, setBrandVoice] = useState(venue.brand_voice);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLanguage = (code: Language) => {
    if (code === "en") return;
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/whatsapp/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supported_languages: languages, brand_voice: brandVoice }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/whatsapp/inbox" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <Settings className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-lg">WhatsApp Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6 pb-8">
        <section className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-sm mb-3">Supported Languages</h2>
          <p className="text-xs text-gray-400 mb-3">The agent will auto-detect and reply in these languages. English is always enabled.</p>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  languages.includes(lang.code)
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-gray-200 text-gray-400"
                } ${lang.code === "en" ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-sm mb-3">Brand Voice</h2>
          <p className="text-xs text-gray-400 mb-3">
            Describe how the AI should sound. This guides the tone of auto-replies.
          </p>
          <textarea
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-sm mb-3">Venue Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-gray-800">{venue.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone Number ID</span>
              <span className="text-gray-800 font-mono text-xs">{venue.phone_number_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timezone</span>
              <span className="text-gray-800">{venue.timezone}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
