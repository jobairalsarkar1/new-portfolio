import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiDownload, FiMapPin, FiPhone } from "react-icons/fi";
import ContactForm, { CopyEmail } from "./_components/ContactForm";
import ExperienceList from "./_components/ExperienceList";
import Hero from "./_components/Hero";
import PipelineSim from "./_components/PipelineSim";
import Reveal from "./_components/Reveal";
import SectionHeading from "./_components/SectionHeading";
import WorkList from "./_components/WorkList";
import { dailyDrivers, principles, profile, toolbox } from "./_lib/content";
import { experience } from "./_lib/experience";
import { getWorkItems } from "./_lib/projects";

export const revalidate = 300;

export default async function Home() {
  const work = await getWorkItems();

  return (
    <>
      <Hero />

      <section id="system" className="page-section">
        <div className="container">
          <SectionHeading
            index="01"
            label="System"
            title={
              <>
                Data that has to arrive. <em>In order, every time.</em>
              </>
            }
            lead={
              <>
                At {profile.company} I work on a hospital information system and
                ERP for Asgar Ali Hospital. Part of that is a gradual move from
                Oracle to PostgreSQL: changes are captured from the legacy
                database, streamed through Kafka, and applied to the new
                platform while staff keep working. This is a small, honest model
                of that kind of pipeline. Push it until it breaks.
              </>
            }
          />
          <div data-reveal>
            <PipelineSim />
          </div>
          <p className="caption">
            Simulated in your browser. Arrivals follow a Poisson process with
            rate λ. Each record key hashes to one of three partitions, so
            changes to the same row stay in order. Each consumer serves μ = 6
            events per second, so the pipeline is only stable while ρ = λ / 3μ
            stays below 1.
          </p>
        </div>
      </section>

      <section id="experience" className="page-section">
        <div className="container">
          <SectionHeading
            index="02"
            label="Experience"
            title={
              <>
                Hospitals, marketplaces, AI video, <em>and the clients in between.</em>
              </>
            }
            lead="Four chapters, one thread: software that real operations depend on. Open any of them for the full story."
          />
          <ExperienceList items={experience} now={Date.now()} />
        </div>
      </section>

      <section id="work" className="page-section">
        <div className="container">
          <SectionHeading
            index="03"
            label="Work"
            title={
              <>
                Selected work. <em>Products, systems, experiments.</em>
              </>
            }
            lead="Case studies from my archive, from production platforms to weekend experiments. Each one opens into the full write-up."
          />
          <WorkList items={work} />
        </div>
      </section>

      <section id="approach" className="page-section">
        <div className="container">
          <SectionHeading
            index="04"
            label="Approach"
            title={
              <>
                How I work, <em>and what I work with.</em>
              </>
            }
          />

          <ol className="principles">
            {principles.map((principle, index) => (
              <li key={principle.title} data-reveal>
                <span className="principle-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </li>
            ))}
          </ol>

          <div className="toolbox" data-reveal>
            {toolbox.map((group) => (
              <div key={group.title} className="toolbox-group">
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item} data-primary={dailyDrivers.has(item)}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="caption toolbox-note">
            <i aria-hidden /> Daily drivers. The rest I have shipped with and
            reach for when the problem calls for it.
          </p>
        </div>
      </section>

      <section id="contact" className="page-section contact">
        <div className="container contact-grid">
          <div className="contact-intro" data-reveal>
            <p className="eyebrow">
              <span>05</span>Contact
            </p>
            <h2>
              Have a system that needs to <em>hold up?</em>
            </h2>
            <a className="contact-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="contact-actions">
              <CopyEmail />
              <a href={profile.resume} className="button button-small" download>
                <FiDownload aria-hidden /> Résumé
              </a>
            </div>
            <ul className="contact-details">
              <li>
                <FiMapPin aria-hidden /> {profile.location}
              </li>
              <li>
                <FiPhone aria-hidden />
                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
              </li>
              <li>
                <FaGithub aria-hidden />
                <a href={profile.github} target="_blank" rel="noreferrer">
                  github.com/jobairalsarkar1
                </a>
              </li>
              <li>
                <FaLinkedin aria-hidden />
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  linkedin.com/in/jobair-al-sarkar
                </a>
              </li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>

      <Reveal />
    </>
  );
}
