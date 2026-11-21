import { readColor, type CanvasSetup } from "./canvas";
import { drop as plop, panFor, trickle } from "./sound";

const CELL = 3;
const COURANT = 0.42;
const DAMPING = 0.986;
const SHADE = 10;

// A still pond: the damped 2D wave equation on a grid. Each pixel is lit by
// the slope of the surface under it, which is what makes ripples read as
// water rather than rings.
export function startPond({ canvas, colors, onTheme }: CanvasSetup) {
  const context = canvas.getContext("2d")!;
  const W = Math.round(canvas.clientWidth / CELL);
  const H = Math.round(canvas.clientHeight / CELL);
  canvas.width = W;
  canvas.height = H;

  let current = new Float32Array(W * H);
  let previous = new Float32Array(W * H);
  let next = new Float32Array(W * H);
  const sponge = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
      sponge[y * W + x] = edge < 10 ? 0.9 + 0.01 * edge : 1;
    }
  }
  const image = context.createImageData(W, H);
  const pan = panFor(canvas);

  let palette = { bg: [0, 0, 0] as readonly number[], light: [0, 0, 0] as readonly number[], dark: [0, 0, 0] as readonly number[] };
  const readPalette = () => {
    const c = colors();
    const accent = readColor(c.accent);
    palette = {
      bg: readColor(c.bg),
      light: [255, 255, 255].map((w, i) => w * 0.6 + accent[i] * 0.4),
      dark: readColor(c.fg),
    };
  };
  readPalette();

  const drop = (x: number, y: number, amount: number, radius: number) => {
    const cx = x / CELL;
    const cy = y / CELL;
    const reach = Math.ceil(radius * 2.5);
    for (let j = Math.max(1, Math.floor(cy) - reach); j < Math.min(H - 1, Math.ceil(cy) + reach); j++) {
      for (let i = Math.max(1, Math.floor(cx) - reach); i < Math.min(W - 1, Math.ceil(cx) + reach); i++) {
        current[j * W + i] += amount * Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / (radius * radius));
      }
    }
  };

  const step = () => {
    let energy = 0;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const u = current[i];
        const laplacian = current[i - 1] + current[i + 1] + current[i - W] + current[i + W] - 4 * u;
        const value = u + (u - previous[i]) * DAMPING * sponge[i] + COURANT * laplacian;
        next[i] = value;
        energy += Math.abs(value);
      }
    }
    [previous, current, next] = [current, next, previous];
    return energy;
  };

  const render = () => {
    const { bg, light, dark } = palette;
    const data = image.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const slope =
          x > 0 && x < W - 1 && y > 0 && y < H - 1
            ? (current[i - 1] - current[i + 1] + current[i - W] - current[i + W]) * SHADE
            : 0;
        const amount = Math.min(1, Math.abs(slope));
        const tone = slope > 0 ? light : dark;
        const p = i * 4;
        data[p] = bg[0] + (tone[0] - bg[0]) * amount;
        data[p + 1] = bg[1] + (tone[1] - bg[1]) * amount;
        data[p + 2] = bg[2] + (tone[2] - bg[2]) * amount;
        data[p + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  };

  let frame = 0;
  const loop = () => {
    const energy = step() + step();
    render();
    frame = energy > 0.5 ? requestAnimationFrame(loop) : 0;
    if (!frame) {
      current.fill(0);
      previous.fill(0);
      render();
    }
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(loop);
  };

  let last: { x: number; y: number; time: number } | null = null;
  const onMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (last) {
      const distance = Math.hypot(x - last.x, y - last.y);
      const speed = distance / Math.max(8, event.timeStamp - last.time);
      const steps = Math.max(1, Math.ceil(distance / 6));
      for (let s = 1; s <= steps; s++) {
        drop(last.x + ((x - last.x) * s) / steps, last.y + ((y - last.y) * s) / steps, (-Math.min(0.9, speed * 0.5) / steps) * 3, 2.4);
      }
      trickle(speed, pan);
      wake();
    }
    last = { x, y, time: event.timeStamp };
  };
  const onLeave = () => {
    last = null;
  };
  const onDown = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    drop(event.clientX - bounds.left, event.clientY - bounds.top, -3, 3);
    plop(1, pan);
    wake();
  };

  render();
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  const stopTheme = onTheme(() => {
    readPalette();
    render();
  });

  return () => {
    cancelAnimationFrame(frame);
    stopTheme();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("pointerdown", onDown);
  };
}
