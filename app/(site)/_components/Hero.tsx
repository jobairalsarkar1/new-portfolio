import { FiArrowDown, FiDownload } from "react-icons/fi";
import { profile } from "../_lib/content";
import LocalTime from "./LocalTime";
import WaveField from "./WaveField";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <WaveField />

      <div className="container hero-content" data-wave-horizon>
        <p className="hero-kicker">
          <span className="pulse" aria-hidden />
          {profile.role} at {profile.company}
          <span className="hero-kicker-sep" aria-hidden>
            /
          </span>
          <span className="hero-kicker-place">
            Dhaka <LocalTime />
          </span>
        </p>

        <div className="hero-grid">
          <h1 className="hero-name">
            <span className="line">
              <span>Jobair</span>
            </span>
            <span className="line">
              <span>Al Sarkar</span>
            </span>
          </h1>

          <div className="hero-aside">
            <p className="hero-statement">
              I build software for work that <em>can’t stop</em>: hospital
              systems, data pipelines, and the screens people use every day.
            </p>
            <div className="hero-actions">
              <a href="#map" className="button button-solid">
                Explore the map <FiArrowDown aria-hidden />
              </a>
              <a href={profile.resume} className="button" download>
                Résumé <FiDownload aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
