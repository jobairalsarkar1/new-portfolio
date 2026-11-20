"use client";

import { useEffect, useRef } from "react";

const HEX_RADIUS = 58;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const VERTICAL_STEP = HEX_RADIUS * 1.5;

// A point light hovering above the lattice plane. Brightness follows
// h^3 / (d^2 + h^2)^1.5, the falloff of a lamp over a surface, so the pool of
// light is soft and has a long, natural tail instead of a hard cutout.
const LIGHT_HEIGHT = 120;
const LIGHT_REACH = 560;
const AMBIENT_POWER = 0.42;
const AFTERGLOW_SECONDS = 0.85;

const RIPPLE_SPEED = 820;
const RIPPLE_WIDTH = 52;
const RIPPLE_LIFETIME = 2.4;
const ELECTRON_LIFETIME = 1.7;
const MAX_RIPPLES = 4;
const MAX_ELECTRONS = 6;

const HEIGHT_SQUARED = LIGHT_HEIGHT * LIGHT_HEIGHT;
const REACH_SQUARED = LIGHT_REACH * LIGHT_REACH;
const FALLOFF_TAIL = Math.pow(
  HEIGHT_SQUARED / (REACH_SQUARED + HEIGHT_SQUARED),
  1.5,
);

// Warm tungsten palette: hot spots drift toward white, the fringe stays amber.
const COLOR_STEPS = 48;
const BOND_COLORS = Array.from({ length: COLOR_STEPS }, (_, index) => {
  const heat = index / (COLOR_STEPS - 1);
  return `rgb(255, ${Math.round(150 + heat * 96)}, ${Math.round(78 + heat * 140)})`;
});
const GLOW_COLOR = "rgb(255, 156, 74)";

type Point = {
  x: number;
  y: number;
};

type Vertex = Point & {
  heat: number;
};

type Bond = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
  heat: number;
};

type Ring = {
  cx: number;
  cy: number;
  points: Point[];
  vertices: Vertex[];
  bonds: Bond[];
  piBonds: Bond[];
};

type Lattice = {
  rings: Ring[];
  bonds: Bond[];
  piBonds: Bond[];
  vertices: Vertex[];
};

type Ripple = Point & { startedAt: number };

type Electron = {
  ring: Ring;
  startedAt: number;
  offset: number;
  direction: 1 | -1;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildHexPoints(centerX: number, centerY: number): Point[] {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;
    return {
      x: centerX + Math.cos(angle) * HEX_RADIUS,
      y: centerY + Math.sin(angle) * HEX_RADIUS,
    };
  });
}

function makeBond(a: Point, b: Point): Bond {
  return {
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
    mx: (a.x + b.x) / 2,
    my: (a.y + b.y) / 2,
    heat: 0,
  };
}

// Kekule style inner double bond: a shortened copy of the edge pulled toward
// the ring centre.
function makePiBond(a: Point, b: Point, center: Point): Bond {
  const pull = 0.76;
  const shorten = 0.72;
  const ax = center.x + (a.x - center.x) * pull;
  const ay = center.y + (a.y - center.y) * pull;
  const bx = center.x + (b.x - center.x) * pull;
  const by = center.y + (b.y - center.y) * pull;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;

  return makeBond(
    { x: mx + (ax - mx) * shorten, y: my + (ay - my) * shorten },
    { x: mx + (bx - mx) * shorten, y: my + (by - my) * shorten },
  );
}

