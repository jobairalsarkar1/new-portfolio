import type { Metadata } from "next";
import InkPanel from "./InkPanel";
import PondPanel from "./PondPanel";
import ThreadsPanel from "./ThreadsPanel";

export const metadata: Metadata = {
  title: "Lab | Jobair Al Sarkar",
  robots: { index: false, follow: false },
};

const panels = [
  {
    key: "A",
    name: "Ink in water",
    note: "Move through it slowly, then quickly. The ink curls and slowly fades.",
    Panel: InkPanel,
  },
  {
    key: "B",
    name: "Pond",
    note: "Drag your cursor like a finger through water. Click to drop a pebble.",
    Panel: PondPanel,
  },
  {
    key: "C",
    name: "Silk threads",
    note: "Brush your cursor through the curtain and watch it settle.",
    Panel: ThreadsPanel,
  },
];

export default function LabPage() {
  return (
    <>
      <section className="intro">
        <h1>Lab</h1>
        <p>
          Three ideas for the empty margins. Try each one with your cursor; they
          stay perfectly still until you touch them.
        </p>
      </section>

      <div className="lab-grid">
        {panels.map(({ key, name, note, Panel }) => (
          <figure key={key} className="lab-panel">
            <Panel />
            <figcaption>
              <strong>
                {key}. {name}
              </strong>
              <span>{note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
