"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const HEX_RADIUS = 58;
const HEX_HEIGHT = HEX_RADIUS * 2;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HORIZONTAL_STEP = HEX_WIDTH;
const VERTICAL_STEP = HEX_RADIUS * 1.5;
const ECHO_LIFETIME = 900;
const PULSE_LIFETIME = 1800;
const MAX_ECHOES = 18;
const MAX_PULSES = 12;

type Point = {
  x: number;
  y: number;
};

type Ring = {
  id: number;
  centerX: number;
  centerY: number;
  points: Point[];
  traceLength: number;
  path: string;
};

type Edge = {
  id: number;
  ringId: number;
  start: Point;
  end: Point;
  midX: number;
  midY: number;
};

type Echo = {
  id: number;
  x: number;
  y: number;
  createdAt: number;
  radius: number;
  path: string;
};

type Pulse = {
  id: number;
  edgeId: number;
  ringId: number;
  x: number;
  y: number;
  createdAt: number;
};

type CursorState = Point & {
  inside: boolean;
};

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1440, height: 900 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function getNow() {
  if (typeof performance === "undefined") {
    return Date.now();
  }

  return performance.now();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildHexPoints(centerX: number, centerY: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;
    return {
      x: centerX + Math.cos(angle) * HEX_RADIUS,
      y: centerY + Math.sin(angle) * HEX_RADIUS,
    };
  });
}

function createArchitecture(width: number, height: number) {
  const rings: Ring[] = [];
  const edges: Edge[] = [];
  let ringId = 0;
  let edgeId = 0;

  for (let row = -1; row <= Math.ceil(height / VERTICAL_STEP) + 1; row += 1) {
    const offsetX = row % 2 === 0 ? 0 : HORIZONTAL_STEP / 2;

    for (
      let column = -1;
      column <= Math.ceil(width / HORIZONTAL_STEP) + 1;
      column += 1
    ) {
      const centerX = column * HORIZONTAL_STEP + offsetX;
      const centerY = row * VERTICAL_STEP;

      if (
        centerX < -HEX_WIDTH ||
        centerX > width + HEX_WIDTH ||
        centerY < -HEX_HEIGHT ||
        centerY > height + HEX_HEIGHT
      ) {
        continue;
      }

      const points = buildHexPoints(centerX, centerY);
      const ring = {
        id: ringId,
        centerX,
        centerY,
        points,
        traceLength: 6 * HEX_RADIUS * 0.85,
        path: points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
          )
          .join(" ")
          .concat(" Z"),
      };

      rings.push(ring);

      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length];
        edges.push({
          id: edgeId,
          ringId,
          start: point,
          end: next,
          midX: (point.x + next.x) / 2,
          midY: (point.y + next.y) / 2,
        });
        edgeId += 1;
      });

      ringId += 1;
    }
  }

  return { rings, edges };
}

function distanceToSegment(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const segmentLength = dx * dx + dy * dy;
  const ratio =
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / segmentLength;
  const t = clamp(ratio, 0, 1);
  const projection = {
    x: start.x + dx * t,
    y: start.y + dy * t,
  };

  return {
    projection,
    distance: Math.hypot(point.x - projection.x, point.y - projection.y),
  };
}

type SegmentMatch = ReturnType<typeof distanceToSegment> & {
  edge: Edge;
};

