"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { GalleryItem } from "@/lib/supabase";

const CATEGORIES = ["venue", "camping", "pool", "gardens", "events"] as const;

export default function GalleryCMSClient({
  initialItems,
}: {
  initialItems: GalleryItem[];
}) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("venue");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "gallery");

    const uploadRes = await fetch("/api/cms/upload", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();
    if (!uploadData.url) { setUploading(false); return; }

    const res = await fetch("/api/cms/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: uploadData.url,
        alt: newAlt || file.name.replace(/\.[^.]+$/, ""),
        category: newCategory,
        sort_order: items.length,
        is_active: true,
      }),
    });
    const data = await res.json();
    if (data.item) setItems(prev => [...prev, data.item]);
    setNewAlt("");
    // reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this image from the gallery?")) return;
    const res = await fetch("/api/cms/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  }

  const inputClass =
    "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">
          ← Dashboard
        </Link>
        <h1 className="font-semibold">Gallery</h1>
        <span className="text-white/40 text-sm">({items.length} photos)</span>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Upload */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-primary mb-4">Upload New Photo</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={newAlt}
              onChange={e => setNewAlt(e.target.value)}
              placeholder="Description (e.g. Pool at night)"
              className={inputClass + " flex-1"}
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition disabled:opacity-60 whitespace-nowrap"
            >
              {uploading ? "Uploading…" : "Choose Photo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
          <p className="text-xs text-text-secondary mt-3">
            Supported: JPG, PNG, WEBP. Images are stored in Supabase Storage and served via CDN.
          </p>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">📸</p>
            <p className="text-lg font-medium">No photos yet</p>
            <p className="text-sm mt-1">Upload your first photo above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs font-medium text-dark truncate">{item.alt}</p>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs bg-bg-alt text-text-secondary capitalize">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  aria-label="Delete image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
