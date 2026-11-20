import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import PipelineSim from "../../_components/PipelineSim";
import Reveal from "../../_components/Reveal";
import { formatDate, notes } from "../../_lib/writing";

const note = notes.find((item) => item.slug === "oracle-to-postgres-cdc")!;

export const metadata: Metadata = {
  title: `${note.title} | Jobair Al Sarkar`,
  description: note.summary,
  openGraph: {
    title: note.title,
    description: note.summary,
    type: "article",
  },
};

const contents = [
  { id: "constraint", label: "The constraint" },
  { id: "capture", label: "Capture changes, not tables" },
  { id: "ordering", label: "Order matters, per row" },
  { id: "queue", label: "A pipeline is a queue" },
  { id: "model", label: "Try the model" },
  { id: "left-out", label: "What the model leaves out" },
];

export default function CdcNote() {
  return (
    <article id="top">
      <header className="container case-header">
        <Link href="/writing" className="case-back">
          <FiArrowLeft aria-hidden /> Writing
        </Link>
        <p className="note-context article-context">
          {note.context}
          <span className="badge">Interactive</span>
        </p>
        <h1 className="case-title article-title">{note.title}</h1>
        <p className="article-dek">{note.summary}</p>

        <dl className="case-meta">
          <div>
            <dt>Topics</dt>
            <dd>
              <ul className="tags">
                {note.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{formatDate(note.published)}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{note.readingTime}</dd>
          </div>
        </dl>
      </header>

      <div className="container case-body">
        <nav className="case-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>
            {contents.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="article-body">
          <div className="prose">
            <h2 id="constraint">The constraint</h2>
            <p>
              A hospital does not have a maintenance window. Appointments,
              admissions, billing and lab orders are written all day and all
              night. At FringeCore_ we are building a new Hospital Information
              System and ERP for Asgar Ali Hospital on PostgreSQL, while parts of
              the existing system still write to Oracle.
            </p>
            <p>
              A big bang migration would mean freezing the old system, copying
              everything, and hoping the cutover goes well. Instead, both
              databases live side by side for a while. New modules move to
              PostgreSQL one at a time, and they need to see what the old
              modules write, quickly and correctly.
            </p>

            <h2 id="capture">Capture changes, not tables</h2>
            <p>
              Copying tables on a schedule is simple, but it puts load on the
              source, misses intermediate states, and is always a little stale.
              Change data capture works differently: it reads committed changes
              from the database log and turns every insert, update and delete
              into an event.
            </p>
            <p>
              Each event carries the operation, the primary key of the row, and
              the new values. Those events are published to Kafka, and consumers
              on the other side apply them to PostgreSQL. The source database
              keeps doing its job and barely notices.
            </p>

            <h2 id="ordering">Order matters, per row</h2>
            <p>
              Suppose an appointment is created and then rescheduled a minute
              later. If the update is applied before the insert, PostgreSQL ends
              up with the wrong time, or no appointment at all. Changes to the
              same row must be applied in the order they happened.
            </p>
            <p>
              Kafka only guarantees order inside a partition, so every event is
              keyed by the primary key of its row. The key decides the
              partition:
            </p>
          </div>

          <figure className="formula" data-reveal>
            <span>
              partition = hash(<var>key</var>) mod <var>P</var>
            </span>
            <figcaption>
              Every change to the same row lands in the same partition and is
              read by one consumer, in order. Different rows spread across{" "}
              <var>P</var> partitions and are processed in parallel.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="queue">A pipeline is a queue</h2>
            <p>
              Each partition behaves like a queue with a single server in front
              of it. If changes arrive at a rate of <var>λ</var> per second and
              each consumer can apply <var>μ</var> per second, the number that
              decides everything is the utilization:
            </p>
          </div>

          <figure className="formula" data-reveal>
            <span>
              <var>ρ</var> = <var>λ</var> / (<var>P</var> · <var>μ</var>)
            </span>
            <figcaption>
              Below 1 the consumers keep up. At 1 or above there is no steady
              state: the backlog grows until something changes.
            </figcaption>
          </figure>

          <div className="prose">
            <p>
              The interesting part is what happens before you reach 1. With
              random arrivals and random service times, an M/M/1 queue, the
              average time an event spends in the system is:
            </p>
          </div>

          <figure className="formula" data-reveal>
            <span>
              <var>W</var> = 1 / (<var>μ</var> − <var>λ</var> / <var>P</var>)
            </span>
            <figcaption>
              Waiting time is not linear in load. Going from 50% to 90%
              utilization makes the average wait five times longer, which is
              why consumer lag is the first number worth watching.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="model">Try the model</h2>
            <p>
              The model below runs in your browser. Changes arrive from Oracle as
              a Poisson process, are partitioned by key, and are applied by
              three consumers that each handle six events per second. Some
              things to try:
            </p>
            <ul>
              <li>
                Raise the arrival rate past 18 events per second and watch the
                lag climb without stopping.
              </li>
              <li>
                Stop the consumers, as if a deploy took them down, then start
                them again and watch the backlog drain.
              </li>
              <li>
                Run a batch import at a moderate rate and see the burst ripple
                through latency.
              </li>
            </ul>
          </div>

          <figure className="article-figure" id="model-figure" data-reveal>
            <PipelineSim />
            <figcaption className="caption">
              A simplified model written for this page. It does not use code or
              data from the hospital&apos;s systems.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="left-out">What the model leaves out</h2>
            <p>
              The model keeps two ideas in focus: ordering per key, and
              capacity. A production pipeline has to handle a lot more:
            </p>
            <ul>
              <li>
                <strong>Idempotent writes.</strong> After a crash, consumers
                replay events from their last committed offset, so applying the
                same event twice must be safe.
              </li>
              <li>
                <strong>Schema mapping.</strong> Oracle and PostgreSQL disagree
                on types, defaults and naming, and every table needs a clear
                mapping.
              </li>
              <li>
                <strong>Deletes and bad events.</strong> Deletes need tombstones,
                and events that cannot be applied need somewhere to go instead of
                blocking a partition forever.
              </li>
              <li>
                <strong>Observability.</strong> Lag per partition, throughput,
                and end to end latency, with alerts before ρ gets close to 1.
              </li>
            </ul>
            <p>
              None of this is glamorous, but it is what lets a hospital move to
              a new platform one module at a time while the people using it
              never notice.
            </p>
          </div>

          <div className="case-cta" data-reveal>
            <p>Planning a migration like this?</p>
            <Link href="/#contact" className="button button-solid">
              Let’s talk
            </Link>
          </div>
        </div>
      </div>

      <Reveal />
    </article>
  );
}
