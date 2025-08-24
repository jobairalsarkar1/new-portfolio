"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "HELPER" | "CLIENT";
  createdAt: string;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/users");
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, role: User["role"]) => {
    try {
      await axios.patch(`/api/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/users/${deleteId}`);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

      <div className="bg-zinc-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/40 backdrop-blur-2xl shadow-xl text-sm sm:text-base text-gray-300">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800"
                  >
                    <td className="px-3 py-2.5 text-sm sm:text-base">
                      {user.name || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-sm sm:text-base">
                      {user.email}
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as User["role"]
                          )
                        }
                        disabled={user.role === "ADMIN"} // 🔒 prevent editing admin
                        className={`bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm ${
                          user.role === "ADMIN"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="HELPER">HELPER</option>
                        <option value="CLIENT">CLIENT</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      {user.role === "ADMIN" ? (
                        <span className="text-gray-500 text-xs italic">
                          Cannot delete
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Popup */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 p-5 rounded-xl shadow-lg w-72">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Delete User?
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

export default UsersPage;
