"use client";

import { Html, useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col justify-center items-center space-y-3">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Center nucleus */}
          <div className="absolute w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/50 animate-pulse" />

          {/* Orbit 1 */}
          <div className="absolute w-12 h-12 border border-gray-500 rounded-full animate-spin-slow">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-md shadow-yellow-300" />
          </div>

          {/* Orbit 2 */}
          <div className="absolute w-16 h-16 border border-gray-400 rounded-full animate-spin-reverse">
            <div className="w-3 h-3 bg-pink-500 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-md shadow-pink-400" />
          </div>

          {/* Orbit 3 */}
          <div className="absolute w-20 h-20 border border-gray-300 rounded-full animate-spin-slow">
            <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-md shadow-cyan-300" />
          </div>

          {/* Percentage in center */}
          <span className="absolute text-white font-bold text-sm">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Optional loading text */}
        <p className="text-gray-300 text-xs text-center tracking-wide">
          Loading 3D scene...
        </p>
      </div>
    </Html>
  );
};

export default Loader;
