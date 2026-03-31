"use client";

import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Placeholder — wire to Resend/Mailchimp when ready
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-20 px-[5%] bg-primary">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[4px] uppercase text-secondary mb-3">
          STAY IN THE LOOP
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
          Get the Weekend Lineup
        </h2>
        <p className="text-white/70 mt-3 text-sm">
          Events, new experiences, and exclusive offers — straight to your inbox. No spam, ever.
        </p>

        {status === "success" ? (
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium">
            <span className="text-secondary text-base">✓</span> You're on the list — see you soon!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-full px-5 py-3 text-sm outline-none focus:border-secondary transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-secondary text-dark font-semibold px-6 py-3 rounded-full text-sm hover:bg-secondary-light transition-colors disabled:opacity-60 shrink-0"
            >
              {status === "loading" ? "Joining…" : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-300 text-xs mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
