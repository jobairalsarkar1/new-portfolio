"use client";

import { useEffect, useRef, useState } from "react";
import { createSetup } from "./canvas";
import { startInk } from "./ink";
import { startPond } from "./pond";
import { startThreads } from "./threads";

export type MarginMode = "auto" | "ink" | "pond" | "threads";
type Effect = Exclude<MarginMode, "auto">;

const STORAGE_KEY = "margins";
const CHANGE_EVENT = "margins-change";

export const EFFECTS: { id: Effect; label: string; from: number }[] = [
  { id: "pond", label: "Pond", from: 0 },
  { id: "threads", label: "Silk threads", from: 8 },
  { id: "ink", label: "Ink in water", from: 16 },
];

const starters = { ink: startInk, pond: startPond, threads: startThreads };

// The day is split into three blocks: a calm pond overnight, silk threads
// through the day, ink in the evening.
export function effectForHour(hour: number): Effect {
  return [...EFFECTS].reverse().find((effect) => hour >= effect.from)!.id;
}

export function readMarginMode(): MarginMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "ink" || value === "pond" || value === "threads" ? value : "auto";
  } catch {
    return "auto";
  }
}

export function setMarginMode(mode: MarginMode) {
  try {
    if (mode === "auto") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: mode }));
}

function MarginCanvas({ effect, side }: { effect: Effect; side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.clientWidth < 80) return;
    return starters[effect](createSetup(canvas));
  }, [effect]);

  return <canvas ref={canvasRef} className={`margin-canvas margin-${side}`} aria-hidden />;
}

export default function Margins() {
  const [mode, setMode] = useState<MarginMode>("auto");
  const [hour, setHour] = useState<number | null>(null);
  const [size, setSize] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1080px) and (hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(wide.matches && !reduce.matches);
    update();
    wide.addEventListener("change", update);

    setMode(readMarginMode());
    setHour(new Date().getHours());
    const clock = window.setInterval(() => setHour(new Date().getHours()), 60_000);

    const onChange = (event: Event) => setMode((event as CustomEvent<MarginMode>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);

    // The effects size themselves when they start, so restart them after a resize.
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSize(`${window.innerWidth}x${window.innerHeight}`), 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      wide.removeEventListener("change", update);
      window.clearInterval(clock);
      window.clearTimeout(timer);
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!enabled || hour === null) return null;
  const effect = mode === "auto" ? effectForHour(hour) : mode;

  return (
    <>
      <MarginCanvas key={`left-${effect}-${size}`} effect={effect} side="left" />
      <MarginCanvas key={`right-${effect}-${size}`} effect={effect} side="right" />
      <div className="margin-switch" role="group" aria-label="Margin effect">
        {(["auto", ...EFFECTS.map((item) => item.id)] as MarginMode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => setMarginMode(option)}
          >
            {option === "auto" ? "Auto" : EFFECTS.find((item) => item.id === option)!.label}
          </button>
        ))}
      </div>
    </>
  );
}
