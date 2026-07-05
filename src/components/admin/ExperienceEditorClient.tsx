"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { CMSExperience } from "@/lib/types";
import { useToast } from "./ui/Toast";

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  schedule: string;
  time: string;
  category: "recurring" | "tour" | "special";
  price: string;
  deposit_amount: string;
  is_featured: boolean;
  is_active: boolean;
  cover_image_url: string;
  package_includes: string;
  activities: string;
};

const inputClass =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
const labelClass =
  "block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5";

export default function ExperienceEditorClient({
  experience,
}: {
  experience: CMSExperience | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: experience?.name ?? "",
    slug: experience?.slug ?? "",
    tagline: experience?.tagline ?? "",
    description: experience?.description ?? "",
    schedule: experience?.schedule ?? "",
    time: experience?.time ?? "",
    category: experience?.category ?? "recurring",
    price: experience?.price?.toString() ?? "",
    deposit_amount: experience?.deposit_amount?.toString() ?? "",
    is_featured: experience?.is_featured ?? false,
    is_active: experience?.is_active ?? true,
    cover_image_url: experience?.cover_image_url ?? "",
    package_includes: experience?.package_includes?.join("\n") ?? "",
    activities: experience?.activities?.join("\n") ?? "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug === autoSlug(prev.name) ? autoSlug(name) : prev.slug,
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "experience-images");
      fd.append("folder", form.slug || "general");
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, cover_image_url: data.url }));
        toast("success", "Image uploaded.");
      } else {
        toast("error", `Upload failed: ${data.error ?? res.status}`);
      }
    } catch {
      toast("error", "Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      tagline: form.tagline,
      description: form.description,
      schedule: form.schedule,
      time: form.time,
      category: form.category,
      price: form.price ? parseFloat(form.price) : null,
      deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      cover_image_url: form.cover_image_url || null,
      package_includes: form.package_includes
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean),
      activities: form.activities
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean),
    };

    const url = experience
      ? `/api/cms/experiences/${experience.id}`
      : "/api/cms/experiences";
    const method = experience ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast("error", data.error ?? "Failed to save");
      } else {
        toast("success", "Saved successfully.");
        if (!experience) router.push("/admin/experiences");
      }
    } catch {
      toast("error", "Failed to save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/admin/experiences"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Experiences
        </Link>
        <h1 className="text-2xl font-semibold text-dark mt-2">
          {experience ? `Edit: ${experience.name}` : "New Experience"}
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Cover Image */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-primary mb-4">Cover Image</h2>
          <div className="flex items-start gap-4">
            {form.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.cover_image_url}
                alt="Cover"
                className="w-32 h-32 object-cover rounded-xl border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 bg-bg-alt rounded-xl border-2 border-dashed border-border flex items-center justify-center text-text-secondary text-xs text-center p-2 flex-shrink-0">
                No image
              </div>
            )}
            <div className="flex-1 space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-4 h-4" aria-hidden />
                {uploading ? "Uploading…" : "Upload Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Choose cover image file"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-text-secondary">Or paste a URL:</p>
              <input
                id="exp-cover-url"
                name="cover_image_url"
                value={form.cover_image_url}
                onChange={handleChange}
                placeholder="https://…"
                aria-label="Cover image URL"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-primary mb-2">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-name" className={labelClass}>Name *</label>
              <input
                id="exp-name"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="exp-slug" className={labelClass}>Slug *</label>
              <input
                id="exp-slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="e.g. saturday-bbq"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="exp-tagline" className={labelClass}>Tagline</label>
            <input
              id="exp-tagline"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="Short punchy line"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="exp-description" className={labelClass}>Description</label>
            <textarea
              id="exp-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="exp-schedule" className={labelClass}>Schedule</label>
              <input
                id="exp-schedule"
                name="schedule"
                value={form.schedule}
                onChange={handleChange}
                placeholder="Every Saturday"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="exp-time" className={labelClass}>Time</label>
              <input
                id="exp-time"
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="6:30 PM – 2:00 AM"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="exp-category" className={labelClass}>Category</label>
              <select id="exp-category" name="category" value={form.category} onChange={handleChange} className={inputClass}>
                <option value="recurring">Recurring</option>
                <option value="tour">Tour</option>
                <option value="special">Special Event</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-primary mb-2">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-price" className={labelClass}>Full Price (GHS) — leave blank if free</label>
              <input
                id="exp-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="200"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="exp-deposit" className={labelClass}>Deposit Amount (GHS)</label>
              <input
                id="exp-deposit"
                name="deposit_amount"
                type="number"
                min="0"
                step="0.01"
                value={form.deposit_amount}
                onChange={handleChange}
                placeholder="100"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Includes & Activities */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-primary mb-2">What&apos;s Included &amp; Activities</h2>
          <div>
            <label htmlFor="exp-includes" className={labelClass}>Package Includes (one per line)</label>
            <textarea
              id="exp-includes"
              name="package_includes"
              value={form.package_includes}
              onChange={handleChange}
              rows={5}
              placeholder={"Pool access\nAll games\nWelcome drink"}
              className={inputClass + " resize-none font-mono text-xs"}
            />
          </div>
          <div>
            <label htmlFor="exp-activities" className={labelClass}>Activities (one per line)</label>
            <textarea
              id="exp-activities"
              name="activities"
              value={form.activities}
              onChange={handleChange}
              rows={5}
              placeholder={"Swimming\nBoard games\nBonfire"}
              className={inputClass + " resize-none font-mono text-xs"}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-primary mb-4">Visibility</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-secondary"
              />
              <div>
                <p className="text-sm font-medium text-dark">Featured on homepage</p>
                <p className="text-xs text-text-secondary">Shows in the homepage experiences grid</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-dark">Active (publicly visible)</p>
                <p className="text-xs text-text-secondary">Uncheck to hide from the site</p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-11 bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving…" : experience ? "Save Changes" : "Create Experience"}
        </button>
      </form>
    </div>
  );
}
