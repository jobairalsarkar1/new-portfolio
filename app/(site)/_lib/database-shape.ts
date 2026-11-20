// A stack of three disks, the shape everyone draws for "database", described
// as points on its surface with a normal for each point. Rendering it works
// like the classic spinning donut: rotate the points, project them, keep the
// nearest point per cell, and shade each cell by how much light it receives.

export const DISKS = 3;
const RADIUS = 1;
const HEIGHT = 0.34;
const GAP = 0.24;
const SEAMS = 10;
const STRIDE = 8;

export function buildDatabaseSurface(density = 1) {
  const values: number[] = [];
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, disk: number, seam: number) =>
    values.push(x, y, z, nx, ny, nz, disk, seam);

  const around = Math.round(260 * density);
  const step = 0.018 / density;
  const total = DISKS * HEIGHT + (DISKS - 1) * GAP;

  for (let disk = 0; disk < DISKS; disk++) {
    const bottom = -total / 2 + disk * (HEIGHT + GAP);
    const top = bottom + HEIGHT;

    for (let i = 0; i < around; i++) {
      const angle = (i / around) * Math.PI * 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const seam = ((angle * SEAMS) / (Math.PI * 2)) % 1 < 0.07 ? 1 : 0;
      for (let y = bottom; y <= top + 0.001; y += step) push(c * RADIUS, y, s * RADIUS, c, 0, s, disk, seam);
    }

    for (let r = 0.02; r <= RADIUS + 0.001; r += step * 1.2) {
      const steps = Math.max(8, Math.round((Math.PI * 2 * r) / (step * 1.2)));
      for (let k = 0; k < steps; k++) {
        const angle = (k / steps) * Math.PI * 2;
        push(Math.cos(angle) * r, top, Math.sin(angle) * r, 0, 1, 0, disk, 0);
      }
    }
  }

  return new Float32Array(values);
}

export type Light = { x: number; y: number; z: number };

// Renders the stack into a brightness grid (0 means empty, otherwise 0..1+).
export function renderDatabase({
  surface,
  buffer,
  depth,
  cols,
  rows,
  scaleX,
  scaleY,
  time,
  light,
  glow,
}: {
  surface: Float32Array;
  buffer: Float32Array;
  depth: Float32Array;
  cols: number;
  rows: number;
  scaleX: number;
  scaleY: number;
  time: number;
  light: Light;
  glow: Float32Array;
}) {
  const camera = 5;
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

  buffer.fill(0);
  depth.fill(0);

  for (let o = 0; o < surface.length; o += STRIDE) {
    const px = surface[o];
    const py = surface[o + 1];
    const pz = surface[o + 2];
    const nx = surface[o + 3];
    const ny = surface[o + 4];
    const nz = surface[o + 5];

    const x = px * cB + pz * sB;
    const z1 = -px * sB + pz * cB;
    const y = py * cA + z1 * sA;
    const z = -py * sA + z1 * cA;

    const nX = nx * cB + nz * sB;
    const nZ1 = -nx * sB + nz * cB;
    const nY = ny * cA + nZ1 * sA;
    const nZ = -ny * sA + nZ1 * cA;
    if (nZ > 0.2) continue;

    const inverse = 1 / (z + camera);
    const col = Math.round(cols / 2 + scaleX * inverse * x);
    const row = Math.round(rows / 2 - scaleY * inverse * y);
    if (col < 0 || col >= cols || row < 0 || row >= rows) continue;

    const cell = row * cols + col;
    if (inverse <= depth[cell]) continue;
    depth[cell] = inverse;

    const lit = Math.max(0, nX * lx + nY * ly + nZ * lz);
    const cap = ny !== 0 ? 0.55 : 1;
    buffer[cell] = 0.06 + 0.82 * lit * cap + surface[o + 7] * 0.22 + glow[surface[o + 6]] + 0.001;
  }
}
