import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jobairalsarkar.site"),
  title: "Jobair Al Sarkar | Full-Stack Developer | Software Engineer",
  description:
    "Portfolio of Jobair Al Sarkar – Freelance Full-Stack Developer. Explore projects, skills, and contact for collaboration.",
  keywords: [
    "Jobair Al Sarkar",
    "Full-Stack Developer",
    "React",
    "Next.js",
    "Node.js",
    "Portfolio",
    "Freelance Developer",
    "Web Developer",
  ],
  authors: [
    { name: "Jobair Al Sarkar", url: "https://www.jobairalsarkar.site" },
  ],
  creator: "Jobair Al Sarkar",
  openGraph: {
    title: "Jobair Al Sarkar | Full-Stack Developer | Software Engineer",
    description:
      "Portfolio of Jobair Al Sarkar – Freelance Full-Stack Developer...",
    url: "/",
    siteName: "Jobair Al Sarkar Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jobair Al Sarkar Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobair Al Sarkar | Full-Stack Developer",
    description:
      "Portfolio of Jobair Al Sarkar – Freelance Full-Stack Developer. Explore projects, skills, and contact for collaboration.",
    images: ["/og-image.png"],
    creator: "@jobairalsarkar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SN9KDQZJD3"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SN9KDQZJD3', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
