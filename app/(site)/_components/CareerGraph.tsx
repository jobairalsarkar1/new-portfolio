"use client";

import { useEffect, useId, useState } from "react";
import type { Experience } from "../_lib/experience";

const RIGHT = 16;
const TOP = 66;

function monthIndex(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
}

function formatSpan(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr`);
  if (rest || !years) parts.push(`${rest} mo`);
  return parts.join(" ");
}

const smoothStep = (value: number) => 1 / (1 + Math.exp(-value * 2.2));

function RidgeIcon() {
  return (
    <svg className="ridge-icon" viewBox="0 0 24 24" aria-hidden>
      <path d="M2 9c3 0 4-4 6-4s3 4 6 4 4-2 8-2" />
      <path d="M2 14c3 0 4-3 6-3s3 3 6 3 4-3 8-3" />
      <path d="M2 19c3 0 4-4 6-4s3 4 6 4 4-1 8-1" />
    </svg>
  );
}

// Each role is a ridge that rises when it started and falls when it ended,
// stacked like a ridgeline plot. Width is time, and a little texture on top
// keeps the ridges from looking like plain bars.
export default function CareerGraph({ items, now }: { items: Experience[]; now: number }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const id = useId();

  useEffect(() => {
    const query = window.matchMedia("(max-width: 560px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const WIDTH = compact ? 340 : 640;
  const LABELS = compact ? 0 : 150;
  const ROW = compact ? 66 : 44;
  const RIDGE = compact ? 38 : 46;

  const today = new Date(now);
  const nowIndex = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const roles = [...items]
    .map((item) => {
      const start = monthIndex(item.start);
      const end = item.end ? monthIndex(item.end) : nowIndex;
      const months = item.end ? end - start + 1 : nowIndex - start;
      return {
        ...item,
        startMonth: start,
        endMonth: item.end ? end + 1 : end + 6,
        months: Math.max(1, months),
        current: !item.end,
      };
    })
    .sort((a, b) => a.startMonth - b.startMonth);

  const first = roles[0].startMonth - 3;
  const last = nowIndex + 1;
  const x = (month: number) => LABELS + ((month - first) / (last - first)) * (WIDTH - LABELS - RIGHT);
  const height = TOP + (roles.length - 1) * ROW + (compact ? 54 : 40);
  const years: number[] = [];
  for (let year = Math.ceil(first / 12); year * 12 <= last; year++) years.push(year);

  const ridge = (role: (typeof roles)[number], index: number, base: number) => {
    const points: string[] = [];
    for (let month = first; month <= last; month += 0.25) {
      const rise = smoothStep(month - role.startMonth) * smoothStep(role.endMonth - month);
      const texture = 0.84 + 0.16 * Math.sin(month * 1.3 + index * 2.1) * Math.sin(month * 0.47 + index);
      const y = base - RIDGE * rise * texture;
      points.push(`${x(month).toFixed(1)},${y.toFixed(1)}`);
    }
    return points;
  };

  return (
    <div
      className="career"
      data-open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <h2>
        Experience
        <button
          type="button"
          className="career-trigger"
          aria-expanded={open}
          aria-controls={id}
          aria-label="Show my career over time"
          onClick={() => setOpen((value) => !value)}
        >
          <RidgeIcon />
        </button>
      </h2>

      <div className="career-panel" id={id} role="region" aria-label="Career over time">
        <div className="career-scroll">
          <svg viewBox={`0 0 ${WIDTH} ${height}`} className="career-svg" aria-hidden>
            {years.map((year) => (
              <g key={year} className="career-year">
                <line x1={x(year * 12)} x2={x(year * 12)} y1={TOP - RIDGE - 6} y2={height - 24} />
                <text x={x(year * 12) + 5} y={height - 8}>
                  {year}
                </text>
              </g>
            ))}

            <g className="career-now">
              <line x1={x(nowIndex + 0.6)} x2={x(nowIndex + 0.6)} y1={TOP - RIDGE - 6} y2={height - 24} />
              <text x={x(nowIndex + 0.6)} y={TOP - RIDGE - 12} textAnchor="end">
                now
              </text>
            </g>

            {roles.map((role, index) => {
              const base = TOP + index * ROW;
              const points = ridge(role, index, base);
              const outline = `M ${points.join(" L ")}`;
              const area = `${outline} L ${x(last).toFixed(1)},${base + 1} L ${x(first).toFixed(1)},${base + 1} Z`;

              return (
                <g
                  key={role.company}
                  className="career-row"
                  data-current={role.current}
                  style={{ "--delay": `${index * 110}ms` } as React.CSSProperties}
                >
                  {compact ? (
                    <text className="career-name" x={0} y={base + 17}>
                      {role.company}
                      <tspan className="career-length" dx={6}>
                        {formatSpan(role.months)}
                      </tspan>
                    </text>
                  ) : (
                    <>
                      <text className="career-name" x={0} y={base - 8}>
                        {role.company}
                      </text>
                      <text className="career-length" x={0} y={base + 8}>
                        {formatSpan(role.months)}
                      </text>
                    </>
                  )}
                  <g className="career-ridge">
                    <path className="career-area" d={area} />
                    <path className="career-line" d={outline} />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
