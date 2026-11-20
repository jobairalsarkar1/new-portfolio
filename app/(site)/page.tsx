import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiFileText, FiMail } from "react-icons/fi";
import CareerGraph from "./_components/CareerGraph";
import ContactForm from "./_components/ContactForm";
import LiveWord from "./_components/LiveWord";
import LiveStatus from "./_components/LiveStatus";
import WorkList from "./_components/WorkList";
import { profile, toolbox } from "./_lib/content";
import { experience } from "./_lib/experience";
import { getWorkItems } from "./_lib/projects";
import { formatDate, noteHref, notes } from "./_lib/writing";

export const revalidate = 300;

const links = [
  { label: "GitHub", href: profile.github, external: true, icon: <FaGithub aria-hidden /> },
  { label: "LinkedIn", href: profile.linkedin, external: true, icon: <FaLinkedin aria-hidden /> },
  { label: "Email", href: `mailto:${profile.email}`, icon: <FiMail aria-hidden /> },
  { label: "Résumé", href: profile.resume, download: true, icon: <FiFileText aria-hidden /> },
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
        <div className="intro-text">
          <p>
            I build software for work that{" "}
            <LiveWord kind="pulse">can’t stop</LiveWord>. Right now that is a
            hospital information system and ERP for Asgar Ali Hospital, where I
            work across the frontend, the backend, and the{" "}
            <LiveWord kind="flow">data pipeline</LiveWord> that keeps an old
            Oracle database and a new PostgreSQL one{" "}
            <LiveWord kind="sync">in sync</LiveWord>. I have also worked on{" "}
            <LiveWord kind="tv">Ekhon TV</LiveWord>, the news site of
            Bangladesh’s first business television channel.
          </p>
          <p>
            Before that I built a marketplace for Picture TV, worked on{" "}
            <LiveWord kind="scan">AI video tools</LiveWord> at Logic Matrix,
            and shipped web apps for freelance clients. I care about clear data
            models, systems that keep running while they change, and screens
            that make people’s work easier.
          </p>
        </div>
        <p className="live-hint">
          Some of these words are alive.
          <span className="hint-touch"> Tap the dotted ones.</span>
        </p>
        <ul className="intro-links">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                {...(link.download ? { download: true } : {})}
              >
                {link.icon}
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
                {item.products && (
                  <p className="role-products">
                    Worked on{" "}
                    {item.products.map((product, index) => (
                      <span key={product.name}>
                        {index > 0 && (index === item.products!.length - 1 ? " and " : ", ")}
                        {product.href ? (
                          <a href={product.href} target="_blank" rel="noreferrer" className="inline-link">
                            {product.name}
                          </a>
                        ) : (
                          product.name
                        )}
                      </span>
                    ))}
                    .
                  </p>
                )}
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
