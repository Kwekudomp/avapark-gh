"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CMSVideo } from "@/lib/supabase";

const CATEGORIES = ["highlights", "events", "nature", "experiences"] as const;

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const emptyYT = { title: "", youtube_url: "", category: "highlights" };
const emptyUp = { title: "", video_url: "", category: "highlights" };

export default function VideosCMSClient({ initialVideos }: { initialVideos: CMSVideo[] }) {
  const [videos, setVideos] = useState<CMSVideo[]>(initialVideos);
  const [adding, setAdding] = useState(false);
  const [source, setSource] = useState<"youtube" | "upload">("youtube");
  const [ytForm, setYtForm] = useState(emptyYT);
  const [upForm, setUpForm] = useState(emptyUp);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewId = getYouTubeId(ytForm.youtube_url);

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "videos");
    const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setUpForm(f => ({ ...f, video_url: data.url }));
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (source === "youtube" && !getYouTubeId(ytForm.youtube_url)) {
      alert("Please enter a valid YouTube URL");
      return;
    }
    if (source === "upload" && !upForm.video_url) {
      alert("Please upload a video file first");
      return;
    }
    setSaving(true);
    const payload = source === "youtube"
      ? { title: ytForm.title, youtube_url: ytForm.youtube_url, video_url: null, source: "youtube", category: ytForm.category }
      : { title: upForm.title, youtube_url: null, video_url: upForm.video_url, source: "upload", category: upForm.category };

    const res = await fetch("/api/cms/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, is_active: true, sort_order: videos.length }),
    });
    const data = await res.json();
    if (data.video) {
      setVideos(prev => [...prev, data.video]);
      setYtForm(emptyYT);
      setUpForm(emptyUp);
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
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            {/* Source toggle */}
            <div className="flex gap-2 p-1 bg-bg-alt rounded-xl w-fit">
              <button type="button" onClick={() => setSource("youtube")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${source === "youtube" ? "bg-white shadow text-primary" : "text-text-secondary hover:text-dark"}`}>
                YouTube Link
              </button>
              <button type="button" onClick={() => setSource("upload")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${source === "upload" ? "bg-white shadow text-primary" : "text-text-secondary hover:text-dark"}`}>
                Upload Video
              </button>
            </div>

            {source === "youtube" ? (
              <>
                <input required value={ytForm.title} onChange={e => setYtForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" className={inputClass} />
                <input required value={ytForm.youtube_url} onChange={e => setYtForm(f => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="YouTube URL (e.g. https://youtu.be/abc123)" className={inputClass} />
                <select value={ytForm.category} onChange={e => setYtForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                {previewId && (
                  <div className="rounded-xl overflow-hidden aspect-video">
                    <iframe src={`https://www.youtube.com/embed/${previewId}`} className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                )}
              </>
            ) : (
              <>
                <input required value={upForm.title} onChange={e => setUpForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" className={inputClass} />
                <select value={upForm.category} onChange={e => setUpForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <div>
                  {upForm.video_url ? (
                    <div className="space-y-2">
                      <video src={upForm.video_url} controls className="w-full rounded-xl aspect-video bg-black" />
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-accent hover:underline">Replace video</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-full border-2 border-dashed border-border rounded-xl py-10 text-text-secondary hover:border-primary hover:text-primary transition disabled:opacity-60 text-sm">
                      {uploading ? "Uploading…" : "Click to upload video (MP4, MOV, WEBM — max 50MB)"}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="video/mp4,video/mov,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" />
                </div>
              </>
            )}

            <button type="submit" disabled={saving || uploading}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold text-sm hover:bg-primary-light transition disabled:opacity-60">
              {saving ? "Saving…" : "Save Video"}
            </button>
          </form>
        )}

        {videos.length === 0 && !adding ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-lg font-medium">No videos yet</p>
            <p className="text-sm mt-1">Add YouTube links or upload short clips</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map(v => {
              const ytId = v.source === "youtube" && v.youtube_url ? getYouTubeId(v.youtube_url) : null;
              return (
                <div key={v.id} className={`bg-white rounded-2xl border border-border overflow-hidden ${!v.is_active ? "opacity-60" : ""}`}>
                  {ytId ? (
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={v.title} className="w-full aspect-video object-cover" />
                  ) : v.video_url ? (
                    <video src={v.video_url} className="w-full aspect-video object-cover bg-black" preload="metadata" />
                  ) : null}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-dark text-sm flex-1">{v.title}</p>
                      <span className="text-xs text-text-secondary">{v.source === "youtube" ? "YT" : "Upload"}</span>
                    </div>
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
