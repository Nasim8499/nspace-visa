import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Atlys-style localized URLs: /en-BD/visa/australia-visa, /en-BD/apply-visa
  async rewrites() {
    return [{ source: "/en-BD/:path*", destination: "/:path*" }];
  },
};

export default nextConfig;
