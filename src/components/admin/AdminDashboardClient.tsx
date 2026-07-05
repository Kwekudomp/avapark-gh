"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Compass, UtensilsCrossed, Hotel, Image as ImageIcon, Calendar,
  Clapperboard, Settings, Star, Inbox, MessageSquare, Users,
  TrendingUp, TrendingDown, Minus, CircleCheck,
} from "lucide-react";
import { Booking, BookingStatus } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 25;

const NAV_CARDS = [
  { href: "/admin/experiences", label: "Experiences", desc: "Add, edit, feature or hide experiences", icon: Compass },
  { href: "/admin/menu", label: "Kitchen Menu", desc: "Set prices and availability for food & drinks", icon: UtensilsCrossed },
  { href: "/admin/accommodation", label: "Accommodation", desc: "Manage partner lodge listings", icon: Hotel },
  { href: "/admin/gallery", label: "Gallery", desc: "Upload and manage site photos", icon: ImageIcon },
  { href: "/admin/events", label: "Events", desc: "Create and manage upcoming events", icon: Calendar },
  { href: "/admin/videos", label: "Videos", desc: "Add YouTube videos to the site", icon: Clapperboard },
  { href: "/admin/settings", label: "Site Settings", desc: "Contact info, hours, social links", icon: Settings },
  { href: "/admin/reviews", label: "Reviews", desc: "Approve or reject guest reviews", icon: Star, badgeKey: "reviews" as const },
  { href: "/admin/inquiries", label: "Inquiries", desc: "Read and reply to contact-form enquiries", icon: Inbox, badgeKey: "inquiries" as const },
  { href: "/admin/whatsapp", label: "WhatsApp Agent", desc: "AI inbox, conversations, FAQs", icon: MessageSquare, badgeKey: "escalations" as const },
  { href: "/admin/users", label: "Staff Users", desc: "Add or remove admin and marketing staff", icon: Users },
];

