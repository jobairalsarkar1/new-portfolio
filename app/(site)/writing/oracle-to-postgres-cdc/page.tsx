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

const laneExample = [
  { change: "Appointment #48213 is booked", lane: 1 },
  { change: "Patient #10577 updates their address", lane: 3 },
  { change: "Appointment #48213 moves to 4 pm", lane: 1 },
  { change: "Bill #92004 is paid", lane: 2 },
];

const waitExample = [
  { busy: "50%", times: 1 },
  { busy: "75%", times: 2 },
  { busy: "90%", times: 5 },
  { busy: "95%", times: 10 },
];

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
              At FringeCore_ I work on a new hospital system for Asgar Ali
              Hospital. The new system saves its data in PostgreSQL, while parts
              of the old system still save their data in Oracle.
            </p>
            <p>
              A hospital can&apos;t switch everything off for a weekend and move it all
              at once. So for a while, both databases run side by side and the
              system moves over one part at a time. While that happens, the
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
              Change data capture, or CDC, is a better fit here. Databases like
              Oracle keep a log of every change they save, a bit like a diary. CDC reads that
              diary and turns every new entry into a small message: this record
              was added, this record was changed, or this record was deleted.
            </p>
            <p>
              Those messages go into Kafka, a system built to carry large
              streams of messages reliably. On the other side, small
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
              not. So every change is sent to a lane picked from the record&apos;s
              ID. The same record always gets the same lane:
            </p>
          </div>

          <figure className="example">
            <ol className="lane-example">
              {laneExample.map((row) => (
                <li key={row.change}>
                  <span>{row.change}</span>
                  <span className="lane-chip" data-lane={row.lane}>
                    Lane {row.lane}
                  </span>
                </li>
              ))}
            </ol>
            <figcaption>
              Both changes to appointment #48213 go to lane 1, so they are
              applied in the right order. Other records use other lanes and are
              handled at the same time.
            </figcaption>
          </figure>

          <div className="prose">
            <h2 id="queue">Every pipeline is a queue</h2>
            <p>
              Think of the checkout at a supermarket. Customers arrive at some
              rate, and each cashier serves them at some speed. A pipeline works
              the same way: changes arrive, and consumers apply them. What
              matters is how busy the consumers are.
            </p>
          </div>

          <figure className="example">
            <p className="example-title">8 changes arrive each second</p>
            <div className="meter" role="img" aria-label="Consumers are 44% busy">
              <span style={{ width: "44%" }} />
            </div>
            <p className="meter-scale">
              <span>Three consumers can apply 18 per second</span>
              <strong>44% busy</strong>
            </p>
            <figcaption>
              While the consumers are less than fully busy, they keep up. Once
              more changes arrive than they can apply, the waiting line grows
              and never shrinks on its own.
            </figcaption>
          </figure>

          <div className="prose">
            <p>
              The surprising part is that the line gets long well before the
              consumers are fully busy. This is how the average wait grows as
              they get busier:
            </p>
          </div>

          <figure className="example">
            <ol className="bars">
              {waitExample.map((row) => (
                <li key={row.busy}>
                  <span className="bars-label">{row.busy} busy</span>
                  <span className="bars-track">
                    <span style={{ width: `${row.times * 10}%` }} />
                  </span>
                  <span className="bars-value">{row.times}× the wait</span>
                </li>
              ))}
            </ol>
            <figcaption>
              In the standard queueing model, going from half busy to 90% busy
              makes the average wait five times longer. That is why the number to watch is the lag: how many
              changes are still waiting.
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
                delay, with alerts long before the consumers are fully busy.
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
