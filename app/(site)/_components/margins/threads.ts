import type { CanvasSetup } from "./canvas";

const GAP = 9;
const SEGMENTS = 34;
const GRAVITY = 0.12;
const FRICTION = 0.982;
const REACH = 36;
const STIFFNESS = 6;

type Thread = { restX: number; xs: Float32Array; ys: Float32Array; px: Float32Array; py: Float32Array; length: number };

// A curtain of silk threads. Every thread is a chain of points joined by
// fixed-length links (Verlet integration), pinned at the top and pulled down
// by gravity, so brushing through them makes them sway and settle naturally.
export function startThreads({ canvas, colors, onTheme }: CanvasSetup) {
  const context = canvas.getContext("2d")!;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  let palette = colors();
  const threads: Thread[] = [];
  const count = Math.floor((width - GAP) / GAP);
  for (let t = 0; t < count; t++) {
    const restX = GAP + t * GAP;
    const reachDown = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.7) * Math.cos(t * 0.37));
    const length = ((height - 16) * reachDown) / SEGMENTS;
    const xs = new Float32Array(SEGMENTS + 1);
    const ys = new Float32Array(SEGMENTS + 1);
    for (let s = 0; s <= SEGMENTS; s++) {
      xs[s] = restX;
      ys[s] = 8 + s * length;
    }
    threads.push({ restX, xs, ys, px: xs.slice(), py: ys.slice(), length });
  }

  const pointer = { x: -999, y: -999, vx: 0, vy: 0, active: false };

  const step = () => {
    let motion = 0;
    for (const thread of threads) {
      const { xs, ys, px, py } = thread;
      for (let s = 1; s <= SEGMENTS; s++) {
        const vx = (xs[s] - px[s]) * FRICTION;
        const vy = (ys[s] - py[s]) * FRICTION;
        px[s] = xs[s];
        py[s] = ys[s];
        xs[s] += vx;
        ys[s] += vy + GRAVITY;
        motion += Math.abs(vx) + Math.abs(vy);

        if (pointer.active) {
          const dx = xs[s] - pointer.x;
          const dy = ys[s] - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < REACH) {
            const push = (1 - distance / REACH) ** 2;
            xs[s] += pointer.vx * push * 0.5 + (dx / (distance || 1)) * push * 1.2;
            ys[s] += pointer.vy * push * 0.25;
          }
        }
      }

      for (let k = 0; k < STIFFNESS; k++) {
        xs[0] = thread.restX;
        ys[0] = 8;
        for (let s = 0; s < SEGMENTS; s++) {
          const dx = xs[s + 1] - xs[s];
          const dy = ys[s + 1] - ys[s];
          const distance = Math.hypot(dx, dy) || 1;
          const correction = (distance - thread.length) / distance;
          if (s === 0) {
            xs[s + 1] -= dx * correction;
            ys[s + 1] -= dy * correction;
          } else {
            xs[s] += dx * correction * 0.5;
            ys[s] += dy * correction * 0.5;
            xs[s + 1] -= dx * correction * 0.5;
            ys[s + 1] -= dy * correction * 0.5;
          }
        }
      }
    }
    return motion;
  };

  const trace = (thread: Thread) => {
    const { xs, ys } = thread;
    context.beginPath();
    context.moveTo(xs[0], ys[0]);
    for (let s = 1; s < SEGMENTS; s++) {
      context.quadraticCurveTo(xs[s], ys[s], (xs[s] + xs[s + 1]) / 2, (ys[s] + ys[s + 1]) / 2);
    }
    context.lineTo(xs[SEGMENTS], ys[SEGMENTS]);
  };

  const render = () => {
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    for (const thread of threads) {
      let sway = 0;
      for (let s = 0; s <= SEGMENTS; s++) sway = Math.max(sway, Math.abs(thread.xs[s] - thread.restX));

      trace(thread);
      context.globalAlpha = 0.32;
      context.strokeStyle = palette.subtle;
      context.lineWidth = 1;
      context.stroke();

      if (sway > 1) {
        trace(thread);
        context.globalAlpha = Math.min(0.9, sway / 30);
        context.strokeStyle = palette.accent;
        context.lineWidth = 1.2;
        context.stroke();
      }

      context.globalAlpha = 0.5;
      context.fillStyle = sway > 1 ? palette.accent : palette.subtle;
      context.beginPath();
      context.arc(thread.xs[SEGMENTS], thread.ys[SEGMENTS], 1.6, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  };

  let frame = 0;
  const loop = () => {
    const motion = step();
    render();
    frame = motion > 0.4 || pointer.active ? requestAnimationFrame(loop) : 0;
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(loop);
  };

  const onMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    pointer.vx = pointer.active ? x - pointer.x : 0;
    pointer.vy = pointer.active ? y - pointer.y : 0;
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    wake();
  };
  const onLeave = () => {
    pointer.active = false;
    wake();
  };

  // Let the threads settle into their hanging shape before the first frame.
  for (let i = 0; i < 60; i++) step();
  render();

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  const stopTheme = onTheme(() => {
    palette = colors();
    render();
  });

  return () => {
    cancelAnimationFrame(frame);
    stopTheme();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
  };
}