/** Bookings created within the last `days`..`days*2` window vs the last `days`. */
function weekTrend(bookings: Booking[]): { current: number; previous: number } {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  let current = 0, previous = 0;
  for (const b of bookings) {
    const t = new Date(b.created_at).getTime();
    if (t >= now - week) current++;
    else if (t >= now - 2 * week) previous++;
  }
  return { current, previous };
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const tone = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-text-secondary";
  return (
    <p className={`flex items-center gap-1 text-xs mt-1 ${tone}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {diff === 0 ? "same as" : `${diff > 0 ? "+" : ""}${diff} vs`} last week
    </p>
  );
}

export default function AdminDashboardClient({
  initialBookings,
  userEmail,
  pendingReviews = 0,
  pendingEscalations = 0,
  unreadInquiries = 0,
}: {
  initialBookings: Booking[];
  userEmail: string;
  pendingReviews?: number;
  pendingEscalations?: number;
  unreadInquiries?: number;
}) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const badges = { reviews: pendingReviews, inquiries: unreadInquiries, escalations: pendingEscalations };

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

  const filtered = useMemo(() => bookings.filter(b => {
    const matchesStatus = filter === "all" || b.status === filter;
    const matchesSearch = !search ||
      b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone.includes(search) ||
      b.experience_name.toLowerCase().includes(search.toLowerCase());
    const bookingDate = b.booking_date.slice(0, 10);
    const matchesFrom = !dateFrom || bookingDate >= dateFrom;
    const matchesTo = !dateTo || bookingDate <= dateTo;
    return matchesStatus && matchesSearch && matchesFrom && matchesTo;
  }), [bookings, filter, search, dateFrom, dateTo]);

  const page = filtered.slice(0, visible);
  const trend = useMemo(() => weekTrend(bookings), [bookings]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    revenue: bookings.filter(b => b.paystack_status === "success").reduce((sum, b) => sum + b.deposit_amount, 0),
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });

  const waHref = (b: Booking) =>
    `https://wa.me/${b.guest_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.guest_name}, this is Hidden Paradise regarding your booking for ${b.experience_name} on ${new Date(b.booking_date).toLocaleDateString()}.`)}`;

  const actionButtons = (b: Booking) => (
    <div className="flex gap-2 flex-wrap">
      {b.status === "pending" && (
        <button
          onClick={() => updateStatus(b.id, "confirmed")}
          disabled={updating === b.id}
          className="min-h-11 px-4 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {updating === b.id ? "Saving…" : "Confirm"}
        </button>
      )}
      {b.status !== "cancelled" && (
        <button
          onClick={() => setConfirmCancel(b)}
          disabled={updating === b.id}
          className="min-h-11 px-4 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      )}
      <a
        href={waHref(b)}
        target="_blank" rel="noopener noreferrer"
        aria-label={`Message ${b.guest_name} on WhatsApp`}
        className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" aria-hidden />
        WhatsApp
      </a>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">{userEmail}</p>
        </div>
      </div>

      {/* CMS Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {NAV_CARDS.map(card => {
          const Icon = card.icon;
          const badge = card.badgeKey ? badges[card.badgeKey] : 0;
          return (
            <Link key={card.href} href={card.href}
              className="relative bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition-colors group cursor-pointer">
              {badge > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {badge}
                </span>
              )}
              <Icon className="w-6 h-6 text-primary mb-2.5" aria-hidden />
              <p className="font-semibold text-dark group-hover:text-primary transition-colors text-sm">{card.label}</p>
              <p className="text-xs text-text-secondary mt-1">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold mt-1 text-primary">{stats.total}</p>
          <TrendBadge current={trend.current} previous={trend.previous} />
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-text-secondary mt-1">awaiting confirmation</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}% of all bookings` : "no bookings yet"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Deposits Collected</p>
          <p className="text-2xl font-bold mt-1 text-accent">GHC {stats.revenue.toFixed(0)}</p>
          <p className="text-xs text-text-secondary mt-1">via Paystack</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search} onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search by name, phone, email or experience..."
            aria-label="Search bookings"
            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
              <button key={s} onClick={() => { setFilter(s); setVisible(PAGE_SIZE); }}
                aria-pressed={filter === s}
                className={`min-h-11 px-4 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 w-full">
            <label htmlFor="filter-from" className="text-xs text-text-secondary whitespace-nowrap">From</label>
            <input id="filter-from" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setVisible(PAGE_SIZE); }}
              className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="flex items-center gap-2 flex-1 w-full">
            <label htmlFor="filter-to" className="text-xs text-text-secondary whitespace-nowrap">To</label>
            <input id="filter-to" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setVisible(PAGE_SIZE); }}
              className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          {(dateFrom || dateTo || search) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setSearch(""); setVisible(PAGE_SIZE); }}
              className="min-h-11 px-2 text-xs text-accent hover:underline whitespace-nowrap cursor-pointer">
              Clear filters
            </button>
          )}
          <p className="text-xs text-text-secondary whitespace-nowrap">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Bookings — cards on mobile, table from sm up */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border text-center py-16 text-text-secondary">
          <p className="text-lg">No bookings found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {page.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-dark">{b.guest_name}</p>
                    <p className="text-text-secondary text-xs">{b.experience_name}{b.package_tier_name ? ` — ${b.package_tier_name}` : ""}</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-2">
                  <span>{fmtDate(b.booking_date)}</span>
                  <span>{b.adults}A{b.children > 0 ? ` / ${b.children}C` : ""}</span>
                  <span>
                    {b.deposit_amount > 0 ? `GHC ${b.deposit_amount}` : "Free"}
                    {b.paystack_reference ? " · paid" : ""}
                  </span>
                  <a href={`tel:${b.guest_phone}`} className="text-accent hover:underline">{b.guest_phone}</a>
                </div>
                <div className="mt-3">{actionButtons(b)}</div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Guest", "Experience", "Date", "Group", "Deposit", "Status", "Actions"].map(h => (
                      <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {page.map(booking => (
                    <tr key={booking.id} className="hover:bg-bg-alt/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{booking.guest_name}</p>
                        <p className="text-text-secondary text-xs">{booking.guest_email}</p>
                        <a href={`tel:${booking.guest_phone}`} className="text-accent text-xs hover:underline">
                          {booking.guest_phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{booking.experience_name}</p>
                        {booking.package_tier_name && (
                          <p className="text-text-secondary text-xs">{booking.package_tier_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{fmtDate(booking.booking_date)}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {booking.adults}A {booking.children > 0 ? `/ ${booking.children}C` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {booking.deposit_amount > 0 ? (
                          <span className="font-semibold text-primary">GHC {booking.deposit_amount}</span>
                        ) : (
                          <span className="text-text-secondary text-xs">Free</span>
                        )}
                        {booking.paystack_reference && (
                          <p className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                            <CircleCheck className="w-3 h-3" aria-hidden /> Paid
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{actionButtons(booking)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length > visible && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisible(v => v + PAGE_SIZE)}
                className="min-h-11 px-6 rounded-full text-sm font-semibold border border-border bg-white text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - visible)} more ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </>
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
