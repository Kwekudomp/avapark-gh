"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
