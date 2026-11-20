"use client";

import { useEffect, useState } from "react";
import { profile } from "../_lib/content";

const CAREER_START = new Date(Date.UTC(2023, 5, 1));

const DHAKA_OFFSET_MINUTES = 6 * 60;

function describeDhaka(now: Date) {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: profile.timeZone,
  }).format(now);
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: profile.timeZone,
  }).format(now);

  // Dhaka has no daylight saving, so the gap to the visitor is a fixed sum.
  const difference = DHAKA_OFFSET_MINUTES + now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(difference) / 60);
  const minutes = Math.abs(difference) % 60;
  const amount = [hours && `${hours} hour${hours === 1 ? "" : "s"}`, minutes && `${minutes} minutes`]
    .filter(Boolean)
    .join(" and ");
  const relation =
    difference === 0 ? "the same time as you" : `${amount} ${difference > 0 ? "ahead of" : "behind"} you`;

  return { time, weekday, relation };
}

function describeCareer(now: Date) {
  let months =
    (now.getUTCFullYear() - CAREER_START.getUTCFullYear()) * 12 +
    now.getUTCMonth() -
    CAREER_START.getUTCMonth();
  if (now.getUTCDate() < CAREER_START.getUTCDate()) months--;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const plural = (value: number, word: string) => `${value} ${word}${value === 1 ? "" : "s"}`;
  return rest ? `${plural(years, "year")} and ${plural(rest, "month")}` : plural(years, "year");
}

export default function LiveStatus() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(interval);
  }, []);

  const dhaka = now ? describeDhaka(now) : null;

  return (
    <dl className="status">
      <div>
        <dt>Now</dt>
        <dd>
          {dhaka ? (
            <>
              It is <span className="status-time">{dhaka.time}</span> on{" "}
              {dhaka.weekday} in Dhaka, {dhaka.relation}.
            </>
          ) : (
            "Based in Dhaka, Bangladesh."
          )}
        </dd>
      </div>
      <div>
        <dt>Since</dt>
        <dd>
          Building software professionally since June 2023
          {now ? `, ${describeCareer(now)}.` : "."}
        </dd>
      </div>
    </dl>
  );
}
