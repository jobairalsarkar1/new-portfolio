import { FaArrowRight } from "react-icons/fa";
import PortfolioSummaryCard from "./PortfolioSummaryCard";

export default function HeroSection() {
  return (
    <section className="modern-hero">
      <div className="modern-hero-copy">
        <p className="modern-kicker">Full Stack Software Engineer</p>
        <h1>I build systems that feel alive, useful, and quietly sharp.</h1>
        <p>
          A more experimental version of my portfolio, shaped around motion,
          product thinking, and the kind of engineering work that has to serve
          real people.
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
