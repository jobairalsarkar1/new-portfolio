import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteFooter from "./_components/SiteFooter";
import IronFilings from "./_components/IronFilings";
import SiteHeader from "./_components/SiteHeader";
import "./site.css";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/logo/site-favicon.ico", sizes: "32x32" },
      { url: "/logo/site-favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/logo/site-favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/logo/site-apple-touch-icon.png",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`site ${inter.variable}`}>
      <IronFilings />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="page">
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
