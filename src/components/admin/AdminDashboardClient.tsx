"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Booking, BookingStatus } from "@/lib/supabase";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboardClient({
  initialBookings,
  userEmail,
}: {
  initialBookings: Booking[];
  userEmail: string;
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

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
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = bookings.filter(b => {
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
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    revenue: bookings.filter(b => b.paystack_status === "success").reduce((sum, b) => sum + b.deposit_amount, 0),
  };

  return (
    <div className="min-h-screen bg-bg-alt">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hp-logo.svg" alt="" className="h-8 w-auto" />
          <div>
            <h1 className="font-semibold text-sm">Hidden Paradise</h1>
            <p className="text-white/60 text-xs">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-xs hidden sm:block">{userEmail}</span>
          <button onClick={handleSignOut}
            className="text-xs text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-full transition">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* CMS Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: "/admin/experiences", label: "Experiences", desc: "Add, edit, feature or hide experiences", icon: "🎯" },
            { href: "/admin/gallery", label: "Gallery", desc: "Upload and manage site photos", icon: "📸" },
            { href: "/admin/events", label: "Events", desc: "Create and manage upcoming events", icon: "📅" },
            { href: "/admin/videos", label: "Videos", desc: "Add YouTube videos to the site", icon: "🎬" },
            { href: "/admin/settings", label: "Site Settings", desc: "Contact info, hours, social links", icon: "⚙️" },
          ].map(link => (
            <a key={link.href} href={link.href}
              className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition group">
              <div className="text-2xl mb-2">{link.icon}</div>
              <p className="font-semibold text-dark group-hover:text-primary transition text-sm">{link.label}</p>
              <p className="text-xs text-text-secondary mt-1">{link.desc}</p>
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total, color: "text-primary" },
            { label: "Pending", value: stats.pending, color: "text-yellow-600" },
            { label: "Confirmed", value: stats.confirmed, color: "text-green-600" },
            { label: "Deposits Collected", value: `GHC ${stats.revenue.toFixed(0)}`, color: "text-accent" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border p-5">
              <p className="text-xs text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email or experience..."
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "confirmed", "cancelled"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${
                    filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-text-secondary whitespace-nowrap">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs text-text-secondary whitespace-nowrap">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            {(dateFrom || dateTo || search) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); setSearch(""); }}
                className="text-xs text-accent hover:underline whitespace-nowrap">
                Clear filters
              </button>
            )}
            <p className="text-xs text-text-secondary whitespace-nowrap">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <p className="text-lg">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Guest", "Experience", "Date", "Group", "Deposit", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(booking => (
                    <tr key={booking.id} className="hover:bg-bg-alt/50 transition">
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
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(booking.booking_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
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
                          <p className="text-xs text-green-600 mt-0.5">✓ Paid</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <button
                              onClick={() => updateStatus(booking.id, "confirmed")}
                              disabled={updating === booking.id}
                              className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== "cancelled" && (
                            <button
                              onClick={() => updateStatus(booking.id, "cancelled")}
                              disabled={updating === booking.id}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${booking.guest_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${booking.guest_name}, this is Hidden Paradise regarding your booking for ${booking.experience_name} on ${new Date(booking.booking_date).toLocaleDateString()}.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition"
                          >
                            WA
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
