"use client";

import { useState, useRef } from "react";
import { Lock, Image as ImageIcon, X } from "lucide-react";
import { GalleryItem } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const CATEGORIES = ["venue", "camping", "pool", "gardens", "events"] as const;

export default function GalleryCMSClient({
  initialItems,
  currentUserId,
  isAdmin,
  uploaderMap,
}: {
  initialItems: GalleryItem[];
  currentUserId: string;
  isAdmin: boolean;
  uploaderMap: Record<string, string>;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("venue");
  const [confirmDelete, setConfirmDelete] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "gallery");

      const uploadRes = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok || !uploadData.url) {
        toast("error", `Upload failed (${uploadRes.status}): ${uploadData.error ?? "unknown error"}`);
        return;
      }

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.item) {
        toast("error", `Save failed (${res.status}): ${data.error ?? "unknown error"}`);
        return;
      }

      setItems(prev => [...prev, data.item]);
      setNewAlt("");
      toast("success", "Photo uploaded — visible on the public gallery within a minute.");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch("/api/cms/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast("error", `Remove failed (${res.status}): ${data.error ?? "unknown error"}`);
        return;
      }
      setItems(prev => prev.filter(i => i.id !== id));
      toast("success", "Photo removed from gallery.");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Remove failed");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  const inputClass =
    "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-dark">Gallery</h1>
        <p className="text-sm text-text-secondary mt-0.5">{items.length} photo{items.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-primary mb-4">Upload New Photo</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newAlt}
            onChange={e => setNewAlt(e.target.value)}
            placeholder="Description (e.g. Pool at night)"
            aria-label="Photo description"
            className={inputClass + " flex-1"}
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            aria-label="Photo category"
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
            className="min-h-11 bg-accent text-white px-6 rounded-full text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
          >
            {uploading ? "Uploading…" : "Choose Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose photo file"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
        <p className="text-xs text-text-secondary mt-3">
          Supported: JPG, PNG, WEBP. Images are stored in Cloudflare R2 and served via CDN.
        </p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1.5} aria-hidden />
          <p className="text-lg font-medium">No photos yet</p>
          <p className="text-sm mt-1">Upload your first photo above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
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
              {(isAdmin || item.uploaded_by === currentUserId) ? (
                <button
                  onClick={() => setConfirmDelete(item)}
                  className="absolute top-1 right-1 min-h-11 min-w-11 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                  aria-label={`Delete ${item.alt}`}
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              ) : (
                <span
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-text-secondary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                  title={item.uploaded_by ? `Uploaded by ${uploaderMap[item.uploaded_by] ?? "unknown"}` : "Uploaded by admin"}
                >
                  <Lock className="w-3 h-3" aria-hidden /> {item.uploaded_by ? uploaderMap[item.uploaded_by] ?? "Other" : "Admin"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this image?"
        message={confirmDelete ? `"${confirmDelete.alt}" will be removed from the public gallery.` : ""}
        confirmLabel="Remove image"
        danger
        busy={deleting}
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
