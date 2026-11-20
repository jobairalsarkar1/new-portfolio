"use client";

import { Fragment, useEffect, useRef } from "react";
import { buildDatabaseSurface, DISKS, renderDatabase, type Light } from "../_lib/database-shape";

const CELL = 7;
const LEVELS = [0.16, 0.32, 0.52, 0.78];

function levelFor(brightness: number) {
  if (brightness === 0) return 0;
  let level = 1;
  for (const threshold of LEVELS) if (brightness >= threshold) level++;
  return level;
}

// The letters of these paragraphs double as pixels. A database turns behind
// them and each letter takes the brightness of the surface right under it.
export default function LitText({ paragraphs }: { paragraphs: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const letters = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-c]"));
    const levels = new Uint8Array(letters.length);
    const surface = buildDatabaseSurface(0.75);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let buffer = new Float32Array(0);
    let depth = new Float32Array(0);
    let scale = 0;
    let cells = new Int32Array(letters.length);

    const measure = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      buffer = new Float32Array(cols * rows);
      depth = new Float32Array(cols * rows);
      const size = Math.min((height * 0.47) / 1.06, (width * 0.44) / 1.0);
      scale = (size * 5) / CELL;

      cells = new Int32Array(letters.length);
      letters.forEach((letter, i) => {
        const col = Math.floor((letter.offsetLeft + letter.offsetWidth / 2) / CELL);
        const row = Math.floor((letter.offsetTop + letter.offsetHeight / 2) / CELL);
        cells[i] = col >= 0 && col < cols && row >= 0 && row < rows ? row * cols + col : -1;
      });
    };

    const light: Light = { x: -0.7, y: 0.35, z: -0.65 };
    const target: Light = { ...light };
    const glow = new Float32Array(DISKS);
    let nextWrite = 1.4;
    let lastPointer = -Infinity;

    const draw = (time: number) => {
      renderDatabase({ surface, buffer, depth, cols, rows, scaleX: scale, scaleY: scale, time, light, glow });
      for (let i = 0; i < letters.length; i++) {
        const level = cells[i] < 0 ? 0 : levelFor(buffer[cells[i]]);
        if (level === levels[i]) continue;
        levels[i] = level;
        if (level) letters[i].dataset.l = String(level);
        else delete letters[i].dataset.l;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = root.getBoundingClientRect();
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
      const dy = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
      target.x = Math.max(-1.6, Math.min(1.6, dx)) * 0.9;
      target.y = Math.max(-1.2, Math.min(1.4, -dy)) * 0.6 + 0.1;
      target.z = -0.65;
      lastPointer = performance.now();
    };

    let frame = 0;
    let last = 0;
    let lastDraw = 0;
    let running = false;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      // Without a mouse, the light slowly circles the stack on its own.
      if (now - lastPointer > 3000) {
        const angle = now / 4000;
        target.x = Math.cos(angle) * 0.9;
        target.y = 0.3 + Math.sin(angle * 0.7) * 0.3;
        target.z = -0.65;
      }
      const ease = Math.min(1, dt * 4);
      light.x += (target.x - light.x) * ease;
      light.y += (target.y - light.y) * ease;
      light.z += (target.z - light.z) * ease;

      nextWrite -= dt;
      if (nextWrite <= 0) {
        glow[Math.floor(Math.random() * DISKS)] = 0.6;
        nextWrite = 1.6 + Math.random() * 2.4;
      }
      for (let d = 0; d < DISKS; d++) glow[d] *= Math.exp(-dt * 2.4);

      if (now - lastDraw < 40) return;
      lastDraw = now;
      draw(now / 1000);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    measure();
    draw(0.8);
    document.fonts?.ready.then(() => {
      measure();
      draw(performance.now() / 1000);
    });

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(root);

    const resize = new ResizeObserver(() => {
      measure();
      draw(performance.now() / 1000);
    });
    resize.observe(root);

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className="lit" ref={rootRef}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} aria-hidden>
          {paragraph.split(" ").map((word, w) => (
            <Fragment key={w}>
              <span className="lit-word">
                {Array.from(word).map((character, c) => (
                  <span key={c} data-c="">
                    {character}
                  </span>
                ))}
              </span>{" "}
            </Fragment>
          ))}
        </p>
      ))}
      <div className="sr-only">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
