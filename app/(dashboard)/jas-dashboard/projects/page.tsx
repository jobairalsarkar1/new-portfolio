"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";

// Use dynamic import for Markdown preview
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

type Project = {
  id: string;
  name: string;
  coverImage: string;
  link?: string;
  gitLink?: string;
  description: string;
  createdAt: string;
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
      <div className="bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/40 backdrop-blur-2xl shadow-xl text-sm sm:text-base text-gray-300">
            <tr>
              <th className="px-3 py-2 ">Name</th>
              <th className="px-3 py-2">Cover</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center p-6">
                  <ActionLoader />
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-500">
                  No projects available
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800"
                >
                  <td className="px-3 py-2 text-sm sm:text-base">
                    {project.name}
                  </td>
                  <td className="px-3 py-2">
                    <Image
                      src={project.coverImage}
                      alt={project.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="h-full flex items-center gap-3 justify-start min-h-[48px]">
                      <button
                        onClick={() => setViewProject(project)}
                        className="text-blue-400 hover:text-blue-600 cursor-pointer"
                        title="View Project"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(project.id)}
                        className="text-red-400 hover:text-red-600 cursor-pointer"
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
                className="prose prose-invert max-w-full"
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
