"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, Calendar, Image as ImageIcon, MessageSquare, ArrowRight } from "lucide-react";
import { Booking, BookingStatus, GalleryItem } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function MarketingDashboardClient({
  initialBookings,
  unreadInquiries,
  recentUploads,
  userName,
  userEmail,
}: {
  initialBookings: Booking[];
  unreadInquiries: number;
  recentUploads: GalleryItem[];
  userName: string;
  userEmail: string;
}) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("pending");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast("success", `Booking ${status === "confirmed" ? "confirmed" : "cancelled"}.`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", `Could not update booking: ${data.error ?? res.status}`);
      }
    } catch {
      toast("error", "Could not update booking — check your connection and try again.");
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const filtered = bookings.filter(b => {
    const matchesStatus = filter === "all" || b.status === filter;
    const matchesSearch = !search ||
      b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });

  const actionButtons = (b: Booking) => (
    <div className="flex gap-2 flex-wrap">
      {b.status === "pending" && (
        <button onClick={() => updateStatus(b.id, "confirmed")} disabled={updating === b.id}
          className="min-h-11 px-4 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer">
          {updating === b.id ? "Saving…" : "Confirm"}
        </button>
      )}
      {b.status !== "cancelled" && (
        <button onClick={() => setConfirmCancel(b)} disabled={updating === b.id}
          className="min-h-11 px-4 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer">
          Cancel
        </button>
      )}
      <a href={`https://wa.me/${b.guest_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.guest_name}, this is Hidden Paradise regarding your booking for ${b.experience_name} on ${new Date(b.booking_date).toLocaleDateString()}.`)}`}
        target="_blank" rel="noopener noreferrer"
        aria-label={`Message ${b.guest_name} on WhatsApp`}
        className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer">
        <MessageSquare className="w-3.5 h-3.5" aria-hidden />
        WhatsApp
      </a>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Marketing &amp; Sales</h1>
        <p className="text-text-secondary text-sm mt-0.5">{userName} — {userEmail}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/inquiries" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition-colors flex items-start gap-4 cursor-pointer">
          <Inbox className="w-7 h-7 text-primary mt-1" aria-hidden />
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Unread Enquiries</p>
            <p className="text-2xl font-bold mt-1 text-primary">{unreadInquiries}</p>
            <p className="text-xs text-text-secondary mt-1">Reply to website contact-form messages</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4">
          <Calendar className="w-7 h-7 text-yellow-600 mt-1" aria-hidden />
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Bookings to Follow Up</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-text-secondary mt-1">Pending bookings awaiting confirmation</p>
          </div>
        </div>

        <Link href="/admin/gallery" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition-colors flex items-start gap-4 cursor-pointer">
          <ImageIcon className="w-7 h-7 text-accent mt-1" aria-hidden />
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Gallery</p>
            <p className="text-2xl font-bold mt-1 text-accent">Upload</p>
            <p className="text-xs text-text-secondary mt-1">Add photos to the public gallery</p>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            aria-label="Search bookings"
            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                aria-pressed={filter === s}
                className={`min-h-11 px-4 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings — cards on mobile, table from sm up */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border text-center py-16 text-text-secondary mb-8">
          No bookings match your filters.
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-3 mb-8">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-dark">{b.guest_name}</p>
                    <p className="text-text-secondary text-xs">{b.experience_name}</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-2">
                  <span>{fmtDate(b.booking_date)}</span>
                  <a href={`tel:${b.guest_phone}`} className="text-accent hover:underline">{b.guest_phone}</a>
                </div>
                <div className="mt-3">{actionButtons(b)}</div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white rounded-2xl border border-border overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Guest", "Experience", "Date", "Status", "Actions"].map(h => (
                      <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-bg-alt/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{b.guest_name}</p>
                        <p className="text-text-secondary text-xs">{b.guest_email}</p>
                        <a href={`tel:${b.guest_phone}`} className="text-accent text-xs hover:underline">{b.guest_phone}</a>
                      </td>
                      <td className="px-4 py-3">{b.experience_name}</td>
                      <td className="px-4 py-3 text-text-secondary">{fmtDate(b.booking_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">{actionButtons(b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent uploads strip */}
      {recentUploads.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary">Your recent gallery uploads</h2>
            <Link href="/admin/gallery" className="inline-flex items-center gap-1 text-xs text-accent hover:underline cursor-pointer">
              View all <ArrowRight className="w-3 h-3" aria-hidden />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {recentUploads.map(item => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={item.id} src={item.url} alt={item.alt}
                className="h-24 w-24 object-cover rounded-xl flex-shrink-0 border border-border" />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel !== null}
        title="Cancel this booking?"
        message={confirmCancel ? `${confirmCancel.guest_name} — ${confirmCancel.experience_name} on ${fmtDate(confirmCancel.booking_date)}. The guest will NOT be notified automatically.` : ""}
        confirmLabel="Cancel booking"
        danger
        busy={updating === confirmCancel?.id}
        onConfirm={async () => {
          if (confirmCancel) {
            await updateStatus(confirmCancel.id, "cancelled");
            setConfirmCancel(null);
          }
        }}
        onCancel={() => setConfirmCancel(null)}
      />
    </div>
  );
}
