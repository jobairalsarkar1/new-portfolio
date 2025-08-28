import React from "react";
import { FaTools } from "react-icons/fa";

const BlogsPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <FaTools className="text-6xl text-yellow-400 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Blogs Page!</h1>
      <p className="text-gray-400 text-lg">
        This page is currently under development. Stay tuned!
      </p>
    </div>
  );
};

export default BlogsPage;
