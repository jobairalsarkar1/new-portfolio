"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useFetch } from "@/lib/hooks/useFetch";

type Skill = {
  id: string;
  name: string;
  iconUrl: string;
  needsBg?: boolean;
  priority: number;
};

export default function SkillsStrip() {
  const { data: skills, isLoading } = useFetch<Skill[]>("/api/skills");
  const visibleSkills = skills?.slice(0, 18) ?? [];

  return (
    <section className="modern-section modern-skills" aria-label="Skills">
      <div className="modern-section-head modern-section-head-compact">
        <p>Stack</p>
        <h2>The tools I reach for when ideas need to become real.</h2>
      </div>

      <div className="modern-skill-orbit">
        {isLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="modern-skill-chip modern-skill-chip-loading"
              />
            ))
          : visibleSkills.map((skill, index) => (
              <span
                key={skill.id}
                className="modern-skill-chip"
                style={{ "--delay": `${index * 54}ms` } as CSSProperties}
              >
                <span
                  className={`modern-skill-icon ${skill.needsBg ? "needs-bg" : ""}`}
                >
                  <Image
                    src={skill.iconUrl}
                    alt={skill.name}
                    width={22}
                    height={22}
                  />
                </span>
                {skill.name}
              </span>
            ))}
      </div>
    </section>
  );
}
