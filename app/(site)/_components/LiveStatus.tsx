"use client";

import { useEffect, useState } from "react";
import { profile } from "../_lib/content";

const CAREER_START = new Date(Date.UTC(2023, 5, 1));

function describeDhaka(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
    timeZone: profile.timeZone,
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const weekend = get("weekday") === "Fri" || get("weekday") === "Sat";

  let guess = "probably winding down";
  if (hour < 7) guess = "probably asleep";
  else if (hour < 10) guess = "probably starting the day";
  else if (hour < 19) guess = weekend ? "probably taking the day off" : "probably at work";

  return { time: `${get("hour")}:${get("minute")}`, guess };
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
              It is <span className="status-time">{dhaka.time}</span> in Dhaka,
              so I am {dhaka.guess}.
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
