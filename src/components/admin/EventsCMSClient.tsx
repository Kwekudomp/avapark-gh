"use client";

import { useState, useRef } from "react";
import { Calendar, Plus, X } from "lucide-react";
import { CMSEvent } from "@/lib/types";
import { parseLocalDate } from "@/lib/dates";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const empty = {
  title: "", description: "", event_date: "", end_date: "",
  image_url: "", price: "", ticket_url: "",
};

type FormState = typeof empty;

export default function EventsCMSClient({ initialEvents }: { initialEvents: CMSEvent[] }) {
  const { toast } = useToast();
  const [events, setEvents] = useState<CMSEvent[]>(initialEvents);
  const [form, setForm] = useState<FormState>(empty);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CMSEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formOpen = adding || editingId !== null;

  function set(k: keyof FormState, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function resetForm() {
    setForm(empty);
    setAdding(false);
    setEditingId(null);
  }

  function openAdd() {
    setEditingId(null);
    setForm(empty);
    setAdding(true);
  }

  function openEdit(ev: CMSEvent) {
    setAdding(false);
    setEditingId(ev.id);
    setForm({
      title: ev.title ?? "",
      description: ev.description ?? "",
      event_date: ev.event_date ?? "",
      end_date: ev.end_date ?? "",
      image_url: ev.image_url ?? "",
      price: ev.price ?? "",
      ticket_url: ev.ticket_url ?? "",
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "gallery");
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        set("image_url", data.url);
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
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      end_date: form.end_date || null,
      image_url: form.image_url || null,
      price: form.price || null,
      ticket_url: form.ticket_url || null,
    };

    try {
      if (editingId) {
        const res = await fetch("/api/cms/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        if (data.event) {
          setEvents(prev => prev.map(e => e.id === editingId ? { ...e, ...data.event } : e));
          resetForm();
          toast("success", "Event updated.");
        } else {
          toast("error", `Could not update event: ${data.error ?? res.status}`);
        }
      } else {
        const res = await fetch("/api/cms/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, is_active: true, sort_order: events.length }),
        });
        const data = await res.json();
        if (data.event) {
          setEvents(prev => [...prev, data.event]);
          resetForm();
          toast("success", "Event created.");
        } else {
          toast("error", `Could not create event: ${data.error ?? res.status}`);
        }
      }
    } catch {
      toast("error", "Could not save event — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(ev: CMSEvent) {
    try {
      const res = await fetch("/api/cms/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ev.id, is_active: !ev.is_active }),
      });
      if (res.ok) {
        setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_active: !e.is_active } : e));
        toast("success", ev.is_active ? "Event hidden from the site." : "Event is now live.");
      } else {
        toast("error", `Could not update event (${res.status}).`);
      }
    } catch {
      toast("error", "Could not update event — check your connection and try again.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch("/api/cms/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        if (editingId === id) resetForm();
        toast("success", "Event removed.");
      } else {
        toast("error", `Could not remove event (${res.status}).`);
      }
    } catch {
      toast("error", "Could not remove event — check your connection and try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  const inputClass = "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors w-full";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Upcoming Events</h1>
          <p className="text-sm text-text-secondary mt-0.5">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => (formOpen ? resetForm() : openAdd())}
          className="inline-flex items-center gap-1.5 min-h-11 bg-accent text-white px-4 rounded-full text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer shrink-0"
        >
          {formOpen ? <><X className="w-4 h-4" aria-hidden /> Cancel</> : <><Plus className="w-4 h-4" aria-hidden /> Add Event</>}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-primary">{editingId ? "Edit Event" : "New Event"}</h2>
          <input required value={form.title} onChange={e => set("title", e.target.value)} placeholder="Event title" aria-label="Event title" className={inputClass} />
          <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description" aria-label="Event description" rows={3} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start-date" className="text-xs text-text-secondary mb-1 block">Start Date *</label>
              <input id="event-start-date" required type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="event-end-date" className="text-xs text-text-secondary mb-1 block">End Date (optional)</label>
              <input id="event-end-date" type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.price} onChange={e => set("price", e.target.value)} placeholder="Price (e.g. GHC 150)" aria-label="Event price" className={inputClass} />
            <input value={form.ticket_url} onChange={e => set("ticket_url", e.target.value)} placeholder="Ticket / booking link (optional)" aria-label="Ticket or booking link" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Cover Image</label>
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-2" />
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="min-h-11 px-4 border border-border rounded-xl text-sm text-text-secondary hover:border-primary transition-colors cursor-pointer disabled:opacity-60">
                {uploading ? "Uploading…" : form.image_url ? "Change Image" : "Upload Image"}
              </button>
              {form.image_url && (
                <button type="button" onClick={() => set("image_url", "")}
                  className="min-h-11 px-3 border border-border rounded-xl text-sm text-text-secondary hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer">
                  Remove
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" aria-label="Choose cover image file" onChange={handleImageUpload} className="hidden" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 min-h-11 bg-primary text-white py-3 rounded-full font-semibold text-sm hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60">
              {saving ? "Saving…" : editingId ? "Update Event" : "Save Event"}
            </button>
            <button type="button" onClick={resetForm}
              className="min-h-11 px-6 py-3 border border-border rounded-full text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}

      {events.length === 0 && !formOpen ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1.5} aria-hidden />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm mt-1">Click &ldquo;Add Event&rdquo; to create your first upcoming event</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className={`bg-white rounded-2xl border p-5 flex gap-4 transition-colors ${editingId === ev.id ? "border-primary ring-2 ring-primary/20" : "border-border"} ${!ev.is_active ? "opacity-60" : ""}`}>
              {ev.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.image_url} alt={ev.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-dark">{ev.title}</p>
                    <p className="text-xs text-accent mt-0.5">
                      {parseLocalDate(ev.event_date).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
                      {ev.end_date && ` — ${parseLocalDate(ev.end_date).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}`}
                    </p>
                    {ev.price && <p className="text-xs text-text-secondary mt-1">{ev.price}</p>}
                    {ev.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{ev.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button onClick={() => openEdit(ev)}
                      className="min-h-11 px-3 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => handleToggle(ev)}
                      aria-pressed={ev.is_active}
                      className={`min-h-11 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${ev.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-bg-alt text-text-secondary hover:bg-border"}`}>
                      {ev.is_active ? "Live" : "Hidden"}
                    </button>
                    <button onClick={() => setConfirmDelete(ev)}
                      className="min-h-11 px-3 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this event?"
        message={confirmDelete ? `"${confirmDelete.title}" will be permanently removed from the site.` : ""}
        confirmLabel="Remove event"
        danger
        busy={deleting}
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
