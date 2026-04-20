"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Mail, Phone, Archive, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import type { Inquiry, InquiryStatus } from "@/lib/supabase";

type Tab = "inbox" | "archived" | "all";

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleString("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InquiriesCMSClient({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [tab, setTab] = useState<Tab>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(initialInquiries[0]?.id ?? null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (tab === "inbox") return inquiries.filter(i => i.status !== "archived");
    if (tab === "archived") return inquiries.filter(i => i.status === "archived");
    return inquiries;
  }, [inquiries, tab]);

  const unreadCount = inquiries.filter(i => i.status === "unread").length;
  const archivedCount = inquiries.filter(i => i.status === "archived").length;

  const selected = inquiries.find(i => i.id === selectedId) ?? filtered[0] ?? null;

  async function patch(id: string, updates: Partial<Pick<Inquiry, "status" | "admin_note">>) {
    setBusyId(id);
    const res = await fetch("/api/cms/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await res.json();
    if (data.inquiry) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...data.inquiry } : i));
    }
    setBusyId(null);
  }

  async function markRead(inq: Inquiry) {
    if (inq.status === "unread") await patch(inq.id, { status: "read" });
  }

  async function setStatus(inq: Inquiry, status: InquiryStatus) {
    await patch(inq.id, { status });
  }

  async function remove(inq: Inquiry) {
    if (!confirm("Permanently delete this inquiry? This cannot be undone.")) return;
    setBusyId(inq.id);
    const res = await fetch("/api/cms/inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inq.id }),
    });
    if (res.ok) {
      setInquiries(prev => prev.filter(i => i.id !== inq.id));
      if (selectedId === inq.id) setSelectedId(null);
    }
    setBusyId(null);
  }

  function handleSelect(inq: Inquiry) {
    setSelectedId(inq.id);
    markRead(inq);
  }

  const replyHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(
        `Re: Your inquiry${selected.experience ? ` about ${selected.experience}` : ""}`
      )}&body=${encodeURIComponent(
        `Hi ${selected.name.split(" ")[0] || selected.name},\n\nThanks for reaching out to Hidden Paradise.\n\n`
      )}`
    : "#";

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">← Dashboard</Link>
          <h1 className="font-semibold">Inquiries</h1>
          <span className="text-white/40 text-sm">({inquiries.length})</span>
        </div>
        {unreadCount > 0 && (
          <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-5">
          {[
            { key: "inbox", label: "Inbox", count: inquiries.filter(i => i.status !== "archived").length },
            { key: "archived", label: "Archived", count: archivedCount },
            { key: "all", label: "All", count: inquiries.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                tab === t.key
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}
            >
              {t.label} <span className="opacity-60 ml-1">({t.count})</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-5">
          {/* List */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-text-secondary">
                <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
                <p className="text-sm font-medium">No inquiries here</p>
                <p className="text-xs mt-1">Submissions from the /contact form will appear in this inbox.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                {filtered.map(inq => (
                  <li key={inq.id}>
                    <button
                      onClick={() => handleSelect(inq)}
                      className={`w-full text-left p-4 transition ${
                        selected?.id === inq.id ? "bg-primary/5" : "hover:bg-bg-alt"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {inq.status === "unread" && (
                              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" aria-label="Unread" />
                            )}
                            <p className={`text-sm truncate ${inq.status === "unread" ? "font-semibold text-dark" : "font-medium text-text-secondary"}`}>
                              {inq.name}
                            </p>
                          </div>
                          {inq.experience && (
                            <p className="text-xs text-accent truncate mt-0.5">{inq.experience}</p>
                          )}
                          <p className="text-xs text-text-secondary truncate mt-0.5">{inq.message}</p>
                        </div>
                        <span className="text-[10px] text-text-secondary flex-shrink-0">{formatRelative(inq.created_at)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detail */}
          <div className="bg-white rounded-2xl border border-border p-6">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary py-20">
                <Mail className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.5} />
                <p className="text-sm">Select an inquiry to view details</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-primary">{selected.name}</h2>
                    <p className="text-xs text-text-secondary mt-0.5">{formatFull(selected.created_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={replyHref}
                      className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-accent-dark transition"
                    >
                      <Mail className="w-3.5 h-3.5" /> Reply by email
                    </a>
                    {selected.status === "archived" ? (
                      <button
                        disabled={busyId === selected.id}
                        onClick={() => setStatus(selected, "read")}
                        className="inline-flex items-center gap-1.5 border border-border text-text-secondary px-4 py-2 rounded-full text-xs font-semibold hover:border-primary hover:text-primary transition disabled:opacity-60"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Unarchive
                      </button>
                    ) : (
                      <button
                        disabled={busyId === selected.id}
                        onClick={() => setStatus(selected, "archived")}
                        className="inline-flex items-center gap-1.5 border border-border text-text-secondary px-4 py-2 rounded-full text-xs font-semibold hover:border-primary hover:text-primary transition disabled:opacity-60"
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </button>
                    )}
                    <button
                      disabled={busyId === selected.id}
                      onClick={() => remove(selected)}
                      className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-100 transition disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2 text-text-secondary hover:text-primary transition"
                  >
                    <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="truncate">{selected.email}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-2 text-text-secondary hover:text-primary transition"
                    >
                      <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="truncate">{selected.phone}</span>
                    </a>
                  )}
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {selected.experience && (
                    <div className="flex gap-3">
                      <span className="text-text-secondary w-24 flex-shrink-0">Interest</span>
                      <span className="text-dark font-medium">{selected.experience}</span>
                    </div>
                  )}
                  {selected.dates && (
                    <div className="flex gap-3">
                      <span className="text-text-secondary w-24 flex-shrink-0">Dates</span>
                      <span className="text-dark">{selected.dates}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Message</p>
                  <p className="text-sm text-dark whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
