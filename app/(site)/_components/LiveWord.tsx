"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Kind = "pulse" | "flow" | "sync" | "tv" | "scan" | "flash" | "ledger";

function Timecode() {
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const interval = window.setInterval(() => setFrames(Math.floor(((performance.now() - start) / 1000) * 25)), 40);
    return () => window.clearInterval(interval);
  }, []);

  const pad = (value: number) => String(value).padStart(2, "0");
  const seconds = Math.floor(frames / 25);
  return (
    <span className="live-pop live-timecode">
      <i />
      {pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}:{pad(frames % 25)}
    </span>
  );
}

function SyncScene() {
  return (
    <span className="live-pop">
      <svg viewBox="0 0 156 44" className="live-sync" aria-hidden>
        <g className="live-db">
          <ellipse cx="18" cy="12" rx="12" ry="4" />
          <path d="M6 12v16c0 2.2 5.4 4 12 4s12-1.8 12-4V12" />
        </g>
        <g className="live-db live-db-new">
          <ellipse cx="138" cy="12" rx="12" ry="4" />
          <path d="M126 12v16c0 2.2 5.4 4 12 4s12-1.8 12-4V12" />
        </g>
        <path className="live-wire" d="M34 20 H122" />
        {[0, 0.45, 0.9].map((delay) => (
          <circle key={delay} r="2.6" className="live-packet">
            <animateMotion dur="1.35s" begin={`${delay}s`} repeatCount="indefinite" path="M34 20 H122" />
          </circle>
        ))}
        <text x="18" y="42" textAnchor="middle">Oracle</text>
        <text x="138" y="42" textAnchor="middle">PostgreSQL</text>
      </svg>
    </span>
  );
}

// Double-entry bookkeeping in two seconds: a debit tips the scale, the
// matching credit brings it back level.
function LedgerScene() {
  return (
    <span className="live-pop">
      <svg viewBox="0 0 160 62" className="live-ledger" aria-hidden>
        <path className="ledger-stand" d="M80 12 V44 M70 46 H90 L80 40 Z" />
        <line className="ledger-beam" x1="30" y1="12" x2="130" y2="12" />
        <circle className="ledger-pivot" cx="80" cy="12" r="2.2" />
        <g className="ledger-pan ledger-pan-debit">
          <line x1="30" y1="12" x2="30" y2="24" />
          <path d="M17 24 Q30 31 43 24" />
          <rect className="ledger-weight" x="24" y="17" width="12" height="7" rx="1.5" />
        </g>
        <g className="ledger-pan ledger-pan-credit">
          <line x1="130" y1="12" x2="130" y2="24" />
          <path d="M117 24 Q130 31 143 24" />
          <rect className="ledger-weight" x="124" y="17" width="12" height="7" rx="1.5" />
        </g>
        <text x="30" y="43" textAnchor="middle">Debit ৳5,000</text>
        <text x="130" y="43" textAnchor="middle">Credit ৳5,000</text>
        <text className="ledger-balanced" x="80" y="59" textAnchor="middle">Balanced</text>
      </svg>
    </span>
  );
}

// A word that comes alive when you point at it or tap it, in a way that
// matches what it means. Nothing moves until someone asks.
export default function LiveWord({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  // Keep pop-ups inside the screen when the word sits near an edge.
  useLayoutEffect(() => {
    const pop = rootRef.current?.querySelector<HTMLElement>(".live-pop");
    if (!pop) return;
    pop.style.setProperty("--shift", "0px");
    const bounds = pop.getBoundingClientRect();
    const margin = 8;
    const shift =
      bounds.left < margin
        ? margin - bounds.left
        : bounds.right > window.innerWidth - margin
          ? window.innerWidth - margin - bounds.right
          : 0;
    pop.style.setProperty("--shift", `${shift}px`);
  }, [active]);

  return (
    <span
      ref={rootRef}
      className="live"
      data-kind={kind}
      data-active={active}
      tabIndex={0}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setActive(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setActive(false);
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") setActive((value) => !value);
      }}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <span className="live-text">{children}</span>
      {kind === "pulse" && (
        <svg className="live-ecg" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
          <path className="live-ecg-base" d="M0 7 H22 L26 2 L30 11 L34 7 H58 L62 1 L66 12 L70 7 H100" />
          <path
            className="live-ecg-trace"
            pathLength={1}
            d="M0 7 H22 L26 2 L30 11 L34 7 H58 L62 1 L66 12 L70 7 H100"
          />
        </svg>
      )}
      {active && kind === "tv" && (
        <span className="live-pop live-onair" aria-hidden>
          <i />
          On air
        </span>
      )}
      {active && kind === "sync" && <SyncScene />}
      {active && kind === "scan" && <Timecode />}
      {active && kind === "ledger" && <LedgerScene />}
      {active && kind === "flash" && (
        <span className="live-pop live-exposure" aria-hidden>
          ISO 400 · 1/250 · f/2.8
        </span>
      )}
    </span>
  );
}
