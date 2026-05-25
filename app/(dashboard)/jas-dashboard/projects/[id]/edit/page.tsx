"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";
import ProjectDescriptionEditor from "@/components/dashboard/ProjectDescriptionEditor";

type Skill = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  coverImage: string;
  heroImage?: string;
  link?: string;
  gitLink?: string;
  canContact: boolean;
  description: string;
  priority: number;
  skills: Skill[];
};

type ProjectForm = {
  name: string;
  coverImage: string;
  heroImage: string;
  link: string;
  gitLink: string;
  canContact: boolean;
  description: string;
  priority: number;
  skillIds: string[];
};

const initialForm: ProjectForm = {
  name: "",
  coverImage: "",
  heroImage: "",
  link: "",
  gitLink: "",
  canContact: false,
  description: "",
  priority: 0,
  skillIds: [],
};

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = useMemo(
    () =>
      Boolean(
        form.name.trim() &&
          form.coverImage.trim() &&
          form.heroImage.trim() &&
          form.description.trim(),
      ),
    [form.coverImage, form.description, form.heroImage, form.name],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [projectResponse, skillsResponse] = await Promise.all([
          axios.get(`/api/projects/${projectId}`),
          axios.get("/api/skills"),
        ]);

        if (!projectResponse.data.success) {
          throw new Error(projectResponse.data.error || "Project not found");
        }

        const project = projectResponse.data.data as Project;
        setForm({
          name: project.name || "",
          coverImage: project.coverImage || "",
          heroImage: project.heroImage || "",
          link: project.link || "",
          gitLink: project.gitLink || "",
          canContact: project.canContact || false,
          description: project.description || "",
          priority: project.priority || 0,
          skillIds: project.skills?.map((skill) => skill.id) || [],
        });

        if (skillsResponse.data.success) {
          setSkills(skillsResponse.data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load project.");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleSkillToggle = (skillId: string) => {
    setForm((current) => {
      const isSelected = current.skillIds.includes(skillId);

      return {
        ...current,
        skillIds: isSelected
          ? current.skillIds.filter((id) => id !== skillId)
          : [...current.skillIds, skillId],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const { data } = await axios.put(`/api/projects/${projectId}`, form);

      if (data.success) {
        router.push("/jas-dashboard/projects");
        return;
      }

      setError(data.error || "Failed to update project.");
    } catch (err) {
      console.error(err);
      setError("Failed to update project.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-white">
        <ActionLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <header className="mx-auto mb-6 flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-300">
            Project Editor
          </p>
          <h1 className="mt-1 text-3xl font-bold">Edit Project</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/jas-dashboard/projects")}
          className="w-fit rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
        >
          Back to projects
        </button>
      </header>

      {error && (
        <div className="mx-auto mb-5 w-full max-w-6xl rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-gray-300">Project Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-300">
              Cover Image URL *
            </label>
            <input
              type="text"
              value={form.coverImage}
              onChange={(event) =>
                setForm({ ...form, coverImage: event.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-gray-300">Hero Image URL *</label>
            <input
              type="text"
              value={form.heroImage}
              onChange={(event) =>
                setForm({ ...form, heroImage: event.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-300">
              Priority (higher shows first)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.priority}
              onChange={(event) =>
                setForm({
                  ...form,
                  priority: Number.isNaN(Number(event.target.value))
                    ? 0
                    : Number(event.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-gray-300">Project Link</label>
            <input
              type="text"
              value={form.link}
              onChange={(event) =>
                setForm({ ...form, link: event.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-300">GitHub Link</label>
            <input
              type="text"
              value={form.gitLink}
              onChange={(event) =>
                setForm({ ...form, gitLink: event.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-gray-200 outline-none transition placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-gray-300">Select Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isSelected = form.skillIds.includes(skill.id);

              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`rounded-full border px-3 py-1 text-sm text-gray-200 transition ${
                    isSelected
                      ? "border-green-500 bg-green-600"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.canContact}
              onChange={(event) =>
                setForm({ ...form, canContact: event.target.checked })
              }
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-lg text-gray-300">
              Allow people to contact you about this project
            </span>
          </label>
        </div>

        <ProjectDescriptionEditor
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
        />

        <div className="flex justify-end">
          <GradientButton type="submit" disabled={!isFormValid || isSaving}>
            {isSaving ? (
              <div className="flex items-center gap-2">
                <ActionLoader />
                Saving
              </div>
            ) : (
              "Save Changes"
            )}
          </GradientButton>
        </div>
      </form>
    </div>
  );
}
