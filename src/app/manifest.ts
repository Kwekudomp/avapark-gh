import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hidden Paradise Nature Park",
    short_name: "Hidden Paradise",
    description:
      "Camping, hiking, pool parties, BBQ nights and more, just an hour from Accra.",
    start_url: "/",
    display: "standalone",
    background_color: "#FEFAF4",
    theme_color: "#1B4332",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
