"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: projects, isLoading } = useFetch<Project[]>(
    "/api/projects",
    5000,
  );
  const projectCount = projects?.length ?? 0;
  const visibleProjects = isExpanded ? (projects ?? []) : projects?.slice(0, 5) ?? [];
  const hasMoreProjects = projectCount > 5;

  return (
    <section id="work" className="modern-section">
      <div className="modern-section-head modern-explore-head" data-reveal>
        <p>
          <span className="modern-index">03</span>Selected work
        </p>
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
                href={`/work/${project.slug}`}
                key={project.id}
                className={`modern-explore-tile tile-${index}`}
                data-reveal
                data-spot
                data-tilt="3"
                style={{ "--d": `${(index % 3) * 90}ms` } as CSSProperties}
              >
                <div className="modern-explore-media">
                  <Image
                    src={project.coverImage}
                    alt={project.name}
                    width={760}
                    height={520}
                    className="modern-explore-image"
                  />
                  <span className="modern-explore-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="modern-explore-arrow" aria-hidden="true">
                    <FiArrowUpRight />
                  </span>
                </div>
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

      <div className="modern-work-footer" data-reveal data-spot>
        <div className="modern-work-footer-actions">
          {hasMoreProjects && (
            <button
              type="button"
              className="modern-secondary"
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? "Show fewer" : `Show all ${projectCount}`}
            </button>
          )}
          <Link href="/projects" className="modern-secondary">
            View archive
          </Link>
        </div>
        <div>
          <span>{isExpanded ? projectCount : visibleProjects.length}</span>
          <p>
            {isExpanded
              ? "projects currently shown"
              : `of ${projectCount} projects shown`}
          </p>
        </div>
      </div>
    </section>
  );
}
