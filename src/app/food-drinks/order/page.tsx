import Link from "next/link";
import { UtensilsCrossed, MessageSquare, ArrowLeft } from "lucide-react";
import { getPublicMenuItems, getOrderingEnabled } from "@/lib/cms";
import { WHATSAPP_URL } from "@/data/constants";
import OrderPageClient from "./OrderPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Online | Hidden Paradise Nature Park",
  description:
    "Build your order from the Hidden Paradise kitchen — dine-in, pickup, or delivery. Browse the full menu and send your order straight to the kitchen on WhatsApp.",
};

export default async function OrderPage() {
  const [items, orderingEnabled] = await Promise.all([
    getPublicMenuItems(),
    getOrderingEnabled(),
  ]);

  if (!orderingEnabled) {
    return (
      <main className="pt-6 pb-24 px-[5%]">
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-border p-10 mt-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-primary" aria-hidden />
          </div>
          <h1 className="font-display text-3xl font-semibold text-primary mb-3">
            Online Ordering Coming Soon
          </h1>
          <p className="text-sm text-text-secondary mb-8">
            We&apos;re putting the finishing touches on our online menu. In the meantime, message us
            on WhatsApp to place your order and we&apos;ll take care of you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-95 transition-colors"
            >
              <MessageSquare className="w-4 h-4" aria-hidden />
              Order on WhatsApp
            </a>
            <Link
              href="/food-drinks"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              View the Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <OrderPageClient items={items} />;
}
