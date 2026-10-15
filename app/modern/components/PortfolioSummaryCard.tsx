import type { CSSProperties } from "react";
import { experienceNotes } from "../data";
import CountUp from "./CountUp";

export default function PortfolioSummaryCard() {
  return (
    <div
      className="modern-orbit-panel modern-intro"
      style={{ "--d": "520ms" } as CSSProperties}
      aria-label="Portfolio summary"
      data-tilt="5"
      data-spot
    >
      <span className="modern-satellite" aria-hidden="true" />
      <span className="modern-panel-index">01</span>
      <h2>Jobair Al Sarkar</h2>
      <p>
        A focused look at the systems I have built across hospital software,
        digital marketplaces, AI video products, and client web applications.
      </p>
      <div className="modern-stat-grid">
        <div>
          <strong>
            <CountUp to={3} />
          </strong>
          <span>Years building</span>
        </div>
        <div>
          <strong>
            <CountUp to={experienceNotes.length} delay={800} />
          </strong>
          <span>Work chapters</span>
        </div>
        <div>
          <strong>Full</strong>
          <span>Stack focus</span>
        </div>
      </div>
    </div>
  );
}
