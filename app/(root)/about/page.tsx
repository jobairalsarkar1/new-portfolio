"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { FaArrowRight } from "react-icons/fa";
import { techs } from "@/lib/constants";
import DonutChart from "@/components/charts/DonutChart";
import AreaChart from "@/components/charts/AreaChart";
import BarChart from "@/components/charts/BarChart";

interface Tech {
  name: string;
  icon: StaticImageData | string;
  needsBg?: boolean;
}

const About = () => {
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
        <p className="subhead-text text-gray-200 mt-4 sm:text-justify">
          I’m a passionate full-stack developer who loves creating seamless web
          applications. I enjoy solving complex problems and turning ideas into
          user-friendly functional solutions. Always eager to learn and grow. My
          goal is to build meaningful software that makes a difference.
        </p>
      </div>

      <div className="mx-1 md:mx-4 border-2 border-gray-600 px-5 py-4 rounded-lg mt-4">
        <h2 className="head-text text-center sm:text-start">
          My{" "}
          <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text font-extrabold">
            Skills
          </span>
        </h2>
        <div className="mt-4 flex gap-3 flex-wrap items-center justify-center">
          {techs.map((tech: Tech, index: number) => (
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
        </div>
      </div>

      <div className="mx-1 md:mx-4 mt-4 grid gap-2 lg:grid-cols-2">
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
      </div>

      <div className="mt-5 px-1 sm:px-4 flex justify-end items-center">
        <Link
          href="/projects"
          className="flex items-center gap-5 text-[0.9rem] font-semibold border border-gray-500 px-4 py-2 bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 text-white rounded-lg shadow-md hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300"
        >
          Explore My Projects
          <FaArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default About;
