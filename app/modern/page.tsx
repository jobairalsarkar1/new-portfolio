"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

const HEX_RADIUS = 58;
const HEX_HEIGHT = HEX_RADIUS * 2;
const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
const HORIZONTAL_STEP = HEX_WIDTH;
const VERTICAL_STEP = HEX_RADIUS * 1.5;
const ECHO_LIFETIME = 720;
const PULSE_LIFETIME = 1500;
const MAX_ECHOES = 14;
const MAX_PULSES = 10;

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
  length: number;
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

type SegmentMatch = ReturnType<typeof distanceToSegment> & {
  edge: Edge;
};

const projects = [
  {
    name: "Redaxify",
    image: "/assets/projects/redaxify.png",
    kind: "AI video indexing",
    stack: "Next.js, Prisma, PostgreSQL, Azure AI",
    href: "/projects/redaxify",
  },
  {
    name: "UniHelper",
    image: "/assets/projects/unihelper.png",
    kind: "University workflow system",
    stack: "React, Node.js, MongoDB, Tailwind",
    href: "/projects/unihelper",
  },
  {
    name: "PromptArt",
    image: "/assets/projects/promptart.png",
    kind: "Prompt to image platform",
    stack: "React, Node.js, Stability AI",
    href: "/projects/promptart",
  },
];

const experienceNotes = [
  {
    company: "FringeCore_",
    role: "Software Engineer",
    note: "Hospital ERP work, CDC pipeline, Oracle to PostgreSQL migration support, and workflow redesign for Asgar Ali Hospital.",
  },
  {
    company: "Picture TV",
    role: "Full Stack Developer",
    note: "Built a media marketplace with payments, media uploads, magic link auth, role access, and an admin dashboard.",
  },
  {
    company: "Logic Matrix",
    role: "Software Engineer Intern",
    note: "Worked on product features, Azure AI Video Indexer, Stripe subscriptions, Cloudflare, Prisma, and PostgreSQL.",
  },
];

const skillGroups = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "Laravel",
  "MongoDB",
  "Three.js",
  "Cloudinary",
  "Stripe",
  "Azure AI",
];

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
          length: Math.hypot(next.x - point.x, next.y - point.y),
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
    t,
    projection,
    distance: Math.hypot(point.x - projection.x, point.y - projection.y),
  };
}

