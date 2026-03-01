import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  title: {
    template: "%s | Ava Park Ghana",
    default: "Ava Park Ghana | Your Escape Into Nature",
  },
  description:
    "Camping, hiking, pool parties, BBQ nights & more — just an hour from Accra. Ava Park is Ghana's premier outdoor recreation destination.",
  openGraph: {
    siteName: "Ava Park Ghana",
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
              name: "Ava Park",
              description:
                "Outdoor recreation and events venue featuring camping, hiking tours, pool parties, BBQ nights, and more. Located on Akuse Road, about an hour east of Accra, Ghana.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Akuse Road",
                addressLocality: "Okwenya",
                addressRegion: "Eastern Region",
                addressCountry: "GH",
              },
              telephone: "+233540879700",
              email: "info@avapark-gh.com",
              url: "https://www.avapark-gh.com",
              sameAs: ["https://instagram.com/avapark_gh"],
            }),
          }}
        />
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
