"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy, FaTrash } from "react-icons/fa";
import GradientButton from "@/components/dashboard/GradientButton";
import ActionLoader from "@/components/loaders/ActionLoader";
import Image from "next/image";

type UploadedImage = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

const ImagesPage = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<{ file: File | null; name: string }>({
    file: null,
    name: "",
  });
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/images");
      if (data.success) setImages(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.name) {
      return alert("Please select an image and enter a name.");
    }

    if (form.file.size > 20 * 1024 * 1024) {
      return alert("File is too large. Max size is 20MB.");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("name", form.name);

    try {
      const { data } = await axios.post("/api/images", formData);
      if (data.success) {
        setIsModalOpen(false);
        setForm({ file: null, name: "" });
        fetchImages();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { data } = await axios.delete("/api/images", {
        data: { id: deleteId },
      });
      if (data.success) {
        setDeleteId(null);
        fetchImages();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Images ({images.length})</h1>
        <GradientButton onClick={() => setIsModalOpen(true)}>
          + Upload New
        </GradientButton>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto border border-zinc-800 shadow-lg bg-gradient-to-b from-zinc-950 to-zinc-900">
        <table className="w-full text-left min-w-[800px] table-auto">
          <thead>
            <tr className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider bg-zinc-900 border-b border-zinc-800">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Preview</th>
              <th className="px-4 py-3 font-semibold">URL</th>
              <th className="px-4 py-3 font-semibold">Uploaded</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm sm:text-base text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-6">
                  <ActionLoader />
                </td>
              </tr>
            ) : images.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-zinc-500">
                  No images uploaded
                </td>
              </tr>
            ) : (
              images.map((image) => (
                <tr
                  key={image.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800 transition duration-200"
                >
                  <td className="px-4 py-3">{image.name}</td>
                  <td className="px-4 py-3">
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={64}
                      height={64}
                      className="rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 max-w-[220px]">
                      <span
                        title={image.url}
                        className="truncate max-w-[180px] text-indigo-400 hover:underline cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(image.url)}
                      >
                        {image.url}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(image.url)}
                        title="Copy URL"
                        className="text-gray-400 hover:text-indigo-400 transition cursor-copy"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(image.id)}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
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

      {/* Upload Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              {/* Name Input */}
              <div>
                <input
                  type="text"
                  placeholder="Image name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  required
                />
              </div>

              {/* File Input */}
              <div className="space-y-1">
                <label className="block text-sm text-gray-300">
                  Image file (max 20MB)
                </label>
                <div className="relative flex items-center justify-between rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 hover:border-indigo-500 transition">
                  <span className="text-sm text-gray-400 truncate">
                    {form.file ? form.file.name : "No file chosen"}
                  </span>
                  <label className="cursor-pointer text-indigo-400 text-sm font-medium ml-4 hover:underline">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          file: e.target.files?.[0] || null,
                        })
                      }
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                {form.file && (
                  <p className="text-xs text-gray-400 mt-1">
                    Size: {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                  className={`px-4 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 cursor-pointer ${
                    uploading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  Cancel
                </button>
                <GradientButton type="submit" disabled={uploading}>
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <ActionLoader size={5} />
                      Uploading...
                    </div>
                  ) : (
                    "Upload"
                  )}
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 p-5 rounded-xl shadow-lg w-72">
            <h2 className="text-lg font-semibold mb-3 text-center">
              Delete Image?
            </h2>
            <p className="text-sm text-gray-300 text-center mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className={`px-4 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 cursor-pointer ${
                  deleting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <ActionLoader size={5} />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
