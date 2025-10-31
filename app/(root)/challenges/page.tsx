"use client";

import { FiExternalLink } from "react-icons/fi";

const problems = [
  { name: "Block Graph", url: "/block-graph" },
  {
    name: "Relationship Visualizer",
    url: "/relationship-visualizer",
  },
  { name: "Recursive Partitioning", url: "/recursive-partitioning" },
  { name: "Video Player", url: "/video-player" },
  { name: "Bouncing Ball", url: "/bouncing-ball" },
  // Add more problems here
];

const Solutions = () => {
  return (
    <section className="relative pt-24 px-8 sm:px-12 py-12 min-h-screen text-white">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <h3 className="head-text inline-block bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
          My Solutions
        </h3>
        <p className="subhead-text text-gray-200 mt-4 sm:text-justify">
          Explore some of the problems and assessments I have solved. Click any
          card to view the solution.
        </p>

        {/* Problems Flex Container */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {problems.map((problem, index) => (
            <a
              key={index}
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 px-6 py-4 border border-gray-600 rounded-xl bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 shadow-lg transition-all duration-300 font-semibold text-white text-center"
            >
              {problem.name}
              <FiExternalLink />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
