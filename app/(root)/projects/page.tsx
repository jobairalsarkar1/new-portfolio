"use client";

// import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import { projects } from "@/lib/constants";
// import { Project } from "@/types/types";
// import { FiExternalLink } from "react-icons/fi";
import { FaArrowRight, FaRedo } from "react-icons/fa";
import { useFetch } from "@/lib/hooks/useFetch";
import ReactMarkdown from "react-markdown";
import { mutate } from "swr";

type Project = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const ProjectSkeleton = () => (
  <div className="animate-pulse border-2 border-gray-700 rounded-2xl bg-gradient-to-br from-gray-900 via-black to-gray-800 h-72 w-full" />
);

const Projects = () => {
  const {
    data: projects,
    isLoading,
    isError,
  } = useFetch<Project[]>("/api/projects", 3000);
  // const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  // const toggleExpand = (projectName: string) => {
  //   setExpanded((prev) => ({
  //     ...prev,
  //     [projectName]: !prev[projectName],
  //   }));
  // };

  return (
    <section className="relative py-12 px-8 text-white z-30">
      <div className="px-1 sm:px-4 py-4 rounded-lg mt-8">
        <h3 className="head-text">
          My{" "}
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
            Projects
          </span>
        </h3>
        <p className="subhead-text text-gray-200 mt-4 sm:text-justify">
          From front-end designs to full-stack implementations, these projects
          showcase my ability to craft functional and visually appealing Web
          Applications. Explore my work to see the range of my technical
          expertise.
        </p>
      </div>

      {/* <div className="mx-1 md:mx-4 mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <div
            key={project.name}
            className="group relative border-2 border-gray-700 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-lg hover:shadow-xl"
          >
            <div className="overflow-hidden">
              <Image
                src={project.iconUrl}
                alt={project.name}
                width={500}
                height={224}
                className="w-full h-56 object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="inline-block text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text mb-3">
                {project.name}
              </h3>

              <p className="text-sm text-gray-300 mb-4 text-justify leading-relaxed">
                {expanded[project.name]
                  ? project.description
                  : `${project.description.substring(0, 200)}`}
                &nbsp;
                {project.description.length > 200 && (
                  <button
                    onClick={() => toggleExpand(project.name)}
                    className="text-teal-400 font-bold hover:underline focus:outline-none"
                  >
                    {expanded[project.name] ? "...show less" : "...Read more"}
                  </button>
                )}
              </p>

              <div className="flex gap-2 items-center justify-between mb-4">
                {project.link && (
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition duration-300"
                  >
                    Visit
                    <FiExternalLink className="w-4 h-4" />
                  </Link>
                )}
                {project.gitLink && (
                  <Link
                    href={project.gitLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition duration-300"
                  >
                    Contact for Details
                    <FiExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <ul className="flex flex-wrap gap-2">
                {project.stacks.map((stack) => (
                  <li
                    key={stack.name}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${stack.color} bg-opacity-20 border border-gray-500 border-opacity-80`}
                  >
                    #{stack.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div> */}

      {/* Projects Grid */}
      {isLoading && (
        <div className="mx-1 md:mx-4 mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <ProjectSkeleton key={idx} />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-gray-300 text-lg font-semibold">
            Failed to load projects!
          </p>
          <button
            onClick={() => mutate("/api/projects")}
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
      )}

      {!isLoading && !isError && (
        <div className="mx-1 md:mx-4 mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Link
              href={`/projects/${project.slug}`}
              key={project.id}
              className="group relative border-2 border-gray-700 rounded-2xl overflow-hidden 
             bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-lg 
             hover:shadow-xl transition-all duration-300"
            >
              {/* Image + Overlay Container */}
              <div className="relative w-full h-56 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={project.coverImage}
                  alt={project.name}
                  width={500}
                  height={224}
                  className="w-full h-full object-cover"
                />

                {/* 🔹 Smooth fog at bottom */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1/5
                 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3
                  className="inline-block text-2xl font-bold 
                   bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 
                   text-transparent bg-clip-text mb-2"
                >
                  {project.name}
                </h3>
                <div className="text-sm text-gray-400">
                  <ReactMarkdown>
                    {project.description.length > 80
                      ? project.description.substring(0, 80) + "..."
                      : project.description.substring(0, 80) + "..."}
                  </ReactMarkdown>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 px-1 sm:px-4 flex justify-end items-center">
        <Link
          href="/contact"
          className="flex items-center gap-5 text-lg font-semibold border border-gray-500 px-4 py-2 bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 text-white rounded-lg shadow-md hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300"
        >
          Let&apos;s Bring Your Idea to Life
          <FaArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default Projects;
