"use client";

import Image from "next/image";
import Link from "next/link";
import { useFetch } from "@/lib/hooks/useFetch";

type Skill = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  description: string;
  priority: number;
  skills?: Skill[];
};

function stripMarkdown(value: string) {
  return value
    .replace(/[#_*`>[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function WorkSection() {
  const { data: projects, isLoading } = useFetch<Project[]>(
    "/api/projects",
    5000,
  );
  const visibleProjects = projects?.slice(0, 9) ?? [];

  return (
    <section id="work" className="modern-section">
      <div className="modern-section-head modern-explore-head">
        <p>Selected work</p>
        <h2>A visual wall of products, systems, and experiments.</h2>
      </div>

      <div className="modern-explore-grid">
        {isLoading
          ? Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className={`modern-explore-tile loading-card tile-${index}`}
              />
            ))
          : visibleProjects.map((project, index) => (
              <Link
                href={`/projects/${project.slug}`}
                key={project.id}
                className={`modern-explore-tile tile-${index}`}
              >
                <Image
                  src={project.coverImage}
                  alt={project.name}
                  width={760}
                  height={760}
                  className="modern-explore-image"
                />
                <div className="modern-explore-overlay">
                  <div>
                    <span>
                      {project.skills
                        ?.slice(0, 3)
                        .map((skill) => skill.name)
                        .join(" / ") || "Case study"}
                    </span>
                    <h3>{project.name}</h3>
                  </div>
                  <p>{stripMarkdown(project.description).slice(0, 95)}...</p>
                </div>
              </Link>
            ))}
      </div>

      <div className="modern-work-footer">
        <Link href="/projects" className="modern-secondary">
          View the full archive
        </Link>
        <div>
          <span>{projects?.length ?? 0}</span>
          <p>projects currently connected</p>
        </div>
      </div>
    </section>
  );
}
