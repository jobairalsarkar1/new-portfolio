import type { Metadata } from "next";
import Link from "next/link";
import PipelineSim from "../../_components/PipelineSim";
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

export default function CdcNote() {
  return (
    <article className="article">
      <header className="article-header">
        <p className="row-meta">
          {note.context} · {formatDate(note.published)} · {note.readingTime}
        </p>
        <h1>{note.title}</h1>
        <p className="article-dek">{note.summary}</p>
      </header>

      <div className="article-body">
          <div className="prose">
            <h2 id="problem">The problem</h2>
            <p>
              A hospital never closes. Staff book appointments, admit patients,
              create bills and order lab tests all day and all night. Every one
              of those actions is saved in a database.
            </p>
            <p>
              At FringeCore_ we are building a new hospital system for Asgar Ali
              Hospital. The new system saves its data in PostgreSQL. Parts of
              the old system still save their data in Oracle.
            </p>
            <p>
              We can&apos;t switch everything off for a weekend and move it all
              at once. So for a while, both databases run side by side and we
              move the system over one part at a time. While that happens, the
              new parts need to see what the old parts write, quickly and
              correctly.
            </p>

            <h2 id="capture">Copy the changes, not the tables</h2>
            <p>
              The simple approach is to copy whole tables every few minutes.
              That is slow, it puts extra load on the old database, and the copy
              is always a little out of date.
            </p>
            <p>
              Change data capture, or CDC, is smarter. Every database keeps a
              log of each change it saves, a bit like a diary. CDC reads that
              diary and turns every new entry into a small message: this record
              was added, this record was changed, or this record was deleted.
            </p>
            <p>
              Those messages go into Kafka, a system built to carry a large
              stream of messages without losing any. On the other side, small
              programs called consumers read each message and make the same
              change in PostgreSQL.
            </p>

            <h2 id="ordering">Changes must arrive in order</h2>
            <p>
              Imagine a patient books an appointment and then moves it to a
              later time. If the move is applied before the booking, the new
              database ends up with the wrong time, or with no appointment at
              all. Changes to the same record have to be applied in the order
              they happened.
            </p>
            <p>
              Kafka splits messages into several lanes, called partitions.
              Inside one lane the order is guaranteed, but across lanes it is
              not. So we send every change for the same record into the same
              lane, using the record&apos;s ID to pick it:
            </p>
          </div>

          <figure className="formula">
            <span>
              lane = hash(<var>record ID</var>) mod <var>number of lanes</var>
            </span>
            <figcaption>
              In plain words: turn the record&apos;s ID into a number and use
              the remainder to choose a lane. The same record always lands in
              the same lane, so its changes stay in order. Different records
              spread across the lanes, so many changes can be applied at the
              same time.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="queue">Every pipeline is a queue</h2>
            <p>
              Think of the checkout at a supermarket. Customers arrive at some
              rate, and each cashier serves them at some speed. A pipeline works
              the same way. Changes arrive at a rate we call <var>λ</var>{" "}
              (lambda), and each consumer applies them at a speed we call{" "}
              <var>μ</var> (mu). With <var>P</var> lanes and one consumer per
              lane, the question is how busy the consumers are:
            </p>
          </div>

          <figure className="formula">
            <span>
              <var>ρ</var> = <var>λ</var> / (<var>P</var> × <var>μ</var>)
            </span>
            <figcaption>
              ρ (rho) is how busy the consumers are. Below 1, they keep up. At 1
              or above, the line only gets longer.
            </figcaption>
          </figure>

          <div className="prose">
            <p>
              The surprising part is that the line gets long well before ρ
              reaches 1. In the classic queue model, the average time a change
              spends waiting and being applied is:
            </p>
          </div>

          <figure className="formula">
            <span>
              <var>W</var> = 1 / (<var>μ</var> − <var>λ</var> / <var>P</var>)
            </span>
            <figcaption>
              If the consumers go from half busy to 90% busy, the average wait
              becomes five times longer. That is why the number to watch is the
              lag: how many changes are still waiting.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="model">Try it yourself</h2>
            <p>
              The model below runs in your browser. Changes leave Oracle at
              random moments, get sorted into three lanes by record ID, and
              three consumers apply them to PostgreSQL. Each consumer handles 6
              changes per second, so together they can handle 18. Things to
              try:
            </p>
            <ul>
              <li>
                Push the rate above 18 changes per second and watch the waiting
                line grow without stopping.
              </li>
              <li>
                Stop the consumers, as if they were being updated, then start
                them again and watch the backlog clear.
              </li>
              <li>
                Press batch import to send 45 changes at once and watch the
                delay jump.
              </li>
            </ul>
          </div>

          <figure className="article-figure" id="model-figure">
            <PipelineSim />
            <figcaption className="caption">
              A simplified model written for this page. It does not use any code
              or data from the hospital&apos;s systems.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="left-out">What the model leaves out</h2>
            <p>
              The model shows two ideas: keeping each record&apos;s changes in
              order, and having enough capacity. A real pipeline needs more:
            </p>
            <ul>
              <li>
                <strong>Safe repeats.</strong> If a consumer crashes, it starts
                again from the last change it confirmed, so some changes get
                applied twice. Applying the same change twice must do no harm.
              </li>
              <li>
                <strong>Translating between databases.</strong> Oracle and
                PostgreSQL store some kinds of data differently, so every table
                needs clear rules for how its data is converted.
              </li>
              <li>
                <strong>Deletes and broken messages.</strong> A delete needs its
                own kind of message, and a message that can&apos;t be applied
                must be set aside instead of blocking its lane forever.
              </li>
              <li>
                <strong>Monitoring.</strong> Lag per lane, speed, and total
                delay, with alerts long before ρ gets close to 1.
              </li>
            </ul>
            <p>
              None of this is flashy. It is what lets a hospital move to a new
              system one piece at a time while the people using it never
              notice.
            </p>
          </div>

          <div className="article-cta">
            <p>Planning a migration like this?</p>
            <Link href="/#contact" className="button button-solid">
              Let’s talk
            </Link>
          </div>
      </div>
    </article>
  );
}
