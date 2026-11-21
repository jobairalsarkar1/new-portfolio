"use client";

import { useEffect, useRef } from "react";

const SPACING = 26;
const LENGTH = 9;
const REACH = 210;
const STIFFNESS = 90;
const DAMPING = 11;
const COLUMN_PADDING = 36;
const FADE = 90;

type Needle = { x: number; y: number; angle: number; velocity: number; rest: number; glow: number };

// The empty margins hold a grid of tiny iron filings. They sit still until the
// cursor passes, then swing on springs to follow the field lines of a magnet
// held at the cursor, and settle back once it leaves.
export default function IronFilings() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let needles: Needle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let columnLeft = 0;
    let columnRight = 0;
    let colors = { line: "#888", accent: "#e4572e" };

    const readColors = () => {
      const style = getComputedStyle(canvas);
      colors = {
        line: style.getPropertyValue("--fg-subtle").trim() || colors.line,
        accent: style.getPropertyValue("--accent").trim() || colors.accent,
      };
    };

    const layout = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const page = document.querySelector(".page")?.getBoundingClientRect();
      columnLeft = (page?.left ?? width / 2) - COLUMN_PADDING;
      columnRight = (page?.right ?? width / 2) + COLUMN_PADDING;

      needles = [];
      if (columnLeft < 60) return;
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          if (x > columnLeft && x < columnRight) continue;
          const rest = Math.PI / 4 + Math.sin(x * 0.013 + y * 0.021) * 0.25;
          needles.push({ x, y, angle: rest, velocity: 0, rest, glow: 0 });
        }
      }
    };

    const pointer = { x: -9999, y: -9999, vx: 1, vy: 0, inside: false };
    const moment = { x: 1, y: 0 };

    // Field of a magnetic dipole: B ∝ 3(m·r̂)r̂ − m, which bends into the
    // looping lines you see around a bar magnet.
    const targetFor = (needle: Needle) => {
      const dx = needle.x - pointer.x;
      const dy = needle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const weight = pointer.inside ? Math.exp(-((distance / REACH) ** 2)) : 0;
      if (weight < 0.01) return { angle: needle.rest, weight: 0 };

      const rx = dx / (distance || 1);
      const ry = dy / (distance || 1);
      const dot = moment.x * rx + moment.y * ry;
      const field = Math.atan2(3 * dot * ry - moment.y, 3 * dot * rx - moment.x);

      // Filings are lines, not arrows, so blend directions on doubled angles.
      const bx = (1 - weight) * Math.cos(2 * needle.rest) + weight * Math.cos(2 * field);
      const by = (1 - weight) * Math.sin(2 * needle.rest) + weight * Math.sin(2 * field);
      return { angle: Math.atan2(by, bx) / 2, weight };
    };

    const fadeFor = (x: number) => {
      const gap = x < columnLeft ? columnLeft - x : x - columnRight;
      return Math.min(1, gap / FADE);
    };

    const draw = () => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";

      for (const pass of ["line", "accent"] as const) {
        for (const needle of needles) {
          const strong = needle.glow > 0.45;
          if ((pass === "accent") !== strong) continue;
          const fade = fadeFor(needle.x);
          const alpha = (pass === "accent" ? 0.35 + needle.glow * 0.5 : 0.16 + needle.glow * 0.45) * fade;
          if (alpha < 0.02) continue;
          const cos = Math.cos(needle.angle) * (LENGTH / 2) * (1 + needle.glow * 0.35);
          const sin = Math.sin(needle.angle) * (LENGTH / 2) * (1 + needle.glow * 0.35);
          context.globalAlpha = alpha;
          context.strokeStyle = pass === "accent" ? colors.accent : colors.line;
          context.lineWidth = 1.2 + needle.glow * 0.6;
          context.beginPath();
          context.moveTo(needle.x - cos, needle.y - sin);
          context.lineTo(needle.x + cos, needle.y + sin);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    };

    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;

      const speed = Math.hypot(pointer.vx, pointer.vy);
      if (speed > 0.01) {
        moment.x += (pointer.vx / speed - moment.x) * Math.min(1, dt * 6);
        moment.y += (pointer.vy / speed - moment.y) * Math.min(1, dt * 6);
        const length = Math.hypot(moment.x, moment.y) || 1;
        moment.x /= length;
        moment.y /= length;
      }

      let moving = false;
      for (const needle of needles) {
        const target = targetFor(needle);
        let delta = target.angle - needle.angle;
        delta = ((delta + Math.PI / 2) % Math.PI + Math.PI) % Math.PI - Math.PI / 2;
        needle.velocity += (STIFFNESS * delta - DAMPING * needle.velocity) * dt;
        needle.angle += needle.velocity * dt;
        needle.glow += (target.weight - needle.glow) * Math.min(1, dt * 8);
        if (Math.abs(delta) > 0.002 || Math.abs(needle.velocity) > 0.002 || needle.glow > 0.004) moving = true;
      }

      draw();
      frame = moving || pointer.inside ? requestAnimationFrame(step) : 0;
    };

    const wake = () => {
      if (reduceMotion || frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      const inside = event.clientX < columnLeft || event.clientX > columnRight;
      pointer.vx = event.clientX - pointer.x;
      pointer.vy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (inside || pointer.inside) {
        pointer.inside = inside;
        wake();
      }
    };

    const onLeave = () => {
      pointer.inside = false;
      wake();
    };

    readColors();
    layout();
    draw();

    const onResize = () => {
      layout();
      draw();
    };

    const themeObserver = new MutationObserver(() => {
      readColors();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="filings" aria-hidden />;
}
