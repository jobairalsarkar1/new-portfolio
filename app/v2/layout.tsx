import type { Metadata } from "next";
import "./modern.css";

export const metadata: Metadata = {
  title: "Jobair Al Sarkar | Version 2",
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
