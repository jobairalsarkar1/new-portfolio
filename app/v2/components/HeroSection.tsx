import type { CSSProperties } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import PortfolioSummaryCard from "./PortfolioSummaryCard";

const headline = [
  { text: "Focusing" },
  { text: "on" },
  { text: "scalable" },
  { text: "backend" },
  { text: "systems" },
  { text: "and" },
  { text: "modern" },
  { text: "web" },
  { text: "interfaces." },
];

export default function HeroSection() {
  return (
    <section className="modern-hero">
      <div className="modern-hero-copy">
        <p className="modern-kicker modern-intro" style={{ "--d": "80ms" } as CSSProperties}>
          <span className="modern-live-dot" aria-hidden="true" />
          Full Stack Software Engineer @ FringeCore_
        </p>
        <h1>
          {headline.map((word, index) => (
            <span key={`${word.text}-${index}`}>
              <span
                className="modern-word"
                style={{ "--i": index } as CSSProperties}
              >
                <span>{word.text}</span>
              </span>{" "}
            </span>
          ))}
        </h1>
        <p className="modern-intro" style={{ "--d": "760ms" } as CSSProperties}>
          I build production grade applications using TypeScript, React,
          Node.js, and PostgreSQL, with recent work across enterprise ERP
          systems, Kafka/CDC pipelines, cloud integrations, and developer
          tooling.
        </p>
        <div
          className="modern-actions modern-intro"
          style={{ "--d": "900ms" } as CSSProperties}
        >
          <a href="#experience" className="modern-primary" data-magnetic>
            View experience <FaArrowRight />
          </a>
          <a
            href="/assets/resume/jobair-al-sarkar-resume.pdf"
            className="modern-secondary"
            data-magnetic
            download
          >
            Resume <FiDownload />
          </a>
        </div>
      </div>

      <PortfolioSummaryCard />

      <div className="modern-scroll-cue modern-intro" style={{ "--d": "1300ms" } as CSSProperties}>
        <span className="modern-scroll-line" aria-hidden="true" />
        <span>Scroll</span>
        <span className="modern-scroll-hint">
          Move your cursor and click the lattice
        </span>
      </div>
    </section>
  );
}
