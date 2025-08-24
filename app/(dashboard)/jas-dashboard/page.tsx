"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaUsers, FaMicrochip, FaFolder, FaFileAlt } from "react-icons/fa";
import ActionLoader from "@/components/loaders/ActionLoader";

type Counts = {
  users: number;
  skills: number;
  projects: number;
  blogs: number; // For now, static
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [counts, setCounts] = useState<Counts>({
    users: 0,
    skills: 0,
    projects: 0,
    blogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [usersRes, skillsRes, projectsRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/skills"),
          axios.get("/api/projects"),
        ]);

        setCounts({
          users: usersRes.data?.data?.length || 0,
          skills: skillsRes.data?.data?.length || 0,
          projects: projectsRes.data?.data?.length || 0,
          blogs: 0, // keep static for now
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

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
        {/* Users */}
        <div className="bg-black/40 backdrop-blur-2xl shadow-lg rounded-xl p-5 flex flex-col items-start">
          <div className="flex items-center justify-between w-full mb-3">
            <h2 className="text-lg font-semibold">Users</h2>
            <FaUsers className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold">{counts.users}</p>
          <span className="text-sm text-gray-400">Total registered users</span>
        </div>

        {/* Skills */}
        <div className="bg-black/40 backdrop-blur-2xl shadow-lg rounded-xl p-5 flex flex-col items-start">
          <div className="flex items-center justify-between w-full mb-3">
            <h2 className="text-lg font-semibold">Skills</h2>
            <FaMicrochip className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold">{counts.skills}</p>
          <span className="text-sm text-gray-400">Skills in system</span>
        </div>

        {/* Projects */}
        <div className="bg-black/40 backdrop-blur-2xl shadow-lg rounded-xl p-5 flex flex-col items-start">
          <div className="flex items-center justify-between w-full mb-3">
            <h2 className="text-lg font-semibold">Projects</h2>
            <FaFolder className="text-yellow-400" size={24} />
          </div>
          <p className="text-3xl font-bold">{counts.projects}</p>
          <span className="text-sm text-gray-400">Projects created</span>
        </div>

        {/* Blogs */}
        <div className="bg-black/40 backdrop-blur-2xl shadow-lg rounded-xl p-5 flex flex-col items-start">
          <div className="flex items-center justify-between w-full mb-3">
            <h2 className="text-lg font-semibold">Blogs</h2>
            <FaFileAlt className="text-pink-400" size={24} />
          </div>
          <p className="text-3xl font-bold">{counts.blogs}</p>
          <span className="text-sm text-gray-400">Blog posts published</span>
        </div>
      </div>
    </div>
  );
}
