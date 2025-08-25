"use client";

import { Html, useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col justify-center items-center space-y-3 animate-fadeInSlow">
        {/* Glowing Core with Orbits */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Core pulse */}
          <div className="absolute w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-700 rounded-full shadow-xl shadow-indigo-500/50 animate-pulse" />

          {/* Orbit 1 */}
          <div className="absolute w-16 h-16 border border-indigo-500/50 rounded-full animate-spin-slow">
            <div className="w-3 h-3 bg-yellow-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-md shadow-yellow-300 blur-sm" />
          </div>

          {/* Orbit 2 */}
          <div className="absolute w-20 h-20 border border-purple-400/40 rounded-full animate-spin-reverse">
            <div className="w-3.5 h-3.5 bg-pink-500 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-lg shadow-pink-500 blur-sm" />
          </div>

          {/* Orbit 3 */}
          <div className="absolute w-24 h-24 border border-cyan-400/30 rounded-full animate-spin-slow">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-md shadow-cyan-400 blur-sm" />
          </div>

          {/* Central Progress Percentage */}
          <span className="absolute text-white font-semibold text-sm drop-shadow-lg tracking-wide">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Status Text */}
        <p className="text-sm text-gray-400 text-center font-mono tracking-wide opacity-90">
          Loading 3D Scene...
        </p>
      </div>
    </Html>
  );
};

export default Loader;
