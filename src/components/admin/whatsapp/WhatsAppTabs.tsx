"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/whatsapp/inbox", label: "Inbox" },
  { href: "/admin/whatsapp/conversations", label: "Conversations" },
  { href: "/admin/whatsapp/faqs", label: "FAQs" },
  { href: "/admin/whatsapp/closures", label: "Closures" },
  { href: "/admin/whatsapp/settings", label: "Settings" },
  { href: "/admin/whatsapp/analytics", label: "Analytics" },
];

export default function WhatsAppTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="WhatsApp agent sections" className="flex flex-wrap gap-2 mb-6">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center min-h-11 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              active
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
