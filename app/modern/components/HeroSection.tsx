import { FaArrowRight } from "react-icons/fa";
import PortfolioSummaryCard from "./PortfolioSummaryCard";

export default function HeroSection() {
  return (
    <section className="modern-hero">
      <div className="modern-hero-copy">
        <p className="modern-kicker">
          Full Stack Software Engineer @ FringeCore_
        </p>
        <h1>Focusing on scalable backend systems and modern web interfaces.</h1>
        <p>
          I build production grade applications using TypeScript, React,
          Node.js, and PostgreSQL, with recent work across enterprise ERP
          systems, Kafka/CDC pipelines, cloud integrations, and developer
          tooling.
        </p>
        <div className="modern-actions">
          <a href="#work" className="modern-primary">
            Explore work <FaArrowRight />
          </a>
          <a href="#contact" className="modern-secondary">
            Start a project
          </a>
        </div>
      </div>

      <PortfolioSummaryCard />
    </section>
  );
}
