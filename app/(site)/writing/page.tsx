import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, noteHref, notes } from "../_lib/writing";

export const metadata: Metadata = {
  title: "Writing | Jobair Al Sarkar",
  description:
    "Notes on backend systems, data pipelines, and the engineering behind real operations.",
};

export default function WritingPage() {
  return (
    <>
      <section className="intro">
        <h1>Writing</h1>
        <p>
          Longer notes from projects I have worked on, written so anyone can
          follow along. Some of them come with a small model you can play with.
        </p>
      </section>

      <section className="home-section">
        <h2>Notes</h2>
        <ol className="notes">
          {notes.map((note) => (
            <li key={note.slug}>
              <span className="row-meta">{formatDate(note.published)}</span>
              <div>
                <Link href={noteHref(note)} className="note-link">
                  {note.title}
                </Link>
                <p>{note.summary}</p>
                <p className="row-meta">
                  {note.interactive ? "Interactive, " : ""}
                  {note.readingTime.toLowerCase()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