function buildLattice(width: number, height: number): Lattice {
  const vertexMap = new Map<string, Vertex>();
  const bondMap = new Map<string, Bond>();
  const rings: Ring[] = [];
  const piBonds: Bond[] = [];
  const key = (point: Point) =>
    `${Math.round(point.x * 0.5)},${Math.round(point.y * 0.5)}`;

  // Neighbouring rings share atoms and bonds, so each is stored once.
  const vertexAt = (point: Point) => {
    const id = key(point);
    let vertex = vertexMap.get(id);

    if (!vertex) {
      vertex = { x: point.x, y: point.y, heat: 0 };
      vertexMap.set(id, vertex);
    }

    return vertex;
  };

  const bondBetween = (a: Point, b: Point) => {
    const [first, second] = [key(a), key(b)].sort();
    const id = `${first}|${second}`;
    let bond = bondMap.get(id);

    if (!bond) {
      bond = makeBond(a, b);
      bondMap.set(id, bond);
    }

    return bond;
  };

  for (let row = -1; row <= Math.ceil(height / VERTICAL_STEP) + 1; row += 1) {
    const offsetX = row % 2 === 0 ? 0 : HEX_WIDTH / 2;

    for (
      let column = -1;
      column <= Math.ceil(width / HEX_WIDTH) + 1;
      column += 1
    ) {
      const cx = column * HEX_WIDTH + offsetX;
      const cy = row * VERTICAL_STEP;

      if (
        cx < -HEX_WIDTH ||
        cx > width + HEX_WIDTH ||
        cy < -HEX_RADIUS * 2 ||
        cy > height + HEX_RADIUS * 2
      ) {
        continue;
      }

      const points = buildHexPoints(cx, cy);
      const center = { x: cx, y: cy };
      const ringPi = [0, 2, 4].map((index) =>
        makePiBond(points[index], points[(index + 1) % 6], center),
      );

      piBonds.push(...ringPi);
      rings.push({
        cx,
        cy,
        points,
        vertices: points.map(vertexAt),
        bonds: points.map((point, index) =>
          bondBetween(point, points[(index + 1) % 6]),
        ),
        piBonds: ringPi,
      });
    }
  }

  return {
    rings,
    bonds: [...bondMap.values()],
    piBonds,
    vertices: [...vertexMap.values()],
  };
}

function renderBaseLayer(
  lattice: Lattice,
  width: number,
  height: number,
  dpr: number,
) {
  const layer = document.createElement("canvas");
  layer.width = Math.round(width * dpr);
  layer.height = Math.round(height * dpr);

  const context = layer.getContext("2d");

  if (!context) {
    return layer;
  }

  context.scale(dpr, dpr);
  context.lineCap = "round";

  // The lattice is never fully dark: a faint room light keeps its structure.
  context.strokeStyle = "rgba(255, 229, 180, 0.05)";
  context.lineWidth = 1;
  context.beginPath();
  lattice.bonds.forEach((bond) => {
    context.moveTo(bond.x1, bond.y1);
    context.lineTo(bond.x2, bond.y2);
  });
  context.stroke();

  context.strokeStyle = "rgba(255, 229, 180, 0.026)";
  context.beginPath();
  lattice.piBonds.forEach((bond) => {
    context.moveTo(bond.x1, bond.y1);
    context.lineTo(bond.x2, bond.y2);
  });
  context.stroke();

  return layer;
}

function falloff(distanceSquared: number) {
  if (distanceSquared >= REACH_SQUARED) {
    return 0;
  }

  const ratio = HEIGHT_SQUARED / (distanceSquared + HEIGHT_SQUARED);

  return Math.max(0, ratio * Math.sqrt(ratio) - FALLOFF_TAIL) / (1 - FALLOFF_TAIL);
}

function colorFor(brightness: number) {
  return BOND_COLORS[Math.round(clamp(brightness, 0, 1) * (COLOR_STEPS - 1))];
}

