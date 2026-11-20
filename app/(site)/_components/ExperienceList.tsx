"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import type { Experience } from "../_lib/experience";

type ExperienceListProps = {
  items: Experience[];
  now: number;
};

const AXIS_START = Date.UTC(2023, 0, 1);

function monthTime(value: string) {
  const [year, month] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, 1);
}

export default function ExperienceList({ items, now }: ExperienceListProps) {
  const [open, setOpen] = useState<number | null>(null);
  const axisEnd = now;
  const span = axisEnd - AXIS_START;
  const position = (time: number) =>
    Math.min(100, Math.max(0, ((time - AXIS_START) / span) * 100));

  const years: number[] = [];
  for (let year = 2023; Date.UTC(year, 0, 1) <= axisEnd; year++) years.push(year);

  return (
    <div className="experience">
      <div className="experience-axis" aria-hidden>
        <span />
        <span />
        <span className="experience-track">
          {years.map((year) => (
            <span
              key={year}
              className="experience-year"
              style={{ left: `${position(Date.UTC(year, 0, 1))}%` }}
            >
              {year}
            </span>
          ))}
        </span>
        <span />
      </div>

      <ol className="experience-list">
        {items.map((item, index) => {
          const isOpen = open === index;
          const start = position(monthTime(item.start));
          const end = item.end ? position(monthTime(item.end)) : 100;
          const panelId = `experience-${index}`;

          return (
            <li key={item.company} className="experience-item" data-open={isOpen} data-reveal>
              <button
                type="button"
                className="experience-row"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="experience-period">{item.duration.replace(" to ", " – ")}</span>
                <span className="experience-title">
                  <strong>{item.company}</strong>
                  <span>
                    {item.role}
                    {item.deepDive && <span className="badge">Deep dive</span>}
                  </span>
                </span>
                <span className="experience-track" aria-hidden>
                  {years.map((year) => (
                    <i key={year} style={{ left: `${position(Date.UTC(year, 0, 1))}%` }} />
                  ))}
                  <span
                    className="experience-bar"
                    data-current={!item.end}
                    style={{ left: `${start}%`, width: `${Math.max(1.5, end - start)}%` }}
                  />
                </span>
                <span className="experience-place">{item.place}</span>
                <span className="experience-toggle" aria-hidden />
              </button>

              <div id={panelId} className="experience-panel" role="region" aria-label={item.company}>
                <div className="experience-panel-inner">
                  <div className="experience-body">
                    <p className="experience-summary">{item.note}</p>
                    {item.overview.split("\n\n").map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                    {item.deepDive && (
                      <Link href={item.deepDive} className="experience-deep-dive">
                        How the Oracle to PostgreSQL sync works, with a live
                        model <FiArrowRight aria-hidden />
                      </Link>
                    )}
                  </div>
                  <aside className="experience-meta">
                    <p>Focus</p>
                    <strong>{item.signal}</strong>
                    <p>Stack</p>
                    <ul className="tags">
                      {item.stack.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </aside>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
