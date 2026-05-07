"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { experienceNotes } from "../data";

export default function ExperienceSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [typedText, setTypedText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const selectedExperience =
    selectedIndex !== null ? experienceNotes[selectedIndex] : null;

  const selectedOverview = useMemo(
    () => selectedExperience?.overview ?? "",
    [selectedExperience],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedOverview) {
      setTypedText("");
      return;
    }

    setTypedText("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 2;
      setTypedText(selectedOverview.slice(0, index));

      if (index >= selectedOverview.length) {
        window.clearInterval(interval);
      }
    }, 14);

    return () => window.clearInterval(interval);
  }, [selectedOverview]);

  useEffect(() => {
    if (!selectedExperience) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedExperience]);

  const experienceModal =
    selectedExperience && isMounted
      ? createPortal(
          <div
            className="modern-experience-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedExperience.company} experience overview`}
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="modern-experience-modal-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modern-modal-top">
                <span>{selectedExperience.signal}</span>
                <button type="button" onClick={() => setSelectedIndex(null)}>
                  Close
                </button>
              </div>
              <h3>{selectedExperience.company}</h3>
              <p className="modern-modal-meta">
                {selectedExperience.role} / {selectedExperience.duration} /{" "}
                {selectedExperience.place}
              </p>
              <p className="modern-typed-text">
                {typedText}
                <span className="modern-type-caret" />
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section id="experience" className="modern-section modern-experience">
      <div className="modern-section-head">
        <p>Experience</p>
        <h2>A few places where the work became serious.</h2>
      </div>

      <div className="modern-experience-constellation">
        <svg
          className="modern-constellation-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 50 50 C 36 36, 27 23, 17 19"
            className="modern-constellation-path"
          />
          <path
            d="M 50 50 C 64 34, 73 22, 84 22"
            className="modern-constellation-path"
          />
          <path
            d="M 50 50 C 67 61, 76 74, 80 78"
            className="modern-constellation-path"
          />
          <path
            d="M 50 50 C 37 62, 27 76, 20 80"
            className="modern-constellation-path"
          />
          <path
            d="M 17 19 C 43 10, 63 12, 84 22 C 88 44, 88 62, 80 78 C 57 88, 37 88, 20 80 C 12 56, 12 36, 17 19"
            className="modern-constellation-loop"
          />
        </svg>

        <div className="modern-constellation-sparks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="modern-experience-core">
          <span className="modern-core-orbit" aria-hidden="true" />
          <span>Career Signal</span>
          <strong>4 chapters</strong>
          <p>Click a node to open the full story.</p>
        </div>

        {experienceNotes.map((item, index) => (
          <button
            key={item.company}
            className={`modern-experience-node exp-node-${index}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <span className="modern-node-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{item.signal}</span>
            <strong>{item.company}</strong>
            <small>
              {item.role} / {item.duration}
            </small>
            <p>{item.note}</p>
            <span className="modern-node-action">Open story</span>
          </button>
        ))}
      </div>

      {experienceModal}
    </section>
  );
}
