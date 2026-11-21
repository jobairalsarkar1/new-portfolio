"use client";

import { useEffect, useRef } from "react";

export type CanvasSetup = {
  canvas: HTMLCanvasElement;
  colors: () => { bg: string; fg: string; subtle: string; accent: string };
  onTheme: (callback: () => void) => () => void;
};

export function readColor(value: string) {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.fillStyle = value;
  const hex = probe.fillStyle as string;
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

// Shared plumbing for the lab panels: a canvas, the theme colors, and a hook
// for re-reading them when the theme changes.
export function useCanvas(start: (setup: CanvasSetup) => () => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = () => {
      const style = getComputedStyle(canvas);
      const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
      return {
        bg: read("--bg-raised", "#faf9f6"),
        fg: read("--fg", "#141413"),
        subtle: read("--fg-subtle", "#6e6b64"),
        accent: read("--accent", "#e4572e"),
      };
    };

    const onTheme = (callback: () => void) => {
      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => observer.disconnect();
    };

    return start({ canvas, colors, onTheme });
    // The start function is defined inline by each panel and only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canvasRef;
}