export default function BenzeneField() {
  const initialViewport = getViewport();
  const cursorWashRef = useRef<SVGCircleElement | null>(null);
  const cursorGroupRef = useRef<SVGGElement | null>(null);
  const hoverSpawnRef = useRef(0);
  const pulseIdRef = useRef(0);
  const echoIdRef = useRef(0);
  const chargeTimeoutsRef = useRef<number[]>([]);
  const frameNowRef = useRef(getNow());
  const pointerTargetRef = useRef<CursorState>({
    x: initialViewport.width / 2,
    y: initialViewport.height / 2,
    inside: false,
  });
  const cursorRef = useRef<CursorState>({
    x: initialViewport.width / 2,
    y: initialViewport.height / 2,
    inside: false,
  });
  const [viewport, setViewport] = useState(initialViewport);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [edgeCharge, setEdgeCharge] = useState<Record<number, number>>({});
  const [ambientCharge, setAmbientCharge] = useState(0);

  const architecture = useMemo(
    () => createArchitecture(viewport.width, viewport.height),
    [viewport.height, viewport.width],
  );

  useEffect(() => {
    const handleResize = () => {
      const nextViewport = getViewport();

      setViewport(nextViewport);
      pointerTargetRef.current = {
        x: nextViewport.width / 2,
        y: nextViewport.height / 2,
        inside: false,
      };
      cursorRef.current = pointerTargetRef.current;
      setCursorVisible(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const createEcho = (x: number, y: number) => {
      const now = getNow();
      setEchoes((current) => [
        ...current.slice(-(MAX_ECHOES - 1)),
        {
          id: (echoIdRef.current += 1),
          x,
          y,
          createdAt: now,
          radius: 20 + Math.random() * 34,
          path: buildHexPoints(x, y)
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
            )
            .join(" ")
            .concat(" Z"),
        },
      ]);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const wasOutside = !pointerTargetRef.current.inside;

      pointerTargetRef.current = { x, y, inside: true };

      if (wasOutside) {
        cursorRef.current = { x, y, inside: true };
        cursorWashRef.current?.setAttribute("cx", `${x}`);
        cursorWashRef.current?.setAttribute("cy", `${y}`);
        cursorGroupRef.current?.setAttribute("transform", `translate(${x} ${y})`);
      }

      setCursorVisible(true);

      const now = getNow();
      if (now - hoverSpawnRef.current > 76) {
        hoverSpawnRef.current = now;
        createEcho(x, y);
      }
    };

    const handlePointerLeave = () => {
      pointerTargetRef.current = {
        ...pointerTargetRef.current,
        inside: false,
      };
      setCursorVisible(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    const clearChargeTimeouts = () => {
      chargeTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      chargeTimeoutsRef.current = [];
    };

    const scheduleEdgeCharge = (edge: Edge, boost: number, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        setEdgeCharge((current) => ({
          ...current,
          [edge.id]: Math.min(3.8, (current[edge.id] ?? 0) + boost),
        }));
      }, delay);

      chargeTimeoutsRef.current.push(timeoutId);
    };

    const handleClick = (event: MouseEvent) => {
      const point = {
        x: event.clientX,
        y: event.clientY,
      };

      let bestMatch: SegmentMatch | null = null;

      for (const edge of architecture.edges) {
        const match = distanceToSegment(point, edge.start, edge.end);

        if (!bestMatch || match.distance < bestMatch.distance) {
          bestMatch = {
            ...match,
            edge,
          };
        }
      }

      if (!bestMatch || bestMatch.distance > 22) {
        return;
      }

      const selectedMatch = bestMatch;
      const now = getNow();
      const ringEdges = architecture.edges
        .filter((edge) => edge.ringId === selectedMatch.edge.ringId)
        .sort((a, b) => a.id - b.id);
      const selectedRingIndex = ringEdges.findIndex(
        (edge) => edge.id === selectedMatch.edge.id,
      );
      const nearbyEdges = architecture.edges
        .filter((edge) => edge.ringId !== selectedMatch.edge.ringId)
        .map((edge) => ({
          edge,
          distance: Math.hypot(
            edge.midX - selectedMatch.projection.x,
            edge.midY - selectedMatch.projection.y,
          ),
        }))
        .filter((item) => item.distance < 145)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8);

      setPulses((current) => [
        ...current.slice(-(MAX_PULSES - 1)),
        {
          id: (pulseIdRef.current += 1),
          edgeId: selectedMatch.edge.id,
          ringId: selectedMatch.edge.ringId,
          x: selectedMatch.projection.x,
          y: selectedMatch.projection.y,
          createdAt: now,
        },
      ]);

      if (selectedRingIndex >= 0) {
        ringEdges.forEach((edge, index) => {
          const clockwiseDistance = Math.abs(index - selectedRingIndex);
          const ringDistance = Math.min(
            clockwiseDistance,
            ringEdges.length - clockwiseDistance,
          );
          const boostByDistance = [2.35, 1.38, 0.78, 0.42];
          const delay = ringDistance * 82;

          scheduleEdgeCharge(
            edge,
            boostByDistance[ringDistance] ?? 0.32,
            delay,
          );
        });
      }

      nearbyEdges.forEach(({ edge, distance }, index) => {
        const distanceFalloff = clamp(1 - distance / 145, 0, 1);
        scheduleEdgeCharge(
          edge,
          0.22 + distanceFalloff * 0.42,
          260 + index * 34,
        );
      });

      setAmbientCharge((current) => Math.min(2.8, current + 0.24));
    };

    window.addEventListener("click", handleClick);
    return () => {
      clearChargeTimeouts();
      window.removeEventListener("click", handleClick);
    };
  }, [architecture.edges]);

  useEffect(() => {
    let frameId = 0;
    let animationAccumulator = 0;
    let lastTime = getNow();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      frameNowRef.current = now;

      const target = pointerTargetRef.current;
      const current = cursorRef.current;
      const easing = 0.1;
      const nextCursor = target.inside
        ? target
        : {
            x: current.x + (target.x - current.x) * easing,
            y: current.y + (target.y - current.y) * easing,
            inside: target.inside,
          };

      cursorRef.current = nextCursor;

      if (cursorWashRef.current) {
        cursorWashRef.current.setAttribute("cx", `${nextCursor.x}`);
        cursorWashRef.current.setAttribute("cy", `${nextCursor.y}`);
        cursorWashRef.current.setAttribute(
          "opacity",
          nextCursor.inside ? "0.28" : "0",
        );
      }

      if (cursorGroupRef.current) {
        cursorGroupRef.current.setAttribute(
          "transform",
          `translate(${nextCursor.x} ${nextCursor.y})`,
        );
        cursorGroupRef.current.setAttribute(
          "opacity",
          nextCursor.inside ? "0.68" : "0",
        );
      }

      animationAccumulator += delta;

      if (animationAccumulator >= 1 / 45) {
        const animationDelta = animationAccumulator;
        animationAccumulator = 0;

        setAmbientCharge((currentCharge) =>
          Math.max(0, currentCharge - animationDelta * 0.07),
        );
        setEchoes((currentEchoes) =>
          currentEchoes.filter((echo) => now - echo.createdAt < ECHO_LIFETIME),
        );
        setPulses((currentPulses) =>
          currentPulses.filter(
            (pulse) => now - pulse.createdAt < PULSE_LIFETIME,
          ),
        );
        setEdgeCharge((currentChargeMap) => {
          const next: Record<number, number> = {};

          Object.entries(currentChargeMap).forEach(([key, value]) => {
            const faded = Math.max(0, value - animationDelta * 0.16);

            if (faded > 0.01) {
              next[Number(key)] = faded;
            }
          });

          return next;
        });
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <section className="benzene-fullscreen" aria-hidden="true">
      <svg
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        className="benzene-canvas"
      >
        <defs>
          <radialGradient id="modernFieldGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255, 245, 220, 0.92)" />
            <stop offset="55%" stopColor="rgba(255, 191, 107, 0.24)" />
            <stop offset="100%" stopColor="rgba(255, 191, 107, 0)" />
          </radialGradient>
          <filter id="modernSoftEdgeGlow">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          ref={cursorWashRef}
          cx={cursorRef.current.x}
          cy={cursorRef.current.y}
          r={176}
          className="field-cursor-wash"
          opacity={cursorVisible ? 0.28 : 0}
        />

        {architecture.rings.map((ring) => {
          const distance = cursorVisible
            ? Math.hypot(
                cursorRef.current.x - ring.centerX,
                cursorRef.current.y - ring.centerY,
              )
            : 9999;
          const proximity = clamp(1 - distance / 220, 0, 1);
          const opacity = proximity * 0.13 + ambientCharge * 0.026;

          if (opacity <= 0.002) {
            return null;
          }

          return (
            <path
              key={ring.id}
              d={ring.path}
              className="benzene-ring-shadow"
              style={{ opacity }}
            />
          );
        })}

        {architecture.edges.map((edge) => {
          const distance = cursorVisible
            ? Math.hypot(
                cursorRef.current.x - edge.midX,
                cursorRef.current.y - edge.midY,
              )
            : 9999;
          const proximity = clamp(1 - distance / 210, 0, 1);
          const charged = edgeCharge[edge.id] ?? 0;
          const opacity =
            proximity * 0.18 + charged * 0.3 + ambientCharge * 0.038;

          if (opacity <= 0.003) {
            return null;
          }

          return (
            <g key={edge.id}>
              <line
                x1={edge.start.x}
                y1={edge.start.y}
                x2={edge.end.x}
                y2={edge.end.y}
                className="benzene-edge"
                style={{
                  opacity,
                  strokeWidth: 1.35 + charged * 1.45,
                }}
              />
              <line
                x1={edge.start.x}
                y1={edge.start.y}
                x2={edge.end.x}
                y2={edge.end.y}
                className="benzene-edge-glow"
                style={{
                  opacity: clamp(opacity * 0.82, 0, 1),
                  strokeWidth: 3.2 + charged * 2.35,
                }}
                filter="url(#modernSoftEdgeGlow)"
              />
            </g>
          );
        })}

        {echoes.map((echo) => {
          const age = clamp(
            (frameNowRef.current - echo.createdAt) / ECHO_LIFETIME,
            0,
            1,
          );
          const opacity = (1 - age) * 0.36;
          const radius = echo.radius + age * 32;

          return (
            <g key={echo.id} opacity={opacity}>
              <circle
                cx={echo.x}
                cy={echo.y}
                r={radius}
                className="benzene-echo-ring"
              />
              <path d={echo.path} className="benzene-echo-shape" />
            </g>
          );
        })}

        {pulses.map((pulse) => {
          const age = clamp(
            (frameNowRef.current - pulse.createdAt) / PULSE_LIFETIME,
            0,
            1,
          );
          const pulseEdge = architecture.edges.find(
            (edge) => edge.id === pulse.edgeId,
          );
          const opacity = 1 - age * 0.82;

          if (!pulseEdge) {
            return null;
          }

          const edgeLength = Math.hypot(
            pulseEdge.end.x - pulseEdge.start.x,
            pulseEdge.end.y - pulseEdge.start.y,
          );

          return (
            <g key={pulse.id}>
              <circle
                cx={pulse.x}
                cy={pulse.y}
                r={10 + age * 28}
                className="benzene-click-core"
                style={{ opacity: opacity * 0.62 }}
              />
              <line
                x1={pulseEdge.start.x}
                y1={pulseEdge.start.y}
                x2={pulseEdge.end.x}
                y2={pulseEdge.end.y}
                className="benzene-ring-trace"
                style={{
                  opacity,
                  strokeDasharray: `${edgeLength}`,
                  strokeDashoffset: `${(1 - age) * edgeLength}`,
                }}
                filter="url(#modernSoftEdgeGlow)"
              />
            </g>
          );
        })}

        <g
          ref={cursorGroupRef}
          transform={`translate(${cursorRef.current.x} ${cursorRef.current.y})`}
          opacity={cursorVisible ? 0.68 : 0}
        >
          <circle r="28" className="benzene-cursor-ring" />
          <circle r="3" className="benzene-cursor-dot" />
        </g>
      </svg>
    </section>
  );
}
