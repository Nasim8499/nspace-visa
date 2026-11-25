import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileTabs } from "@/components/MobileTabs";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Nspace Visa Agency — Your visa. On time. Always.",
  description:
    "Get visas on time to 45+ destinations from Bangladesh. Live tracking, expert document checks and 24×7 human support.",
  applicationName: "Nspace Visa",
  appleWebApp: { capable: true, title: "Nspace Visa", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <html lang="en">
      <body>
        <Navbar user={user ? { name: user.name, email: user.email } : null} />
        <main>{children}</main>
        <Footer />
        <MobileTabs />
      </body>
    </html>
  );
}
