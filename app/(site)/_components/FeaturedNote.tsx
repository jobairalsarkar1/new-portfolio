import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { noteHref, notes } from "../_lib/writing";

const lanes = [28, 56, 84];

function MiniPipeline() {
  return (
    <svg className="mini-pipeline" viewBox="0 0 320 112" aria-hidden>
      <rect x="1" y="38" width="44" height="36" rx="7" className="mini-box" />
      <rect x="275" y="38" width="44" height="36" rx="7" className="mini-box mini-store" />
      <text x="23" y="96" className="mini-label">Oracle</text>
      <text x="297" y="96" className="mini-label">Postgres</text>
      {lanes.map((y, lane) => (
        <g key={y}>
          <path
            d={`M45 56 C 80 56, 80 ${y}, 110 ${y} L 210 ${y} C 240 ${y}, 240 56, 275 56`}
            className="mini-wire"
          />
          {[0, 1, 2].map((dot) => (
            <circle
              key={dot}
              r="3.2"
              className={dot === 1 ? "mini-dot mini-dot-accent" : "mini-dot"}
            >
              <animateMotion
                dur={`${2.6 + lane * 0.45}s`}
                begin={`${dot * 0.9 + lane * 0.3}s`}
                repeatCount="indefinite"
                path={`M45 56 C 80 56, 80 ${y}, 110 ${y} L 210 ${y} C 240 ${y}, 240 56, 275 56`}
              />
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function FeaturedNote() {
  const note = notes[0];

  return (
    <Link href={noteHref(note)} className="featured-note" data-reveal>
      <div className="featured-note-copy">
        <span className="note-context">
          {note.context}
          <span className="badge">Interactive</span>
        </span>
        <strong>{note.title}</strong>
        <span className="featured-note-summary">{note.summary}</span>
        <span className="featured-note-cta">
          Read the deep dive <FiArrowRight aria-hidden />
        </span>
      </div>
      <MiniPipeline />
    </Link>
  );
}
