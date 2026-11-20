"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import type { WorkItem } from "../_lib/projects";

const STIFFNESS = 210;
const DAMPING = 21;
const PREVIEW_WIDTH = 400;

export default function WorkList({ items }: { items: WorkItem[] }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0, placed: false });
  const frame = useRef(0);

  useEffect(() => {
    if (active === null) return;
    const preview = previewRef.current;
    if (!preview) return;

    let last = performance.now();

    // Semi-implicit Euler on a damped spring: the preview chases the cursor
    // with a little overshoot and tilts in the direction it is moving.
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const state = spring.current;
      const ax = STIFFNESS * (target.current.x - state.x) - DAMPING * state.vx;
      const ay = STIFFNESS * (target.current.y - state.y) - DAMPING * state.vy;
      state.vx += ax * dt;
      state.vy += ay * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      const tilt = Math.max(-9, Math.min(9, state.vx * 0.012));
      preview.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${tilt}deg)`;
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [active]);

  const onPointerMove = (event: React.PointerEvent) => {
    const x = Math.min(event.clientX, window.innerWidth - PREVIEW_WIDTH - 48);
    target.current = { x, y: event.clientY };
    if (!spring.current.placed) {
      spring.current = { x, y: event.clientY, vx: 0, vy: 0, placed: true };
    }
  };

  if (items.length === 0) {
    return (
      <p className="work-empty">
        The project archive is offline right now. In the meantime, most of my
        work lives on <a href="https://github.com/jobairalsarkar1">GitHub</a>.
      </p>
    );
  }

  return (
    <div
      className="work"
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        setActive(null);
        spring.current.placed = false;
      }}
    >
      <ol className="work-list" data-hovering={active !== null}>
        {items.map((item, index) => (
          <li key={item.id} data-reveal>
            <Link
              href={`/work/${item.slug}`}
              className="work-row"
              data-active={active === index}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(index);
              }}
              onFocus={() => setActive(null)}
            >
              <span className="work-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="work-thumb">
                <Image src={item.coverImage} alt="" fill sizes="(max-width: 720px) 92vw, 220px" />
              </span>
              <span className="work-main">
                <span className="work-name">{item.name}</span>
                <span className="work-excerpt">{item.excerpt}</span>
              </span>
              <span className="work-stack">
                {item.skills.slice(0, 3).join(" · ") || "Case study"}
              </span>
              <span className="work-arrow" aria-hidden>
                <FiArrowUpRight />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="work-preview-anchor" aria-hidden>
        <div ref={previewRef} className="work-preview">
          <div className="work-preview-card" data-visible={active !== null}>
            {items.map((item, index) => (
              <Image
                key={item.id}
                src={item.coverImage}
                alt=""
                fill
                sizes="420px"
                data-active={active === index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
