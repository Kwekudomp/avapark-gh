"use client";

import { useId, useState } from "react";
import { Save } from "lucide-react";
import WhatsAppTabs from "./WhatsAppTabs";
import { useToast } from "../ui/Toast";
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
  const { toast } = useToast();
  const brandVoiceId = useId();
  const [languages, setLanguages] = useState<Language[]>(venue.supported_languages);
  const [brandVoice, setBrandVoice] = useState(venue.brand_voice);
  const [saving, setSaving] = useState(false);

  const toggleLanguage = (code: Language) => {
    if (code === "en") return;
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supported_languages: languages, brand_voice: brandVoice }),
      });

      if (res.ok) {
        toast("success", "WhatsApp settings saved.");
      } else {
        toast("error", "Could not save settings — please try again.");
      }
    } catch {
      toast("error", "Could not save settings — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">WhatsApp Settings</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Languages and tone for the AI agent.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" aria-hidden />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <WhatsAppTabs />

      <div className="space-y-6 pb-8">
        <section className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm text-dark mb-1">Supported Languages</h2>
          <p className="text-xs text-text-secondary mb-3">
            The agent will auto-detect and reply in these languages. English is always enabled.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((lang) => {
              const active = languages.includes(lang.code);
              const locked = lang.code === "en";
              return (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  aria-pressed={active}
                  disabled={locked}
                  className={`inline-flex items-center min-h-11 px-4 text-sm font-medium rounded-full border transition-colors ${
                    active
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-white border-border text-text-secondary hover:border-primary"
                  } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm text-dark mb-1">
            <label htmlFor={brandVoiceId}>Brand Voice</label>
          </h2>
          <p className="text-xs text-text-secondary mb-3">
            Describe how the AI should sound. This guides the tone of auto-replies.
          </p>
          <textarea
            id={brandVoiceId}
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            rows={4}
            className="w-full text-sm border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </section>

        <section className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm text-dark mb-3">Venue Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Name</span>
              <span className="text-dark">{venue.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Phone Number ID</span>
              <span className="text-dark font-mono text-xs">{venue.phone_number_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Timezone</span>
              <span className="text-dark">{venue.timezone}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
