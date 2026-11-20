"use client";

import { useId, useState } from "react";
import type { Experience } from "../_lib/experience";

const WIDTH = 620;
const LANE = 34;
const TOP = 30;
const LEFT = 14;
const RIGHT = 70;

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

// Career as a git history: one main line, and a branch for every role that
// forks off when it started and merges back when it ended.
export default function CareerGraph({ items, now }: { items: Experience[]; now: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const today = new Date(now);
  const nowIndex = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const roles = [...items]
    .map((item) => {
      const start = monthIndex(item.start);
      const end = item.end ? monthIndex(item.end) : nowIndex;
      const months = item.end ? end - start + 1 : nowIndex - start;
      return { ...item, startIndex: start, endIndex: end, months: Math.max(1, months) };
    })
    .sort((a, b) => a.startIndex - b.startIndex);

  const first = Math.min(...roles.map((role) => role.startIndex)) - 2;
  const span = nowIndex - first + 1;
  const x = (month: number) => LEFT + ((month - first) / span) * (WIDTH - LEFT - RIGHT);
  const mainY = TOP;
  const height = TOP + roles.length * LANE + 44;
  const years: number[] = [];
  for (let year = Math.ceil(first / 12); year * 12 <= nowIndex; year++) years.push(year);

  const total = nowIndex - roles[0].startIndex;
  const longest = roles.reduce((best, role) => (role.months > best.months ? role : best));

  return (
    <div
      className="career"
      data-open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <h2>
        <button
          type="button"
          className="career-trigger"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          Experience
          <span className="career-hint">see it as a graph</span>
        </button>
      </h2>

      <div className="career-panel" id={id} role="region" aria-label="Career timeline">
        <p className="career-summary">
          {formatSpan(total)} of work across {roles.length} roles. The longest was{" "}
          {longest.company}, {formatSpan(longest.months)}.
        </p>

        <div className="career-scroll">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} className="career-svg" aria-hidden>
          {years.map((year) => (
            <g key={year} className="career-year">
              <line x1={x(year * 12)} x2={x(year * 12)} y1={TOP - 14} y2={height - 26} />
              <text x={x(year * 12) + 4} y={height - 10}>
                {year}
              </text>
            </g>
          ))}

          <line className="career-main" x1={x(first)} x2={x(nowIndex) + 8} y1={mainY} y2={mainY} />
          <text className="career-main-label" x={x(first)} y={mainY - 10}>
            main
          </text>

          {roles.map((role, index) => {
            const laneY = TOP + (index + 1) * LANE;
            const x1 = x(role.startIndex);
            const x2 = x(role.endIndex);
            const curve = Math.min(16, (x2 - x1) / 3);
            const current = !role.end;
            const path = current
              ? `M ${x1} ${mainY} C ${x1 + curve} ${mainY}, ${x1} ${laneY}, ${x1 + curve} ${laneY} L ${x2 + 8} ${laneY}`
              : `M ${x1} ${mainY} C ${x1 + curve} ${mainY}, ${x1} ${laneY}, ${x1 + curve} ${laneY} L ${x2 - curve} ${laneY} C ${x2} ${laneY}, ${x2 - curve} ${mainY}, ${x2} ${mainY}`;

            return (
              <g
                key={role.company}
                className="career-branch"
                data-current={current}
                style={{ "--delay": `${index * 120}ms` } as React.CSSProperties}
              >
                <path d={path} pathLength={1} />
                <circle cx={x1} cy={mainY} r={3.5} />
                {current ? (
                  <circle className="career-head" cx={x2 + 8} cy={laneY} r={4.5} />
                ) : (
                  <circle cx={x2} cy={mainY} r={3.5} />
                )}
                {x1 > 150 ? (
                  <text x={x1 - 10} y={laneY + 4.5} textAnchor="end">
                    {role.company}
                    <tspan dx={6}>{formatSpan(role.months)}</tspan>
                  </text>
                ) : (
                  <text x={x1 + curve + 6} y={laneY - 8}>
                    {role.company}
                    <tspan dx={6}>{formatSpan(role.months)}</tspan>
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        </div>
      </div>
    </div>
  );
}
