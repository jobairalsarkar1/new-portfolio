"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { sections } from "../_lib/content";
import CommandMenu from "./CommandMenu";
import ThemeToggle from "./ThemeToggle";

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden>
      <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="7" />
      <path d="M5 15.5c2.2-6.4 4.4-6.4 6.6 0s4.4 6.4 6.6 0 2.9-4.8 4.8-3.2" />
    </svg>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcut, setShortcut] = useState("⌘K");

  useEffect(() => {
    if (!/mac|iphone|ipad/i.test(navigator.userAgent)) setShortcut("Ctrl K");

    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    ["top", ...sections.map((section) => section.id)].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isHome]);

  return (
    <>
      <header className="nav" data-scrolled={scrolled}>
        <div className="container nav-inner">
          <Link href="/" className="nav-brand" aria-label="Jobair Al Sarkar, home">
            <BrandMark />
            <span>Jobair Al Sarkar</span>
          </Link>

          <nav className="nav-links" aria-label="Sections">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/#${section.id}`}
                data-active={active === section.id}
              >
                {section.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-command"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
            >
              Menu
              <kbd>{shortcut}</kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