export default function BenzeneField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;
    let lattice: Lattice = { rings: [], bonds: [], piBonds: [], vertices: [] };
    let baseLayer: HTMLCanvasElement | null = null;
    let frameId = 0;
    let resizeTimer = 0;
    let lastTime = performance.now() / 1000;
    let presence = 0;

    const light = { x: width / 2, y: height / 2, power: 0, flash: 0 };
    const target = { x: width / 2, y: height / 2, inside: false };
    const ripples: Ripple[] = [];
    const electrons: Electron[] = [];

    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      lattice = buildLattice(width, height);
      baseLayer = renderBaseLayer(lattice, width, height, dpr);
    };

    const rippleAt = (x: number, y: number, time: number) => {
      let sum = 0;

      for (const ripple of ripples) {
        const age = time - ripple.startedAt;
        const distance = Math.hypot(x - ripple.x, y - ripple.y);
        const delta = distance - age * RIPPLE_SPEED;

        sum +=
          0.9 *
          Math.exp(-age * 1.7) *
          Math.exp(-(delta * delta) / (2 * RIPPLE_WIDTH * RIPPLE_WIDTH));
      }

      return sum;
    };

    const strokeLine = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      brightness: number,
      thickness: number,
    ) => {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);

      if (brightness > 0.12) {
        context.globalAlpha = Math.min(0.32, brightness * 0.22);
        context.strokeStyle = GLOW_COLOR;
        context.lineWidth = (4 + brightness * 8) * thickness;
        context.stroke();
      }

      context.globalAlpha = Math.min(1, brightness * 1.05);
      context.strokeStyle = colorFor(brightness);
      context.lineWidth = (0.9 + Math.min(brightness, 1.3) * 1.1) * thickness;
      context.stroke();
    };

    const frame = (nowMs: number) => {
      const time = nowMs / 1000;
      const dt = clamp(time - lastTime, 0.001, 0.05);
      lastTime = time;

      // Where the light wants to be. Without a pointer it drifts slowly on
      // its own at lower power, so the page never looks switched off.
      let goalX = target.x;
      let goalY = target.y;
      let goalPower = 1;

      if (!target.inside) {
        goalPower = AMBIENT_POWER;
        goalX = reduceMotion
          ? width / 2
          : width * (0.5 + 0.32 * Math.sin(time * 0.21));
        goalY = reduceMotion
          ? height / 2
          : height * (0.5 + 0.26 * Math.sin(time * 0.33 + 1.3));
      }

      const follow = 1 - Math.exp(-dt * (target.inside ? 18 : 2.2));
      light.x += (goalX - light.x) * follow;
      light.y += (goalY - light.y) * follow;
      light.power += (goalPower - light.power) * (1 - Math.exp(-dt * 3.5));
      light.flash = Math.max(0, light.flash - dt * 2.2);
      presence += ((target.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt * 6));

      const flicker = 1 + 0.018 * Math.sin(time * 11.3) * Math.sin(time * 3.1);
      const output = light.power * (1 + light.flash * 0.9) * flicker;
      const cooling = Math.exp(-dt / AFTERGLOW_SECONDS);

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        if (time - ripples[index].startedAt > RIPPLE_LIFETIME) {
          ripples.splice(index, 1);
        }
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";

      if (baseLayer) {
        context.globalAlpha = 1;
        context.drawImage(baseLayer, 0, 0, width, height);
      }

      context.globalCompositeOperation = "lighter";

      // Soft scatter around the lamp, like light hanging in dusty air.
      const poolRadius = 520;
      const pool = context.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        poolRadius,
      );
      const poolStrength = Math.min(1.2, output);

      pool.addColorStop(0, `rgba(255, 205, 140, ${0.13 * poolStrength})`);
      pool.addColorStop(0.35, `rgba(255, 170, 95, ${0.05 * poolStrength})`);
      pool.addColorStop(1, "rgba(255, 150, 80, 0)");
      context.globalAlpha = 1;
      context.fillStyle = pool;
      context.fillRect(
        light.x - poolRadius,
        light.y - poolRadius,
        poolRadius * 2,
        poolRadius * 2,
      );

      // Electrons circling a ring deposit heat on the bonds they pass.
      for (let index = electrons.length - 1; index >= 0; index -= 1) {
        const electron = electrons[index];
        const age = time - electron.startedAt;

        if (age > ELECTRON_LIFETIME) {
          electrons.splice(index, 1);
          continue;
        }

        const progress = age / ELECTRON_LIFETIME;
        const eased = 1 - Math.pow(1 - progress, 2);
        const travelled =
          (electron.offset + eased * 9 * electron.direction + 60) % 6;
        const bondIndex = Math.floor(travelled);
        const along = travelled - bondIndex;
        const start = electron.ring.points[bondIndex];
        const end = electron.ring.points[(bondIndex + 1) % 6];
        const fade = 1 - progress;

        electron.ring.bonds[bondIndex].heat = Math.max(
          electron.ring.bonds[bondIndex].heat,
          1.1 * fade,
        );
        electron.ring.vertices[bondIndex].heat = Math.max(
          electron.ring.vertices[bondIndex].heat,
          1.2 * fade,
        );
        electron.ring.piBonds.forEach((bond) => {
          bond.heat = Math.max(bond.heat, 0.55 * fade);
        });

        const ex = start.x + (end.x - start.x) * along;
        const ey = start.y + (end.y - start.y) * along;
        const halo = context.createRadialGradient(ex, ey, 0, ex, ey, 22);

        halo.addColorStop(0, `rgba(255, 244, 225, ${0.9 * fade})`);
        halo.addColorStop(0.3, `rgba(255, 190, 110, ${0.4 * fade})`);
        halo.addColorStop(1, "rgba(255, 150, 80, 0)");
        context.globalAlpha = 1;
        context.fillStyle = halo;
        context.fillRect(ex - 22, ey - 22, 44, 44);
      }

      const hasRipples = ripples.length > 0;

      for (const bond of lattice.bonds) {
        const dx = bond.mx - light.x;
        const dy = bond.my - light.y;
        let lit = falloff(dx * dx + dy * dy) * output;

        if (hasRipples) {
          lit += rippleAt(bond.mx, bond.my, time);
        }

        bond.heat = Math.max(lit, bond.heat * cooling);

        if (bond.heat > 0.015) {
          strokeLine(bond.x1, bond.y1, bond.x2, bond.y2, bond.heat, 1);
        }
      }

      for (const bond of lattice.piBonds) {
        const dx = bond.mx - light.x;
        const dy = bond.my - light.y;
        let lit = falloff(dx * dx + dy * dy) * output * 0.7;

        if (hasRipples) {
          lit += rippleAt(bond.mx, bond.my, time) * 0.6;
        }

        bond.heat = Math.max(lit, bond.heat * cooling);

        if (bond.heat > 0.02) {
          strokeLine(bond.x1, bond.y1, bond.x2, bond.y2, bond.heat, 0.8);
        }
      }

      // Carbon atoms catch the light at every junction.
      for (const vertex of lattice.vertices) {
        const dx = vertex.x - light.x;
        const dy = vertex.y - light.y;
        let lit = falloff(dx * dx + dy * dy) * output;

        if (hasRipples) {
          lit += rippleAt(vertex.x, vertex.y, time);
        }

        vertex.heat = Math.max(lit, vertex.heat * cooling);

        if (vertex.heat > 0.05) {
          const brightness = Math.min(vertex.heat, 1.4);

          context.fillStyle = GLOW_COLOR;
          context.globalAlpha = Math.min(0.2, brightness * 0.14);
          context.beginPath();
          context.arc(vertex.x, vertex.y, 7 + brightness * 7, 0, Math.PI * 2);
          context.fill();

          context.fillStyle = colorFor(brightness);
          context.globalAlpha = Math.min(1, brightness * 1.1);
          context.beginPath();
          context.arc(vertex.x, vertex.y, 1.5 + brightness * 1.7, 0, Math.PI * 2);
          context.fill();
        }
      }

      // The lamp itself, only while a pointer is steering it.
      if (presence > 0.02) {
        const glint = context.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          30,
        );

        glint.addColorStop(0, `rgba(255, 246, 228, ${0.75 * presence})`);
        glint.addColorStop(0.25, `rgba(255, 205, 140, ${0.28 * presence})`);
        glint.addColorStop(1, "rgba(255, 170, 95, 0)");
        context.globalAlpha = 1;
        context.fillStyle = glint;
        context.fillRect(light.x - 30, light.y - 30, 60, 60);
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      frameId = window.requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      target.inside = true;
    };

    const handlePointerEnd = () => {
      target.inside = false;
    };

    const handleTouchEnd = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        target.inside = false;
      }
    };

    const handleClick = (event: MouseEvent) => {
      const time = performance.now() / 1000;

      light.flash = 1;

      if (reduceMotion) {
        return;
      }

      ripples.push({ x: event.clientX, y: event.clientY, startedAt: time });
      if (ripples.length > MAX_RIPPLES) ripples.shift();

      let nearest: Ring | null = null;
      let nearestDistance = Infinity;

      for (const ring of lattice.rings) {
        const distance = Math.hypot(ring.cx - event.clientX, ring.cy - event.clientY);

        if (distance < nearestDistance) {
          nearest = ring;
          nearestDistance = distance;
        }
      }

      if (nearest) {
        electrons.push({
          ring: nearest,
          startedAt: time,
          offset: Math.floor(Math.random() * 6),
          direction: Math.random() > 0.5 ? 1 : -1,
        });
        if (electrons.length > MAX_ELECTRONS) electrons.shift();
      }
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 120);
    };

    setup();
    frameId = window.requestAnimationFrame(frame);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handleTouchEnd);
    window.addEventListener("pointercancel", handleTouchEnd);
    window.addEventListener("blur", handlePointerEnd);
    document.documentElement.addEventListener("pointerleave", handlePointerEnd);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handleTouchEnd);
      window.removeEventListener("pointercancel", handleTouchEnd);
      window.removeEventListener("blur", handlePointerEnd);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerEnd,
      );
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="benzene-fullscreen" aria-hidden="true">
      <canvas ref={canvasRef} className="benzene-canvas" />
    </section>
  );
}
