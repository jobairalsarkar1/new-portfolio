"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaRedo } from "react-icons/fa";
import GradientButton from "@/components/dashboard/GradientButton";
import InProjectSkeletonLoader from "@/components/loaders/InProjectSkeletonLoader";
import dynamic from "next/dynamic";

// Markdown preview
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

type Skill = {
  id: string;
  name: string;
  iconUrl: string;
  needsBg: boolean;
  priority: number;
};

type Project = {
  id: string;
  name: string;
  heroImage?: string;
  link?: string;
  gitLink?: string;
  canContact?: boolean;
  description: string;
  priority
  skills: Skill[];
};

const ProjectPage = () => {
  const { slug } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProject = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/projects/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setProject(json.data);
    } catch {
      setError(true);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <InProjectSkeletonLoader />;

  if (error || !project)
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-red-500 text-lg font-semibold">
          Failed to load project!
        </p>
        <button
          onClick={fetchProject}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-600 
                     bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 
                     text-white font-semibold shadow-md
                     hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 
                     transition-all duration-300 ease-in-out hover:animate-[wiggle_0.3s_ease-in-out] cursor-pointer"
        >
          <FaRedo className="w-4 h-4" />
          Retry
        </button>
      </div>
    );

  return (
    <section className="relative pt-24 py-12 px-8 sm:px-12 text-white z-30">
      {/* Hero Image */}
      {project.heroImage && (
        <div className="mb-6 w-full h-96 relative rounded-lg overflow-hidden shadow-lg">
          <Image
            src={project.heroImage}
            alt={project.name}
            fill
            className="object-cover w-full h-full rounded-lg"
          />
        </div>
      )}

      {/* Project Name */}
      <h1 className="inline-block text-3xl sm:text-4xl font-bold mb-6 py-2 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
        {project.name}
      </h1>

      {/* Skills */}
      {project.skills.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {project.skills.map((skill) => (
            <div
              key={skill.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                skill.needsBg
                  ? "bg-gray-200 border-gray-600 text-black font-semibold"
                  : "bg-transparent border-gray-500"
              }`}
            >
              <Image
                src={skill.iconUrl}
                alt={skill.name}
                width={20}
                height={20}
                className="rounded"
              />
              <span className="text-xs">{skill.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="mb-10 flex flex-wrap gap-4">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 font-semibold rounded-lg bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white shadow hover:scale-105 transition-transform duration-300"
          >
            Visit Site <FaExternalLinkAlt />
          </a>
        )}
        {project.gitLink && (
          <a
            href={project.gitLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 font-semibold rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow hover:scale-105 transition-transform duration-300"
          >
            GitHub <FaExternalLinkAlt />
          </a>
        )}
        {project.canContact && (
          <Link
            href="/contact"
            className="flex items-center gap-2 px-5 py-2 font-semibold rounded-lg bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white shadow hover:scale-105 transition-transform duration-300"
          >
            Reach Out About
            <span className="font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
              &ldquo;{project.name}&rdquo;
            </span>
          </Link>
        )}
      </div>

      {/* Description */}
      <div>
        <MarkdownPreview
          source={project.description}
          className="prose prose-invert max-w-full no-bg"
        />
      </div>

      {/* Go Back Button */}
      <div className="mt-8">
        <GradientButton onClick={() => router.back()}>Go Back</GradientButton>
      </div>
    </section>
  );
};

export default ProjectPage;
