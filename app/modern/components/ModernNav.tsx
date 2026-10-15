"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

type Indicator = { left: number; width: number } | null;

export default function ModernNav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/modern";
  const [activeId, setActiveId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicator>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (!isHome) {
      setActiveId(null);
      return;
    }

    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    // Hero sits above every section, so clear the highlight when back on top.
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActiveId(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

  useEffect(() => {
    const measure = () => {
      const active = activeId ? linkRefs.current[activeId] : null;

      setIndicator(
        active ? { left: active.offsetLeft, width: active.offsetWidth } : null,
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeId]);

  return (
    <nav className="modern-nav" aria-label="Modern portfolio navigation">
      <Link href="/" className="modern-mark" aria-label="Jobair Al Sarkar, home">
        <svg className="modern-mark-hex" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 4.5 41 14.25v19.5L24 43.5 7 33.75v-19.5Z" />
        </svg>
        JAS
      </Link>
      <div className="modern-nav-links">
        <span
          className="modern-nav-indicator"
          aria-hidden="true"
          style={
            indicator
              ? {
                  width: indicator.width,
                  transform: `translateX(${indicator.left}px)`,
                  opacity: 1,
                }
              : undefined
          }
        />
        {links.map((link) => (
          <Link
            key={link.id}
            href={`/#${link.id}`}
            ref={(element) => {
              linkRefs.current[link.id] = element;
            }}
            data-active={activeId === link.id}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
