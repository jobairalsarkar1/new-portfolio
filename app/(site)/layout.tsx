import { Inter } from "next/font/google";
import SiteFooter from "./_components/SiteFooter";
import SiteHeader from "./_components/SiteHeader";
import "./site.css";

const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
});

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`site ${inter.variable}`}>
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
