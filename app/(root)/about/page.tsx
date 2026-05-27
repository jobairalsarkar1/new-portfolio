"use client";

import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaRedo } from "react-icons/fa";
// import { techs } from "@/lib/constants";
// import DonutChart from "@/components/charts/DonutChart";
// import AreaChart from "@/components/charts/AreaChart";
// import BarChart from "@/components/charts/BarChart";
import { useFetch } from "@/lib/hooks/useFetch";
import SkillSkeleton from "@/components/loaders/SkillSkeleton";
import { mutate } from "swr";

type Skill = {
  id: string;
  name: string;
  iconUrl: string;
  needsBg?: boolean;
  createdAt: string;
};

const experiences = [
  {
    role: "Software Engineer",
    company: "FringeCore_",
    type: "Full time",
    duration: "Nov 2025 to Present · 7 mos",
    location: "Dhaka, Bangladesh",
    mode: "On site",
    summary:
      "I work on a Hospital Information System and ERP platform for Asgar Ali Hospital, contributing across frontend, backend, shared application layers, and database integration.",
    highlights: [
      "Collaborate with business stakeholders and design teams to turn hospital operations into scalable software flows.",
      "Work within a monorepo architecture using TypeScript, React, Node.js, tRPC, PostgreSQL, and Oracle.",
      "Contributed to a Kafka based CDC synchronization pipeline for gradual Oracle to PostgreSQL migration.",
      "Improved patient appointment and scheduling flows by simplifying complex operational steps.",
      "Participate in architecture discussions around data flow, scalability, maintainability, and legacy modernization.",
      "Build software that supports real hospital operations instead of isolated demo features.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "Picture TV",
    type: "Contract",
    duration: "Jun 2025 to Jan 2026 · 8 mos",
    location: "New York, United States",
    mode: "Remote",
    summary:
      "At Picture TV, I worked on a content driven marketplace platform for buying and selling images and videos, event booking, blogging, and media focused features.",
    highlights: [
      "Worked from planning and system structure to core feature development and user experience refinement.",
      "Built with Next.js, React, Tailwind CSS, Prisma, and MongoDB.",
      "Implemented JWT based magic links and role based access for different user types.",
      "Integrated Stripe payment workflows and Cloudinary media handling.",
      "Built admin dashboard tools for users, events, blog content, and uploaded media.",
      "Balanced fast delivery with maintainability and product growth.",
    ],
  },
  {
    role: "Software Engineer (Intern)",
    company: "Logic Matrix",
    type: "Internship",
    duration: "Feb 2025 to May 2025 · 4 mos",
    location: "Manassas, Virginia, United States",
    mode: "Remote",
    summary:
      "During the internship, I contributed to full stack development across frontend and backend features while learning how production systems evolve in a team.",
    highlights: [
      "Built and refined features using Next.js, React, Express, Tailwind CSS, PostgreSQL, and Prisma.",
      "Worked with Azure AI Video Indexer for video processing, transcription, and automated media insights.",
      "Contributed to Stripe subscription flows and authentication related product work.",
      "Helped improve delivery and performance using Cloudflare.",
      "Took part in debugging, code reviews, and backend scalability discussions.",
      "Grew from building individual features to thinking more about maintainability and system design.",
    ],
  },
  {
    role: "Full Stack Developer",
    company: "Self Employed",
    type: "Freelance",
    duration: "Jun 2023 to Oct 2024 · 1 yr 5 mos",
    location: "Remote",
    mode: "Client Work",
    summary:
      "Before joining structured engineering teams, I worked as a freelance full stack developer building web applications for different clients and use cases.",
    highlights: [
      "Handled planning, architecture, development, deployment, and client communication.",
      "Built projects using Next.js, React, Node.js, Prisma, MongoDB, and PostgreSQL.",
      "Implemented authentication systems, admin dashboards, payment flows, and media handling.",
      "Learned to understand business needs before writing code.",
      "Built ownership habits around scope, delivery, tradeoffs, and practical technical decisions.",
    ],
  },
];

const About = () => {
  const { data: skills, isLoading, isError } = useFetch<Skill[]>("/api/skills");

  return (
    <section className="relative pt-22 py-12 px-8 text-white bg-transparent z-30">
      <div className="mx-1 md:mx-4 py-4 rounded-lg">
        {/* border-2 border-gray-600 px-5 */}
        <h3 className="head-text">
          Hi I&apos;m{" "}
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
            Jobair Al Sarkar
          </span>
        </h3>
        {/* <p className="subhead-text text-gray-200 mt-4 sm:text-justify">
          I’m a passionate full-stack developer who loves creating seamless web
          applications. I enjoy solving complex problems and turning ideas into
          user-friendly functional solutions. Always eager to learn and grow. My
          goal is to build meaningful software that makes a difference.
        </p> */}
        <p className="subhead-text text-gray-200 mt-4 sm:text-justify">
          I am a&nbsp;
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-semibold">
            Full Stack Software Engineer
          </span>
          &nbsp;with nearly 3 years of experience building web applications,
          backend systems, and production focused platforms. I started through
          self driven learning in 2022, moved into freelance client work, and
          later transitioned into structured engineering roles across product
          and enterprise environments.
          <br />
          <br />
          My current focus is building reliable software where frontend,
          backend, database work, and real business operations meet. I enjoy
          systems that have real user impact, especially backend focused
          products, scalable workflows, and full stack applications that solve
          practical problems.
        </p>
      </div>

      <div className="mx-1 md:mx-4 border-2 border-gray-600 px-5 py-5 rounded-lg mt-4 overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="head-text">
              Work{" "}
              <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
                Experience
              </span>
            </h2>
            <p className="text-gray-300 mt-2 text-base sm:text-lg">
              Product work, enterprise systems, and client projects across
              frontend, backend, databases, and cloud integrations.
            </p>
          </div>
          <div className="text-sm text-gray-400 border border-gray-700 rounded-lg px-3 py-1.5 bg-black/40 w-fit">
            2022 to Present
          </div>
        </div>

        <div className="relative mt-7">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600 hidden sm:block" />

          <div className="space-y-5">
            {experiences.map((experience) => (
              <article
                key={`${experience.company}-${experience.duration}`}
                className="relative sm:pl-10 rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900/90 via-black/80 to-gray-900/90 p-4 shadow-lg shadow-indigo-950/20"
              >
                <span className="absolute left-[7px] top-6 hidden h-3 w-3 rounded-full border-2 border-teal-300 bg-black shadow-[0_0_18px_rgba(45,212,191,0.8)] sm:block" />

                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
                      {experience.role}
                    </h3>
                    <p className="mt-1 text-gray-200 font-semibold">
                      {experience.company}{" "}
                      <span className="text-gray-500">/</span>{" "}
                      <span className="text-gray-300">{experience.type}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs sm:justify-end">
                    <span className="rounded-full border border-gray-600 bg-gray-900 px-3 py-1 text-gray-300">
                      {experience.duration}
                    </span>
                    <span className="rounded-full border border-gray-600 bg-gray-900 px-3 py-1 text-gray-300">
                      {experience.mode}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  {experience.location}
                </p>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  {experience.summary}
                </p>

                <ul className="mt-4 grid gap-2 text-sm text-gray-300 md:grid-cols-3">
                  {experience.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-md border border-gray-800 bg-black/40 px-3 py-2 leading-relaxed"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-1 md:mx-4 border-2 border-gray-600 px-5 py-4 rounded-lg mt-4">
        <h2 className="head-text text-center sm:text-start">
          My{" "}
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
            Skills
          </span>
        </h2>
        {/* <div className="mt-4 flex gap-3 flex-wrap items-center justify-center">
          {techs.map((tech, index: number) => (
            <div
              key={tech.name}
              className={`w-12 h-12 border flex items-center justify-center rounded-lg hover:bg-slate-100 animate-pulse relative group ${
                tech.needsBg ? "bg-white" : "bg-gray-800"
              }`}
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <Image
                src={tech.icon}
                alt={tech.name}
                className="w-10 h-10 bg-cover"
                width={40}
                height={40}
              />
              <div className="absolute -top-5 -right-2 bg-gray-700 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center rounded-lg font-bold">
                {tech.name}
              </div>
            </div>
          ))}
        </div> */}

        {isLoading ? (
          <SkillSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-gray-300 text-lg font-semibold">
              Failed to load skills.
            </p>
            <button
              onClick={() => mutate("/api/skills")}
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
        ) : (
          <div className="mt-4 flex gap-3 flex-wrap items-center justify-center">
            {skills?.map((skill, index: number) => (
              <div
                key={skill.id}
                className={`w-12 h-12 border border-gray-600 flex items-center justify-center rounded-lg hover:bg-slate-100 animate-pulse relative group cursor-help ${
                  skill.needsBg ? "bg-white" : "bg-gray-800"
                }`}
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <Image
                  src={skill.iconUrl}
                  alt={skill.name}
                  className="w-10 h-10 bg-cover"
                  width={40}
                  height={40}
                />
                <div className="absolute -top-5 -right-2 bg-gray-700 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center rounded-lg font-bold">
                  {skill.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* <div className="mx-1 md:mx-4 mt-4 grid gap-2 lg:grid-cols-2">
        <div className="border-2 border-gray-600 px-4 py-2 rounded-md flex flex-col items-center justify-center overflow-hidden">
          <h1 className="text-2xl mb-2 font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
            Languages
          </h1>
          <DonutChart />
        </div>
        <div className="border-2 border-gray-600 px-4 py-2 rounded-md flex flex-col items-center justify-center overflow-hidden">
          <h1 className="text-2xl mb-4 font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
            Frameworks
          </h1>
          <AreaChart />
        </div>
        <div className="border-2 border-gray-600 px-4 py-2 rounded-md flex flex-col items-center justify-center lg:col-span-2 overflow-hidden">
          <h1 className="text-2xl mb-4 font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
            Tools & Libraries
          </h1>
          <BarChart />
        </div>
      </div> */}

      <div className="mt-5 px-1 sm:px-4 flex justify-end items-center">
        <Link
          href="/projects"
          className="flex items-center gap-5 text-base sm:text-lg font-semibold border border-gray-500 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 text-white rounded-lg shadow-md hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300"
        >
          Explore My Work & Projects
          <FaArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default About;
