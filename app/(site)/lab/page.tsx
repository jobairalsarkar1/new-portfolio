import type { Metadata } from "next";
import Experiment, { type ExperimentId } from "./Experiment";

export const metadata: Metadata = {
  title: "Lab | Jobair Al Sarkar",
  robots: { index: false, follow: false },
};

// Every experiment gets an entry here, including ones that are not on the
// site any more, so the history of ideas stays in one place.
const experiments: { id: ExperimentId; name: string; note: string; status: string }[] = [
  {
    id: "ink",
    name: "Ink in water",
    note: "Stable fluids with vorticity confinement. Move through it slowly, then quickly.",
    status: "In the margins, 16:00 to 24:00",
  },
  {
    id: "pond",
    name: "Pond",
    note: "Damped wave equation, lit by the slope of the surface. Drag like a finger, click for a pebble.",
    status: "In the margins, 00:00 to 08:00",
  },
  {
    id: "threads",
    name: "Silk threads",
    note: "Verlet chains under gravity. Brush through the curtain and watch it settle.",
    status: "In the margins, 08:00 to 16:00",
  },
];

export default function LabPage() {
  return (
    <>
      <section className="intro">
        <h1>Lab</h1>
        <p>
          Experiments for this site, kept in one place. Each one stays still
          until you touch it.
        </p>
      </section>

      <div className="lab-grid">
        {experiments.map((experiment) => (
          <figure key={experiment.id} className="lab-panel">
            <Experiment id={experiment.id} />
            <figcaption>
              <strong>{experiment.name}</strong>
              <span>{experiment.note}</span>
              <span className="lab-status">{experiment.status}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
