"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HEX_RADIUS = 58;
const HEX_HEIGHT = HEX_RADIUS * 2;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HORIZONTAL_STEP = HEX_WIDTH;
const VERTICAL_STEP = HEX_RADIUS * 1.5;
const ECHO_LIFETIME = 680;
const PULSE_LIFETIME = 980;
const MAX_EFFECT_NODES = 36;
const MAX_AMBIENT_CHARGE = 6.4;

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

type EffectNode = {
  node: SVGElement;
  createdAt: number;
  lifetime: number;
  kind: "echo" | "pulse" | "charge";
  strength?: number;
};

function createSvgElement<ElementName extends keyof SVGElementTagNameMap>(
  name: ElementName,
) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function setSvgAttributes(
  element: SVGElement,
  attributes: Record<string, string | number>,
) {
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });
}

export default function BenzeneField() {
  const initialViewport = getViewport();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const echoLayerRef = useRef<SVGGElement | null>(null);
  const chargeLayerRef = useRef<SVGGElement | null>(null);
  const pulseLayerRef = useRef<SVGGElement | null>(null);
  const revealMaskRef = useRef<SVGCircleElement | null>(null);
  const ambientBloomRef = useRef<SVGRectElement | null>(null);
  const cursorWashRef = useRef<SVGCircleElement | null>(null);
  const cursorGroupRef = useRef<SVGGElement | null>(null);
  const hoverSpawnRef = useRef(0);
  const clickSpawnRef = useRef(0);
  const effectNodesRef = useRef<EffectNode[]>([]);
  const ambientChargeRef = useRef(0);
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

  const architecture = useMemo(
    () => createArchitecture(viewport.width, viewport.height),
    [viewport.height, viewport.width],
  );

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const bounds = svgRef.current?.getBoundingClientRect();

    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      return { x: clientX, y: clientY };
    }

    return {
      x: ((clientX - bounds.left) / bounds.width) * viewport.width,
      y: ((clientY - bounds.top) / bounds.height) * viewport.height,
    };
  }, [viewport.height, viewport.width]);

  const trimEffectNodes = useCallback(() => {
    while (effectNodesRef.current.length > MAX_EFFECT_NODES) {
      const oldest = effectNodesRef.current.shift();
      oldest?.node.remove();
    }
  }, []);

  const appendEffectNode = useCallback((effectNode: EffectNode) => {
    effectNodesRef.current.push(effectNode);
    trimEffectNodes();
  }, [trimEffectNodes]);

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
      const group = createSvgElement("g");
      const ring = createSvgElement("circle");
      const shape = createSvgElement("path");
      const radius = 20 + Math.random() * 28;
      const path = buildHexPoints(x, y)
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ")
        .concat(" Z");

      setSvgAttributes(ring, {
        cx: x,
        cy: y,
        r: radius,
        class: "benzene-echo-ring",
      });
      setSvgAttributes(shape, {
        d: path,
        class: "benzene-echo-shape",
      });

      group.append(ring, shape);
      echoLayerRef.current?.append(group);
      appendEffectNode({
        node: group,
        createdAt: now,
        lifetime: ECHO_LIFETIME,
        kind: "echo",
        strength: radius,
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { x, y } = toSvgPoint(event.clientX, event.clientY);
      const wasOutside = !pointerTargetRef.current.inside;

      pointerTargetRef.current = { x, y, inside: true };
      cursorRef.current = { x, y, inside: true };
      cursorWashRef.current?.setAttribute("cx", `${x}`);
      cursorWashRef.current?.setAttribute("cy", `${y}`);
      cursorWashRef.current?.setAttribute("opacity", "0.28");
      revealMaskRef.current?.setAttribute("cx", `${x}`);
      revealMaskRef.current?.setAttribute("cy", `${y}`);
      revealMaskRef.current?.setAttribute("opacity", "1");
      cursorGroupRef.current?.setAttribute("transform", `translate(${x} ${y})`);
      cursorGroupRef.current?.setAttribute("opacity", "0.68");

      if (wasOutside) {
        setCursorVisible(true);
      }

      const now = getNow();
      if (now - hoverSpawnRef.current > 180) {
        hoverSpawnRef.current = now;
        createEcho(x, y);
      }
    };

    const handlePointerLeave = () => {
      pointerTargetRef.current = {
        ...pointerTargetRef.current,
        inside: false,
      };
      revealMaskRef.current?.setAttribute("opacity", "0");
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
  }, [appendEffectNode, toSvgPoint]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const point = toSvgPoint(event.clientX, event.clientY);

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

      if (now - clickSpawnRef.current < 70) {
        ambientChargeRef.current = Math.min(
          MAX_AMBIENT_CHARGE,
          ambientChargeRef.current + 0.18,
        );
        return;
      }

      clickSpawnRef.current = now;

      const ringEdges = architecture.edges
        .filter((edge) => edge.ringId === selectedMatch.edge.ringId)
        .sort((a, b) => a.id - b.id);
      const selectedRingIndex = ringEdges.findIndex(
        (edge) => edge.id === selectedMatch.edge.id,
      );
      const pulse = createSvgElement("circle");

      setSvgAttributes(pulse, {
        cx: selectedMatch.projection.x,
        cy: selectedMatch.projection.y,
        r: 10,
        class: "benzene-click-core",
      });
      pulseLayerRef.current?.append(pulse);
      appendEffectNode({
        node: pulse,
        createdAt: now,
        lifetime: PULSE_LIFETIME,
        kind: "pulse",
      });

      if (selectedRingIndex >= 0) {
        ringEdges.forEach((edge, index) => {
          const clockwiseDistance = Math.abs(index - selectedRingIndex);
          const ringDistance = Math.min(
            clockwiseDistance,
            ringEdges.length - clockwiseDistance,
          );
          const opacityByDistance = [0.98, 0.5, 0.25, 0.12];
          const widthByDistance = [5.2, 3.4, 2.3, 1.5];
          const line = createSvgElement("line");

          setSvgAttributes(line, {
            x1: edge.start.x,
            y1: edge.start.y,
            x2: edge.end.x,
            y2: edge.end.y,
            class: "benzene-live-charge",
          });
          line.style.opacity = String(opacityByDistance[ringDistance] ?? 0.1);
          line.style.strokeWidth = `${widthByDistance[ringDistance] ?? 1.2}px`;
          line.style.transitionDelay = `${ringDistance * 35}ms`;
          chargeLayerRef.current?.append(line);
          appendEffectNode({
            node: line,
            createdAt: now + ringDistance * 35,
            lifetime: PULSE_LIFETIME,
            kind: "charge",
            strength: opacityByDistance[ringDistance] ?? 0.1,
          });
        });
      }

      ambientChargeRef.current = Math.min(
        MAX_AMBIENT_CHARGE,
        ambientChargeRef.current + 0.46,
      );
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [appendEffectNode, architecture.edges, toSvgPoint]);

  useEffect(() => {
    let frameId = 0;
    let animationAccumulator = 0;
    let lastTime = getNow();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
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

      if (revealMaskRef.current) {
        revealMaskRef.current.setAttribute("cx", `${nextCursor.x}`);
        revealMaskRef.current.setAttribute("cy", `${nextCursor.y}`);
        revealMaskRef.current.setAttribute(
          "opacity",
          nextCursor.inside ? "1" : "0",
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

      if (animationAccumulator >= 1 / 30) {
        const animationDelta = animationAccumulator;
        animationAccumulator = 0;
        ambientChargeRef.current = Math.max(
          0,
          ambientChargeRef.current - animationDelta * 0.14,
        );

        cursorWashRef.current?.setAttribute(
          "r",
          `${174 + ambientChargeRef.current * 62}`,
        );
        revealMaskRef.current?.setAttribute(
          "r",
          `${210 + ambientChargeRef.current * 190}`,
        );
        if (ambientBloomRef.current) {
          ambientBloomRef.current.style.opacity = `${Math.min(0.92, ambientChargeRef.current * 0.16)}`;
        }

        effectNodesRef.current = effectNodesRef.current.filter((effectNode) => {
          const age = clamp(
            (now - effectNode.createdAt) / effectNode.lifetime,
            0,
            1,
          );

          if (age >= 1) {
            effectNode.node.remove();
            return false;
          }

          if (effectNode.kind === "echo") {
            effectNode.node.setAttribute("opacity", `${(1 - age) * 0.32}`);
            const circle = effectNode.node.firstElementChild;
            circle?.setAttribute(
              "r",
              `${(effectNode.strength ?? 22) + age * 30}`,
            );
          }

          if (effectNode.kind === "pulse") {
            effectNode.node.setAttribute("r", `${10 + age * 26}`);
            effectNode.node.style.opacity = `${(1 - age) * 0.56}`;
          }

          if (effectNode.kind === "charge") {
            const strength = effectNode.strength ?? 0.6;
            effectNode.node.style.opacity = `${(1 - age) * strength}`;
          }

          return true;
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
        ref={svgRef}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        className="benzene-canvas"
        preserveAspectRatio="none"
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
          <radialGradient id="modernAmbientBloom" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255, 229, 180, 0.24)" />
            <stop offset="42%" stopColor="rgba(255, 191, 107, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 191, 107, 0.025)" />
          </radialGradient>
          <mask id="modernCursorReveal">
            <rect width="100%" height="100%" fill="black" />
            <circle
              ref={revealMaskRef}
              cx={cursorRef.current.x}
              cy={cursorRef.current.y}
              r={210}
              fill="url(#modernRevealGlow)"
              opacity="0"
            />
          </mask>
          <radialGradient id="modernRevealGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="42%" stopColor="rgba(255, 255, 255, 0.68)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
        </defs>

        <rect
          ref={ambientBloomRef}
          width="100%"
          height="100%"
          fill="url(#modernAmbientBloom)"
          className="benzene-ambient-bloom"
        />

        <circle
          ref={cursorWashRef}
          cx={cursorRef.current.x}
          cy={cursorRef.current.y}
          r={176}
          className="field-cursor-wash"
          opacity={cursorVisible ? 0.28 : 0}
        />

        <g mask="url(#modernCursorReveal)">
          {architecture.rings.map((ring) => (
            <path
              key={ring.id}
              d={ring.path}
              className="benzene-ring-shadow"
            />
          ))}

          {architecture.edges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.start.x}
              y1={edge.start.y}
              x2={edge.end.x}
              y2={edge.end.y}
              className="benzene-edge"
            />
          ))}
        </g>

        <g ref={echoLayerRef} />
        <g ref={chargeLayerRef} filter="url(#modernSoftEdgeGlow)" />
        <g ref={pulseLayerRef} />

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
