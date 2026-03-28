"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/data/constants";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const name = params.get("name") ?? "Guest";
  const exp = params.get("exp") ?? "your experience";
  const ref = params.get("ref");
  const amount = params.get("amount");
  const isFree = params.get("free") === "1";

  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="text-6xl mb-6">🌿</div>
      <h1 className="font-display text-4xl font-semibold text-primary mb-4">
        You&apos;re Booked, {name}!
      </h1>
      <p className="text-text-secondary text-lg mb-6">
        {isFree
          ? `Your spot for ${exp} has been reserved. We'll be in touch to confirm details.`
          : `Your deposit of GHC ${amount} for ${exp} has been received. We'll confirm your booking shortly.`}
      </p>

      {ref && (
        <div className="bg-bg-alt border border-border rounded-xl p-4 mb-6 text-sm">
          <p className="text-text-secondary">Payment Reference</p>
          <p className="font-mono font-semibold text-primary mt-1">{ref}</p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 text-sm text-left space-y-2">
        <p className="font-semibold text-primary">What happens next:</p>
        <p className="text-text-secondary">✅ Check your email for a confirmation</p>
        <p className="text-text-secondary">📱 Our team will WhatsApp you with directions & details</p>
        <p className="text-text-secondary">🎉 Show up on your booking date and enjoy Hidden Paradise!</p>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I just made a booking at Hidden Paradise and wanted to confirm details.")}`}
          target="_blank" rel="noopener noreferrer"
          className="bg-accent text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-accent-dark transition"
        >
          WhatsApp Us
        </a>
        <Link href="/experiences"
          className="border border-primary text-primary px-6 py-3 rounded-full font-medium text-sm hover:bg-primary hover:text-white transition">
          Browse More Experiences
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-bg pt-32 pb-20 px-[5%] flex items-center justify-center">
      <Suspense fallback={<div className="text-center text-text-secondary">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
