"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";

// Markdown preview
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

type Skill = {
  id: string;
  name: string;
  iconUrl: string;
  needsBg: boolean;
};

type Project = {
  id: string;
  name: string;
  coverImage: string;
  heroImage?: string;
  link?: string;
  gitLink?: string;
  description: string;
  createdAt: string;
  skills: Skill[];
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const router = useRouter();

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/projects");
      if (data.success) setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Delete project
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/projects/${deleteId}`);
      setDeleteId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects ({projects.length})</h1>
        <GradientButton
          onClick={() => router.push("/jas-dashboard/projects/create")}
        >
          + Add New
        </GradientButton>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto border border-zinc-800 shadow-lg bg-gradient-to-b from-zinc-950 to-zinc-900">
        <table className="w-full text-left min-w-[600px] table-auto">
          <thead>
            <tr className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider bg-zinc-900 border-b border-zinc-800">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Cover Image</th>
              <th className="px-4 py-3 font-semibold">Hero Image</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm sm:text-base text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center p-6">
                  <ActionLoader />
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4 text-zinc-500">
                  No projects available
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800 transition duration-200"
                >
                  <td className="px-4 py-2.5">{project.name}</td>
                  <td className="px-4 py-2.5">
                    <Image
                      src={project.coverImage}
                      alt={project.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    {project.heroImage ? (
                      <Image
                        src={project.heroImage}
                        alt={project.name}
                        width={48}
                        height={48}
                        className="rounded object-cover"
                      />
                    ) : (
                      <span className="text-zinc-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setViewProject(project)}
                        className="text-blue-400 hover:text-blue-600 cursor-pointer transition"
                        title="View Project"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(project.id)}
                        className="text-red-400 hover:text-red-600 cursor-pointer transition"
                        title="Delete Project"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Popup */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="backdrop-blur-md bg-white/10 border border-white/20 p-5 rounded-xl shadow-lg w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-3 text-center">
              Delete Project?
            </h2>
            <p className="text-sm text-gray-300 text-center mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600"
              >
                Cancel
              </button>
              <GradientButton onClick={handleDelete}>Confirm</GradientButton>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {viewProject && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setViewProject(null)}
        >
          <div
            className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">{viewProject.name}</h2>

            {viewProject.coverImage && (
              <div className="mb-4">
                <Image
                  src={viewProject.coverImage}
                  alt={viewProject.name}
                  width={400}
                  height={200}
                  className="rounded"
                />
              </div>
            )}

            {/* skills */}
            {viewProject.skills?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {viewProject.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        skill.needsBg
                          ? "bg-gray-700 border-gray-600"
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
                      <span className="text-sm">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewProject.link && (
              <p className="mb-2">
                Link:{" "}
                <a
                  href={viewProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {viewProject.link}
                </a>
              </p>
            )}
            {viewProject.gitLink && (
              <p className="mb-4">
                GitHub:{" "}
                <a
                  href={viewProject.gitLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {viewProject.gitLink}
                </a>
              </p>
            )}

            <div className="bg-gray-800 rounded-lg p-3">
              <MarkdownPreview
                source={viewProject.description}
                className="prose prose-invert max-w-full no-bg"
              />
            </div>

            <div className="flex justify-end mt-4">
              <GradientButton onClick={() => setViewProject(null)}>
                Close
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
