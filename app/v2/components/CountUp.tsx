"use client";

import { useEffect, useState } from "react";

type CountUpProps = {
  to: number;
  duration?: number;
  delay?: number;
};

export default function CountUp({ to, duration = 1400, delay = 650 }: CountUpProps) {
  // Start on the final value so server markup and no-JS stay correct.
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    setValue(0);

    const timeout = window.setTimeout(() => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        setValue(Math.round(to * eased));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };

      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [to, duration, delay]);

  return <>{value}</>;
}
