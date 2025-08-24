"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";

// Dynamically import MDEditor for SSR support
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const CreateProjectPage = () => {
  const [form, setForm] = useState({
    name: "",
    coverImage: "",
    link: "",
    gitLink: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isFormValid =
    form.name.trim() && form.coverImage.trim() && form.description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/projects", form);
      if (data.success) {
        router.push("/projects");
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <header className="mb-6 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Creates New Project</h1>
      </header>

      {/* Full-page Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
      >
        {/* Project Name & Cover Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Project Name *</label>
            <input
              type="text"
              placeholder="Enter project name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">
              Cover Image URL *
            </label>
            <input
              type="text"
              placeholder="Enter image URL"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Project Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Project Link</label>
            <input
              type="text"
              placeholder="Enter project URL (optional)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">GitHub Link</label>
            <input
              type="text"
              placeholder="Enter GitHub URL (optional)"
              value={form.gitLink}
              onChange={(e) => setForm({ ...form, gitLink: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Markdown Editor */}
        <div>
          <label className="block mb-1 text-gray-300">
            Project Description *
          </label>
          <div className="rounded-lg p-2 bg-gray-900">
            <MDEditor
              value={form.description}
              onChange={(val = "") => setForm({ ...form, description: val })}
              height={400}
              textareaProps={{
                placeholder: "Write project description in Markdown...",
                className: "bg-gray-900 text-gray-200",
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <GradientButton type="submit" disabled={!isFormValid || loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <ActionLoader />
                Creating
              </div>
            ) : (
              "Create Project"
            )}
          </GradientButton>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
