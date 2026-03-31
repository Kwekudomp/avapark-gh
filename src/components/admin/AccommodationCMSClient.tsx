"use client";

import { useState } from "react";
import Link from "next/link";
import { AccommodationPartner } from "@/lib/supabase";

const empty = {
  name: "", type: "", distance: "", price_from: "", guests: "",
  highlights: "", badge: "", image_url: "", whatsapp_override: "", enquiry_url: "",
};

export default function AccommodationCMSClient({ initialPartners }: { initialPartners: AccommodationPartner[] }) {
  const [partners, setPartners] = useState<AccommodationPartner[]>(initialPartners);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type,
      distance: form.distance,
      price_from: form.price_from,
      guests: form.guests,
      highlights: form.highlights.split("\n").map(h => h.trim()).filter(Boolean),
      badge: form.badge || null,
      image_url: form.image_url || null,
      whatsapp_override: form.whatsapp_override || null,
      enquiry_url: form.enquiry_url || null,
      is_active: true,
      sort_order: partners.length,
    };

    if (editId) {
      const res = await fetch("/api/cms/accommodation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...payload }),
      });
      const data = await res.json();
      if (data.partner) {
        setPartners(prev => prev.map(p => p.id === editId ? data.partner : p));
        setEditId(null);
        setForm(empty);
        setAdding(false);
      }
    } else {
      const res = await fetch("/api/cms/accommodation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.partner) {
        setPartners(prev => [...prev, data.partner]);
        setForm(empty);
        setAdding(false);
      }
    }
    setSaving(false);
  }

  function startEdit(p: AccommodationPartner) {
    setForm({
      name: p.name,
      type: p.type,
      distance: p.distance,
      price_from: p.price_from,
      guests: p.guests,
      highlights: p.highlights.join("\n"),
      badge: p.badge ?? "",
      image_url: p.image_url ?? "",
      whatsapp_override: p.whatsapp_override ?? "",
      enquiry_url: p.enquiry_url ?? "",
    });
    setEditId(p.id);
    setAdding(true);
  }

  async function handleToggle(p: AccommodationPartner) {
    const res = await fetch("/api/cms/accommodation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    if (res.ok) setPartners(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this accommodation partner?")) return;
    const res = await fetch("/api/cms/accommodation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setPartners(prev => prev.filter(p => p.id !== id));
  }

  const inputClass = "border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition w-full";

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">← Dashboard</Link>
          <h1 className="font-semibold">Accommodation Partners</h1>
          <span className="text-white/40 text-sm">({partners.length})</span>
        </div>
        <button
          onClick={() => { setAdding(a => !a); setEditId(null); setForm(empty); }}
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          {adding ? "Cancel" : "+ Add Partner"}
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {adding && (
          <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-semibold text-primary">{editId ? "Edit Partner" : "New Accommodation Partner"}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Partner Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Akuse River Lodge" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Type *</label>
                <input required value={form.type} onChange={e => set("type", e.target.value)} placeholder="e.g. Riverside Cabins" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Distance *</label>
                <input required value={form.distance} onChange={e => set("distance", e.target.value)} placeholder="e.g. 12 min drive" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Price From *</label>
                <input required value={form.price_from} onChange={e => set("price_from", e.target.value)} placeholder="e.g. GHS 450" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Guests *</label>
                <input required value={form.guests} onChange={e => set("guests", e.target.value)} placeholder="e.g. 2–4 guests" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Highlights (one per line) *</label>
              <textarea
                required
                value={form.highlights}
                onChange={e => set("highlights", e.target.value)}
                placeholder={"River views\nAir conditioning\nBreakfast included"}
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Badge (optional)</label>
                <input value={form.badge} onChange={e => set("badge", e.target.value)} placeholder="e.g. Popular, New, Eco-Friendly" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Image URL (optional)</label>
                <input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">WhatsApp Override (optional)</label>
                <input value={form.whatsapp_override} onChange={e => set("whatsapp_override", e.target.value)} placeholder="2330xxxxxxxxx" className={inputClass} />
                <p className="text-xs text-text-secondary mt-1">Leave blank to use park's main WhatsApp</p>
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Direct Booking URL (optional)</label>
                <input value={form.enquiry_url} onChange={e => set("enquiry_url", e.target.value)} placeholder="https://partner-booking-link.com" className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold text-sm hover:bg-primary-light transition disabled:opacity-60">
              {saving ? "Saving…" : editId ? "Update Partner" : "Add Partner"}
            </button>
          </form>
        )}

        {partners.length === 0 && !adding ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">🏨</p>
            <p className="text-lg font-medium">No accommodation partners yet</p>
            <p className="text-sm mt-1">Click "+ Add Partner" to add your first partner lodge</p>
          </div>
        ) : (
          <div className="space-y-4">
            {partners.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border border-border p-5 flex gap-4 ${!p.is_active ? "opacity-60" : ""}`}>
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-3xl">🏕️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-dark">{p.name}</p>
                        {p.badge && (
                          <span className="text-xs font-medium bg-secondary/20 text-dark px-2 py-0.5 rounded-full">{p.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-accent mt-0.5">{p.type}</p>
                      <div className="flex gap-3 mt-1 text-xs text-text-secondary">
                        <span>📍 {p.distance}</span>
                        <span>👥 {p.guests}</span>
                        <span className="font-medium text-primary">From {p.price_from}/night</span>
                      </div>
                      {p.highlights.length > 0 && (
                        <p className="text-xs text-text-secondary mt-1">{p.highlights.join(" · ")}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                      <button onClick={() => startEdit(p)}
                        className="px-3 py-1 bg-bg-alt text-text-secondary rounded-full text-xs font-medium hover:border-primary hover:text-primary border border-border transition">
                        Edit
                      </button>
                      <button onClick={() => handleToggle(p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${p.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-bg-alt text-text-secondary hover:bg-border"}`}>
                        {p.is_active ? "Live" : "Hidden"}
                      </button>
                      <button onClick={() => handleDelete(p.id)}
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
