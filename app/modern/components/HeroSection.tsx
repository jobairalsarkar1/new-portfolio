import { FaArrowRight } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
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
          <a href="#experience" className="modern-primary">
            View experience <FaArrowRight />
          </a>
          <a
            href="/assets/resume/jobair-al-sarkar-resume.pdf"
            className="modern-secondary"
            download
          >
            Resume <FiDownload />
          </a>
        </div>
      </div>

      <PortfolioSummaryCard />
    </section>
  );
}
