"use client";

import { useEffect, useRef } from "react";

const SOURCE = `const jobair = new Engineer({
  role: "Software Engineer", at: "FringeCore_",
  building: "HIS and ERP for Asgar Ali Hospital",
  sync: { from: "Oracle", to: "PostgreSQL", via: "Kafka CDC" },
  also: ["Ekhon TV"],
  before: ["Picture TV", "Logic Matrix", "freelance clients"],
  cares: ["clear data models", "systems that keep running",
    "screens that make work easier"],
});

jobair.ship(); // every day since 2023`;

type Token = { text: string; kind?: string };

function highlight(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /(\/\/.*$)|("[^"]*")|\b(const|new|true)\b|\b([A-Z]\w*)\b|(\w+)(?=:)|(\w+)(?=\()/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index) });
    const kind = match[1] ? "comment" : match[2] ? "string" : match[3] ? "keyword" : match[4] ? "type" : match[5] ? "prop" : "call";
    tokens.push({ text: match[0], kind });
    last = match.index + match[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}

// The paragraph is the rendered output. A lens that follows the cursor shows
// the source underneath, and both the lens position and its size move on
// damped springs, so it glides, overshoots a little, and settles.
export default function SourceLens({ paragraphs }: { paragraphs: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lensSize = () => Math.min(120, root.clientWidth * 0.32);
    const position = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    const radius = { value: 0, velocity: 0, target: 0 };
    let placed = false;
    let pinned = false;
    let frame = 0;
    let last = 0;

    const apply = () => {
      root.dataset.active = String(radius.value > 1);
      root.style.setProperty("--lens-x", `${position.x}px`);
      root.style.setProperty("--lens-y", `${position.y}px`);
      root.style.setProperty("--lens-r", `${Math.max(0, radius.value)}px`);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;

      position.vx += (180 * (target.x - position.x) - 22 * position.vx) * dt;
      position.vy += (180 * (target.y - position.y) - 22 * position.vy) * dt;
      position.x += position.vx * dt;
      position.y += position.vy * dt;

      radius.velocity += (240 * (radius.target - radius.value) - 15 * radius.velocity) * dt;
      radius.value += radius.velocity * dt;
      apply();

      const settled =
        Math.abs(target.x - position.x) < 0.3 &&
        Math.abs(target.y - position.y) < 0.3 &&
        Math.abs(radius.target - radius.value) < 0.3 &&
        Math.abs(radius.velocity) < 0.3;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (reduceMotion) {
        position.x = target.x;
        position.y = target.y;
        radius.value = radius.target;
        apply();
        return;
      }
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const local = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || pinned) return;
      const point = local(event);
      target.x = point.x;
      target.y = point.y;
      if (!placed) {
        position.x = point.x;
        position.y = point.y;
        placed = true;
      }
      radius.target = lensSize();
      wake();
    };

    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || pinned) return;
      radius.target = 0;
      placed = false;
      wake();
    };

    // On touch screens a tap opens the source fully from where you tapped,
    // and a second tap closes it again.
    const onTap = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const point = local(event);
      pinned = !pinned;
      position.x = target.x = point.x;
      position.y = target.y = point.y;
      radius.target = pinned ? Math.hypot(root.clientWidth, root.clientHeight) : 0;
      root.dataset.pinned = String(pinned);
      wake();
    };

    // Shrink the code until it fits inside the paragraph's box.
    const code = root.querySelector<HTMLElement>(".lens-source code");
    const fit = () => {
      if (!code) return;
      code.style.fontSize = "";
      if (root.clientWidth < 560) return;
      const box = root.getBoundingClientRect();
      const ratio = Math.min(1, (box.width - 8) / code.scrollWidth, (box.height + 8) / code.scrollHeight);
      code.style.fontSize = `${Math.max(8, 13.5 * ratio)}px`;
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(root);

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerup", onTap);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerup", onTap);
    };
  }, []);

  return (
    <div className="lens" ref={rootRef}>
      <div className="lens-prose">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      <pre className="lens-source" aria-hidden>
        <code>
          {SOURCE.split("\n").map((line, index) => (
            <span key={index} className="lens-line">
              {highlight(line).map((token, i) =>
                token.kind ? (
                  <span key={i} className={`tok-${token.kind}`}>
                    {token.text}
                  </span>
                ) : (
                  token.text
                ),
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
      <span className="lens-ring" aria-hidden />
    </div>
  );
}
