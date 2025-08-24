"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";
import Image from "next/image";

type Skill = {
  id: string;
  name: string;
  iconUrl: string;
  needsBg: boolean;
  createdAt: string;
};

const SkillsPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<null | string>(null);
  const [form, setForm] = useState({ name: "", iconUrl: "", needsBg: false });

  // Fetch skills
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/skills");
      if (data.success) setSkills(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Delete skill
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/skills/${deleteId}`);
      setDeleteId(null);
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  // Add new skill
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/skills", form);
      if (data.success) {
        setIsModalOpen(false);
        setForm({ name: "", iconUrl: "", needsBg: false });
        fetchSkills();
      } else {
        alert(data.error || "Failed to add skill");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Skills ({skills.length})</h1>
        <GradientButton onClick={() => setIsModalOpen(true)}>
          + Add New
        </GradientButton>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/40 backdrop-blur-2xl shadow-xl text-sm sm:text-base text-gray-300">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Icon</th>
              <th className="px-3 py-2">Needs Bg</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-6">
                  <ActionLoader />
                </td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No skills available
                </td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr
                  key={skill.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800"
                >
                  <td className="px-3 py-2.5 text-sm sm:text-base">
                    {skill.name}
                  </td>
                  <td className="px-3 py-2.5">
                    <Image
                      src={skill.iconUrl}
                      alt={skill.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {skill.needsBg ? (
                      <FaCheckCircle className="text-green-500 text-lg" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-lg" />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setDeleteId(skill.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add New Skill</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={form.name}
                  placeholder="Skill name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={form.iconUrl}
                  placeholder="Icon Url"
                  onChange={(e) =>
                    setForm({ ...form, iconUrl: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.needsBg}
                  onChange={(e) =>
                    setForm({ ...form, needsBg: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label className="text-gray-300">Needs Background</label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <GradientButton type="submit">Save</GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Popup */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 p-5 rounded-xl shadow-lg w-72">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Delete Skill?
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
    </div>
  );
};

export default SkillsPage;
