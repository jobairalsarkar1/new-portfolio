import { readColor, type CanvasSetup } from "./canvas";
import { panFor, stir } from "./sound";

const CELL = 5;
const ITERATIONS = 18;
const VORTICITY = 5;
const DYE_FADE = 0.995;
const VELOCITY_FADE = 0.995;

// Jos Stam's "stable fluids": velocities are carried along by themselves,
// then corrected so the water never compresses. Vorticity confinement adds
// back the small curls that the coarse grid would otherwise smooth away.
export function startInk({ canvas, colors, onTheme }: CanvasSetup) {
  const context = canvas.getContext("2d")!;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const W = Math.round(width / CELL);
  const H = Math.round(height / CELL);
  canvas.width = W;
  canvas.height = H;

  const size = (W + 2) * (H + 2);
  const at = (x: number, y: number) => x + (W + 2) * y;
  let u = new Float32Array(size);
  let v = new Float32Array(size);
  let u0 = new Float32Array(size);
  let v0 = new Float32Array(size);
  let dye = new Float32Array(size);
  let dye0 = new Float32Array(size);
  const pressure = new Float32Array(size);
  const divergence = new Float32Array(size);
  const curl = new Float32Array(size);
  const image = context.createImageData(W, H);
  const pan = panFor(canvas);

  let palette = { bg: [0, 0, 0] as readonly number[], ink: [0, 0, 0] as readonly number[] };
  const readPalette = () => {
    const c = colors();
    palette = { bg: readColor(c.bg), ink: readColor(c.accent) };
  };
  readPalette();

  const bounds = (kind: 0 | 1 | 2, field: Float32Array) => {
    for (let i = 1; i <= W; i++) {
      field[at(i, 0)] = kind === 2 ? -field[at(i, 1)] : field[at(i, 1)];
      field[at(i, H + 1)] = kind === 2 ? -field[at(i, H)] : field[at(i, H)];
    }
    for (let j = 1; j <= H; j++) {
      field[at(0, j)] = kind === 1 ? -field[at(1, j)] : field[at(1, j)];
      field[at(W + 1, j)] = kind === 1 ? -field[at(W, j)] : field[at(W, j)];
    }
  };

  const advect = (kind: 0 | 1 | 2, target: Float32Array, source: Float32Array, dt: number) => {
    for (let j = 1; j <= H; j++) {
      for (let i = 1; i <= W; i++) {
        let x = i - dt * u[at(i, j)];
        let y = j - dt * v[at(i, j)];
        x = Math.max(0.5, Math.min(W + 0.5, x));
        y = Math.max(0.5, Math.min(H + 0.5, y));
        const i0 = Math.floor(x);
        const j0 = Math.floor(y);
        const s = x - i0;
        const t = y - j0;
        target[at(i, j)] =
          (1 - s) * ((1 - t) * source[at(i0, j0)] + t * source[at(i0, j0 + 1)]) +
          s * ((1 - t) * source[at(i0 + 1, j0)] + t * source[at(i0 + 1, j0 + 1)]);
      }
    }
    bounds(kind, target);
  };

  const project = () => {
    for (let j = 1; j <= H; j++) {
      for (let i = 1; i <= W; i++) {
        divergence[at(i, j)] = -0.5 * (u[at(i + 1, j)] - u[at(i - 1, j)] + v[at(i, j + 1)] - v[at(i, j - 1)]);
        pressure[at(i, j)] = 0;
      }
    }
    bounds(0, divergence);
    bounds(0, pressure);
    for (let k = 0; k < ITERATIONS; k++) {
      for (let j = 1; j <= H; j++) {
        for (let i = 1; i <= W; i++) {
          pressure[at(i, j)] =
            (divergence[at(i, j)] +
              pressure[at(i - 1, j)] +
              pressure[at(i + 1, j)] +
              pressure[at(i, j - 1)] +
              pressure[at(i, j + 1)]) /
            4;
        }
      }
      bounds(0, pressure);
    }
    for (let j = 1; j <= H; j++) {
      for (let i = 1; i <= W; i++) {
        u[at(i, j)] -= 0.5 * (pressure[at(i + 1, j)] - pressure[at(i - 1, j)]);
        v[at(i, j)] -= 0.5 * (pressure[at(i, j + 1)] - pressure[at(i, j - 1)]);
      }
    }
    bounds(1, u);
    bounds(2, v);
  };

  const confineVorticity = (dt: number) => {
    for (let j = 1; j <= H; j++) {
      for (let i = 1; i <= W; i++) {
        curl[at(i, j)] = 0.5 * (v[at(i + 1, j)] - v[at(i - 1, j)] - (u[at(i, j + 1)] - u[at(i, j - 1)]));
      }
    }
    for (let j = 2; j < H; j++) {
      for (let i = 2; i < W; i++) {
        const gx = 0.5 * (Math.abs(curl[at(i + 1, j)]) - Math.abs(curl[at(i - 1, j)]));
        const gy = 0.5 * (Math.abs(curl[at(i, j + 1)]) - Math.abs(curl[at(i, j - 1)]));
        const length = Math.hypot(gx, gy) + 1e-5;
        const w = curl[at(i, j)];
        u[at(i, j)] += dt * VORTICITY * (gy / length) * w;
        v[at(i, j)] -= dt * VORTICITY * (gx / length) * w;
      }
    }
  };

  const splat = (x: number, y: number, dx: number, dy: number, amount: number) => {
    const cx = x / CELL;
    const cy = y / CELL;
    const radius = 4;
    for (let j = Math.max(1, Math.floor(cy - radius * 2)); j <= Math.min(H, Math.ceil(cy + radius * 2)); j++) {
      for (let i = Math.max(1, Math.floor(cx - radius * 2)); i <= Math.min(W, Math.ceil(cx + radius * 2)); i++) {
        const falloff = Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / (radius * radius));
        u[at(i, j)] += dx * falloff;
        v[at(i, j)] += dy * falloff;
        dye[at(i, j)] = Math.min(1.6, dye[at(i, j)] + amount * falloff);
      }
    }
  };

  const render = () => {
    const { bg, ink } = palette;
    const data = image.data;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const mix = 1 - Math.exp(-dye[at(i + 1, j + 1)] * 2.6);
        const p = (j * W + i) * 4;
        data[p] = bg[0] + (ink[0] - bg[0]) * mix;
        data[p + 1] = bg[1] + (ink[1] - bg[1]) * mix;
        data[p + 2] = bg[2] + (ink[2] - bg[2]) * mix;
        data[p + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  };

  let frame = 0;
  let last = 0;

  const step = (now: number) => {
    const dt = Math.min(1.5, ((now - last) / 1000) * 60);
    last = now;

    confineVorticity(dt * 0.016);
    [u0, u] = [u, u0];
    [v0, v] = [v, v0];
    advect(1, u, u0, dt);
    advect(2, v, v0, dt);
    project();
    [dye0, dye] = [dye, dye0];
    advect(0, dye, dye0, dt);

    let ink = 0;
    let motion = 0;
    for (let k = 0; k < size; k++) {
      dye[k] *= DYE_FADE;
      u[k] *= VELOCITY_FADE;
      v[k] *= VELOCITY_FADE;
      ink += dye[k];
      motion += Math.abs(u[k]) + Math.abs(v[k]);
    }

    render();
    frame = ink > 0.5 || motion > 0.5 ? requestAnimationFrame(step) : 0;
  };

  const wake = () => {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(step);
  };

  let previous: { x: number; y: number } | null = null;
  const onMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (previous) {
      const dx = (x - previous.x) / CELL;
      const dy = (y - previous.y) / CELL;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.05) {
        splat(x, y, dx * 1.2, dy * 1.2, Math.min(1, 0.35 + speed * 0.1));
        stir(speed, pan);
        wake();
      }
    }
    previous = { x, y };
  };
  const onLeave = () => {
    previous = null;
  };

  render();
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  const stopTheme = onTheme(() => {
    readPalette();
    render();
  });

  return () => {
    cancelAnimationFrame(frame);
    stopTheme();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
  };
}
