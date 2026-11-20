"use client";

import { useEffect, useState } from "react";
import { profile } from "../_lib/content";

export default function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: profile.timeZone,
    });
    const tick = () => setTime(format.format(new Date()));

    tick();
    const interval = window.setInterval(tick, 10_000);
    return () => window.clearInterval(interval);
  }, []);

  return <time className="local-time">{time ?? "--:--"} GMT+6</time>;
}
