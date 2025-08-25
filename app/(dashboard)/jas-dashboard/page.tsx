"use client";

import React from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import axios from "axios";
import { FaUsers, FaMicrochip, FaFolder, FaFileAlt } from "react-icons/fa";
import ActionLoader from "@/components/loaders/ActionLoader";

type Counts = {
  users: number;
  skills: number;
  projects: number;
  blogs: number;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Dashboard() {
  const { data: session } = useSession();

  // SWR hooks with 60s refresh interval
  const { data: usersData, isLoading: usersLoading } = useSWR(
    "/api/users",
    fetcher,
    { refreshInterval: 60000 }
  );
  const { data: skillsData, isLoading: skillsLoading } = useSWR(
    "/api/skills",
    fetcher,
    { refreshInterval: 60000 }
  );
  const { data: projectsData, isLoading: projectsLoading } = useSWR(
    "/api/projects",
    fetcher,
    { refreshInterval: 60000 }
  );

  const loading = usersLoading || skillsLoading || projectsLoading;

  const counts: Counts = {
    users: usersData?.data?.length || 0,
    skills: skillsData?.data?.length || 0,
    projects: projectsData?.data?.length || 0,
    blogs: 0, // static
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ActionLoader />
      </div>
    );
  }

  return (
    <div className="bg-transparent w-full min-h-screen p-6 text-white">
      {/* Welcome */}
      <h1 className="text-2xl font-bold mb-2">
        Welcome back,{" "}
        <span className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
          {session?.user?.name || "User"} 👋
        </span>
      </h1>
      <p className="text-gray-400 mb-8">
        Here’s what’s happening in your dashboard today.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Users"
          count={counts.users}
          icon={<FaUsers className="text-blue-400" size={24} />}
          subtitle="Total registered users"
        />
        <StatCard
          title="Skills"
          count={counts.skills}
          icon={<FaMicrochip className="text-green-400" size={24} />}
          subtitle="Skills in system"
        />
        <StatCard
          title="Projects"
          count={counts.projects}
          icon={<FaFolder className="text-yellow-400" size={24} />}
          subtitle="Projects created"
        />
        <StatCard
          title="Blogs"
          count={counts.blogs}
          icon={<FaFileAlt className="text-pink-400" size={24} />}
          subtitle="Blog posts published"
        />
      </div>
    </div>
  );
}

// StatCard component
function StatCard({
  title,
  count,
  icon,
  subtitle,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="bg-black/40 backdrop-blur-2xl shadow-lg rounded-xl p-5 flex flex-col items-start">
      <div className="flex items-center justify-between w-full mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {icon}
      </div>
      <p className="text-3xl font-bold">{count}</p>
      <span className="text-sm text-gray-400">{subtitle}</span>
    </div>
  );
}
