"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import CommandMenu from "./CommandMenu";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcut, setShortcut] = useState("⌘K");

  useEffect(() => {
    if (!/mac|iphone|ipad/i.test(navigator.userAgent)) setShortcut("Ctrl K");
  }, []);

  const parent = pathname.startsWith("/writing/")
    ? { href: "/writing", label: "Writing" }
    : pathname === "/"
      ? null
      : { href: "/", label: "Jobair Al Sarkar" };

  return (
    <>
      <header className="site-header">
        {parent ? (
          <Link href={parent.href} className="header-back">
            <FiArrowLeft aria-hidden /> {parent.label}
          </Link>
        ) : (
          <span />
        )}
        <div className="header-actions">
          <button
            type="button"
            className="header-menu"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
          >
            Menu <kbd>{shortcut}</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
