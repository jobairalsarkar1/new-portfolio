"use client";

import { useEffect, useRef } from "react";

// A damped 2D wave equation, u_tt = c²∇²u − γu_t, solved with explicit finite
// differences on a world-space grid and drawn in perspective as ridge lines.
const DEPTH_FAR = 2.4;
const COURANT = 0.46;
const DAMPING = 0.988;
const STEPS_PER_SECOND = 120;
const AMPLITUDE = 44;
const SPONGE_CELLS = 8;
const CREST_LEVELS = [0.32, 0.6, 1];

type Colors = { bg: string; fg: string; accent: string };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function WaveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !section || !context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const farScale = 1 / DEPTH_FAR;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let top = 0;
    let bottom = 0;
    let spanX = 0;
    let weightX = 0;
    let weightZ = 0;
    let current = new Float32Array(0);
    let previous = new Float32Array(0);
    let next = new Float32Array(0);
    let sponge = new Float32Array(0);
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let colors: Colors = readColors();

    function readColors(): Colors {
      const style = getComputedStyle(canvas!);
      return {
        bg: style.getPropertyValue("--bg").trim() || "#000",
        fg: style.getPropertyValue("--fg").trim() || "#fff",
        accent: style.getPropertyValue("--accent").trim() || "#f60",
      };
    }

    function allocate(nextCols: number, nextRows: number) {
      cols = nextCols;
      rows = nextRows;
      const size = cols * rows;
      current = new Float32Array(size);
      previous = new Float32Array(size);
      next = new Float32Array(size);
      sponge = new Float32Array(size);
      xs = new Float32Array(cols);
      ys = new Float32Array(cols);

      // Cells are not square in world space, so weight the Laplacian per axis
      // to keep ripples circular. Stability needs weightX + weightZ <= 0.5.
      const dx = 2 / (cols - 1);
      const dz = (DEPTH_FAR - 1) / (rows - 1);
      const ratio = (dz / dx) ** 2;
      weightX = (COURANT * ratio) / (1 + ratio);
      weightZ = COURANT / (1 + ratio);

      // Absorbing layer near the edges so waves fade instead of bouncing back.
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const edge = Math.min(c, cols - 1 - c, (r * dz) / dx, rows - 1 - r);
          const t = clamp(1 - edge / SPONGE_CELLS, 0, 1);
          sponge[r * cols + c] = 1 - 0.14 * t * t;
        }
      }

      if (gridRef.current) gridRef.current.textContent = `${cols}×${rows}`;
    }

    function resize() {
      const bounds = section!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);

      const marker = section!.querySelector("[data-wave-horizon]");
      const markerBottom = marker
        ? marker.getBoundingClientRect().bottom - bounds.top
        : height * 0.5;

      top = clamp(markerBottom + 40, height * 0.42, height * 0.8);
      bottom = height + 60;
      spanX = (width * 1.16) / (2 * farScale);

      const nextCols = Math.round(clamp(width / 9, 72, 170));
      const nextRows = Math.round(clamp((bottom - top) / 9.5, 24, 56));
      if (nextCols !== cols || nextRows !== rows) allocate(nextCols, nextRows);
    }

    function rowScale(r: number) {
      return 1 / (DEPTH_FAR - ((DEPTH_FAR - 1) * r) / (rows - 1));
    }

    function rowBase(scale: number) {
      return top + ((bottom - top) * (scale - farScale)) / (1 - farScale);
    }

    function disturb(col: number, row: number, amount: number, radius: number) {
      const radiusZ = radius * ((2 / (cols - 1)) / ((DEPTH_FAR - 1) / (rows - 1)));
      const reachX = Math.ceil(radius * 2.5);
      const reachZ = Math.ceil(radiusZ * 2.5) + 1;

      for (let r = Math.round(row) - reachZ; r <= Math.round(row) + reachZ; r++) {
        if (r < 1 || r >= rows - 1) continue;
        for (let c = Math.round(col) - reachX; c <= Math.round(col) + reachX; c++) {
          if (c < 1 || c >= cols - 1) continue;
          const dx = (c - col) / radius;
          const dz = (r - row) / Math.max(radiusZ, 0.6);
          current[r * cols + c] += amount * Math.exp(-(dx * dx + dz * dz) / 2);
        }
      }
    }

    function toGrid(x: number, y: number) {
      if (y < top - 8) return null;
      const scale = farScale + ((y - top) / (bottom - top)) * (1 - farScale);
      const depth = 1 / scale;
      const row = ((DEPTH_FAR - depth) / (DEPTH_FAR - 1)) * (rows - 1);
      const worldX = (x - width / 2) / (scale * spanX);
      const col = ((worldX + 1) / 2) * (cols - 1);
      if (col < 0 || col > cols - 1) return null;
      return { col, row: clamp(row, 0, rows - 1) };
    }

    function step() {
      for (let r = 1; r < rows - 1; r++) {
        const offset = r * cols;
        for (let c = 1; c < cols - 1; c++) {
          const i = offset + c;
          const u = current[i];
          const laplacian =
            weightX * (current[i - 1] + current[i + 1] - 2 * u) +
            weightZ * (current[i - cols] + current[i + cols] - 2 * u);
          next[i] = u + (u - previous[i]) * DAMPING * sponge[i] + laplacian;
        }
      }

      const recycled = previous;
      previous = current;
      current = next;
      next = recycled;
    }

    function energy() {
      let total = 0;
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const i = r * cols + c;
          const velocity = current[i] - previous[i];
          const gx = current[i + 1] - current[i];
          const gz = current[i + cols] - current[i];
          total += velocity * velocity + weightX * gx * gx + weightZ * gz * gz;
        }
      }
      return (total * 500) / (cols * rows);
    }

    function draw() {
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
      context!.globalAlpha = 1;
      context!.fillStyle = colors.bg;
      context!.fillRect(0, 0, width, height);
      context!.lineJoin = "round";

      const half = width / 2;
      const rowGap = (bottom - top) / rows;

      for (let r = 0; r < rows; r++) {
        const scale = rowScale(r);
        const base = rowBase(scale);
        const span = scale * spanX;
        const amplitude = AMPLITUDE * scale;
        const visible = half / span;
        const first = Math.max(0, Math.floor(((1 - visible) / 2) * (cols - 1)) - 1);
        const last = Math.min(cols - 1, Math.ceil(((1 + visible) / 2) * (cols - 1)) + 1);
        const offset = r * cols;
        let count = 0;

        for (let c = first; c <= last; c++) {
          xs[count] = half + (-1 + (2 * c) / (cols - 1)) * span;
          ys[count] = base - current[offset + c] * amplitude;
          count++;
        }

        // Fill a band under the line with the background to hide rows behind it.
        const band = base + rowGap * 3 + amplitude * 1.6;
        context!.beginPath();
        context!.moveTo(xs[0], ys[0]);
        for (let i = 1; i < count; i++) context!.lineTo(xs[i], ys[i]);
        context!.lineTo(xs[count - 1], band);
        context!.lineTo(xs[0], band);
        context!.closePath();
        context!.globalAlpha = 1;
        context!.fillStyle = colors.bg;
        context!.fill();

        const nearness = r / (rows - 1);
        context!.beginPath();
        context!.moveTo(xs[0], ys[0]);
        for (let i = 1; i < count; i++) context!.lineTo(xs[i], ys[i]);
        context!.globalAlpha = 0.07 + 0.38 * nearness ** 1.15;
        context!.strokeStyle = colors.fg;
        context!.lineWidth = 0.7 + 0.5 * nearness;
        context!.stroke();

        for (const level of CREST_LEVELS) {
          context!.beginPath();
          let drawing = false;
          for (let i = 1; i < count; i++) {
            if (Math.abs(current[offset + first + i]) > level) {
              if (!drawing) context!.moveTo(xs[i - 1], ys[i - 1]);
              context!.lineTo(xs[i], ys[i]);
              drawing = true;
            } else {
              drawing = false;
            }
          }
          context!.globalAlpha = (0.12 + 0.3 * nearness) * (level / CREST_LEVELS[0]) ** 0.5;
          context!.strokeStyle = colors.accent;
          context!.lineWidth = 0.9 + 0.6 * nearness;
          context!.stroke();
        }
      }

      context!.globalAlpha = 1;
    }

    resize();
    disturb(cols * 0.5, rows * 0.62, -2.6, 2.6);
    disturb(cols * 0.22, rows * 0.35, -1.4, 2);
    disturb(cols * 0.8, rows * 0.45, -1.6, 2.2);

    if (reduceMotion) {
      for (let i = 0; i < 90; i++) step();
      draw();
    }

    let pointer: { x: number; y: number; time: number } | null = null;
    let lastInteraction = -Infinity;

    const localPoint = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = localPoint(event);

      if (pointer) {
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const elapsed = Math.max(8, event.timeStamp - pointer.time);
        const strength = Math.min(1.2, (distance / elapsed) * 0.6);

        if (strength > 0.03) {
          const samples = Math.max(1, Math.ceil(distance / 12));
          for (let i = 1; i <= samples; i++) {
            const cell = toGrid(
              pointer.x + (dx * i) / samples,
              pointer.y + (dy * i) / samples,
            );
            if (cell) disturb(cell.col, cell.row, -0.32 * strength, 1.5);
          }
          lastInteraction = performance.now();
        }
      }

      pointer = { ...point, time: event.timeStamp };
    };

    const onPointerDown = (event: PointerEvent) => {
      const point = localPoint(event);
      const cell = toGrid(point.x, point.y);
      if (!cell) return;
      disturb(cell.col, cell.row, -2.4, 2.3);
      lastInteraction = performance.now();
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerdown", onPointerDown);
    section.addEventListener("pointerleave", onPointerLeave);

    let frame = 0;
    let running = false;
    let lastTime = 0;
    let accumulator = 0;
    let frames = 0;
    let autopilot = 0;
    let nextDrop = 2;

    // When nobody is touching it, a source traces a Lissajous curve and the
    // occasional raindrop lands, so the surface never goes flat.
    function idleMotion(seconds: number, dt: number) {
      const idle = (performance.now() - lastInteraction) / 1000;
      const target = idle > 2.5 ? 1 : 0;
      autopilot += (target - autopilot) * Math.min(1, dt * 1.2);
      if (autopilot < 0.01) return;

      const col = cols * (0.5 + 0.34 * Math.sin(seconds * 0.21 + 0.8));
      const row = rows * (0.56 + 0.3 * Math.sin(seconds * 0.33));
      disturb(col, row, -0.05 * autopilot, 1.4);

      nextDrop -= dt;
      if (nextDrop <= 0) {
        nextDrop = -Math.log(Math.random()) * 2.2;
        const dropRow = rows * (0.3 + Math.random() * 0.6);
        const visible = (width / 2) / (rowScale(dropRow) * spanX);
        const dropCol = ((1 + (Math.random() * 2 - 1) * visible * 0.9) / 2) * (cols - 1);
        disturb(dropCol, dropRow, -1.1 * autopilot, 1.6);
      }
    }

    function loop(now: number) {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      idleMotion(now / 1000, dt);

      accumulator += dt * STEPS_PER_SECOND;
      let steps = 0;
      while (accumulator >= 1 && steps < 4) {
        step();
        accumulator -= 1;
        steps++;
      }
      if (steps === 4) accumulator = 0;

      draw();

      if (++frames % 10 === 0 && energyRef.current) {
        energyRef.current.textContent = energy().toFixed(3);
      }
    }

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    visibility.observe(section);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    resizeObserver.observe(section);

    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      if (reduceMotion) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerdown", onPointerDown);
      section.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="wave-canvas" aria-hidden />
      <div className="wave-readout container" aria-hidden>
        <span className="wave-equation">
          ∂²u/∂t² = c²∇²u − γ ∂u/∂t
        </span>
        <span className="wave-stats">
          E <span ref={energyRef}>0.000</span>
          <span className="dot-sep" />
          grid <span ref={gridRef}>—</span>
        </span>
        <span className="wave-hint">
          <span className="hint-fine">Move across the surface. Click to drop.</span>
          <span className="hint-touch">Tap the surface</span>
        </span>
      </div>
    </>
  );
}
