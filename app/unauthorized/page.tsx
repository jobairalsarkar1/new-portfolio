"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-500/10 rounded-full filter blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-float-medium" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="max-w-md mx-auto">
          {/* Animated icon */}
          <div className="relative mb-8"></div>

          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            <span className="bg-gradient-to-r from-red-300 to-red-500 bg-clip-text text-transparent">
              401
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-8">
            You are not authorized to access this page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Go back button */}
            <button
              onClick={() => router.back()}
              className="relative px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Go Back
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <Link
              href="/"
              className="relative px-6 py-3 border border-gray-700 hover:border-red-400/30 text-gray-300 rounded-lg font-medium transition-all group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Home
              </span>
              <span className="absolute inset-0 bg-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
