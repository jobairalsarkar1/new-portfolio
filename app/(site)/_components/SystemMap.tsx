"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Graph, GraphNode } from "../_lib/graph";
import MapInspector from "./MapInspector";

type SimNode = {
  data: GraphNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: { x: number; y: number } | null;
  radius: number;
  labelWidth: number;
  ring: number;
  anchor: number | null;
  charge: number;
  side: 1 | -1 | 0;
};

type Pulse = { link: number; t: number; speed: number; reverse: boolean };

const RINGS = { me: 0, role: 0.4, note: 0.5, project: 0.7, skill: 0.97 };
const CHARGE = { me: 600, role: 420, note: 300, project: 340, skill: 120 };
const VELOCITY_DECAY = 0.58;
const ALPHA_DECAY = 0.014;
const ALPHA_MIN = 0.003;
const PULSE_POOL = 48;

function radiusFor(node: GraphNode, degree: number) {
  if (node.type === "me") return 15;
  if (node.type === "role") return 9;
  if (node.type === "project") return 7;
  if (node.type === "note") return 7;
  return 2.8 + Math.sqrt(degree) * 1.4;
}

export default function SystemMap({ graph }: { graph: Graph }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const linkRefs = useRef<(SVGLineElement | null)[]>([]);
  const worldRef = useRef<SVGGElement>(null);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const simRef = useRef<{ nodes: SimNode[]; reheat: (alpha: number) => void } | null>(null);
  const hoverRef = useRef<string | null>(null);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("me");
  const [ready, setReady] = useState(false);

  const index = useMemo(() => {
    const byId = new Map(graph.nodes.map((node, i) => [node.id, i]));
    const neighbors = graph.nodes.map(() => new Set<number>());
    const links = graph.links
      .map((link) => [byId.get(link.source), byId.get(link.target)] as const)
      .filter((pair): pair is readonly [number, number] => pair[0] !== undefined && pair[1] !== undefined);

    links.forEach(([a, b]) => {
      neighbors[a].add(b);
      neighbors[b].add(a);
    });

    return { byId, neighbors, links };
  }, [graph]);

  const focus = hovered ?? (selected === "me" ? null : selected);
  const focusIndex = focus ? index.byId.get(focus) : undefined;
  const isActive = (i: number) =>
    focusIndex === undefined || i === focusIndex || index.neighbors[focusIndex].has(i);
  const linkActive = (a: number, b: number) =>
    focusIndex !== undefined && (a === focusIndex || b === focusIndex);

  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = stage.clientWidth;
    let height = stage.clientHeight;
    let rx = 1;
    let ry = 1;
    let scale = 1;

    const measure = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      const compact = width < 640;
      rx = width / 2 - (compact ? 36 : 70);
      ry = height / 2 - (compact ? 56 : 64);
      scale = Math.min(1.15, Math.max(0.45, Math.min(width, height * 1.4) / 900));
      worldRef.current?.setAttribute("transform", `translate(${width / 2} ${height / 2})`);
    };
    measure();

    // Seed every node on its ring. Skills start at the average angle of the
    // things they connect to, so related nodes begin near each other.
    const counts: Record<string, number> = {};
    const totals: Record<string, number> = {};
    graph.nodes.forEach((node) => (totals[node.type] = (totals[node.type] ?? 0) + 1));

    const nodes: SimNode[] = graph.nodes.map((node, i) => {
      const position = counts[node.type] ?? 0;
      counts[node.type] = position + 1;
      const offset = node.type === "project" ? Math.PI / Math.max(1, totals.project) : 0;
      const angle = (position / Math.max(1, totals[node.type])) * Math.PI * 2 + offset - Math.PI * 0.75;
      const ring = RINGS[node.type];
      return {
        data: node,
        x: Math.cos(angle) * rx * ring,
        y: Math.sin(angle) * ry * ring,
        vx: 0,
        vy: 0,
        pinned: node.type === "me" ? { x: 0, y: 0 } : null,
        radius: radiusFor(node, index.neighbors[i].size),
        labelWidth: node.label.length * 7,
        ring,
        anchor: node.type === "role" || node.type === "project" ? angle : null,
        charge: CHARGE[node.type],
        side: 0,
      };
    });

    nodes.forEach((node, i) => {
      if (node.data.type !== "note") return;
      const role = [...index.neighbors[i]].find((n) => nodes[n].data.type === "role");
      node.anchor = (role !== undefined ? nodes[role].anchor ?? 0 : 0) + 0.45;
      node.x = Math.cos(node.anchor) * rx * node.ring;
      node.y = Math.sin(node.anchor) * ry * node.ring;
    });

    nodes.forEach((node, i) => {
      if (node.data.type !== "skill") return;
      let sx = 0;
      let sy = 0;
      index.neighbors[i].forEach((n) => {
        const angle = Math.atan2(nodes[n].y / ry, nodes[n].x / rx);
        sx += Math.cos(angle);
        sy += Math.sin(angle);
      });
      const angle = Math.atan2(sy, sx) + ((i % 7) - 3) * 0.06;
      node.x = Math.cos(angle) * rx * node.ring;
      node.y = Math.sin(angle) * ry * node.ring;
    });

    const bounds = (node: SimNode) => {
      const half = Math.max(node.radius, 9) + 2;
      if (node.data.type === "me") {
        return { left: node.x - 62, right: node.x + 62, top: node.y - node.radius - 4, bottom: node.y + node.radius + 30 };
      }
      const side = node.side === -1 ? -1 : node.x >= 0 ? 1 : -1;
      const reach = node.radius + 8 + node.labelWidth;
      return {
        left: side === 1 ? node.x - node.radius - 3 : node.x - reach,
        right: side === 1 ? node.x + reach : node.x + node.radius + 3,
        top: node.y - half,
        bottom: node.y + half,
      };
    };

    let alpha = 1;
    let alphaTarget = 0;

    const tick = () => {
      alpha += (alphaTarget - alpha) * ALPHA_DECAY * 2;
      const count = nodes.length;

      for (let i = 0; i < count; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < count; j++) {
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance2 = dx * dx + dy * dy;
          if (distance2 < 1) {
            dx = (i - j) * 0.5;
            dy = 0.5;
            distance2 = dx * dx + dy * dy;
          }
          const push = (alpha * scale * scale) / distance2;
          a.vx -= dx * b.charge * push * 0.5;
          a.vy -= dy * b.charge * push * 0.5;
          b.vx += dx * a.charge * push * 0.5;
          b.vy += dy * a.charge * push * 0.5;

          // Treat each dot and its label as one box, and slide overlapping
          // boxes apart along whichever axis overlaps least.
          const boxA = bounds(a);
          const boxB = bounds(b);
          const overlapX = Math.min(boxA.right, boxB.right) - Math.max(boxA.left, boxB.left);
          const overlapY = Math.min(boxA.bottom, boxB.bottom) - Math.max(boxA.top, boxB.top);
          if (overlapX > 0 && overlapY > 0) {
            if (overlapY < overlapX) {
              const direction = Math.sign(dy) || 1;
              a.vy -= direction * overlapY * 0.22;
              b.vy += direction * overlapY * 0.22;
            } else {
              const direction = Math.sign(dx) || 1;
              a.vx -= direction * overlapX * 0.22;
              b.vx += direction * overlapX * 0.22;
            }
          }
        }
      }

      index.links.forEach(([s, t]) => {
        const a = nodes[s];
        const b = nodes[t];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const strength = a.data.type === "me" ? 0.004 : 0.04;
        const rest = 70 * scale;
        const pull = ((distance - rest) / distance) * strength * alpha;
        // Anchored nodes barely move. The skill on the other end does the
        // travelling, so skills drift toward the work that used them.
        const shareA = a.anchor === null ? 0.5 : 0.08;
        const shareB = b.anchor === null ? 0.5 : 0.08;
        a.vx += dx * pull * shareA * 2;
        a.vy += dy * pull * shareA * 2;
        b.vx -= dx * pull * shareB * 2;
        b.vy -= dy * pull * shareB * 2;
      });

      for (const node of nodes) {
        // Roles, projects and notes spring toward their own slot on the ring.
        // Skills only keep their distance and are free to orbit toward the
        // places that use them.
        if (node.ring > 0) {
          const angle = node.anchor ?? Math.atan2(node.y / ry, node.x / rx);
          const tx = Math.cos(angle) * rx * node.ring;
          const ty = Math.sin(angle) * ry * node.ring;
          const strength = node.anchor === null ? 0.1 : 0.22;
          node.vx += (tx - node.x) * strength * alpha;
          node.vy += (ty - node.y) * strength * alpha;
        }

        if (node.pinned) {
          node.x = node.pinned.x;
          node.y = node.pinned.y;
          node.vx = 0;
          node.vy = 0;
          continue;
        }

        node.vx *= VELOCITY_DECAY;
        node.vy *= VELOCITY_DECAY;
        node.x += node.vx;
        node.y += node.vy;
        // Keep the dot and its label inside the stage.
        const reach = node.radius + 10 + node.labelWidth;
        node.x = node.x >= 0
          ? Math.min(width / 2 - reach, node.x)
          : Math.max(-width / 2 + reach, node.x);
        node.y = Math.max(-height / 2 + 44, Math.min(height / 2 - 44, node.y));
      }
    };

    const pulses: Pulse[] = [];
    let nextPulse = 0;

    const render = (time: number) => {
      const wobble = reduceMotion ? 0 : 1;
      const positions = nodes.map((node, i) => ({
        x: node.x + Math.sin(time / 1700 + i * 1.3) * 1.6 * wobble * (node.pinned ? 0 : 1),
        y: node.y + Math.cos(time / 1900 + i * 0.7) * 1.6 * wobble * (node.pinned ? 0 : 1),
      }));

      positions.forEach((point, i) => {
        nodeRefs.current[i]?.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);

        const node = nodes[i];
        const side: 1 | -1 = point.x >= 0 ? 1 : -1;
        if (node.data.type !== "me" && side !== node.side) {
          node.side = side;
          const label = labelRefs.current[i];
          if (label) {
            label.setAttribute("text-anchor", side === 1 ? "start" : "end");
            label.setAttribute("x", String((node.radius + 6) * side));
          }
        }
      });

      index.links.forEach(([s, t], i) => {
        const line = linkRefs.current[i];
        if (!line) return;
        line.setAttribute("x1", positions[s].x.toFixed(1));
        line.setAttribute("y1", positions[s].y.toFixed(1));
        line.setAttribute("x2", positions[t].x.toFixed(1));
        line.setAttribute("y2", positions[t].y.toFixed(1));
      });

      pulseRefs.current.forEach((circle, i) => {
        const pulse = pulses[i];
        if (!circle) return;
        if (!pulse) {
          circle.style.display = "none";
          return;
        }
        const [s, t] = index.links[pulse.link];
        const from = positions[pulse.reverse ? t : s];
        const to = positions[pulse.reverse ? s : t];
        const ease = pulse.t * pulse.t * (3 - 2 * pulse.t);
        circle.style.display = "";
        circle.setAttribute("cx", (from.x + (to.x - from.x) * ease).toFixed(1));
        circle.setAttribute("cy", (from.y + (to.y - from.y) * ease).toFixed(1));
      });
    };

    // Small packets travel along the edges. Hovering a node sends them along
    // that node's connections, outward from it.
    const updatePulses = (dt: number, time: number) => {
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].t += dt * pulses[i].speed;
        if (pulses[i].t >= 1) pulses.splice(i, 1);
      }

      if (time < nextPulse || pulses.length >= PULSE_POOL || index.links.length === 0) return;

      const hover = hoverRef.current;
      const hoverIndex = hover ? index.byId.get(hover) : undefined;
      if (hoverIndex !== undefined) {
        const own = index.links
          .map((pair, i) => ({ pair, i }))
          .filter(({ pair }) => pair[0] === hoverIndex || pair[1] === hoverIndex);
        if (own.length) {
          const pick = own[Math.floor(Math.random() * own.length)];
          pulses.push({ link: pick.i, t: 0, speed: 1.4, reverse: pick.pair[1] === hoverIndex });
        }
        nextPulse = time + 70;
        return;
      }

      const candidates = index.links
        .map((pair, i) => ({ pair, i }))
        .filter(({ pair }) => nodes[pair[0]].data.type !== "me");
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (pick) pulses.push({ link: pick.i, t: 0, speed: 0.55 + Math.random() * 0.3, reverse: Math.random() < 0.5 });
      nextPulse = time + 260;
    };

    const measureLabels = () => {
      nodes.forEach((node, i) => {
        const label = labelRefs.current[i];
        if (!label || node.data.type === "me") {
          node.labelWidth = 0;
          return;
        }
        const hidden = getComputedStyle(label).opacity === "0";
        node.labelWidth = hidden ? 0 : label.getComputedTextLength();
      });
    };
    measureLabels();

    simRef.current = {
      nodes,
      reheat: (value) => {
        alpha = Math.max(alpha, value);
      },
    };

    if (reduceMotion) {
      for (let i = 0; i < 400; i++) tick();
      render(0);
    }
    setReady(true);

    let frame = 0;
    let last = performance.now();
    let running = false;

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      if (alpha > ALPHA_MIN || alphaTarget > 0) tick();
      updatePulses(dt, time);
      render(time);
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
    visibility.observe(stage);

    const resize = new ResizeObserver(() => {
      const previousRx = rx;
      const previousRy = ry;
      measure();
      measureLabels();
      nodes.forEach((node) => {
        node.x *= rx / previousRx;
        node.y *= ry / previousRy;
      });
      alpha = Math.max(alpha, 0.3);
      if (reduceMotion) {
        for (let i = 0; i < 200; i++) tick();
        render(0);
      }
    });
    resize.observe(stage);

    // Dragging pins a node to the pointer and keeps the simulation warm.
    let drag: { index: number; startX: number; startY: number; moved: boolean } | null = null;

    const toLocal = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      return { x: event.clientX - bounds.left - width / 2, y: event.clientY - bounds.top - height / 2 };
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as Element).closest<SVGGElement>("[data-node]");
      if (!target) return;
      const i = Number(target.dataset.node);
      if (nodes[i].data.type === "me") return;
      drag = { index: i, startX: event.clientX, startY: event.clientY, moved: false };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag) return;
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
        drag.moved = true;
        stage.setPointerCapture(event.pointerId);
      }
      nodes[drag.index].pinned = toLocal(event);
      alphaTarget = 0.25;
    };

    const onPointerUp = () => {
      if (!drag) return;
      if (drag.moved) {
        nodes[drag.index].pinned = null;
        alpha = Math.max(alpha, 0.45);
      }
      alphaTarget = 0;
      drag = null;
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    return () => {
      stop();
      visibility.disconnect();
      resize.disconnect();
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
    };
  }, [graph, index]);

  const select = (id: string) => {
    setSelected(id);
    simRef.current?.reheat(0.08);
  };

  const counts = useMemo(() => {
    const total = (type: GraphNode["type"]) => graph.nodes.filter((node) => node.type === type).length;
    return { roles: total("role"), projects: total("project"), skills: total("skill"), notes: total("note") };
  }, [graph]);

  return (
    <div className="map">
      <div className="map-stage" ref={stageRef} data-ready={ready} data-focus={focus !== null}>
        <svg role="group" aria-label="Map of my roles, projects, skills and writing">
          <g className="map-world" ref={worldRef}>
            <g className="map-links">
              {index.links.map(([s, t], i) => (
                <line
                  key={`${s}-${t}`}
                  ref={(element) => {
                    linkRefs.current[i] = element;
                  }}
                  data-kind={graph.nodes[s].type === "me" ? "spoke" : "edge"}
                  data-active={linkActive(s, t)}
                />
              ))}
            </g>

            <g className="map-pulses" aria-hidden>
              {Array.from({ length: PULSE_POOL }, (_, i) => (
                <circle
                  key={i}
                  r={2.4}
                  ref={(element) => {
                    pulseRefs.current[i] = element;
                  }}
                  style={{ display: "none" }}
                />
              ))}
            </g>

            <g className="map-nodes">
              {graph.nodes.map((node, i) => {
                const radius = radiusFor(node, index.neighbors[i].size);
                const primary = node.type === "skill" && node.primary;
                return (
                  <g
                    key={node.id}
                    ref={(element) => {
                      nodeRefs.current[i] = element;
                    }}
                    data-node={i}
                    data-type={node.type}
                    data-primary={primary || undefined}
                    data-active={isActive(i)}
                    data-selected={selected === node.id}
                    className="map-node"
                    role="button"
                    tabIndex={node.type === "skill" ? -1 : 0}
                    aria-label={`${node.label}, ${node.type === "role" ? "role" : node.type}`}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") setHovered(node.id);
                    }}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(node.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => select(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        select(node.id);
                      }
                    }}
                  >
                    <circle className="map-hit" r={Math.max(radius + 10, 16)} />
                    {node.type === "note" ? (
                      <rect
                        className="map-dot"
                        x={-radius}
                        y={-radius}
                        width={radius * 2}
                        height={radius * 2}
                        rx={2}
                        transform="rotate(45)"
                      />
                    ) : (
                      <circle className="map-dot" r={radius} />
                    )}
                    {node.type === "me" ? (
                      <text className="map-label" y={radius + 20} textAnchor="middle">
                        {node.label}
                      </text>
                    ) : (
                      <text
                        className="map-label"
                        ref={(element) => {
                          labelRefs.current[i] = element;
                        }}
                        x={radius + 6}
                        dy="0.34em"
                      >
                        {node.type === "note" ? node.short : node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        <div className="map-legend" aria-hidden>
          <span>
            <i data-type="role" /> Roles · {counts.roles}
          </span>
          <span>
            <i data-type="project" /> Projects · {counts.projects}
          </span>
          <span>
            <i data-type="skill" /> Skills · {counts.skills}
          </span>
          {counts.notes > 0 && (
            <span>
              <i data-type="note" /> Writing · {counts.notes}
            </span>
          )}
        </div>
        <p className="map-hint" aria-hidden>
          <span className="hint-fine">Drag anything. Hover a skill. Click to read.</span>
          <span className="hint-touch">Drag anything. Tap to read.</span>
        </p>
      </div>

      <MapInspector
        graph={graph}
        neighbors={index.neighbors}
        byId={index.byId}
        selected={selected}
        onSelect={select}
      />
    </div>
  );
}
