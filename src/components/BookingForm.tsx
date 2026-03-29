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

export default function BookingForm({ experience }: { experience: CMSExperience }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    guest_name: "", guest_email: "", guest_phone: "",
    booking_date: "", adults: 1, children: 0,
    package_tier_id: experience.package_tiers?.[0]?.id ?? "",
    notes: "",
  });
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
          notes: form.notes,
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
              notes: form.notes,
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white py-4 rounded-full font-semibold text-base hover:bg-accent-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {loading
          ? "Processing..."
          : isFree
          ? "Reserve My Spot"
          : `Pay Deposit — GHC ${totalDeposit}`}
      </button>

      <p className="text-center text-xs text-text-secondary">
        Prefer to book via WhatsApp?{" "}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to book ${experience.name}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-accent font-medium hover:underline">Chat with us</a>
      </p>
    </form>
  );
}
