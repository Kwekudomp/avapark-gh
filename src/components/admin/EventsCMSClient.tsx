"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CMSEvent } from "@/lib/supabase";
import { parseLocalDate } from "@/lib/dates";

const empty = {
  title: "", description: "", event_date: "", end_date: "",
  image_url: "", price: "", ticket_url: "",
};

export default function EventsCMSClient({ initialEvents }: { initialEvents: CMSEvent[] }) {
  const [events, setEvents] = useState<CMSEvent[]>(initialEvents);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "gallery");
    const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) set("image_url", data.url);
    setUploading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/cms/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
        end_date: form.end_date || null,
        image_url: form.image_url || null,
        price: form.price || null,
        ticket_url: form.ticket_url || null,
        is_active: true,
        sort_order: events.length,
      }),
    });
    const data = await res.json();
    if (data.event) {
      setEvents(prev => [...prev, data.event]);
      setForm(empty);
      setAdding(false);
    }
    setSaving(false);
  }

  async function handleToggle(ev: CMSEvent) {
    const res = await fetch("/api/cms/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ev.id, is_active: !ev.is_active }),
    });
    if (res.ok) setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_active: !e.is_active } : e));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this event?")) return;
    const res = await fetch("/api/cms/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
  }

  const inputClass = "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition w-full";

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">← Dashboard</Link>
          <h1 className="font-semibold">Upcoming Events</h1>
          <span className="text-white/40 text-sm">({events.length})</span>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          {adding ? "Cancel" : "+ Add Event"}
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {adding && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-primary">New Event</h2>
            <input required value={form.title} onChange={e => set("title", e.target.value)} placeholder="Event title" className={inputClass} />
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description" rows={3} className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Start Date *</label>
                <input required type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">End Date (optional)</label>
                <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.price} onChange={e => set("price", e.target.value)} placeholder="Price (e.g. GHC 150)" className={inputClass} />
              <input value={form.ticket_url} onChange={e => set("ticket_url", e.target.value)} placeholder="Ticket / booking link (optional)" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Cover Image</label>
              {form.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-2" />
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:border-primary transition disabled:opacity-60">
                {uploading ? "Uploading…" : form.image_url ? "Change Image" : "Upload Image"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold text-sm hover:bg-primary-light transition disabled:opacity-60">
              {saving ? "Saving…" : "Save Event"}
            </button>
          </form>
        )}

        {events.length === 0 && !adding ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-lg font-medium">No events yet</p>
            <p className="text-sm mt-1">Click &ldquo;+ Add Event&rdquo; to create your first upcoming event</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(ev => (
              <div key={ev.id} className={`bg-white rounded-2xl border border-border p-5 flex gap-4 ${!ev.is_active ? "opacity-60" : ""}`}>
                {ev.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ev.image_url} alt={ev.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-dark">{ev.title}</p>
                      <p className="text-xs text-accent mt-0.5">
                        {parseLocalDate(ev.event_date).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
                        {ev.end_date && ` — ${parseLocalDate(ev.end_date).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}`}
                      </p>
                      {ev.price && <p className="text-xs text-text-secondary mt-1">{ev.price}</p>}
                      {ev.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{ev.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleToggle(ev)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${ev.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-bg-alt text-text-secondary hover:bg-border"}`}>
                        {ev.is_active ? "Live" : "Hidden"}
                      </button>
                      <button onClick={() => handleDelete(ev.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
