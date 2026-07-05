"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Breadcrumbs from "@/components/Breadcrumbs";

// Immersive full-screen-hero routes that should NOT show a breadcrumb bar.
// (The experience detail pages carry their own in-page back link.)
function showsBreadcrumbs(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname === "/experiences" || pathname.startsWith("/experiences/")) return false;
  return true;
}

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isMaintenance = pathname.startsWith("/maintenance");
  const isSys = pathname.startsWith("/sys");

  // Admin, maintenance, and the hidden control page render bare (no nav/footer/FAB)
  if (isAdmin || isMaintenance || isSys) return <>{children}</>;

  return (
    <>
      <Nav />
      {showsBreadcrumbs(pathname) && <Breadcrumbs />}
      <main>{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
