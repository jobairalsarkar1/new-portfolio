"use client";

import { useEffect, useRef } from "react";

// A stack of three disks, the shape everyone draws for "database", rendered
// the same way as the classic spinning donut: sample points on the surface,
// rotate them, project them onto a grid of characters, keep the nearest point
// per cell, and pick a character by how much light that point receives.
const SHADES = " .,-~:;=!*#$@";
const DISKS = 3;
const RADIUS = 1;
const HEIGHT = 0.34;
const GAP = 0.24;
const SEAMS = 10;
const CAMERA = 5;

function buildSurface() {
  const values: number[] = [];
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, disk: number, seam: number) =>
    values.push(x, y, z, nx, ny, nz, disk, seam);

  const total = DISKS * HEIGHT + (DISKS - 1) * GAP;
  for (let disk = 0; disk < DISKS; disk++) {
    const bottom = -total / 2 + disk * (HEIGHT + GAP);
    const top = bottom + HEIGHT;

    for (let i = 0; i < 260; i++) {
      const angle = (i / 260) * Math.PI * 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const seam = (angle * SEAMS) / (Math.PI * 2) % 1 < 0.07 ? 1 : 0;
      for (let y = bottom; y <= top + 0.001; y += 0.018) push(c * RADIUS, y, s * RADIUS, c, 0, s, disk, seam);
    }

    for (let r = 0.02; r <= RADIUS + 0.001; r += 0.022) {
      const steps = Math.max(8, Math.round((Math.PI * 2 * r) / 0.022));
      for (let k = 0; k < steps; k++) {
        const angle = (k / steps) * Math.PI * 2;
        const c = Math.cos(angle) * r;
        const s = Math.sin(angle) * r;
        push(c, top, s, 0, 1, 0, disk, 0);
        push(c, bottom, s, 0, -1, 0, disk, 0);
      }
    }
  }

  return new Float32Array(values);
}

export default function AsciiDatabase() {
  const preRef = useRef<HTMLPreElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    const probe = probeRef.current;
    if (!pre || !probe) return;

    const surface = buildSurface();
    const count = surface.length / 8;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cols = 0;
    let rows = 0;
    let shade = new Uint8Array(0);
    let depth = new Float32Array(0);
    let scaleX = 0;
    let scaleY = 0;

    const resize = () => {
      const cell = probe.getBoundingClientRect();
      const cellWidth = cell.width / 10 || 6;
      const cellHeight = cell.height || 10;
      cols = Math.max(40, Math.floor(pre.clientWidth / cellWidth));
      const aspect = pre.clientWidth < 520 ? 1.15 : 1.9;
      rows = Math.max(18, Math.round((cols * cellWidth) / cellHeight / aspect));
      shade = new Uint8Array(cols * rows);
      depth = new Float32Array(cols * rows);
      scaleY = rows * CAMERA * 0.42;
      scaleX = scaleY * (cellHeight / cellWidth);
    };

    const light = { x: -0.7, y: 0.35, z: -0.65 };
    const target = { ...light };
    const glow = new Float32Array(DISKS);
    let nextWrite = 1.2;

    const draw = (time: number) => {
      const tilt = 0.36 + Math.sin(time * 0.45) * 0.06;
      const spin = time * 0.5;
      const cA = Math.cos(tilt);
      const sA = Math.sin(tilt);
      const cB = Math.cos(spin);
      const sB = Math.sin(spin);
      const length = Math.hypot(light.x, light.y, light.z) || 1;
      const lx = light.x / length;
      const ly = light.y / length;
      const lz = light.z / length;

      shade.fill(0);
      depth.fill(0);

      for (let i = 0; i < count; i++) {
        const o = i * 8;
        const px = surface[o];
        const py = surface[o + 1];
        const pz = surface[o + 2];
        const nx = surface[o + 3];
        const ny = surface[o + 4];
        const nz = surface[o + 5];

        // Spin around the vertical axis, then tilt the stack toward the viewer.
        const x = px * cB + pz * sB;
        const z1 = -px * sB + pz * cB;
        const y = py * cA + z1 * sA;
        const z = -py * sA + z1 * cA;

        const nX = nx * cB + nz * sB;
        const nZ1 = -nx * sB + nz * cB;
        const nY = ny * cA + nZ1 * sA;
        const nZ = -ny * sA + nZ1 * cA;
        if (nZ > 0.2) continue;

        const inverse = 1 / (z + CAMERA);
        const col = Math.round(cols / 2 + scaleX * inverse * x);
        const row = Math.round(rows / 2 - scaleY * inverse * y);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

        const cell = row * cols + col;
        if (inverse <= depth[cell]) continue;
        depth[cell] = inverse;

        const lit = Math.max(0, nX * lx + nY * ly + nZ * lz);
        const cap = ny !== 0 ? 0.55 : 1;
        const brightness = 0.06 + 0.82 * lit * cap + surface[o + 7] * 0.22 + glow[surface[o + 6]];
        shade[cell] = 1 + Math.min(SHADES.length - 2, Math.floor(brightness * (SHADES.length - 2)));
      }

      let text = "";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) text += SHADES[shade[row * cols + col]];
        text += "\n";
      }
      pre.textContent = text;
    };

    resize();
    draw(0.8);

    const onPointerMove = (event: PointerEvent) => {
      const bounds = pre.getBoundingClientRect();
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
      const dy = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
      target.x = Math.max(-1.6, Math.min(1.6, dx)) * 0.9;
      target.y = Math.max(-1.2, Math.min(1.4, -dy)) * 0.6 + 0.1;
      target.z = -0.65;
    };

    let frame = 0;
    let last = 0;
    let lastDraw = 0;
    let running = false;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      light.x += (target.x - light.x) * Math.min(1, dt * 4);
      light.y += (target.y - light.y) * Math.min(1, dt * 4);
      light.z += (target.z - light.z) * Math.min(1, dt * 4);

      // Every few seconds a write lands on one of the disks and it glows.
      nextWrite -= dt;
      if (nextWrite <= 0) {
        glow[Math.floor(Math.random() * DISKS)] = 0.6;
        nextWrite = 1.6 + Math.random() * 2.4;
      }
      for (let d = 0; d < DISKS; d++) glow[d] *= Math.exp(-dt * 2.4);

      if (now - lastDraw < 33) return;
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

    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    visibility.observe(pre);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    resizeObserver.observe(pre);

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <figure className="ascii">
      <pre ref={preRef} aria-hidden />
      <span ref={probeRef} className="ascii-probe" aria-hidden>
        0000000000
      </span>
      <figcaption>
        A database drawn with nothing but text characters, lit by your
        cursor. Every few seconds a write lands on one of its disks.
      </figcaption>
    </figure>
  );
}