function BenzeneField() {
  const initialViewport = getViewport();
  const stageRef = useRef<HTMLElement | null>(null);
  const cursorWashRef = useRef<SVGCircleElement | null>(null);
  const cursorGroupRef = useRef<SVGGElement | null>(null);
  const hoverSpawnRef = useRef(0);
  const pulseIdRef = useRef(0);
  const echoIdRef = useRef(0);
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
    let frameId = 0;
    let animationAccumulator = 0;
    let lastTime = getNow();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      frameNowRef.current = now;

      const target = pointerTargetRef.current;
      const current = cursorRef.current;
      const easing = target.inside ? 0.2 : 0.12;
      const nextCursor = {
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
          nextCursor.inside ? "0.18" : "0",
        );
      }

      if (cursorGroupRef.current) {
        cursorGroupRef.current.setAttribute(
          "transform",
          `translate(${nextCursor.x} ${nextCursor.y})`,
        );
        cursorGroupRef.current.setAttribute(
          "opacity",
          nextCursor.inside ? "0.55" : "0",
        );
      }

      animationAccumulator += delta;

      if (animationAccumulator >= 1 / 30) {
        const animationDelta = animationAccumulator;
        animationAccumulator = 0;

        setAmbientCharge((currentCharge) =>
          Math.max(0, currentCharge - animationDelta * 0.09),
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
            const faded = Math.max(0, value - animationDelta * 0.2);

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

  const createEcho = (x: number, y: number) => {
    const now = getNow();
    setEchoes((current) => [
      ...current.slice(-(MAX_ECHOES - 1)),
      {
        id: (echoIdRef.current += 1),
        x,
        y,
        createdAt: now,
        radius: 18 + Math.random() * 28,
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

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = stageRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    pointerTargetRef.current = { x, y, inside: true };
    if (!cursorVisible) {
      setCursorVisible(true);
    }

    const now = getNow();
    if (now - hoverSpawnRef.current > 100) {
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const bounds = stageRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const point = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
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

    if (!bestMatch || bestMatch.distance > 16) {
      return;
    }

    const selectedMatch = bestMatch;
    const now = getNow();

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

    setEdgeCharge((current) => {
      const next = { ...current };
      const targetRingId = selectedMatch.edge.ringId;

      architecture.edges.forEach((edge) => {
        if (edge.ringId !== targetRingId) {
          return;
        }

        const boost = edge.id === selectedMatch.edge.id ? 1.8 : 1.05;
        next[edge.id] = Math.min(3.2, (next[edge.id] ?? 0) + boost);
      });

      return next;
    });

    setAmbientCharge((current) => Math.min(2.4, current + 0.18));
  };

  return (
    <section
      ref={stageRef}
      className="benzene-fullscreen"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        className="benzene-canvas"
      >
        <defs>
          <radialGradient id="modernFieldGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255, 245, 220, 0.92)" />
            <stop offset="55%" stopColor="rgba(255, 191, 107, 0.22)" />
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
          r={152}
          className="field-cursor-wash"
          opacity={cursorVisible ? 0.18 : 0}
        />

        {architecture.rings.map((ring) => {
          const distance = cursorVisible
            ? Math.hypot(
                cursorRef.current.x - ring.centerX,
                cursorRef.current.y - ring.centerY,
              )
            : 9999;
          const proximity = clamp(1 - distance / 180, 0, 1);
          const opacity = proximity * 0.08 + ambientCharge * 0.02;

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
          const proximity = clamp(1 - distance / 165, 0, 1);
          const charged = edgeCharge[edge.id] ?? 0;
          const opacity =
            proximity * 0.12 + charged * 0.26 + ambientCharge * 0.03;

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
                  strokeWidth: 1.2 + charged * 1.4,
                }}
              />
              <line
                x1={edge.start.x}
                y1={edge.start.y}
                x2={edge.end.x}
                y2={edge.end.y}
                className="benzene-edge-glow"
                style={{
                  opacity: clamp(opacity * 0.7, 0, 1),
                  strokeWidth: 2.8 + charged * 2.2,
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
          const opacity = (1 - age) * 0.3;
          const radius = echo.radius + age * 26;

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
          const ring = architecture.rings[pulse.ringId];
          const opacity = 1 - age * 0.82;

          if (!ring) {
            return null;
          }

          return (
            <g key={pulse.id}>
              <circle
                cx={pulse.x}
                cy={pulse.y}
                r={9 + age * 24}
                className="benzene-click-core"
                style={{ opacity: opacity * 0.55 }}
              />
              <path
                d={ring.path}
                className="benzene-ring-trace"
                style={{
                  opacity,
                  strokeDasharray: `${ring.traceLength}`,
                  strokeDashoffset: `${
                    (1 - age) * (edgeCharge[pulse.edgeId] ?? 0) * 40
                  }`,
                }}
                filter="url(#modernSoftEdgeGlow)"
              />
            </g>
          );
        })}

        <g
          ref={cursorGroupRef}
          transform={`translate(${cursorRef.current.x} ${cursorRef.current.y})`}
          opacity={cursorVisible ? 0.55 : 0}
        >
          <circle r="28" className="benzene-cursor-ring" />
          <circle r="3" className="benzene-cursor-dot" />
        </g>
      </svg>
    </section>
  );
}

export default function ModernPortfolio() {
  return (
    <main className="modern-shell">
      <BenzeneField />

      <div className="modern-noise" />
      <nav className="modern-nav" aria-label="Modern portfolio navigation">
        <Link href="/" className="modern-mark">
          JAS
        </Link>
        <div className="modern-nav-links">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="modern-hero">
        <div className="modern-hero-copy">
          <p className="modern-kicker">Full Stack Software Engineer</p>
          <h1>
            I build systems that feel alive, useful, and quietly sharp.
          </h1>
          <p>
            A more experimental version of my portfolio, shaped around motion,
            product thinking, and the kind of engineering work that has to serve
            real people.
          </p>
          <div className="modern-actions">
            <a href="#work" className="modern-primary">
              Explore work <FaArrowRight />
            </a>
            <Link href="/contact" className="modern-secondary">
              Start a project
            </Link>
          </div>
        </div>

        <div className="modern-orbit-panel" aria-label="Portfolio summary">
          <span className="modern-panel-index">01</span>
          <h2>Jobair Al Sarkar</h2>
          <p>
            Next.js, React, TypeScript, backend systems, database work, payment
            flows, AI integrations, and interactive visual interfaces.
          </p>
          <div className="modern-stat-grid">
            <div>
              <strong>3+</strong>
              <span>Years building</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Work chapters</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Core tools</span>
            </div>
          </div>
        </div>
      </section>

      <section className="modern-section modern-skills" aria-label="Skills">
        {skillGroups.map((skill, index) => (
          <span key={skill} style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}>
            {skill}
          </span>
        ))}
      </section>

      <section id="work" className="modern-section">
        <div className="modern-section-head">
          <p>Selected builds</p>
          <h2>Product work with texture.</h2>
        </div>

        <div className="modern-work-grid">
          {projects.map((project, index) => (
            <Link
              href={project.href}
              key={project.name}
              className="modern-project-card"
              style={{ "--lift": `${index * 24}px` } as React.CSSProperties}
            >
              <div className="modern-project-media">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={560}
                  height={340}
                  className="modern-project-image"
                />
              </div>
              <div className="modern-project-copy">
                <span>{project.kind}</span>
                <h3>{project.name}</h3>
                <p>{project.stack}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="experience" className="modern-section modern-experience">
        <div className="modern-section-head">
          <p>Experience</p>
          <h2>Where the ideas became real systems.</h2>
        </div>

        <div className="modern-experience-list">
          {experienceNotes.map((item) => (
            <article key={item.company}>
              <div>
                <span>{item.role}</span>
                <h3>{item.company}</h3>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="modern-contact">
        <div>
          <p className="modern-kicker">Available for serious builds</p>
          <h2>Have an idea that needs more than a template?</h2>
        </div>
        <div className="modern-contact-actions">
          <Link href="/contact" className="modern-primary">
            Contact me <FaExternalLinkAlt />
          </Link>
          <a
            href="https://github.com/jobairalsarkar1"
            target="_blank"
            rel="noreferrer"
            className="modern-icon-link"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/jobair-al-sarkar/"
            target="_blank"
            rel="noreferrer"
            className="modern-icon-link"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </section>
    </main>
  );
}
