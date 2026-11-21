"use client";

import { useEffect, useRef } from "react";

const CELL = 12;
const COLUMN_PADDING = 40;
const GENERATIONS_PER_SECOND = 12;
const CALM_AFTER = 5000;
const MAX_ALIVE = 1800;

// Glider heading down and to the right; mirrored for the other diagonals.
const GLIDER = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

const R_PENTOMINO = [
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1],
  [1, 2],
];

// Conway's Game of Life in the empty margins. Moving the cursor throws
// gliders the way it is heading, a click drops an R-pentomino, and once the
// cursor goes quiet the colony slowly dies back to blank graph paper.
export default function LifeMargins() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let columnLeft = 0;
    let columnRight = 0;
    let open = new Uint8Array(0);
    let alive = new Uint8Array(0);
    let next = new Uint8Array(0);
    let age = new Uint16Array(0);
    let trail = new Float32Array(0);
    let colors = { dot: "#999", cell: "#666", accent: "#e4572e" };

    const readColors = () => {
      const style = getComputedStyle(canvas);
      colors = {
        dot: style.getPropertyValue("--line-strong").trim() || colors.dot,
        cell: style.getPropertyValue("--fg-subtle").trim() || colors.cell,
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

      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      open = new Uint8Array(cols * rows);
      alive = new Uint8Array(cols * rows);
      next = new Uint8Array(cols * rows);
      age = new Uint16Array(cols * rows);
      trail = new Float32Array(cols * rows);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2;
          open[r * cols + c] = x < columnLeft || x > columnRight ? 1 : 0;
        }
      }
    };

    const fadeFor = (x: number) => {
      const gap = x < columnLeft ? columnLeft - x : x - columnRight;
      return Math.max(0, Math.min(1, gap / 80));
    };

    let population = 0;

    const place = (pattern: number[][], col: number, row: number, flipX: boolean, flipY: boolean) => {
      if (population > MAX_ALIVE) return;
      for (const [px, py] of pattern) {
        const c = col + (flipX ? 2 - px : px);
        const r = row + (flipY ? 2 - py : py);
        if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
        const i = r * cols + c;
        if (!open[i]) continue;
        if (!alive[i]) population++;
        alive[i] = 1;
        age[i] = 0;
      }
    };

    let calm = false;

    const generation = () => {
      population = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (!open[i]) {
            next[i] = 0;
            continue;
          }
          let neighbours = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const rr = r + dy;
            if (rr < 0 || rr >= rows) continue;
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const cc = c + dx;
              if (cc < 0 || cc >= cols) continue;
              neighbours += alive[rr * cols + cc];
            }
          }
          let lives = alive[i] ? neighbours === 2 || neighbours === 3 : neighbours === 3;
          // Once the cursor has gone quiet, a little entropy lets the colony die out.
          if (lives && calm && Math.random() < 0.07) lives = false;
          next[i] = lives ? 1 : 0;
          if (lives) population++;
        }
      }

      for (let i = 0; i < alive.length; i++) {
        if (alive[i] && !next[i]) trail[i] = 1;
        age[i] = next[i] ? (alive[i] ? Math.min(age[i] + 1, 999) : 0) : 0;
      }
      const swap = alive;
      alive = next;
      next = swap;
    };

    const draw = () => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      context.fillStyle = colors.dot;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (!open[i]) continue;
          const x = c * CELL + CELL / 2;
          context.globalAlpha = 0.55 * fadeFor(x);
          context.fillRect(x - 0.75, r * CELL + CELL / 2 - 0.75, 1.5, 1.5);
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = c * CELL;
          const y = r * CELL;
          const fade = fadeFor(x + CELL / 2);
          if (alive[i]) {
            const young = age[i] < 3;
            context.globalAlpha = (young ? 0.95 : 0.6) * fade;
            context.fillStyle = young ? colors.accent : colors.cell;
            context.beginPath();
            context.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 2.5);
            context.fill();
          } else if (trail[i] > 0.02) {
            context.globalAlpha = trail[i] * 0.4 * fade;
            context.fillStyle = colors.accent;
            context.beginPath();
            context.roundRect(x + 3.5, y + 3.5, CELL - 7, CELL - 7, 2);
            context.fill();
          }
        }
      }
      context.globalAlpha = 1;
    };

    let frame = 0;
    let last = 0;
    let carry = 0;
    let lastActivity = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      calm = now - lastActivity > CALM_AFTER;

      carry += dt * GENERATIONS_PER_SECOND;
      while (carry >= 1) {
        generation();
        carry -= 1;
      }

      let trails = false;
      for (let i = 0; i < trail.length; i++) {
        if (trail[i] > 0) {
          trail[i] = Math.max(0, trail[i] - dt * 1.6);
          if (trail[i] > 0) trails = true;
        }
      }

      draw();
      frame = population > 0 || trails ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (frame) return;
      last = performance.now();
      carry = 0;
      frame = requestAnimationFrame(loop);
    };

    const pointer = { x: 0, y: 0, travelled: 0, lastThrow: 0 };

    const inMargin = (x: number) => x < columnLeft || x > columnRight;

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!inMargin(event.clientX)) return;

      pointer.travelled += Math.hypot(dx, dy);
      const now = performance.now();
      if (pointer.travelled < CELL * 3 || now - pointer.lastThrow < 90) return;
      pointer.travelled = 0;
      pointer.lastThrow = now;
      lastActivity = now;

      const col = Math.floor(event.clientX / CELL) - 1;
      const row = Math.floor(event.clientY / CELL) - 1;
      place(GLIDER, col, row, dx < 0, dy < 0);
      wake();
    };

    const onClick = (event: MouseEvent) => {
      if (!inMargin(event.clientX)) return;
      const target = event.target as Element | null;
      if (target?.closest("a, button, input, textarea, [role='dialog']")) return;
      lastActivity = performance.now();
      place(R_PENTOMINO, Math.floor(event.clientX / CELL) - 1, Math.floor(event.clientY / CELL) - 1, false, false);
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
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="margin-canvas" aria-hidden />;
}
