"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Inbox, CalendarClock, Star, MessageSquare,
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

const TONE_STYLES = {
  alert: { badge: "bg-red-500", value: "text-red-600", icon: "text-red-500" },
  warn: { badge: "bg-yellow-500", value: "text-yellow-600", icon: "text-yellow-600" },
  calm: { badge: "", value: "text-primary", icon: "text-primary" },
} as const;

function MetricCard({
  href, icon: Icon, label, value, hint, tone,
}: {
  href: string;
  icon: typeof ShoppingBag;
  label: string;
  value: number;
  hint: string;
  tone: keyof typeof TONE_STYLES;
}) {
  const s = TONE_STYLES[tone];
  return (
    <Link
      href={href}
      className="relative bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition-colors cursor-pointer"
    >
      {tone !== "calm" && value > 0 && (
        <span className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${s.badge}`} aria-hidden />
      )}
      <Icon className={`w-5 h-5 mb-2 ${s.icon}`} aria-hidden />
      <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${value > 0 ? s.value : "text-text-secondary"}`}>{value}</p>
      <p className="text-xs text-text-secondary mt-1">{hint}</p>
    </Link>
  );
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
  inquiriesToday = 0,
  newOrders = 0,
  ordersToday = 0,
}: {
  initialBookings: Booking[];
  userEmail: string;
  pendingReviews?: number;
  pendingEscalations?: number;
  unreadInquiries?: number;
  inquiriesToday?: number;
  newOrders?: number;
  ordersToday?: number;
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

  const pendingBookings = bookings.filter(b => b.status === "pending").length;

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

      {/* Operational metrics — each links to the queue that clears it */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          href="/admin/orders"
          icon={ShoppingBag}
          label="New Orders"
          value={newOrders}
          hint={`${ordersToday} placed today`}
          tone={newOrders > 0 ? "alert" : "calm"}
        />
        <MetricCard
          href="/admin/inquiries"
          icon={Inbox}
          label="Outstanding Enquiries"
          value={unreadInquiries}
          hint={`${inquiriesToday} came in today`}
          tone={unreadInquiries > 0 ? "alert" : "calm"}
        />
        <MetricCard
          href="/admin/dashboard"
          icon={CalendarClock}
          label="Bookings to Confirm"
          value={pendingBookings}
          hint="pending confirmation"
          tone={pendingBookings > 0 ? "warn" : "calm"}
        />
        <MetricCard
          href="/admin/reviews"
          icon={Star}
          label="Reviews to Approve"
          value={pendingReviews}
          hint="awaiting moderation"
          tone={pendingReviews > 0 ? "warn" : "calm"}
        />
      </div>

      {/* Booking stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold mt-1 text-primary">{stats.total}</p>
          <TrendBadge current={trend.current} previous={trend.previous} />
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.total > 0 ? `${Math.round((stats.confirmed / stats.total) * 100)}% of all bookings` : "no bookings yet"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wider">WhatsApp Escalations</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingEscalations}</p>
          <Link href="/admin/whatsapp/inbox" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1">
            <MessageSquare className="w-3 h-3" aria-hidden /> open inbox
          </Link>
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
