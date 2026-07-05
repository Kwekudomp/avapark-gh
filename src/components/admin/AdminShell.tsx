"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Compass, UtensilsCrossed, Hotel, Image as ImageIcon,
  Calendar, Clapperboard, Settings, Star, Inbox, MessageSquare, Users,
  Menu as MenuIcon, X, Moon, Sun, LogOut,
} from "lucide-react";
import { useAdminRole } from "./AdminRoleContext";
import { ToastProvider } from "./ui/Toast";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, mso: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, mso: true },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, mso: true },
  { href: "/admin/experiences", label: "Experiences", icon: Compass, mso: false },
  { href: "/admin/menu", label: "Kitchen Menu", icon: UtensilsCrossed, mso: false },
  { href: "/admin/accommodation", label: "Accommodation", icon: Hotel, mso: false },
  { href: "/admin/events", label: "Events", icon: Calendar, mso: false },
  { href: "/admin/videos", label: "Videos", icon: Clapperboard, mso: false },
  { href: "/admin/reviews", label: "Reviews", icon: Star, mso: false },
  { href: "/admin/whatsapp/inbox", label: "WhatsApp Agent", icon: MessageSquare, mso: false, prefix: "/admin/whatsapp" },
  { href: "/admin/users", label: "Staff Users", icon: Users, mso: false },
  { href: "/admin/settings", label: "Site Settings", icon: Settings, mso: false },
];

const THEME_KEY = "hp-admin-theme";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { email, name, role } = useAdminRole();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem(THEME_KEY) === "dark");
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  const items = NAV.filter(item => role === "admin" || item.mso);
  const isActive = (item: (typeof NAV)[number]) =>
    pathname === item.href || pathname.startsWith((item.prefix ?? item.href) + "/");

  const sidebar = (
    <nav aria-label="Admin navigation" className="flex flex-col h-full">
      <Link href="/admin/dashboard" className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hp-logo.png" alt="" className="h-8 w-auto" />
        <div>
          <p className="font-semibold text-sm text-white leading-tight">Hidden Paradise</p>
          <p className="text-white/50 text-[11px] leading-tight">{role === "admin" ? "Admin Panel" : "Marketing & Sales"}</p>
        </div>
      </Link>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {items.map(item => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 min-h-11 px-3 rounded-xl text-sm transition-colors cursor-pointer ${
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-white/10 p-3 shrink-0">
        <p className="px-3 text-white/50 text-xs truncate" title={email}>{name || email}</p>
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-white/65 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
          >
            {dark ? <Sun className="w-4.5 h-4.5" aria-hidden /> : <Moon className="w-4.5 h-4.5" aria-hidden />}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 flex-1 min-h-11 px-3 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" aria-hidden />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div data-admin-theme={dark ? "dark" : "light"}>
      <ToastProvider>
        <div className="min-h-screen bg-bg-alt lg:pl-64">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-primary z-30">
            {sidebar}
          </aside>

          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-30 bg-primary text-white h-14 flex items-center gap-3 px-4">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex items-center justify-center min-h-11 min-w-11 -ml-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MenuIcon className="w-5 h-5" aria-hidden />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hp-logo.png" alt="" className="h-7 w-auto" />
            <p className="font-semibold text-sm">Hidden Paradise</p>
          </header>

          {/* Mobile drawer */}
          {drawerOpen && (
            <div className="lg:hidden fixed inset-0 z-40">
              <button
                aria-label="Close navigation menu"
                className="absolute inset-0 bg-black/50 cursor-pointer"
                onClick={() => setDrawerOpen(false)}
              />
              <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-primary shadow-2xl">
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center min-h-11 min-w-11 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
                {sidebar}
              </aside>
            </div>
          )}

          <main>{children}</main>
        </div>
      </ToastProvider>
    </div>
  );
}
