import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import PublicShell from "@/components/PublicShell";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FEFAF4",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Hidden Paradise Nature Park",
    default: "Hidden Paradise Nature Park | Your Escape Into Nature",
  },
  description:
    "Camping, hiking, pool parties, BBQ nights and more, just an hour from Accra. Hidden Paradise is Ghana's premier nature park and outdoor recreation destination on the Akuse Road.",
  icons: {
    icon: "/hp-logo.png",
  },
  openGraph: {
    siteName: "Hidden Paradise Nature Park",
    type: "website",
    locale: "en_GH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TouristAttraction",
              name: "Hidden Paradise Nature Park",
              description:
                "300-acre nature park and outdoor recreation destination featuring camping, hiking tours, pool parties, BBQ nights, family days, and more. Located on Akuse Road, about an hour east of Accra, Ghana.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Akuse Road",
                addressLocality: "Okwenya",
                addressRegion: "Eastern/Volta Region",
                addressCountry: "GH",
              },
              telephone: "+233540879700",
              email: "info@hiddenparadisegh.com",
              url: "https://www.hiddenparadisegh.com",
              sameAs: [
                "https://instagram.com/hiddenparadise_gh",
                "https://www.tiktok.com/@hiddenparadise_gh"
              ],
            }),
          }}
        />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
