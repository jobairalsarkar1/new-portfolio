import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Reveal from "../_components/Reveal";
import { formatDate, noteHref, notes } from "../_lib/writing";

export const metadata: Metadata = {
  title: "Writing | Jobair Al Sarkar",
  description:
    "Notes on backend systems, data pipelines, and the engineering behind real operations.",
};

export default function WritingPage() {
  return (
    <div className="container writing-page">
      <header className="writing-header">
        <p className="eyebrow">
          <span>Notes</span>Writing
        </p>
        <h1>
          Notes on systems, data, <em>and the work behind them.</em>
        </h1>
        <p className="lead">
          Longer write-ups from projects I have worked on. Some of them come with
          a small model you can play with.
        </p>
      </header>

      <ol className="note-list">
        {notes.map((note) => (
          <li key={note.slug} data-reveal>
            <Link href={noteHref(note)} className="note-row">
              <span className="note-date">{formatDate(note.published)}</span>
              <span className="note-main">
                <span className="note-context">
                  {note.context}
                  {note.interactive && <span className="badge">Interactive</span>}
                </span>
                <span className="note-title">{note.title}</span>
                <span className="note-summary">{note.summary}</span>
                <span className="note-meta">
                  {note.readingTime} · {note.topics.join(", ")}
                </span>
              </span>
              <span className="work-arrow" aria-hidden>
                <FiArrowUpRight />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Reveal />
    </div>
  );
}
