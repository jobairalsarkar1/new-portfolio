"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Navbar from "@/components/headers/Navbar";
import StarField from "@/components/3d/StarField";
import Loader from "@/components/loaders/Loader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow bg-black">
      {/* StarField Background */}
      <div className="fixed top-0 left-0 w-full h-full z-10">
        <Canvas className="w-full h-full">
          <Suspense fallback={<Loader />}>
            <StarField numStars={1000} />
          </Suspense>
        </Canvas>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 w-full max-container">{children}</main>
    </div>
  );
}
