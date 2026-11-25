import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nspace Visa Agency",
    short_name: "Nspace Visa",
    description: "Your visa. On time. Always.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#2f5bff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
