"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CMSExperience } from "@/lib/supabase";
import { WHATSAPP_NUMBER } from "@/data/constants";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

interface FormData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_date: string;
  adults: number;
  children: number;
  package_tier_id: string;
  notes: string;
}

// ── Camping-specific constants ───────────────────────────────────────────
const COMPLIMENTARY_ACTIVITIES = [
  "Spin the Bottle", "Archery", "Dart Board", "Tag of War", "Sack Races",
  "Karaoke", "Music & Good Vibes", "Networking", "Volleyball", "Soccer",
  "Table Tennis", "Board Games",
];

const PAY_TO_USE_ACTIVITIES = [
  "Pool Table", "Movie Night", "Bonfire", "Swimming", "Video Games",
  "Hiking", "Cycling", "Sip & Paint", "Photoshoot", "Horse Riding",
  "Boating / Fishing", "Paintball Target Shooting", "Mini Golf Course",
  "Crafting & Pottery Classes",
];

const CAMP_CHECKLIST = [
  "Toiletries",
  "Swimsuit",
  "Bedsheet / Duvet",
  "Extension Board",
  "Towels",
  "Pillows",
  "Sportswear (Hiking & Outfit For Games)",
  "Party Outfits",
  "Sneakers for Games",
  "Bug Spray / Mosquito Repellent",
];

