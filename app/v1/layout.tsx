import type { Metadata } from "next";
import V1Shell from "./V1Shell";

export const metadata: Metadata = {
  icons: {
    icon: "/logo/old-favicon.ico",
    shortcut: "/logo/old-favicon.ico",
    apple: "/logo/old-favicon.ico",
  },
};

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return <V1Shell>{children}</V1Shell>;
}
