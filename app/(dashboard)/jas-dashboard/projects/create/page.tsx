"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";

// Dynamically import MDEditor for SSR support
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Skill = {
  id: string;
  name: string;
};

const CreateProjectPage = () => {
  const [form, setForm] = useState({
    name: "",
    coverImage: "",
    heroImage: "",
    link: "",
    gitLink: "",
    canContact: false,
    description: "",
    priority: 0,
    skillIds: [] as string[],
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSkills = async () => {
    try {
      const { data } = await axios.get("/api/skills");
      if (data.success) setSkills(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const isFormValid =
    form.name.trim() &&
    form.coverImage.trim() &&
    form.heroImage.trim() &&
    form.description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/api/projects", form);
      if (data.success) {
        router.push("/jas-dashboard/projects");
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    setForm((prev) => {
      const isSelected = prev.skillIds.includes(skillId);
      return {
        ...prev,
        skillIds: isSelected
          ? prev.skillIds.filter((id) => id !== skillId)
          : [...prev.skillIds, skillId],
      };
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <header className="mb-6 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
      >
        {/* Project Name & Images */}
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

        {/* Hero Image + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-300">Hero Image URL *</label>
            <input
              type="text"
              placeholder="Enter hero image URL"
              value={form.heroImage}
              onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">
              Priority (0 = default, higher shows first)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: Number.isNaN(Number(e.target.value))
                    ? 0
                    : Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
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

        {/* Skills Multi-select */}
        <div>
          <label className="block mb-2 text-gray-300">Select Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isSelected = form.skillIds.includes(skill.id);
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`px-3 py-1 rounded-full border ${
                    isSelected
                      ? "bg-green-600 border-green-500"
                      : "bg-gray-800 border-gray-700"
                  } text-sm text-gray-200 transition`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Can Contact Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.canContact}
              onChange={(e) =>
                setForm({ ...form, canContact: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-300 text-lg">
              Allow people to contact you about this project
            </span>
          </label>
        </div>

        {/* Markdown Editor */}
        <div>
          <label className="block mb-1 text-gray-300">
            Project Description *
          </label>
          {/* <div className="rounded-lg p-2 bg-gray-900">
            <MDEditor
              value={form.description}
              onChange={(val = "") => setForm({ ...form, description: val })}
              height={400}
              textareaProps={{
                placeholder: "Write project description in Markdown...",
                className: "bg-gray-900 text-gray-200",
              }}
            />
          </div> */}
          <div className="rounded-lg p-2 bg-gray-900">
            <MDEditor
              value={form.description}
              onChange={(value) =>
                setForm({ ...form, description: value || "" })
              }
              id="description"
              preview="edit"
              height={400}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#111827", // same as bg-gray-900
              }}
              textareaProps={{
                placeholder: "Write project description in Markdown...",
                className: "bg-gray-900 text-gray-200",
              }}
              previewOptions={{
                disallowedElements: ["style"],
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