export default function BookingForm({ experience }: { experience: CMSExperience }) {
  const router = useRouter();
  const isCamping = experience.slug === "camping";

  const [form, setForm] = useState<FormData>({
    guest_name: "", guest_email: "", guest_phone: "",
    booking_date: "", adults: 1, children: 0,
    package_tier_id: experience.package_tiers?.[0]?.id ?? "",
    notes: "",
  });
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Paystack script
  useEffect(() => {
    if (document.getElementById("paystack-script")) return;
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const selectedTier = experience.package_tiers?.find(t => t.id === form.package_tier_id);
  const depositPerPerson = selectedTier?.deposit ?? experience.deposit_amount ?? 0;
  const totalDeposit = depositPerPerson * form.adults + (form.children > 0 ? Math.floor(depositPerPerson * 0.5) * form.children : 0);
  const isFree = !experience.deposit_amount && !experience.package_tiers;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "adults" || name === "children" ? Number(value) : value }));
  }

  function toggleActivity(activity: string) {
    setSelectedActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  }

  function buildNotes(baseNotes: string) {
    if (!isCamping || selectedActivities.length === 0) return baseNotes;
    const activityLine = `Activities interested in: ${selectedActivities.join(", ")}`;
    return baseNotes ? `${baseNotes}\n${activityLine}` : activityLine;
  }

  function downloadChecklist() {
    const lines = [
      "AVAPARK — CAMPING CHECKLIST",
      "===========================",
      "",
      "Pack the following for your camping experience:",
      "",
      ...CAMP_CHECKLIST.map(item => `  ☐  ${item}`),
      "",
      "BOOKING DETAILS",
      "───────────────",
      "A 50% deposit is required to secure your dates.",
      "Confirm your booking at least 48 hours before arrival.",
      "",
      "Contact: +233 (0) 540 879 700 | info@avapark-gh.com",
      "Web: www.avapark-gh.com | IG: @avapark_gh",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "Avapark-Camping-Checklist.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function submitFreeBooking() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience_slug: experience.slug,
          experience_name: experience.name,
          guest_name: form.guest_name,
          guest_email: form.guest_email,
          guest_phone: form.guest_phone,
          booking_date: form.booking_date,
          group_size: form.adults + form.children,
          adults: form.adults,
          children: form.children,
          package_tier_id: null,
          package_tier_name: null,
          subtotal: 0,
          deposit_amount: 0,
          notes: buildNotes(form.notes),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/book/success?name=${encodeURIComponent(form.guest_name)}&exp=${encodeURIComponent(experience.name)}&free=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handlePaystack() {
    if (!window.PaystackPop) {
      setError("Payment system not loaded. Please refresh and try again.");
      return;
    }

    const amountInPesewas = Math.round(totalDeposit * 100);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: form.guest_email,
      amount: amountInPesewas,
      currency: "GHS",
      ref: `HP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      metadata: {
        custom_fields: [
          { display_name: "Guest Name", variable_name: "guest_name", value: form.guest_name },
          { display_name: "Experience", variable_name: "experience", value: experience.name },
          { display_name: "Booking Date", variable_name: "booking_date", value: form.booking_date },
        ],
      },
      callback: async (response: { reference: string }) => {
        setLoading(true);
        setError("");
        try {
          // Verify payment server-side
          const verifyRes = await fetch(`/api/paystack/verify?reference=${response.reference}`);
          const verifyData = await verifyRes.json();
          if (!verifyData.verified) throw new Error("Payment verification failed");

          // Save booking
          const tierName = selectedTier?.name ?? null;
          const bookingRes = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              experience_slug: experience.slug,
              experience_name: experience.name,
              guest_name: form.guest_name,
              guest_email: form.guest_email,
              guest_phone: form.guest_phone,
              booking_date: form.booking_date,
              group_size: form.adults + form.children,
              adults: form.adults,
              children: form.children,
              package_tier_id: form.package_tier_id || null,
              package_tier_name: tierName,
              subtotal: totalDeposit * 2,
              deposit_amount: totalDeposit,
              paystack_reference: response.reference,
              notes: buildNotes(form.notes),
            }),
          });
          const bookingData = await bookingRes.json();
          if (!bookingRes.ok) throw new Error(bookingData.error);

          router.push(
            `/book/success?name=${encodeURIComponent(form.guest_name)}&exp=${encodeURIComponent(experience.name)}&ref=${response.reference}&amount=${totalDeposit}`
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Payment failed. Contact us via WhatsApp.");
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {
        // User closed popup without paying
      },
    });

    handler.openIframe();
  }

  async function reserveAtVenue(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tierName = selectedTier?.name ?? null;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience_slug: experience.slug,
          experience_name: experience.name,
          guest_name: form.guest_name,
          guest_email: form.guest_email,
          guest_phone: form.guest_phone,
          booking_date: form.booking_date,
          group_size: form.adults + form.children,
          adults: form.adults,
          children: form.children,
          package_tier_id: form.package_tier_id || null,
          package_tier_name: tierName,
          subtotal: totalDeposit * 2,
          deposit_amount: 0,
          notes: buildNotes(form.notes ? `[Pay at venue — GHC ${totalDeposit} due on arrival] ${form.notes}` : `Pay at venue — GHC ${totalDeposit} due on arrival`),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/book/success?name=${encodeURIComponent(form.guest_name)}&exp=${encodeURIComponent(experience.name)}&venue=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isFree) {
      submitFreeBooking();
    } else {
      handlePaystack();
    }
  }

  const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
  const labelClass = "block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Package tier selector (only for tiered experiences like Friday) */}
      {experience.package_tiers && (
        <div>
          <label className={labelClass}>Select Package</label>
          <div className="space-y-3">
            {experience.package_tiers.map(tier => (
              <label
                key={tier.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  form.package_tier_id === tier.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="package_tier_id"
                  value={tier.id}
                  checked={form.package_tier_id === tier.id}
                  onChange={handleChange}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary text-sm">{tier.name}</span>
                    <span className="text-accent font-bold text-sm">GHC {tier.price}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{tier.description}</p>
                  <p className="text-xs text-secondary font-medium mt-1">Deposit: GHC {tier.deposit}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Guest details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="guest_name" value={form.guest_name} onChange={handleChange}
            required placeholder="Your full name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email Address *</label>
          <input name="guest_email" type="email" value={form.guest_email} onChange={handleChange}
            required placeholder="you@email.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone Number *</label>
          <input name="guest_phone" type="tel" value={form.guest_phone} onChange={handleChange}
            required placeholder="+233 XX XXX XXXX" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Preferred Date *</label>
          <input name="booking_date" type="date" value={form.booking_date} onChange={handleChange}
            required min={new Date().toISOString().split("T")[0]} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Adults</label>
          <select name="adults" value={form.adults} onChange={handleChange} className={inputClass}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Children</label>
          <select name="children" value={form.children} onChange={handleChange} className={inputClass}>
            {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* ── Camping: Activity Selection ── */}
      {isCamping && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Which activities are you interested in?</label>
            <p className="text-xs text-text-secondary mb-3">Select all that apply — helps us prepare for your stay.</p>

            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">✅ Complimentary</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {COMPLIMENTARY_ACTIVITIES.map(activity => (
                <label key={activity}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm transition ${
                    selectedActivities.includes(activity)
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/40"
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity)}
                    onChange={() => toggleActivity(activity)}
                    className="accent-primary w-4 h-4 flex-shrink-0"
                  />
                  {activity}
                </label>
              ))}
            </div>

            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">💰 Pay-To-Use</p>
            <div className="grid grid-cols-2 gap-2">
              {PAY_TO_USE_ACTIVITIES.map(activity => (
                <label key={activity}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm transition ${
                    selectedActivities.includes(activity)
                      ? "border-accent bg-accent/5 font-medium"
                      : "border-border hover:border-accent/40"
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity)}
                    onChange={() => toggleActivity(activity)}
                    className="accent-accent w-4 h-4 flex-shrink-0"
                  />
                  {activity}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Camping: Checklist ── */}
      {isCamping && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-green-800 text-sm uppercase tracking-wider">🎒 Camp Checklist</h3>
            <button
              type="button"
              onClick={downloadChecklist}
              className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-full hover:bg-green-800 transition font-medium"
            >
              ⬇ Download
            </button>
          </div>
          <p className="text-xs text-green-700 mb-3">Remember to pack the following for your camping experience:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {CAMP_CHECKLIST.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-green-800">
                <span className="mt-0.5 text-green-500 flex-shrink-0">☐</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-green-600 mt-3 font-medium">
            A 50% deposit is required to secure your dates. Confirm at least 48 hours before arrival.
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>Additional Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
          placeholder="Any special requests, dietary needs, or questions..."
          className={inputClass + " resize-none"} />
      </div>

      {/* Deposit summary */}
      {!isFree && (
        <div className="bg-bg-alt rounded-2xl p-5 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Deposit ({form.adults} adult{form.adults > 1 ? "s" : ""}{form.children > 0 ? ` + ${form.children} child${form.children > 1 ? "ren" : ""}` : ""})</span>
            <span className="font-bold text-primary text-lg">GHC {totalDeposit}</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">Balance paid at venue. Deposit secures your booking.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}{" "}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
            className="underline font-medium">Contact us on WhatsApp</a>
        </div>
      )}

      {isFree ? (
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-4 rounded-full font-semibold text-base hover:bg-accent-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? "Processing..." : "Reserve My Spot"}
        </button>
      ) : (
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-4 rounded-full font-semibold text-base hover:bg-accent-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? "Processing..." : `Pay Deposit Now — GHC ${totalDeposit}`}
          </button>
          <button
            type="button"
            onClick={reserveAtVenue}
            disabled={loading}
            className="w-full bg-white border-2 border-primary text-primary py-4 rounded-full font-semibold text-base hover:bg-primary hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Reserve — Pay at Venue"}
          </button>
          <p className="text-center text-xs text-text-secondary">
            Pay online now to secure your spot, or reserve and pay GHC {totalDeposit} on arrival.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-text-secondary">
        Prefer to book via WhatsApp?{" "}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to book ${experience.name}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-accent font-medium hover:underline">Chat with us</a>
      </p>
    </form>
  );
}
