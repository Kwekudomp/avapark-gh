"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, Calendar, Image as ImageIcon } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Booking, BookingStatus, GalleryItem } from "@/lib/supabase";

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
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("pending");
  const [search, setSearch] = useState("");
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
      if (res.ok) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
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

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hp-logo.png" alt="" className="h-8 w-auto" />
          <div>
            <h1 className="font-semibold text-sm">Hidden Paradise</h1>
            <p className="text-white/60 text-xs">Marketing & Sales — {userName}</p>
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
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/inquiries" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition flex items-start gap-4">
            <Inbox className="w-7 h-7 text-primary mt-1" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Unread Enquiries</p>
              <p className="text-2xl font-bold mt-1 text-primary">{unreadInquiries}</p>
              <p className="text-xs text-text-secondary mt-1">Reply to website contact-form messages</p>
            </div>
          </Link>

          <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4">
            <Calendar className="w-7 h-7 text-yellow-600 mt-1" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Bookings to Follow Up</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-text-secondary mt-1">Pending bookings awaiting confirmation</p>
            </div>
          </div>

          <Link href="/admin/gallery" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition flex items-start gap-4">
            <ImageIcon className="w-7 h-7 text-accent mt-1" />
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
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-2 flex-wrap">
              {(["all","pending","confirmed","cancelled"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${
                    filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">No bookings match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Guest","Experience","Date","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-bg-alt/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{b.guest_name}</p>
                        <p className="text-text-secondary text-xs">{b.guest_email}</p>
                        <a href={`tel:${b.guest_phone}`} className="text-accent text-xs hover:underline">{b.guest_phone}</a>
                      </td>
                      <td className="px-4 py-3">{b.experience_name}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(b.booking_date).toLocaleDateString("en-GH", { day:"numeric", month:"short", year:"numeric" })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {b.status === "pending" && (
                            <button onClick={() => updateStatus(b.id, "confirmed")} disabled={updating === b.id}
                              className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition disabled:opacity-50">
                              Confirm
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button onClick={() => updateStatus(b.id, "cancelled")} disabled={updating === b.id}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition disabled:opacity-50">
                              Cancel
                            </button>
                          )}
                          <a href={`https://wa.me/${b.guest_phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi ${b.guest_name}, this is Hidden Paradise regarding your booking for ${b.experience_name} on ${new Date(b.booking_date).toLocaleDateString()}.`)}`}
                             target="_blank" rel="noopener noreferrer"
                             className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition">
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

        {/* Recent uploads strip */}
        {recentUploads.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary">Your recent gallery uploads</h2>
              <Link href="/admin/gallery" className="text-xs text-accent hover:underline">View all →</Link>
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
      </div>
    </div>
  );
}
