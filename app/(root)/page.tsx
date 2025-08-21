"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import Loader from "@/components/Loader";
import SolarSystem from "@/components/SolarSystem";
// import StarField from "../components/StarField";

const Home = () => {
  return (
    <section className="w-full h-screen relative">
      {/* Overlay Info Box */}
      <div className="fixed top-24 left-0 right-0 sm:px-12 px-8 flex items-center justify-center text-white z-30">
        <div className="w-auto border-2 border-slate-500 bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 sm:px-5 pt-2 sm:pt-3 pb-7 sm:pb-7 rounded-xl shadow-2xl">
          <h1 className="mb-1 text-sm sm:text-lg font-semibold">
            <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">
              Jobair Al Sarkar &nbsp;:
            </span>
            <br />
            Empowering Ideas Through Code
          </h1>
          <div className="relative mt-2 sm:mt-2.5 text-sm sm:text-lg font-medium overflow-hidden">
            <p className="typing-effect whitespace-nowrap">
              Software Engineer | Full-Stack Developer
            </p>
          </div>

          <Link
            href="/about"
            className="border-2 border-slate-500 absolute pt-2 pb-2 px-5 -bottom-4 bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900 text-white rounded-lg flex items-center gap-4 shadow-lg hover:from-gray-900 hover:via-indigo-700 hover:to-gray-800 transition-all duration-300"
          >
            <span className="text-[0.9rem] sm:text-[0.95rem] font-semibold">
              Learn More About Me
            </span>
            <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{
          near: 0.1,
          far: 1000,
          position: [0, 0, 15],
        }}
        className="z-20"
      >
        <ambientLight intensity={0.4} />
        {/* <hemisphereLight
          skyColor="#ffffff"
          groundColor="#b9b9b9"
          intensity={0.3}
        /> */}
        <hemisphereLight args={[0xffffff, 0xb9b9b9, 0.3]} />
        <pointLight position={[20, 20, 20]} intensity={2.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={<Loader />}>
          {/* <StarField numStars={1000} /> */}
          <SolarSystem modelPath="/solar_system.glb" />
        </Suspense>

        <OrbitControls maxDistance={15} />
      </Canvas>
    </section>
  );
};

export default Home;
