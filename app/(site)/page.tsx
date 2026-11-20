import Link from "next/link";
import CareerGraph from "./_components/CareerGraph";
import ContactForm from "./_components/ContactForm";
import LitText from "./_components/LitText";
import LiveStatus from "./_components/LiveStatus";
import WorkList from "./_components/WorkList";
import { profile, toolbox } from "./_lib/content";
import { experience } from "./_lib/experience";
import { getWorkItems } from "./_lib/projects";
import { formatDate, noteHref, notes } from "./_lib/writing";

export const revalidate = 300;

const intro = [
  "I build software for work that can’t stop. Right now that is a hospital information system and ERP for Asgar Ali Hospital, where I work across the frontend, the backend, and the data pipeline that keeps an old Oracle database and a new PostgreSQL one in sync.",
  "Before that I built a marketplace for Picture TV, worked on AI video tools at Logic Matrix, and shipped web apps for freelance clients. I care about clear data models, systems that keep running while they change, and screens that make people’s work easier.",
];

const links = [
  { label: "GitHub", href: profile.github, external: true },
  { label: "LinkedIn", href: profile.linkedin, external: true },
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "Résumé", href: profile.resume, download: true },
];

export default async function Home() {
  const work = await getWorkItems();

  return (
    <>
      <section className="intro">
        <h1>{profile.name}</h1>
        <p className="intro-role">
          {profile.role} at {profile.company}, Dhaka
        </p>
        <LitText paragraphs={intro} />
        <p className="lit-hint">
          <span className="hint-fine">
            A database is turning inside the text above. Move your cursor to
            shine a light on it.
          </span>
          <span className="hint-touch">
            Look closely: a database is turning inside the text above.
          </span>
        </p>
        <ul className="intro-links">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                {...(link.download ? { download: true } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <LiveStatus />

      <section id="experience" className="home-section">
        <CareerGraph items={experience} now={Date.now()} />
        <ol className="roles">
          {experience.map((item) => (
            <li key={item.company}>
              <span className="row-meta">{item.duration.replace(" to ", " – ")}</span>
              <div className="role">
                <h3>
                  {item.company} <span>{item.role}</span>
                </h3>
                <p>{item.note}</p>
                {item.deepDive && (
                  <p>
                    <Link href={item.deepDive} className="inline-link">
                      Read how the Oracle to PostgreSQL sync works
                    </Link>
                    , with a live model you can play with.
                  </p>
                )}
                <details>
                  <summary>Full story</summary>
                  <div className="role-story">
                    {item.overview.split("\n\n").map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                    <p className="role-stack">{item.stack.join(", ")}</p>
                  </div>
                </details>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="work" className="home-section">
        <h2>Work</h2>
        <WorkList items={work} />
      </section>

      <section id="writing" className="home-section">
        <h2>Writing</h2>
        <ol className="notes">
          {notes.map((note) => (
            <li key={note.slug}>
              <span className="row-meta">{formatDate(note.published)}</span>
              <div>
                <Link href={noteHref(note)} className="note-link">
                  {note.title}
                </Link>
                <p>
                  {note.interactive ? "Interactive, " : ""}
                  {note.readingTime.toLowerCase()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="stack" className="home-section">
        <h2>Stack</h2>
        <dl className="stack">
          {toolbox.map((group) => (
            <div key={group.title}>
              <dt>{group.title}</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="contact" className="home-section">
        <h2>Contact</h2>
        <p>
          The quickest way to reach me is{" "}
          <a href={`mailto:${profile.email}`} className="inline-link">
            {profile.email}
          </a>
          . Or leave a message here and it lands in the same inbox.
        </p>
        <ContactForm />
      </section>
    </>
  );
}
