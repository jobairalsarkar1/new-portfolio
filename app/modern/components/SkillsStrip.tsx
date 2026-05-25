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

type SkillGroup = {
  title: string;
  description: string;
  skills: string[];
};

const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    description: "Languages I use across application and systems work.",
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C#"],
  },
  {
    title: "Frontend",
    description: "Product interfaces, dashboards, and interactive screens.",
    skills: ["React.js", "Next.js", "React Native", "Tailwind CSS", "Three.js"],
  },
  {
    title: "Backend & Systems",
    description: "APIs, services, architecture, and data movement.",
    skills: [
      "Node.js",
      "Express.js",
      "Django",
      "Flask",
      ".NET",
      "Laravel",
      "Prisma",
      "tRPC",
      "Monorepo Architecture",
      "Kafka/CDC Data Pipelines",
    ],
  },
  {
    title: "Databases",
    description: "Storage layers I have used in real projects.",
    skills: ["PostgreSQL", "MongoDB", "Oracle", "MySQL"],
  },
  {
    title: "Cloud & DevOps",
    description: "Deployment, tooling, integrations, and delivery workflows.",
    skills: [
      "Git",
      "GitHub",
      "Docker",
      "Cloudflare",
      "Azure",
      "Turborepo",
      "Postman",
      "Azure OpenAI",
      "Stripe",
      "Cloudinary",
    ],
  },
];

const skillAliases: Record<string, string> = {
  Jave: "Java",
};

function getDisplayName(skill: Skill) {
  return skillAliases[skill.name] ?? skill.name;
}

function getSkillMatch(skillsByName: Map<string, Skill>, name: string) {
  const skill = skillsByName.get(name);

  return {
    name,
    skill,
  };
}

export default function SkillsStrip() {
  const { data: skills, isLoading } = useFetch<Skill[]>("/api/skills");
  const skillsByName = new Map(
    (skills ?? []).map((skill) => [getDisplayName(skill), skill]),
  );

  return (
    <section className="modern-section modern-skills" aria-label="Skills">
      <div className="modern-section-head modern-section-head-compact">
        <p>Stack</p>
        <h2>A cleaner view of the stack behind the work.</h2>
      </div>

      <div className="modern-skill-groups">
        {isLoading
          ? Array.from({ length: 6 }).map((_, groupIndex) => (
              <div key={groupIndex} className="modern-skill-group">
                <span className="modern-skill-group-title-loading" />
                <div className="modern-skill-orbit">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="modern-skill-chip modern-skill-chip-loading"
                    />
                  ))}
                </div>
              </div>
            ))
          : skillGroups.map((group) => {
              const groupSkills = group.skills.map((name) =>
                getSkillMatch(skillsByName, name),
              );

              if (groupSkills.length === 0) {
                return null;
              }

              return (
                <div key={group.title} className="modern-skill-group">
                  <div className="modern-skill-group-head">
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <div className="modern-skill-orbit">
                    {groupSkills.map(({ name, skill }, index) => (
                      <span
                        key={skill?.id ?? name}
                        className={`modern-skill-chip ${skill ? "" : "text-only"}`}
                        style={
                          { "--delay": `${index * 54}ms` } as CSSProperties
                        }
                      >
                        {skill && (
                          <span
                            className={`modern-skill-icon ${skill.needsBg ? "needs-bg" : ""}`}
                          >
                            <Image
                              src={skill.iconUrl}
                              alt={getDisplayName(skill)}
                              width={22}
                              height={22}
                            />
                          </span>
                        )}
                        {skill ? getDisplayName(skill) : name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}
