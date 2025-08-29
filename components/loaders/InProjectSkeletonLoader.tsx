import React from "react";

const InProjectSkeletonLoader = () => {
  return (
    <div className="relative pt-24 py-12 px-8 sm:px-12 animate-pulse flex flex-col gap-4">
      {/* Hero Image Placeholder */}
      <div className="h-80 w-full rounded-lg border-2 border-gray-700 bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-inner" />

      {/* Project Title Placeholder */}
      <div className="h-8 w-1/3 rounded-md border-2 border-gray-700 bg-gradient-to-br from-gray-900 via-black to-gray-800" />

      {/* Skills Placeholder */}
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="h-6 w-24 rounded-full border-2 border-gray-700 bg-gradient-to-br from-gray-900 via-black to-gray-800"
          />
        ))}
      </div>

      {/* Description Placeholder */}
      <div className="h-48 w-full rounded-lg border-2 border-gray-700 bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-inner" />

      {/* Buttons Placeholder */}
      <div className="h-10 w-32 rounded-lg border-2 border-gray-700 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
    </div>
  );
};

export default InProjectSkeletonLoader;
