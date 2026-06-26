import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/logo/modern-favicon.ico",
    shortcut: "/logo/modern-favicon.ico",
    apple: "/logo/modern-favicon.ico",
  },
};

export default function ModernLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
