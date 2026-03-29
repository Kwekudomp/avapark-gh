"use client";

import { useState } from "react";
import Link from "next/link";
import { CMSExperience } from "@/lib/supabase";

const CATEGORY_COLORS: Record<string, string> = {
  recurring: "bg-blue-100 text-blue-700",
  tour: "bg-purple-100 text-purple-700",
  special: "bg-orange-100 text-orange-700",
};

export default function ExperiencesCMSClient({
  initialExperiences,
}: {
  initialExperiences: CMSExperience[];
}) {
  const [experiences, setExperiences] = useState<CMSExperience[]>(initialExperiences);
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(exp: CMSExperience, field: "is_featured" | "is_active") {
    setSaving(exp.id);
    const res = await fetch(`/api/cms/experiences/${exp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !exp[field] }),
    });
    if (res.ok) {
      setExperiences(prev =>
        prev.map(e => e.id === exp.id ? { ...e, [field]: !e[field] } : e)
      );
    }
    setSaving(null);
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">
            ← Dashboard
          </Link>
          <h1 className="font-semibold">Experiences</h1>
        </div>
        <Link
          href="/admin/experiences/new"
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          + Add Experience
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {experiences.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <p className="text-lg mb-2">No experiences yet</p>
              <Link href="/admin/experiences/new" className="text-accent hover:underline text-sm">
                Add your first experience →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Experience", "Category", "Price", "Deposit", "Featured", "Active", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {experiences.map(exp => (
                    <tr key={exp.id} className="hover:bg-bg-alt/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {exp.cover_image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={exp.cover_image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-medium text-dark">{exp.name}</p>
                            <p className="text-text-secondary text-xs">{exp.schedule}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[exp.category] ?? ""}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {exp.price ? `GHC ${exp.price}` : "Free"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {exp.deposit_amount ? `GHC ${exp.deposit_amount}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggle(exp, "is_featured")}
                          disabled={saving === exp.id}
                          title={exp.is_featured ? "Remove from homepage" : "Feature on homepage"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            exp.is_featured ? "bg-secondary" : "bg-gray-200"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            exp.is_featured ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggle(exp, "is_active")}
                          disabled={saving === exp.id}
                          title={exp.is_active ? "Hide from site" : "Show on site"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                            exp.is_active ? "bg-primary" : "bg-gray-200"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            exp.is_active ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/experiences/${exp.id}`}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
