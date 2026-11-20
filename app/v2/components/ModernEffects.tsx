"use client";

import { useEffect, useRef } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * One global engine for the modern page's motion language:
 * - scroll progress bar + scroll-linked CSS variables
 * - reveal-on-scroll for any `[data-reveal]` element
 * - cursor spotlight for `[data-spot]`, 3D tilt for `[data-tilt]`,
 *   magnetic pull for `[data-magnetic]`
 */
export default function ModernEffects() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const watch = (element: Element) => {
      if (!element.hasAttribute("data-revealed")) {
        observer.observe(element);
      }
    };

    document.querySelectorAll("[data-reveal]").forEach(watch);

    // Skills and projects arrive async, so pick up late `[data-reveal]` nodes.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.matches("[data-reveal]")) watch(node);
          node.querySelectorAll("[data-reveal]").forEach(watch);
        });
      });
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollY = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(scrollY / max, 0, 1) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      root.dataset.scrolled = scrollY > 24 ? "true" : "false";

      if (!reduceMotion) {
        root.style.setProperty(
          "--hero-p",
          String(clamp(scrollY / window.innerHeight, 0, 1)),
        );
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      delete root.dataset.scrolled;
      root.style.removeProperty("--hero-p");
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!finePointer) return;

    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    const resetTilt = (element: HTMLElement) => {
      element.style.removeProperty("--rx");
      element.style.removeProperty("--ry");
    };

    const resetMagnet = (element: HTMLElement) => {
      element.style.removeProperty("--tx");
      element.style.removeProperty("--ty");
    };

    const handleMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const spot = target?.closest<HTMLElement>("[data-spot]") ?? null;
      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      const pull = target?.closest<HTMLElement>("[data-magnetic]") ?? null;

      if (spot) {
        const bounds = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
        spot.style.setProperty("--my", `${event.clientY - bounds.top}px`);
      }

      if (tilted && tilted !== tilt) resetTilt(tilted);
      if (magnet && magnet !== pull) resetMagnet(magnet);
      tilted = tilt;
      magnet = pull;

      if (reduceMotion) return;

      if (tilt) {
        const bounds = tilt.getBoundingClientRect();
        const max = Number(tilt.dataset.tilt) || 6;
        const px = (event.clientX - bounds.left) / bounds.width - 0.5;
        const py = (event.clientY - bounds.top) / bounds.height - 0.5;

        tilt.style.setProperty("--ry", `${(px * max * 2).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(-py * max * 2).toFixed(2)}deg`);
      }

      if (pull) {
        const bounds = pull.getBoundingClientRect();
        const dx = event.clientX - (bounds.left + bounds.width / 2);
        const dy = event.clientY - (bounds.top + bounds.height / 2);

        pull.style.setProperty("--tx", `${clamp(dx * 0.22, -9, 9)}px`);
        pull.style.setProperty("--ty", `${clamp(dy * 0.3, -7, 7)}px`);
      }
    };

    const handleLeave = () => {
      if (tilted) resetTilt(tilted);
      if (magnet) resetMagnet(magnet);
      tilted = null;
      magnet = null;
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div className="modern-progress" aria-hidden="true">
      <div ref={barRef} className="modern-progress-bar" />
    </div>
  );
}
