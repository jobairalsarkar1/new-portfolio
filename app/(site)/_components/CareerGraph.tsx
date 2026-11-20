"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Experience } from "../_lib/experience";

const BLOCKS = "▁▂▃▄▅▆▇█";

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

type Run = { text: string; tone: "base" | "high" };

// The career as text: every role is a row of block characters that rise while
// the role lasted, like a sparkline. Opening it prints the rows left to right.
export default function CareerGraph({ items, now }: { items: Experience[]; now: number }) {
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState(64);
  const [progress, setProgress] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    const panel = panelRef.current;
    const probe = probeRef.current;
    if (!panel || !probe) return;
    const measure = () => {
      const charWidth = probe.getBoundingClientRect().width / 10 || 7.8;
      setColumns(Math.floor((panel.clientWidth - 36) / charWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const value = Math.min(1, (time - start) / 1100);
      setProgress(value);
      if (value < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const today = new Date(now);
  const nowIndex = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const roles = [...items]
    .map((item) => {
      const start = monthIndex(item.start);
      const end = item.end ? monthIndex(item.end) : nowIndex;
      const months = item.end ? end - start + 1 : nowIndex - start;
      return {
        company: item.company,
        startMonth: start,
        endMonth: item.end ? end + 1 : end + 6,
        months: Math.max(1, months),
        current: !item.end,
      };
    })
    .sort((a, b) => a.startMonth - b.startMonth);

  const compact = columns < 56;
  const labelWidth = compact ? 14 : 16;
  const lengthWidth = compact ? 12 : 13;
  const width = Math.max(16, columns - labelWidth - lengthWidth);
  const first = roles[0].startMonth - 3;
  const last = nowIndex + 1;
  const monthAt = (column: number) => first + ((column + 0.5) / width) * (last - first);
  const columnOf = (month: number) => Math.round(((month - first) / (last - first)) * width);

  const rows = roles.map((role, index) => {
    const reveal = Math.max(0, Math.min(1, (progress - index * 0.09) / 0.64));
    const shown = Math.floor(width * reveal);
    const runs: Run[] = [];
    for (let column = 0; column < width; column++) {
      let character = " ";
      let tone: Run["tone"] = "base";
      if (column < shown) {
        const month = monthAt(column);
        const rise = smoothStep(month - role.startMonth) * smoothStep(role.endMonth - month);
        const texture = 0.8 + 0.2 * Math.sin(month * 1.3 + index * 2.1) * Math.sin(month * 0.47 + index);
        const level = Math.round(rise * texture * (BLOCKS.length - 1));
        character = BLOCKS[level];
        tone = level > 0 ? "high" : "base";
      }
      const lastRun = runs[runs.length - 1];
      if (lastRun && lastRun.tone === tone) lastRun.text += character;
      else runs.push({ text: character, tone });
    }
    return { role, runs, done: reveal >= 1 };
  });

  const years: number[] = [];
  for (let year = Math.ceil(first / 12); year * 12 <= last; year++) years.push(year);

  const yearGap = (12 / (last - first)) * width;
  const axis = "─".repeat(width).split("");
  const labels = " ".repeat(width).split("");
  years.forEach((year) => {
    const column = columnOf(year * 12);
    if (column < 0 || column >= width) return;
    axis[column] = "┴";
    (yearGap < 6 ? `'${String(year).slice(2)}` : String(year))
      .split("")
      .forEach((digit, offset) => {
        if (column + offset < labels.length) labels[column + offset] = digit;
      });
  });

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

      <div className="career-panel" id={id} ref={panelRef} role="region" aria-label="Career over time">
        <span className="career-probe" ref={probeRef} aria-hidden>
          ▁▁▁▁▁▁▁▁▁▁
        </span>
        <pre className="career-ascii" aria-hidden>
          {rows.map(({ role, runs, done }) => (
            <span key={role.company} className="career-line" data-current={role.current}>
              <span className="career-label">{role.company.padEnd(labelWidth).slice(0, labelWidth)}</span>
              {runs.map((run, i) => (
                <span key={i} className={`career-${run.tone}`}>
                  {run.text}
                </span>
              ))}
              <span className="career-length">{done ? `  ${formatSpan(role.months)}` : ""}</span>
              {role.current && done && <span className="career-cursor">▌</span>}
              {"\n"}
            </span>
          ))}
          <span className="career-axis">
            {" ".repeat(labelWidth)}
            {axis.join("")}
            {"  now\n"}
            {" ".repeat(labelWidth)}
            {labels.join("")}
          </span>
        </pre>
        <ul className="sr-only">
          {roles.map((role) => (
            <li key={role.company}>
              {role.company}, {formatSpan(role.months)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
