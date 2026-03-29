"use client";

import { useState } from "react";
import Link from "next/link";

export interface CMSVideo {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

const CATEGORIES = ["highlights", "events", "nature", "experiences"] as const;

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const empty = { title: "", youtube_url: "", category: "highlights" };

export default function VideosCMSClient({ initialVideos }: { initialVideos: CMSVideo[] }) {
  const [videos, setVideos] = useState<CMSVideo[]>(initialVideos);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const previewId = getYouTubeId(form.youtube_url);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!getYouTubeId(form.youtube_url)) {
      alert("Please enter a valid YouTube URL");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/cms/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        youtube_url: form.youtube_url,
        category: form.category,
        is_active: true,
        sort_order: videos.length,
      }),
    });
    const data = await res.json();
    if (data.video) {
      setVideos(prev => [...prev, data.video]);
      setForm(empty);
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleToggle(v: CMSVideo) {
    const res = await fetch("/api/cms/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, is_active: !v.is_active }),
    });
    if (res.ok) setVideos(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this video?")) return;
    const res = await fetch("/api/cms/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setVideos(prev => prev.filter(x => x.id !== id));
  }

  const inputClass = "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition w-full";

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">← Dashboard</Link>
          <h1 className="font-semibold">Videos</h1>
          <span className="text-white/40 text-sm">({videos.length})</span>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          {adding ? "Cancel" : "+ Add Video"}
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {adding && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-primary">Add YouTube Video</h2>
            <input required value={form.title} onChange={e => set("title", e.target.value)} placeholder="Video title" className={inputClass} />
            <input required value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)}
              placeholder="YouTube URL (e.g. https://youtu.be/abc123)" className={inputClass} />
            <select value={form.category} onChange={e => set("category", e.target.value)} className={inputClass}>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            {previewId && (
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${previewId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <button type="submit" disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold text-sm hover:bg-primary-light transition disabled:opacity-60">
              {saving ? "Saving…" : "Save Video"}
            </button>
          </form>
        )}

        {videos.length === 0 && !adding ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-lg font-medium">No videos yet</p>
            <p className="text-sm mt-1">Paste YouTube links to showcase your content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map(v => {
              const vid = getYouTubeId(v.youtube_url);
              return (
                <div key={v.id} className={`bg-white rounded-2xl border border-border overflow-hidden ${!v.is_active ? "opacity-60" : ""}`}>
                  {vid && (
                    <img
                      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="font-medium text-dark text-sm">{v.title}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-bg-alt text-text-secondary capitalize">{v.category}</span>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleToggle(v)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${v.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-bg-alt text-text-secondary hover:bg-border"}`}>
                        {v.is_active ? "Live" : "Hidden"}
                      </button>
                      <button onClick={() => handleDelete(v.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
